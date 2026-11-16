export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
export function formatBrazilianPhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 13) digits = digits.slice(2);
  digits = digits.slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  const area = digits.slice(0, 2);
  const subscriber = digits.slice(2);
  return `(${area}) ${subscriber.slice(0, 5)}${subscriber.length > 5 ? `-${subscriber.slice(5)}` : ""}`;
}
export function createPayload(
  name: string,
  localDate: string,
  selectedIds: string[],
  creatorId: string,
  now = Date.now(),
) {
  const playerIds = [...new Set([creatorId, ...selectedIds])];
  if (!name.trim()) throw new Error("Give your Secret Santa a name.");
  const date = new Date(localDate);
  if (!Number.isFinite(date.getTime()) || date.getTime() <= now)
    throw new Error("Choose a draw date and time in the future.");
  return { name: name.trim(), drawAt: date.toISOString(), playerIds };
}
export function formatDate(value: string, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
