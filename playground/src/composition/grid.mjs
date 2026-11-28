// Coordinates start at the frame's leading edge. All lengths use the same unit.
export function columnGrid(width, columns, margin, gutter) {
  if (![width, margin, gutter].every(Number.isFinite) || margin < 0 || gutter < 0 ||
      !Number.isSafeInteger(columns) || columns < 1) {
    throw new RangeError("Use positive column counts and finite, nonnegative distances.");
  }
  const inner = width - 2 * margin;
  const track = (inner - (columns - 1) * gutter) / columns;
  if (track <= 0) throw new RangeError("Margins and gutters leave no column width.");
  const starts = Array.from({ length: columns }, (_, i) => margin + i * (track + gutter));
  return { track, inner, starts };
}

export function spanWidth(track, gutter, span) {
  if (!Number.isFinite(track) || track <= 0 || !Number.isFinite(gutter) || gutter < 0 ||
      !Number.isSafeInteger(span) || span < 1) {
    throw new RangeError("A span needs a positive track width, a nonnegative gutter and a whole number of tracks.");
  }
  return span * track + (span - 1) * gutter;
}

// Width of a symmetric frame at which this span has exactly the desired measure.
export function frameForSpan(measure, span, columns, margin, gutter) {
  if (!Number.isFinite(measure) || !Number.isSafeInteger(span) || span < 1 || span > columns || !Number.isFinite(margin) || margin < 0) {
    throw new RangeError("Use a finite measure, a span inside the ruling and a nonnegative margin.");
  }
  const track = (measure - (span - 1) * gutter) / span;
  return 2 * margin + spanWidth(track, gutter, columns);
}

// Module heights are integer multiples of the baseline step, with one empty step between modules.
export function rowGrid(top, step, rowsPerModule, count) {
  if (!Number.isFinite(top) || !Number.isFinite(step) || step <= 0 ||
      !Number.isSafeInteger(rowsPerModule) || rowsPerModule < 1 || !Number.isSafeInteger(count) || count < 1) {
    throw new RangeError("Use a positive step and positive whole numbers of rows and modules.");
  }
  const modules = Array.from({ length: count }, (_, i) => {
    const start = top + i * (rowsPerModule + 1) * step;
    return { start, end: start + rowsPerModule * step };
  });
  const baseline = Array.from({ length: count * (rowsPerModule + 1) }, (_, i) => top + i * step);
  return { modules, baseline };
}
