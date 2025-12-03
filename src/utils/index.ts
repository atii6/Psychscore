export function createPageUrl(input: string) {
  const [path, query] = input.split("?");

  const cleanedPath = path
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();

  return query ? `/${cleanedPath}?${query}` : `/${cleanedPath}`;
}
