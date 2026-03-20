const PHONE_XPATH = "//input[contains(@class, 'control-phone__formatted js-form-changes-skip')]";

function readNodeValue(node) {
  if (!node) {
    return '';
  }

  if ('value' in node && typeof node.value === 'string') {
    return node.value.trim();
  }

  return node.textContent?.trim() || '';
}

function extractPhoneFromPage() {
  const result = document.evaluate(
    PHONE_XPATH,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );

  const node = result.singleNodeValue;
  const rawValue = readNodeValue(node);
  const normalizedPhone = rawValue.replace(/[^\d+]/g, '');

  return {
    phone: normalizedPhone,
    rawValue,
    xpath: PHONE_XPATH,
    found: Boolean(node && normalizedPhone)
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'GET_PHONE_FROM_PAGE') {
    return undefined;
  }

  sendResponse(extractPhoneFromPage());
  return false;
});
