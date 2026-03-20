import { DEFAULT_SETTINGS } from './config.js';

export async function getSettings() {
  const data = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    moizvonkiAccounts: Array.isArray(data.moizvonkiAccounts) ? data.moizvonkiAccounts : [],
    wappiAccounts: Array.isArray(data.wappiAccounts) ? data.wappiAccounts : []
  };
}

export async function saveSettings(patch) {
  await chrome.storage.sync.set(patch);
}

export function getActiveAccounts(accounts) {
  return accounts.filter((account) => account?.enabled !== false && account?.name && account?.apiKey);
}

export function getNextAccount(accounts, nextIndex) {
  const activeAccounts = getActiveAccounts(accounts);
  if (!activeAccounts.length) {
    return { account: null, nextIndex: 0, activeAccounts };
  }

  const safeIndex = Number.isInteger(nextIndex) && nextIndex >= 0 ? nextIndex % activeAccounts.length : 0;
  const account = activeAccounts[safeIndex];
  const updatedNextIndex = (safeIndex + 1) % activeAccounts.length;
  return { account, nextIndex: updatedNextIndex, activeAccounts };
}
