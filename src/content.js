const PHONE_XPATH = '//div[@class="pipeline_leads__field h-text-overflow"]';

function extractPhoneFromPage() {
  const result = document.evaluate(
    PHONE_XPATH,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );

  const node = result.singleNodeValue;
  const rawValue = node?.textContent?.trim() || '';
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
