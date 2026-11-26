/** A progressive display format for text inputs. Parsing a formatted value recovers its editable characters. A longer display prefix must not yield fewer characters. */
export interface InputFormat {
  parse: (value: string) => string;
  format: (raw: string) => string;
  inputMode?: "text" | "numeric" | "tel";
  autoComplete?: string;
}

export interface SegmentedInputFormat extends InputFormat {
  /** Maximum character count of each editable block, in display order. */
  segments: (raw: string) => readonly number[];
}

type Mask = string | InputFormat;

// A # consumes one digit. Punctuation is emitted with its following group, so a
// partly entered identifier has no dangling separator. Offsets stay in DOM units.
const digits = (value: string) => value.replaceAll(/\D/g, "");

export function formatInputMask(value: string, mask: Mask, limit = Infinity): string {
  if (typeof mask !== "string") {
    const raw = mask.parse(value);
    const display = mask.format(raw);
    if (display.length <= limit) return display;
    // Formatting can add separators after the browser has applied maxLength.
    // Keep the longest complete prefix that fits, without splitting a group separator.
    let end = Math.min(raw.length, limit);
    let prefix = mask.format(raw.slice(0, end));
    while (prefix.length > limit && end > 0) prefix = mask.format(raw.slice(0, --end));
    return prefix;
  }
  const raw = digits(value);
  if (!raw) return "";
  let result = "";
  let separator = "";
  let index = 0;
  for (const character of mask) {
    if (character === "#") {
      if (index === raw.length || result.length + separator.length >= limit) return result;
      result += separator + raw[index++];
      separator = "";
    } else {
      separator += character;
    }
  }
  return (result + separator).slice(0, limit);
}

function positionAfterCharacters(value: string, count: number, mask: Mask): number {
  if (count === 0) return 0;
  if (typeof mask !== "string") {
    // Find the earliest display boundary covering the edit, even when grouping
    // changes with the prefix. Avoid reparsing every prefix of a long paste.
    let low = 0;
    let high = value.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (mask.parse(value.slice(0, middle)).length < count) low = middle + 1;
      else high = middle;
    }
    return low;
  }
  let seen = 0;
  for (let i = 0; i < value.length; i++) {
    if (/\d/.test(value[i]!) && ++seen === count) return i + 1;
  }
  return value.length;
}

/** Map the native edit back to a display value and a caret in the same logical group. */
export function applyInputMask(input: HTMLInputElement, mask: Mask, previous: string, inputType?: string, commitComposition = false): void {
  const edited = input.value;
  const position = input.selectionStart ?? edited.length;
  const parse = (text: string) => typeof mask === "string" ? digits(text) : mask.parse(text);
  let before = parse(edited.slice(0, position)).length;
  let raw = parse(edited);
  // A native backward or forward deletion may remove only the grouping space.
  // Consume the adjacent digit as well so the caret can cross that boundary.
  if (edited.length < previous.length && raw === parse(previous)) {
    if (inputType === "deleteContentBackward" && before > 0) {
      before--;
      raw = raw.slice(0, before) + raw.slice(before + 1);
    } else if (inputType === "deleteContentForward") {
      raw = raw.slice(0, before) + raw.slice(before + 1);
    }
  }
  // A native edit within maxLength must still fit after the separators are added.
  const limit = input.maxLength >= edited.length ? input.maxLength : Infinity;
  const formatted = formatInputMask(raw, mask, limit);
  if (formatted === edited) return;
  if (commitComposition) {
    const prototype = input.ownerDocument.defaultView!.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(input, formatted);
  } else {
    input.value = formatted;
  }
  if (input.selectionStart !== null) {
    const caret = positionAfterCharacters(formatted, before, mask);
    input.setSelectionRange(caret, caret);
  }
}
