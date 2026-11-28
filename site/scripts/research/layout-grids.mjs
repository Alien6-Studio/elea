// Rebuild the static plates from the same arithmetic as the grid laboratory.
// Run with --check to verify the checked-in figures without writing the study.
import { readFileSync, writeFileSync } from "node:fs";
import { columnGrid, frameForSpan, rowGrid, spanWidth } from "../../playground/src/composition/grid.mjs";

const page = new URL("../../docs/research/composition-of-interfaces.md", import.meta.url);
const width = 240;
const height = 160;
const gutter = 6;
const { track, starts } = columnGrid(width, 6, 18, gutter);
const { modules, baseline } = rowGrid(16, 8, 3, 4);

function rect(x, y, w, h, role) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="grid-plot__${role}"/>`;
}

function line(x1, y1, x2, y2, role) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="grid-plot__${role}"/>`;
}

function drawing(title, description, marks) {
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}"><title>${title}</title><desc>${description}</desc>
${rect(0, 0, width, height, "field")}
${marks.join("\n")}
</svg>`;
}

function text(x, y, content, style) {
  return `<text x="${x}" y="${y}" class="grid-plot__${style}">${content}</text>`;
}

function departureBoard(destinationColumn) {
  const first = starts[0];
  const last = starts[5] + track;
  const marks = [
    text(first, 32, "Departures", "heading"),
    line(first, 43, last, 43, "fold"),
    ...starts.map(x => line(x, 49, x, 139, "guide")),
  ];
  const services = [["08:10", "North Pier", "Platform 2"], ["08:40", "Dry Dock", "Platform 1"], ["09:20", "Tide Mill", "Platform 3"]];
  for (const [i, [time, destination, platform]] of services.entries()) {
    const y = 66 + 31 * i;
    marks.push(text(first, y, time, "entry"), text(starts[destinationColumn], y, destination, "entry"),
      text(starts[4], y, platform, "entry"), line(first, y + 10, last, y + 10, "row-rule"));
  }
  const open = destinationColumn === 1 ? "before the platform" : "after the time";
  return drawing(`Departures with space ${open}`, `The three services have the same times, destinations and platforms. One column is empty ${open}.`, marks);
}

function columnDrawing(split) {
  const second = starts.length - split;
  const a = spanWidth(track, gutter, split);
  const b = spanWidth(track, gutter, second);
  const label = (x, value) => `<text x="${x}" y="88" text-anchor="middle" class="grid-plot__value">${value}</text>`;
  return drawing(`${split} plus ${second} columns`,
    `Six tracks of ${track} units, with two occupied spans of ${a} and ${b} separated by one six-unit gutter.`, [
      ...starts.map(x => rect(x, 8, track, 144, "track")),
      rect(starts[0], 45, a, 78, "span"), rect(starts[split], 45, b, 78, "span"),
      label(starts[0] + a / 2, a), label(starts[split] + b / 2, b),
      ...starts.flatMap(x => [line(x, 8, x, 152, "edge"), line(x + track, 8, x + track, 152, "edge")]),
    ]);
}

function plate(views, caption) {
  return `<figure class="grid-plot">
<div class="grid-plot__pair">
${views.map(([name, view]) => `<div>${view}<span class="grid-plot__label">${name}</span></div>`).join("\n")}
</div>
<figcaption>${caption}</figcaption>
</figure>`;
}

const guides = baseline.map(y => line(18, y, 222, y, "guide"));
const rows = drawing("Four module rows", "Four 24-unit rows are separated by 8 units. Each row spans three steps of the horizontal ruling.", [
  ...modules.flatMap(({ start, end }) => starts.map(x => rect(x, start, track, end - start, "module"))),
  ...guides,
]);
const type = drawing("Two baseline sequences", "Starting on the same ruling, lines set 16 units apart and 24 units apart meet again after 48 and 96 units.", [
  ...guides,
  ...baseline.filter((_, i) => i % 2 === 0).map(y => line(18, y, 117, y, "ink")),
  ...baseline.filter((_, i) => i % 3 === 0).map(y => line(123, y, 222, y, "accent")),
]);

function facingPages() {
  const w = 120, h = 180;
  const textWidth = 2 * w / 3, textHeight = 2 * h / 3;
  const top = h / 9;
  const pages = [0, w].flatMap((left, pageNumber) => {
    const textLeft = left + (pageNumber === 0 ? 2 : 1) * w / 9;
    return [
      rect(left, 0, w, h, "field"),
      ...Array.from({ length: 8 }, (_, i) => line(left + (i + 1) * w / 9, 0, left + (i + 1) * w / 9, h, "guide")),
      ...Array.from({ length: 8 }, (_, i) => line(left, (i + 1) * h / 9, left + w, (i + 1) * h / 9, "guide")),
      rect(textLeft, top, textWidth, textHeight, "span"),
      ...Array.from({ length: 17 }, (_, i) => {
        const y = top + 10 + 6 * i;
        const end = textLeft + textWidth * (i === 10 || i === 16 ? .66 : .93);
        return line(textLeft + 5, y, end, y, "type");
      }),
    ];
  });
  return `<figure class="grid-plot grid-plot--spread">
