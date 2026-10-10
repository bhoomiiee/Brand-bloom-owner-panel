export function parseDateRange(start?: string, end?: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = end ? new Date(end) : now;
  const startDate = start ? new Date(start) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { startDate, endDate };
}
