import { columnGrid, rowGrid, spanWidth } from "./src/composition/grid.mjs";

const lab = document.querySelector(".grid-lab");
const frame = lab.querySelector("#grid-frame");
const controls = lab.querySelector("form");
const readings = lab.querySelector(".grid-lab__readings");
const lines = frame.querySelector(".grid-sheet__lines");
const inputs = Object.fromEntries(
  [...controls.querySelectorAll("input")].map(input => [input.id.slice("grid-".length), input])
);
const number = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const px = value => number.format(value) + " px";

function setLimit(input, maximum) {
  input.max = String(maximum);
  if (input.valueAsNumber > maximum) input.valueAsNumber = maximum;
}

function showValue(name, value) {
  lab.querySelector(`[data-value="${name}"]`).textContent = value;
  inputs[name].setAttribute("aria-valuetext", value);
}

function draw() {
  const columns = inputs.columns.valueAsNumber;
  frame.style.setProperty("--grid-width", inputs.width.value + "px");
  const width = frame.getBoundingClientRect().width;
  if (width <= 0) return;

  // Limit deductions to keep at least one CSS pixel per track whenever it fits.
  setLimit(inputs.margin, Math.max(0, Math.min(64, Math.floor((width - columns) / 2))));
  const margin = inputs.margin.valueAsNumber;
  const gutterLimit = columns > 1 ? Math.floor((width - 2 * margin - columns) / (columns - 1)) : 32;
  setLimit(inputs.gutter, Math.max(0, Math.min(32, gutterLimit)));
  inputs.gutter.disabled = columns === 1;
  setLimit(inputs.span, columns);

  const gutter = inputs.gutter.valueAsNumber;
  const span = inputs.span.valueAsNumber;
  const step = inputs.baseline.valueAsNumber;
  const grid = columnGrid(width, columns, margin, gutter);
  const [firstModule] = rowGrid(step, step, 4, 6).modules;
  const moduleDepth = firstModule.end - firstModule.start;
  const leadWidth = spanWidth(grid.track, gutter, span);

  frame.style.setProperty("--grid-columns", columns);
  frame.style.setProperty("--grid-margin", margin + "px");
  frame.style.setProperty("--grid-gutter", gutter + "px");
  frame.style.setProperty("--grid-span", span);
  frame.style.setProperty("--grid-baseline", step + "px");
  frame.style.setProperty("--grid-module", moduleDepth + "px");
  if (lines.childElementCount !== columns) {
    lines.replaceChildren(...grid.starts.map(() => document.createElement("i")));
  }

  showValue("width", px(inputs.width.valueAsNumber));
  showValue("columns", String(columns));
  showValue("margin", px(margin));
  showValue("gutter", columns === 1 ? "No gutter" : px(gutter));
  showValue("baseline", px(step));
  showValue("span", span === 1 ? "1 column" : span + " columns");
  const dimensions = { frame: width, track: grid.track, span: leadWidth, reserve: grid.inner - leadWidth, module: moduleDepth };
  for (const [name, value] of Object.entries(dimensions)) {
    readings.querySelector(`[data-readout="${name}"]`).textContent = px(Math.max(0, value));
  }
}

controls.hidden = false;
controls.addEventListener("input", draw);
draw();
readings.hidden = false;
new ResizeObserver(draw).observe(frame.parentElement);

// CSS lays out the three views; these readings report the width they actually receive.
const series = document.querySelector(".archive-series");
const mount = series.querySelector(".archive-series__mount");
const archiveFrame = series.querySelector(".archive-series__frame");
const available = series.querySelector("#archive-width");
const availableValue = series.querySelector("#archive-width-value");
const archiveMeasure = series.querySelector(".archive-series__measure");
const firstTrack = archiveFrame.querySelector(".archive-series__ruling i");
let chosenWidth = available.valueAsNumber;

function measureEdition() {
  const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  const mountRem = mount.getBoundingClientRect().width / rem;
  if (mountRem <= 0) return;
  const maximum = Math.min(64, Math.max(.25, Math.floor(mountRem * 4) / 4));
  available.min = String(Math.min(14, maximum));
  available.max = String(maximum);
  available.valueAsNumber = Math.min(chosenWidth, maximum);
  series.style.setProperty("--archive-width", available.value + "rem");
  const frameRem = archiveFrame.getBoundingClientRect().width / rem;
  const track = firstTrack.getBoundingClientRect().width / rem;
  availableValue.textContent = number.format(available.valueAsNumber) + " rem";
  available.setAttribute("aria-valuetext", availableValue.textContent);
  const ruling = track > 0 ? `column ${number.format(track)} rem` : "one reading column";
  const report = `Shared frame ${number.format(frameRem)} rem · ${ruling}.`;
  if (archiveMeasure.textContent !== report) archiveMeasure.textContent = report;
}

available.closest(".archive-series__width").hidden = false;
archiveMeasure.hidden = false;
available.addEventListener("input", () => {
  chosenWidth = available.valueAsNumber;
  measureEdition();
});
measureEdition();
const editionResize = new ResizeObserver(() => requestAnimationFrame(measureEdition));
editionResize.observe(archiveFrame);
editionResize.observe(mount);
