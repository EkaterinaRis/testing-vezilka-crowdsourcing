
export function normalizeUrls(obj) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    if(!obj) return obj;

    if (typeof obj === 'string') {
        const cleanPath = obj.startsWith('/') ? obj.slice(1) : obj;
        return `${BACKEND_URL}/${cleanPath}`
    }

  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(normalizeUrls);
  }

  return Object.keys(obj).reduce((acc, key) => {
    let value = obj[key];

    if (typeof value === 'string' && (key.endsWith('Url') || key.endsWith('Path'))) {
      if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
        const cleanPath = value.startsWith('/') ? value.slice(1) : value;
        value = `${BACKEND_URL}/${cleanPath}`;
      }
    } else if (typeof value === 'object') {
      value = normalizeUrls(value);
    }

    acc[key] = value;
    return acc;
  }, {});
};

