// Recognise only unambiguous prefixes. Unrecognised cards use the generic artwork.
export function cardNetwork(digits: string) {
  if (/^3[47]/.test(digits)) return "amex";
  if (digits.startsWith("4")) return "visa";
  const firstFour = Number(digits.slice(0, 4));
  if (/^5[1-5]/.test(digits) || (digits.length >= 4 && firstFour >= 2221 && firstFour <= 2720)) return "mastercard";
  return "generic";
}
