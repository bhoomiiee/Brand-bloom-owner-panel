export const logger = {
  info: (msg: string, ...args: any[]) => console.info(`[FRONTEND INFO] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[FRONTEND ERROR] ${msg}`, ...args)
};
