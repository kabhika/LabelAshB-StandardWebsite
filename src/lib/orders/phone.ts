export function indianMobile(value: string): string | null {
  const digits = value.replace(/[\s()-]/g, "");
  const match = /^(?:\+?91|0)?([6-9]\d{9})$/.exec(digits);
  return match ? "+91" + match[1] : null;
}
