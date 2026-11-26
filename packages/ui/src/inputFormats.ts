import { cardNetwork } from "./cardNetwork.js";
import type { SegmentedInputFormat } from "./inputMask.js";

function digits(value: string, limit: number) {
  return value.replaceAll(/\D/g, "").slice(0, limit);
}

/** Insert spaces only between populated groups, leaving incomplete entries editable. */
function grouped(value: string, sizes: readonly number[]) {
  const parts: string[] = [];
  let start = 0;
  for (let index = 0; index < sizes.length - 1; index++) {
    const end = start + sizes[index]!;
    if (end >= value.length) break;
    parts.push(value.slice(start, end));
    start = end;
  }
  parts.push(value.slice(start));
  return parts.join(" ");
}

// National lengths from the SWIFT IBAN Registry, release 103 (September 2026).
// https://www.swift.com/standards/data-standards/iban-international-bank-account-number
const ibanCountryLengths: Readonly<Partial<Record<string, number>>> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16,
  BG: 22, BH: 22, BI: 27, BR: 29, BY: 28, CH: 21, CR: 22,
  CY: 28, CZ: 24, DE: 22, DJ: 27, DK: 18, DO: 28, EE: 20,
  EG: 29, ES: 24, FI: 18, FK: 18, FO: 18, FR: 27, GB: 22,
  GE: 22, GI: 23, GL: 18, GR: 27, GT: 28, HN: 28, HR: 21,
  HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26, IT: 27, JO: 30,
  KW: 30, KZ: 20, LB: 28, LC: 32, LI: 21, LT: 20, LU: 20,
  LV: 21, LY: 25, MC: 27, MD: 24, ME: 22, MK: 19, MN: 20,
  MR: 27, MT: 31, MU: 30, NI: 28, NL: 18, NO: 15, OM: 23,
  PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24, RS: 22,
  RU: 33, SA: 24, SC: 31, SD: 18, SE: 24, SI: 19, SK: 24,
  SM: 27, SO: 23, ST: 25, SV: 28, TL: 23, TN: 24, TR: 26,
  UA: 29, VA: 22, VG: 24, XK: 20, YE: 30,
};

const ibanMaxLength = 34;
function ibanSegments(raw: string) {
  const countryLength = ibanCountryLengths[raw.slice(0, 2).toUpperCase()];
  // Keep overlength values accessible when correcting their country prefix.
  // An unknown prefix grows one group ahead as the user types.
  const capacity = countryLength === undefined
    ? Math.max(8, (Math.floor(raw.length / 4) + 1) * 4)
    : Math.max(countryLength, raw.length);
  const length = Math.min(capacity, ibanMaxLength);
  return Array.from({ length: Math.ceil(length / 4) }, (_, index) => Math.min(4, length - index * 4));
}

/** Electronic IBAN in the model, print groups of four in the field. */
export const ibanFormat: SegmentedInputFormat = {
  inputMode: "text",
  parse: value => value.replaceAll(/[^A-Za-z0-9]/g, "").slice(0, ibanMaxLength).toUpperCase(),
  format: raw => grouped(raw, ibanSegments(raw)),
  segments: ibanSegments,
};

const amexGroups = [4, 6, 5] as const;
const cardGroups = [4, 4, 4, 4] as const;
function cardSegments(raw: string) {
  if (cardNetwork(raw) === "amex") return raw.length > 15 ? [...amexGroups, 4] : amexGroups;
  return raw.length > 16 ? [...cardGroups, 3] : cardGroups;
}

/** Card number entry with the 4–6–5 layout for American Express. */
export const paymentCardFormat: SegmentedInputFormat = {
  inputMode: "numeric",
  autoComplete: "cc-number",
  parse: value => digits(value, 19),
  format: raw => grouped(raw, cardSegments(raw)),
  segments: cardSegments,
};

const sirenGroups = [3, 3, 3] as const;
const siretGroups = [...sirenGroups, 5] as const;

/** The nine digits identifying a French legal unit. */
export const sirenFormat: SegmentedInputFormat = {
  inputMode: "numeric",
  parse: value => digits(value, 9),
  format: raw => grouped(raw, sirenGroups),
  segments: () => sirenGroups,
};

/** The SIREN and the five-digit establishment identifier (NIC). */
export const siretFormat: SegmentedInputFormat = {
  inputMode: "numeric",
  parse: value => digits(value, 14),
  format: raw => grouped(raw, siretGroups),
  segments: () => siretGroups,
};
