const XPATH_QUERY = '//div[@class="pipeline_leads__field h-text-overflow"]';
const statusEl = document.getElementById('status');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#d93025' : '#188038';
}

document.getElementById('collectBtn').addEventListener('click', async () => {
  setStatus('Выполняю поиск...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      throw new Error('Активная вкладка не найдена.');
    }

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [XPATH_QUERY],
      func: (xpathQuery) => {
        const snapshot = document.evaluate(
          xpathQuery,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );

        const elevenDigitRegex = /\b\d{11}\b/g;
        const collected = [];

        for (let i = 0; i < snapshot.snapshotLength; i += 1) {
          const node = snapshot.snapshotItem(i);
          if (!node) continue;

          const text = (node.textContent || '').trim();
          const matches = text.match(elevenDigitRegex);
          if (matches) {
            collected.push(...matches);
          }
        }

        return [...new Set(collected)];
      }
    });

    if (!result || result.length === 0) {
      setStatus('Совпадений с 11 цифрами не найдено.');
      return;
    }

    const response = await chrome.runtime.sendMessage({
      type: 'APPEND_LOG',
      numbers: result
    });

    if (!response?.ok) {
      throw new Error(response?.error || 'Не удалось записать в файл.');
    }

    setStatus(`Добавлено номеров: ${response.appendedCount}\nФайл: ${response.fileName}`);
  } catch (error) {
    setStatus(`Ошибка: ${error.message}`, true);
  }
});
