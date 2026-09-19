export const normalizeSearch = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

export const matchesSearch = (query: unknown, values: unknown[]): boolean => {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return true;
  const haystack = normalizeSearch(values.filter(Boolean).join(' '));
  return normalizedQuery
    .split(' ')
    .filter(Boolean)
    .every((token) => haystack.includes(token));
};
