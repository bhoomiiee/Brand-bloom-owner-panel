export function maskSensitive(obj: Record<string, any>): Record<string, any> {
  const copy = { ...obj };
  const sensitiveKeys = ['password', 'token', 'secret', 'creditCard', 'cvv'];
  for (const k of Object.keys(copy)) {
    if (sensitiveKeys.some(s => k.toLowerCase().includes(s))) {
      copy[k] = '***REDACTED***';
    }
  }
  return copy;
}