<svg viewBox="0 0 240 180" role="img" aria-label="Facing pages divided into ninths"><title>Facing pages divided into ninths</title><desc>The composition is mirrored at the fold. The outside margin of each page is twice its inside margin. The lower margin is twice the upper margin.</desc>
${pages.join("\n")}
${line(w, 0, w, h, "fold")}
</svg>
<figcaption>A facing-page construction in ninths. Each text field keeps its page’s proportions. At the fold, the two inner margins together equal one outer margin.</figcaption>
</figure>`;
}

// Draw the same record, two recordings and three results at one common scale.
function archivePlan(w) {
  const n = 6, margin = 2, gap = 1;
  const { starts, track, inner } = columnGrid(w, n, margin, gap);
  const scale = 4.6;
  const left = 6;
  const marks = [rect(left, 5, w * scale, 144, "paper")];
  for (const x of starts) marks.push(rect(left + x * scale, 9, track * scale, 136, "track"));
  function block(column, measure, top, depth, role = "span") {
    const start = left + starts[column] * scale;
    const size = measure * scale;
    marks.push(rect(start, top, size, depth, role), line(start + 3, top + 4, start + size * .72, top + 4, "type"));
  }
  const noteFits = w >= Math.max(frameForSpan(23, 4, n, margin, gap), frameForSpan(12, 2, n, margin, gap));
  if (noteFits) {
    block(0, spanWidth(track, gap, 4), 14, 25);
    block(4, spanWidth(track, gap, 2), 14, 15, "note");
  } else {
    block(0, Math.min(inner, 33), 14, 20);
    block(0, inner, 37, 11, "note");
  }
  const half = spanWidth(track, gap, 3);
  block(0, half, 64, 18);
  block(3, half, 64, 18);
  const perRow = w >= frameForSpan(13, 2, n, margin, gap) ? 3 : 2;
  const span = n / perRow;
  for (let i = 0; i < 3; i++) {
    block((i % perRow) * span, spanWidth(track, gap, span), 99 + Math.floor(i / perRow) * 21, 16);
  }
  return drawing(`Archive at ${w} rem`,
    `The note sits ${noteFits ? "beside" : "below"} the passage. The comparison is paired and the index fits ${perRow} entries in its first row.`, marks);
}

const plates = {
  "spread-plate": facingPages(),
  "column-plate": plate([["Three + three", columnDrawing(3)], ["Two + four", columnDrawing(2)]],
    "Both frames measure 240 × 160 units. Six 29-unit columns occupy the same positions in each. Changing the span assignment moves the division while preserving the margins and the separating gutter."),
  "rhythm-plate": plate([["Module rows", rows], ["16- and 24-unit leading", type]],
    "The first ruling lies 16 units below the top of the frame. An 8-unit step locates both the modules and the ideal text baselines. The two sequences on the right coincide every 48 units."),
  "series-plate": plate([["A 40-rem frame", archivePlan(40)], ["A 46-rem frame", archivePlan(46)]],
    "The upper band shows the record and its outlined note, the middle band a comparison, and the lower band an index of three recordings. The frames use the same horizontal scale."),
  "departure-plate": plate([["Time beside destination", departureBoard(1)], ["Destination beside platform", departureBoard(2)]],
    "Read across the 08:40 service. Dry Dock moves by one column. The times and platforms stay in place, and all three fields retain their width."),
};

let source = readFileSync(page, "utf8");
const original = source;
for (const [id, figure] of Object.entries(plates)) {
  const start = `<!-- ${id} -->`;
  const end = `<!-- /${id} -->`;
  if (!source.includes(start)) throw new Error(`Missing ${start} in the study`);
  const begin = source.indexOf(start);
  const finish = source.indexOf(end, begin);
  source = source.slice(0, begin) + `${start}\n${figure}\n${end}` +
    source.slice(finish === -1 ? begin + start.length : finish + end.length);
}
if (process.argv.includes("--check")) {
  if (source !== original) throw new Error("Regenerate the layout grid plates with node scripts/research/layout-grids.mjs");
} else if (source !== original) {
  writeFileSync(page, source);
}
