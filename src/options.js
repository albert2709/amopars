import {
  DEFAULT_MOIZVONKI_BASE_PATH,
  DEFAULT_MOIZVONKI_DOMAIN,
  DEFAULT_WAPPI_BASE_URL,
  DEFAULT_WAPPI_ENDPOINT_PATH,
  MAX_PRESET_LABEL_LENGTH
} from './config.js';
import { getSettings, normalizePresetLabel, saveSettings } from './storage.js';

const state = {
  moizvonkiAccounts: [],
  wappiAccounts: [],
  messagePresets: []
};

const moizvonkiList = document.getElementById('moizvonki-list');
const wappiList = document.getElementById('wappi-list');
const presetList = document.getElementById('preset-list');
const saveButton = document.getElementById('save-settings');
const saveStatus = document.getElementById('save-status');
const defaultMessage = document.getElementById('default-message');

document.getElementById('add-moizvonki').addEventListener('click', () => {
  state.moizvonkiAccounts.push(createMoizvonkiAccount());
  render();
});

document.getElementById('add-wappi').addEventListener('click', () => {
  state.wappiAccounts.push(createWappiAccount());
  render();
});

document.getElementById('add-preset').addEventListener('click', () => {
  state.messagePresets.push(createMessagePreset());
  render();
});

saveButton.addEventListener('click', async () => {
  const payload = {
    moizvonkiAccounts: readAccounts(moizvonkiList, 'moizvonki'),
    wappiAccounts: readAccounts(wappiList, 'wappi'),
    messagePresets: readPresets(),
    messageTemplate: defaultMessage.value.trim(),
    nextMoizvonkiIndex: 0,
    nextWappiIndex: 0
  };

  await saveSettings(payload);
  saveStatus.textContent = 'Сохранено.';
});

function createMoizvonkiAccount(account = {}) {
  return {
    name: account.name || '',
    userName: account.userName || '',
    apiKey: account.apiKey || '',
    domain: account.domain || DEFAULT_MOIZVONKI_DOMAIN,
    endpointPath: account.endpointPath || DEFAULT_MOIZVONKI_BASE_PATH,
    action: account.action || 'calls.make_call',
    from: account.from || '',
    line: account.line || '',
    baseUrl: account.baseUrl || '',
    enabled: account.enabled !== false
  };
}

function createWappiAccount(account = {}) {
  return {
    name: account.name || '',
    apiKey: account.apiKey || '',
    cascadeId: account.cascadeId || '',
    caption: account.caption || '',
    fileName: account.fileName || '',
    url: account.url || '',
    baseUrl: account.baseUrl || DEFAULT_WAPPI_BASE_URL,
    endpointPath: account.endpointPath || DEFAULT_WAPPI_ENDPOINT_PATH,
    enabled: account.enabled !== false
  };
}

function createMessagePreset(preset = {}) {
  return {
    label: normalizePresetLabel(preset.label || ''),
    message: preset.message || ''
  };
}

function createTextField({ label, key, value, maxLength = '', placeholder = '' }) {
  return `
    <label>
      <span>${label}</span>
      <input type="text" data-field="${key}" value="${String(value || '').replace(/"/g, '&quot;')}" ${maxLength ? `maxlength="${maxLength}"` : ''} placeholder="${placeholder}" />
    </label>
  `;
}

