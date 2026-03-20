import {
  DEFAULT_MOIZVONKI_BASE_PATH,
  DEFAULT_MOIZVONKI_DOMAIN,
  DEFAULT_WAPPI_BASE_URL,
  DEFAULT_WAPPI_ENDPOINT_PATH
} from './config.js';
import { getSettings, saveSettings } from './storage.js';

const state = {
  moizvonkiAccounts: [],
  wappiAccounts: []
};

const moizvonkiList = document.getElementById('moizvonki-list');
const wappiList = document.getElementById('wappi-list');
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

saveButton.addEventListener('click', async () => {
  const payload = {
    moizvonkiAccounts: readAccounts(moizvonkiList, 'moizvonki'),
    wappiAccounts: readAccounts(wappiList, 'wappi'),
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
    profileId: account.profileId || '',
    botId: account.botId || '',
    chatId: account.chatId || '',
    managerId: account.managerId || '',
    managerName: account.managerName || '',
    managerAvaLink: account.managerAvaLink || '',
    managerDescription: account.managerDescription || '',
    baseUrl: account.baseUrl || DEFAULT_WAPPI_BASE_URL,
    endpointPath: account.endpointPath || DEFAULT_WAPPI_ENDPOINT_PATH,
    enabled: account.enabled !== false
  };
}

function renderAccountCard(type, account, index) {
  const wrapper = document.createElement('article');
  wrapper.className = 'account-card';
  wrapper.dataset.type = type;
  wrapper.dataset.index = String(index);

  const fields = type === 'moizvonki'
    ? [
        ['Название', 'name', account.name],
        ['Email пользователя', 'userName', account.userName],
        ['API ключ', 'apiKey', account.apiKey],
        ['Поддомен', 'domain', account.domain],
        ['Endpoint', 'endpointPath', account.endpointPath],
        ['Action', 'action', account.action],
        ['From (необязательно)', 'from', account.from],
        ['Line (необязательно)', 'line', account.line],
        ['Полный Base URL (необязательно)', 'baseUrl', account.baseUrl]
      ]
    : [
        ['Название', 'name', account.name],
        ['API ключ', 'apiKey', account.apiKey],
        ['Profile ID', 'profileId', account.profileId],
        ['Bot ID (необязательно)', 'botId', account.botId],
        ['Chat ID (необязательно)', 'chatId', account.chatId],
        ['Manager ID (необязательно)', 'managerId', account.managerId],
        ['Manager name (необязательно)', 'managerName', account.managerName],
        ['Manager avatar link (необязательно)', 'managerAvaLink', account.managerAvaLink],
        ['Manager description (необязательно)', 'managerDescription', account.managerDescription],
        ['Base URL', 'baseUrl', account.baseUrl],
        ['Endpoint', 'endpointPath', account.endpointPath]
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
    ${fields
      .map(
        ([label, key, value]) => `
          <label>
            <span>${label}</span>
            <input type="text" data-field="${key}" value="${String(value || '').replace(/"/g, '&quot;')}" />
          </label>
        `
      )
      .join('')}
  `;

  wrapper.querySelector('[data-action="delete"]').addEventListener('click', () => {
    state[type === 'moizvonki' ? 'moizvonkiAccounts' : 'wappiAccounts'].splice(index, 1);
    render();
  });

  return wrapper;
}

function render() {
  moizvonkiList.innerHTML = '';
  wappiList.innerHTML = '';
  state.moizvonkiAccounts.forEach((account, index) => {
    moizvonkiList.appendChild(renderAccountCard('moizvonki', account, index));
  });
  state.wappiAccounts.forEach((account, index) => {
    wappiList.appendChild(renderAccountCard('wappi', account, index));
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

async function init() {
  const settings = await getSettings();
  state.moizvonkiAccounts = settings.moizvonkiAccounts.map(createMoizvonkiAccount);
  state.wappiAccounts = settings.wappiAccounts.map(createWappiAccount);
  defaultMessage.value = settings.messageTemplate || '';
  render();
}

init();
