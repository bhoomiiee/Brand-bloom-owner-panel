export function formatCentsToCurrency(cents: number, currency = 'INR'): string {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(cents / 100);
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