function renderAccountCard(type, account, index) {
  const wrapper = document.createElement('article');
  wrapper.className = 'account-card';

  const fields = type === 'moizvonki'
    ? [
        { label: 'Название', key: 'name', value: account.name },
        { label: 'Email пользователя', key: 'userName', value: account.userName },
        { label: 'API ключ', key: 'apiKey', value: account.apiKey },
        { label: 'Поддомен', key: 'domain', value: account.domain },
        { label: 'Endpoint', key: 'endpointPath', value: account.endpointPath },
        { label: 'Action', key: 'action', value: account.action },
        { label: 'From (необязательно)', key: 'from', value: account.from },
        { label: 'Line (необязательно)', key: 'line', value: account.line },
        { label: 'Полный Base URL (необязательно)', key: 'baseUrl', value: account.baseUrl }
      ]
    : [
        { label: 'Название', key: 'name', value: account.name },
        { label: 'API ключ', key: 'apiKey', value: account.apiKey },
        { label: 'Cascade ID', key: 'cascadeId', value: account.cascadeId },
        { label: 'Caption (необязательно)', key: 'caption', value: account.caption },
        { label: 'File name (необязательно)', key: 'fileName', value: account.fileName },
        { label: 'URL файла (необязательно)', key: 'url', value: account.url },
        { label: 'Base URL', key: 'baseUrl', value: account.baseUrl },
        { label: 'Endpoint', key: 'endpointPath', value: account.endpointPath }
      ];

  wrapper.innerHTML = `
    <div class="account-card-header">
      <strong>${type === 'moizvonki' ? 'Мои Звонки' : 'Wappi'} #${index + 1}</strong>
      <button class="danger-button" data-action="delete">Удалить</button>
    </div>
    <label class="checkbox-row">
      <input type="checkbox" data-field="enabled" ${account.enabled ? 'checked' : ''} />
      Аккаунт активен
    </label>
    ${fields.map(createTextField).join('')}
  `;

  wrapper.querySelector('[data-action="delete"]').addEventListener('click', () => {
    state[type === 'moizvonki' ? 'moizvonkiAccounts' : 'wappiAccounts'].splice(index, 1);
    render();
  });

  return wrapper;
}

function renderPresetCard(preset, index) {
  const wrapper = document.createElement('article');
  wrapper.className = 'account-card';
  wrapper.innerHTML = `
    <div class="account-card-header">
      <strong>Шаблон #${index + 1}</strong>
      <button class="danger-button" data-action="delete">Удалить</button>
    </div>
    ${createTextField({
      label: 'Название кнопки',
      key: 'label',
      value: preset.label,
      maxLength: MAX_PRESET_LABEL_LENGTH,
      placeholder: 'До 16 символов'
    })}
    <label>
      <span>Сообщение / спинтакс</span>
      <textarea data-field="message" rows="4" placeholder="{Здравствуйте|Добрый день}, это тест">${preset.message}</textarea>
    </label>
  `;

  wrapper.querySelector('[data-action="delete"]').addEventListener('click', () => {
    state.messagePresets.splice(index, 1);
    render();
  });

  return wrapper;
}

function render() {
  moizvonkiList.innerHTML = '';
  wappiList.innerHTML = '';
  presetList.innerHTML = '';

  state.moizvonkiAccounts.forEach((account, index) => {
    moizvonkiList.appendChild(renderAccountCard('moizvonki', account, index));
  });
  state.wappiAccounts.forEach((account, index) => {
    wappiList.appendChild(renderAccountCard('wappi', account, index));
  });
  state.messagePresets.forEach((preset, index) => {
    presetList.appendChild(renderPresetCard(preset, index));
  });
}

function readAccounts(container, type) {
  return Array.from(container.querySelectorAll('.account-card')).map((card) => {
    const account = {};
    card.querySelectorAll('[data-field]').forEach((field) => {
      if (field.type === 'checkbox') {
        account[field.dataset.field] = field.checked;
      } else {
        account[field.dataset.field] = field.value.trim();
      }
    });

    return type === 'moizvonki' ? createMoizvonkiAccount(account) : createWappiAccount(account);
  });
}

function readPresets() {
  return Array.from(presetList.querySelectorAll('.account-card'))
    .map((card) => {
      const label = normalizePresetLabel(card.querySelector('[data-field="label"]')?.value || '');
      const message = card.querySelector('[data-field="message"]')?.value.trim() || '';
      return label && message ? { label, message } : null;
    })
    .filter(Boolean);
}

async function init() {
  const settings = await getSettings();
  state.moizvonkiAccounts = settings.moizvonkiAccounts.map(createMoizvonkiAccount);
  state.wappiAccounts = settings.wappiAccounts.map(createWappiAccount);
  state.messagePresets = settings.messagePresets.map(createMessagePreset);
  defaultMessage.value = settings.messageTemplate || '';
  render();
}

init();
