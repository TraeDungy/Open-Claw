/**
 * Unit helpers. Everything inside the app is stored in millimetres and
 * millimetres squared. Display conversion happens at the edges only.
 */

export const MM_PER_INCH = 25.4;
export const MM_PER_FOOT = 304.8;
export const MM2_PER_SQFT = MM_PER_FOOT * MM_PER_FOOT;
export const MM2_PER_SQM = 1_000_000;

export const inches = (n) => n * MM_PER_INCH;
export const feet = (n) => n * MM_PER_FOOT;

export const toInches = (mm) => mm / MM_PER_INCH;
export const toFeet = (mm) => mm / MM_PER_FOOT;
export const toSqFt = (mm2) => mm2 / MM2_PER_SQFT;
export const toSqM = (mm2) => mm2 / MM2_PER_SQM;

/** Round to a sensible number of decimals without trailing zeros. */
export function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** 2438 -> `8' 0"` (nearest 1/2 inch, which is as fine as anyone builds). */
export function formatFeetInches(mm) {
  const totalHalfInches = Math.round(toInches(mm) * 2);
  const totalInches = Math.floor(totalHalfInches / 2);
  const half = totalHalfInches % 2 === 1;
  const ft = Math.floor(totalInches / 12);
  const inch = totalInches % 12;
  return `${ft}' ${inch}${half ? '½' : ''}"`;
}

export function formatLength(mm, units = 'imperial') {
  if (units === 'metric') {
    return mm >= 1000 ? `${round(mm / 1000, 2)} m` : `${Math.round(mm)} mm`;
  }
  return formatFeetInches(mm);
}

export function formatArea(mm2, units = 'imperial') {
  if (units === 'metric') return `${round(toSqM(mm2), 1)} m²`;
  return `${Math.round(toSqFt(mm2))} sq ft`;
}

export function formatWeight(kg, units = 'imperial') {
  if (units === 'metric') return `${Math.round(kg).toLocaleString('en-US')} kg`;
  return `${Math.round(kg * 2.20462).toLocaleString('en-US')} lb`;
}

export function formatMoney(usd) {
  return `$${Math.round(usd).toLocaleString('en-US')}`;
}

/**
 * Parse a user-typed length. Accepts `8'6"`, `8ft 6in`, `102"`, `2438mm`, `2.4m`.
 * Returns millimetres, or null when the input is not a length.
 */
export function parseLength(input, units = 'imperial') {
  if (typeof input === 'number' && Number.isFinite(input)) return input;
  if (typeof input !== 'string') return null;
  const text = input.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!text) return null;

  const mm = text.match(/^(-?[\d.]+)\s*mm$/);
  if (mm) return Number(mm[1]);

  const cm = text.match(/^(-?[\d.]+)\s*cm$/);
  if (cm) return Number(cm[1]) * 10;

  const m = text.match(/^(-?[\d.]+)\s*m$/);
  if (m) return Number(m[1]) * 1000;

  const ftIn = text.match(/^(-?[\d.]+)\s*(?:'|ft|feet)\s*(?:(-?[\d.]+)\s*(?:"|in|inch|inches)?)?$/);
  if (ftIn) return feet(Number(ftIn[1])) + inches(Number(ftIn[2] ?? 0));

  const inOnly = text.match(/^(-?[\d.]+)\s*(?:"|in|inch|inches)$/);
  if (inOnly) return inches(Number(inOnly[1]));

  const bare = Number(text);
  if (Number.isFinite(bare)) return units === 'metric' ? bare : inches(bare);
  return null;
}

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
