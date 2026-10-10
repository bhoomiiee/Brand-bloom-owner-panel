export function formatCurrency(cents: number, currency = 'INR'): string {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format((cents || 0) / 100);
}

