export const columnMappingService = {
  suggestMappings(headers: string[]): Record<string, string> {
    const suggestions: Record<string, string> = {};
    for (const h of headers) {
      const lower = h.toLowerCase();
      if (lower.includes('title') || lower.includes('name')) suggestions[h] = 'title';
      else if (lower.includes('price')) suggestions[h] = 'price';
      else if (lower.includes('sku')) suggestions[h] = 'sku';
      else if (lower.includes('stock') || lower.includes('qty')) suggestions[h] = 'stock';
    }
    return suggestions;
  }
};
