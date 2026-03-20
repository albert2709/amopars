import {
  DEFAULT_MOIZVONKI_BASE_PATH,
  DEFAULT_MOIZVONKI_DOMAIN,
  DEFAULT_WAPPI_BASE_URL
} from './config.js';
import {
  getNextAccount,
  getSettings,
  isMoizvonkiAccountActive,
  isWappiAccountActive,
  saveSettings
} from './storage.js';

async function getPhoneFromActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error('Не удалось определить активную вкладку.');
  }

  const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PHONE_FROM_PAGE' });
  if (!response?.found || !response.phone) {
    throw new Error(`Телефон по XPath не найден: ${response?.xpath || 'неизвестно'}`);
  }

  return response.phone;
}

function withFallbackBaseUrl(url, fallback) {
  return (url || fallback).replace(/\/$/, '');
}

function getMoizvonkiUrl(account) {
  if (account.baseUrl) {
    return withFallbackBaseUrl(account.baseUrl, `https://${DEFAULT_MOIZVONKI_DOMAIN}.moizvonki.ru`) + (account.endpointPath || DEFAULT_MOIZVONKI_BASE_PATH);
  }

  const domain = (account.domain || DEFAULT_MOIZVONKI_DOMAIN).trim();
  const basePath = account.endpointPath || DEFAULT_MOIZVONKI_BASE_PATH;
  return `https://${domain}.moizvonki.ru${basePath}`;
}

async function callMoizvonki(account, phone) {
  const requestData = {
    user_name: account.userName,
    api_key: account.apiKey,
    action: account.action || 'calls.make_call',
    to: phone
  };

  if (account.from) {
    requestData.from = account.from;
  }

  if (account.line) {
    requestData.line = account.line;
  }

  const response = await fetch(getMoizvonkiUrl(account), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Мои Звонки вернул ${response.status}: ${text || 'пустой ответ'}`);
  }

  return response.text();
}

async function sendWappiMessage(account, phone, messageText) {
  const baseUrl = withFallbackBaseUrl(account.baseUrl, DEFAULT_WAPPI_BASE_URL);
  const endpoint = account.endpointPath || '/messages/text';
  const profileQuery = account.profileId ? `?profile_id=${encodeURIComponent(account.profileId)}` : '';
  const payload = {
    phone,
    body: messageText
  };

  const response = await fetch(`${baseUrl}${endpoint}${profileQuery}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: account.apiKey
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Wappi вернул ${response.status}: ${text || 'пустой ответ'}`);
  }

  return response.text();
}

async function handleAction(action, messageText) {
  const settings = await getSettings();
  const isCall = action === 'call';
  const accountKey = isCall ? 'moizvonkiAccounts' : 'wappiAccounts';
  const indexKey = isCall ? 'nextMoizvonkiIndex' : 'nextWappiIndex';
  const validator = isCall ? isMoizvonkiAccountActive : isWappiAccountActive;
  const { account, nextIndex, activeAccounts } = getNextAccount(settings[accountKey], settings[indexKey], validator);

  if (!account) {
    throw new Error(isCall ? 'Нет активных аккаунтов Мои Звонки.' : 'Нет активных аккаунтов Wappi.');
  }

  const phone = await getPhoneFromActiveTab();
  const result = isCall
    ? await callMoizvonki(account, phone)
    : await sendWappiMessage(account, phone, messageText || settings.messageTemplate || '');

  await saveSettings({ [indexKey]: nextIndex });

  return {
    ok: true,
    phone,
    accountName: account.name,
    queueSize: activeAccounts.length,
    result
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'RUN_CALL') {
    handleAction('call')
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message?.type === 'RUN_SMS') {
    handleAction('sms', message.messageText)
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  return undefined;
});
