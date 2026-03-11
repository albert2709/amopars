function getTimestampForFileName() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

function buildLogFileName() {
  return `xpath_results_${getTimestampForFileName()}.txt`;
}

async function downloadLogFile(numbers) {
  const content = `${numbers.join('\n')}\n`;
  const url = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
  const fileName = buildLogFileName();

  await chrome.downloads.download({
    url,
    filename: fileName,
    saveAs: false,
    conflictAction: 'uniquify'
  });

  return fileName;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'APPEND_LOG' || !Array.isArray(message.numbers)) {
    return false;
  }

  (async () => {
    try {
      const fileName = await downloadLogFile(message.numbers);

      sendResponse({
        ok: true,
        appendedCount: message.numbers.length,
        fileName
      });
    } catch (error) {
      sendResponse({
        ok: false,
        error: error.message
      });
    }
  })();

  return true;
});
