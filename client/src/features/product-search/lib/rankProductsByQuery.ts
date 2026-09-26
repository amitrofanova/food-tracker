export function extractPercentLabel(text: string): string | null {
  const normalized = text
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/(\d+)[.,](\d+)\s*%/g, "$1.$2%")
    .replace(/(\d+)\s*%/g, "$1%");
  return normalized.match(/(\d+(?:\.\d+)?)%/)?.[1] ?? null;
}

export function rankProductsByQuery<T extends { name: string }>(products: T[], query: string): T[] {
  const percent = extractPercentLabel(query);
  if (!percent) return products;

  const escaped = percent.replace(".", "[.,]");
  const pattern = new RegExp(`(?:^|[^0-9])${escaped}\\s*%`, "i");

  return [...products].sort((a, b) => {
    const aHit = pattern.test(a.name) ? 1 : 0;
    const bHit = pattern.test(b.name) ? 1 : 0;
    return bHit - aHit;
  });
}
