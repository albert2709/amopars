import {
  getActiveAccounts,
  getSettings,
  isMoizvonkiAccountActive,
  isWappiAccountActive
} from './storage.js';
import { applySpintax } from './messages.js';

const callButton = document.getElementById('call-button');
const smsButton = document.getElementById('sms-button');
const settingsButton = document.getElementById('open-settings');
const statusNode = document.getElementById('status');
const queueNode = document.getElementById('queue-info');
const messageField = document.getElementById('message-text');
const presetButtonsNode = document.getElementById('preset-buttons');

function setStatus(text, tone = 'info') {
  statusNode.textContent = text;
  statusNode.dataset.tone = tone;
}

async function persistMessageTemplate() {
  await chrome.storage.sync.set({ messageTemplate: messageField.value.trim() });
}

function renderPresetButtons(presets) {
  presetButtonsNode.innerHTML = '';

  if (!presets.length) {
    presetButtonsNode.innerHTML = '<p class="empty-state">Сохранённые шаблоны появятся здесь.</p>';
    return;
  }

  presets.forEach((preset) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preset-button';
    button.textContent = preset.label;
    button.title = preset.message;
    button.addEventListener('click', async () => {
      messageField.value = preset.message;
      await persistMessageTemplate();
      setStatus(`Выбран шаблон: ${preset.label}`, 'success');
    });
    presetButtonsNode.appendChild(button);
  });
}

async function renderState() {
  const settings = await getSettings();
  const callAccounts = getActiveAccounts(settings.moizvonkiAccounts, isMoizvonkiAccountActive);
  const smsAccounts = getActiveAccounts(settings.wappiAccounts, isWappiAccountActive);

  callButton.disabled = !callAccounts.length;
  smsButton.disabled = !smsAccounts.length;
  messageField.value = settings.messageTemplate || '';
  renderPresetButtons(settings.messagePresets);

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
  await persistMessageTemplate();
  setStatus('Выполняется запрос…');

  const response = await chrome.runtime.sendMessage(
    type === 'call' ? { type: 'RUN_CALL' } : { type: 'RUN_SMS', messageText }
  );

  if (!response?.ok) {
    setStatus(response?.error || 'Неизвестная ошибка.', 'error');
    return;
  }

  const detail = type === 'sms' && response.resolvedMessage ? ` Текст: ${response.resolvedMessage}` : '';
  setStatus(`${type === 'call' ? 'Звонок' : 'Сообщение'} отправлен(о) на ${response.phone}.${detail}`, 'success');
  queueNode.textContent = `Использован аккаунт: ${response.accountName}. Следующий будет выбран по очереди.`;
}

messageField.addEventListener('change', persistMessageTemplate);
callButton.addEventListener('click', () => runAction('call'));
smsButton.addEventListener('click', () => runAction('sms'));
settingsButton.addEventListener('click', () => chrome.runtime.openOptionsPage());

renderState();
