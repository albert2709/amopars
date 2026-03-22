export const PHONE_XPATH = "//input[contains(@class, 'control-phone__formatted js-form-changes-skip')]";

export const DEFAULT_SETTINGS = {
  moizvonkiAccounts: [],
  wappiAccounts: [],
  nextMoizvonkiIndex: 0,
  nextWappiIndex: 0,
  messageTemplate: 'Здравствуйте!',
  messagePresets: [],
  lastSmsInfo: null
};

export const DEFAULT_MOIZVONKI_DOMAIN = 'test';
export const DEFAULT_MOIZVONKI_BASE_PATH = '/api/v1';
export const DEFAULT_WAPPI_BASE_URL = 'https://wappi.pro';
export const DEFAULT_WAPPI_ENDPOINT_PATH = '/csender/cascade/send';
export const MAX_PRESET_LABEL_LENGTH = 16;
