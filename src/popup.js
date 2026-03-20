import {
  getActiveAccounts,
  getSettings,
  isMoizvonkiAccountActive,
  isWappiAccountActive
} from './storage.js';

const callButton = document.getElementById('call-button');
const smsButton = document.getElementById('sms-button');
const settingsButton = document.getElementById('open-settings');
const statusNode = document.getElementById('status');
const queueNode = document.getElementById('queue-info');
const messageField = document.getElementById('message-text');

function setStatus(text, tone = 'info') {
  statusNode.textContent = text;
  statusNode.dataset.tone = tone;
}

async function renderState() {
  const settings = await getSettings();
  const callAccounts = getActiveAccounts(settings.moizvonkiAccounts, isMoizvonkiAccountActive);
  const smsAccounts = getActiveAccounts(settings.wappiAccounts, isWappiAccountActive);

  callButton.disabled = !callAccounts.length;
  smsButton.disabled = !smsAccounts.length;
  messageField.value = settings.messageTemplate || '';

  queueNode.textContent = [
    `Мои Звонки: ${callAccounts.length} активных`,
    `Wappi: ${smsAccounts.length} активных`
  ].join(' · ');

  if (!callAccounts.length || !smsAccounts.length) {
    setStatus('Добавьте и активируйте аккаунты в настройках.', 'warning');
  } else {
    setStatus('Готово к работе.', 'success');
  }
}

async function runAction(type) {
  const messageText = messageField.value.trim();
  await chrome.storage.sync.set({ messageTemplate: messageText });
  setStatus('Выполняется запрос…');

  const response = await chrome.runtime.sendMessage(
    type === 'call' ? { type: 'RUN_CALL' } : { type: 'RUN_SMS', messageText }
  );

  if (!response?.ok) {
    setStatus(response?.error || 'Неизвестная ошибка.', 'error');
    return;
  }

  setStatus(`${type === 'call' ? 'Звонок' : 'Сообщение'} отправлен(о) на ${response.phone}.`, 'success');
  queueNode.textContent = `Использован аккаунт: ${response.accountName}. Следующий будет выбран по очереди.`;
}

callButton.addEventListener('click', () => runAction('call'));
smsButton.addEventListener('click', () => runAction('sms'));
settingsButton.addEventListener('click', () => chrome.runtime.openOptionsPage());

renderState();
