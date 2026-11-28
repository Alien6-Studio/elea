import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MeasurementLog, MeasurementMap, MeasurementPlot, MeasurementRecord } from "./Measurement.js";

test("a measurement plot renders point and interval marks on the supplied scale", () => {
  const html = renderToStaticMarkup(<MeasurementPlot min={0} max={1200} format={String} label="Exposure timing"
    lanes={[{ id: "dwell", label: "Dwell", marks: [
      { id: "interval", from: 450, to: 1100 },
      { id: "threshold", at: 1050, shape: "square", selected: true },
    ] }]} caption="Constructed trace" />);
  assert.match(html, /role="img" aria-label="Exposure timing"/);
  assert.match(html, /inset-inline-start:37\.5%;inline-size:54\.166/);
  assert.match(html, /data-shape="square" data-selected="true" style="inset-inline-start:87\.5%"/);
  assert.match(html, /<figcaption>Constructed trace<\/figcaption>/);
});

test("measurement maps show counts and the log exposes controlled selection", () => {
  const map = renderToStaticMarkup(<MeasurementMap maximum={8} cells={[{ id: "save", label: "Save", value: 4 }]} />);
  assert.match(map, /--elea-measurement-density:30%/);
  assert.match(map, /<dt>Save<\/dt><dd>4<\/dd>/);
  const log = renderToStaticMarkup(<MeasurementLog aria-label="Sequence" selected="one" controls="record"
    entries={[{ id: "one", label: "First", value: "0 ms" }]} onSelect={() => {}} />);
  assert.match(log, /role="list"/);
  assert.match(log, /aria-pressed="true" aria-controls="record"/);
  const record = renderToStaticMarkup(<MeasurementRecord aria-label="Event"><code>{'<signal>'}</code></MeasurementRecord>);
  assert.match(record, /<code>&lt;signal&gt;<\/code>/);
});
