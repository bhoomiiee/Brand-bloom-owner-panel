export const importValidationService = {
  validateRow(row: Record<string, any>, _rowIndex?: number) {
    const errors: string[] = [];
    const title = (row.title || '').trim();
    if (!title) {
      errors.push('Title is required');
    }

    const priceStr = String(row.price || '').replace('$', '').trim();
    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      errors.push('Price must be a valid non-negative number');
    }

    if (row.stock !== undefined && row.stock !== '') {
      const stock = parseInt(String(row.stock).trim(), 10);
      if (isNaN(stock) || stock < 0) {
        errors.push('Stock must be a non-negative integer');
      }
    }

    return { isValid: errors.length === 0, errors };
  }
};
