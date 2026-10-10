export const taxService = {
  async calculateTax(subtotalCents: number, _storeId: string) {
    return Math.round(subtotalCents * 0.08); // 8% default tax
  }
};
