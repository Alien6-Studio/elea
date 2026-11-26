import {
  formatIncompletePhoneNumber,
  parseIncompletePhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";
import type { InputFormat } from "./inputMask.js";

export { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js/min";

const formats = new Map<CountryCode, InputFormat>();

/** Format national input for the selected country and international input for its own calling code. */
export function phoneFormat(country: CountryCode): InputFormat {
  const cached = formats.get(country);
  if (cached) return cached;
  const format: InputFormat = {
    parse: parseIncompletePhoneNumber,
    format: raw => formatIncompletePhoneNumber(raw, country),
    inputMode: "tel",
    autoComplete: "tel",
  };
  formats.set(country, format);
  return format;
}

/** Return an E.164 number for a complete, possible-length entry without an extension. */
export function phoneToE164(value: string, country: CountryCode): string | undefined {
  const number = parsePhoneNumberFromString(value, { defaultCountry: country, extract: false });
  if (!number || number.ext || number.number.length > 16 || !number.isPossible()) return undefined;
  return number.number;
}
