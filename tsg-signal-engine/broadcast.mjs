import { generateContentCalendar } from "./content.mjs";

let _calendar = null;

export function getCalendar() {
  if (!_calendar) _calendar = generateContentCalendar();
  return _calendar;
}

export function getWeekNumber(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start;
  return Math.ceil(diff / 604800000);
}

export function getCurrentEntry(cursor) {
  const cal = getCalendar();
  if (cal.length === 0) return null;
  return cal[cursor % cal.length];
}

export function getMonthlyDigest(cursor) {
  const cal = getCalendar();
  if (cal.length === 0) return [];
  const entries = [];
  for (let i = 0; i < 4; i++) {
    const idx = (cursor - 3 + i) % cal.length;
    entries.push(cal[idx < 0 ? cal.length + idx : idx]);
  }
  return entries;
}
