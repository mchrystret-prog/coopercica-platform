export type OpeningInterval = { opens: string; closes: string };
export type WeeklyHours = Record<number, OpeningInterval[]>;
export function openingHoursFromText(text: string): WeeklyHours {
  const result: WeeklyHours = {};
  const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  for (const part of normalized.split(/[|;\n]/)) {
    const range = part.match(/(\d{1,2})(?:h|:)(\d{2})?\s*(?:as|a|ate|-)\s*(\d{1,2})(?:h|:)(\d{2})?/);
    if (!range) continue;
    const opens = `${range[1].padStart(2, "0")}:${range[2] || "00"}`, closes = `${range[3].padStart(2, "0")}:${range[4] || "00"}`;
    if (Number(range[1]) > 23 || Number(range[3]) > 23 || Number(range[2] || 0) > 59 || Number(range[4] || 0) > 59) continue;
    let days: number[] = [];
    if (/todos os dias|diariamente/.test(part)) days = [0, 1, 2, 3, 4, 5, 6];
    else if (/seg.*(?:sab|sex)/.test(part)) days = /sab/.test(part) ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
    else days = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"].flatMap((day, index) => part.includes(day) ? [index] : []);
    for (const day of days) (result[day] ||= []).push({ opens, closes });
  }
  return result;
}
export function regularHours(sundayCloses = "22:00"): WeeklyHours {
  return Object.fromEntries(Array.from({ length: 7 }, (_, day) => [day, [{ opens: "07:00", closes: day === 0 ? sundayCloses : "22:00" }]]));
}
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function storeStatus(hours: WeeklyHours, now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value || "";
  const day = weekdays.indexOf(value("weekday"));
  const minute = Number(value("hour")) * 60 + Number(value("minute"));
  const minutes = (time: string) => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
  for (const interval of hours[day] || []) {
    const opens = minutes(interval.opens), closes = minutes(interval.closes);
    if (closes > opens ? minute >= opens && minute < closes : minute >= opens) return { open: true, closes: interval.closes };
  }
  for (const interval of hours[(day + 6) % 7] || []) if (minutes(interval.closes) <= minutes(interval.opens) && minute < minutes(interval.closes)) return { open: true, closes: interval.closes };
  return { open: false, closes: null };
}
