export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
export function createPayload(
  name: string,
  localDate: string,
  selectedIds: number[],
  creatorId: number,
  now = Date.now(),
) {
  const playerIds = [...new Set([creatorId, ...selectedIds])];
  if (!name.trim()) throw new Error("Give your Secret Santa a name.");
  if (playerIds.length < 2)
    throw new Error("Choose at least one other player.");
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
