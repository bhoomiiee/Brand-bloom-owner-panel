export function checkPermission(userPerms: string[], required: string): boolean {
  return userPerms.includes('*') || userPerms.includes(required);
}
