export function dollarsToCents(dollars: number | string): number {
  const num = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  return Math.round(num * 100);
}

export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}
