const STORAGE_KEY = 'xpathLogLines';
const LOG_FILE_NAME = 'xpath_results_log.txt';

function nowStamp() {
  const now = new Date();
  const date = now.toLocaleDateString('ru-RU');
  const time = now.toLocaleTimeString('ru-RU');
  return `${date} ${time}`;
}

async function getStoredLines() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return data[STORAGE_KEY] || [];
}

async function saveLines(lines) {
  await chrome.storage.local.set({ [STORAGE_KEY]: lines });
}

async function downloadLogFile(lines) {
  const content = `${lines.join('\n')}\n`;
  const url = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

  await chrome.downloads.download({
    url,
    filename: LOG_FILE_NAME,
    saveAs: false,
    conflictAction: 'overwrite'
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'APPEND_LOG' || !Array.isArray(message.numbers)) {
    return false;
  }

  (async () => {
    try {
      const timestamp = nowStamp();
      const existingLines = await getStoredLines();
      const newLines = message.numbers.map((number) => `${timestamp} | ${number}`);
      const updatedLines = [...existingLines, ...newLines];

      await saveLines(updatedLines);
      await downloadLogFile(updatedLines);

      sendResponse({
        ok: true,
        appendedCount: newLines.length,
        fileName: LOG_FILE_NAME
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
