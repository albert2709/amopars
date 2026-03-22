export function applySpintax(input) {
  const source = String(input || '');

  function resolve(fragment) {
    return fragment.replace(/\{([^{}]+)\}/g, (_match, group) => {
      const options = group.split('|').map((item) => resolve(item.trim())).filter(Boolean);
      if (!options.length) {
        return '';
      }

      return options[Math.floor(Math.random() * options.length)];
    });
  }

  return resolve(source);
}
