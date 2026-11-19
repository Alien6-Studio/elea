/** Joins class names, skipping empty values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

let counter = 0;
/** A stable id for pairing a field with its label and messages when none is given. */
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
