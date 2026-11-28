import { Card, CardTitle, Table, TableBody, TableCaption, TableCell, TableHead, TableHeaderCell, TableRow } from "@alien6-studio/elea-ui";
import { MeasurementMap, MeasurementPlot, type MeasurementLane } from "@alien6-studio/elea-ui/measurement";
import { eligible, eligibleDuration, exposureTrace, firstQualification, outcomeContrast, outcomeRates, outcomes, uninterruptedTrace, type ExposureSlice } from "../src/observe/study.js";
import { exposureRule, sample, signals } from "../src/observe/model.js";

const ms = (value: number) => `${value.toLocaleString("en")} ms`;
const percent = (value: number) => `${value.toFixed(0)}%`;

export function ExposureFigure() {
  const qualification = firstQualification(exposureTrace);
  const bands = (keeps: (slice: ExposureSlice) => boolean, tone: "neutral" | "accent") => exposureTrace.filter(keeps)
    .map(({ start, end }) => ({ id: String(start), from: start, to: end, tone }));
  const lanes: MeasurementLane[] = [
    { id: "intersection", label: "Area ≥ 50%", marks: bands(row => row.ratio >= exposureRule.minimumIntersectionRatio, "neutral") },
    { id: "visible", label: "Document visible", marks: bands(row => row.visible, "neutral") },
    { id: "eligible", label: "Eligible dwell", marks: bands(eligible, "accent") },
    { id: "qualified", label: "Qualification", marks: qualification === null ? [] : [{ id: "first", at: qualification, shape: "square" }] },
  ];
  return (
    <Card padding="sm">
      <MeasurementPlot min={0} max={exposureTrace.at(-1)!.end} lanes={lanes} format={ms}
        label="Timing of intersection, document visibility, eligible dwell and the first exposure qualification"
        caption={<>Constructed trace. The first interval ends at {ms(300)}. The visible document starts a new interval at {ms(450)}.
          {qualification !== null && <> The square marks qualification at {ms(qualification)}.</>}</>} />
      <Table label="Exposure trace values" density="sm">
        <TableCaption>Input intervals for the exposure trace</TableCaption>
        <TableHead><TableRow>
          <TableHeaderCell scope="col">Interval</TableHeaderCell><TableHeaderCell scope="col">Area</TableHeaderCell>
          <TableHeaderCell scope="col">Document</TableHeaderCell>
        </TableRow></TableHead>
        <TableBody>{exposureTrace.map(row => (
          <TableRow key={row.start}>
            <TableHeaderCell scope="row">{row.start}–{row.end} ms</TableHeaderCell>
            <TableCell>{percent(100 * row.ratio)}</TableCell><TableCell>{row.visible ? "Visible" : "Hidden"}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </Card>
  );
}

export function OutcomeFigure() {
  const lanes: MeasurementLane[] = outcomes.map(row => {
    const { lower, upper } = outcomeRates(row);
    return {
      id: row.id,
      label: `${row.id} · ${row.label}`,
      marks: [
        { id: "confirmed", from: 0, to: lower },
        { id: "missing", from: lower, to: upper, hatched: true },
        { id: "other", from: upper, to: 100, tone: "muted" },
      ],
    };
  });

  return (
    <Card padding="sm">
      <MeasurementPlot min={0} max={100} lanes={lanes} format={percent}
        label="Confirmed saves, missing outcomes and other recorded outcomes as shares of assigned attempts"
        caption="Synthetic counts on a shared 0–100% scale. The coloured band shows confirmed saves, the hatching shows missing outcomes and the remaining grey band shows other recorded outcomes." />
      <Table label="Synthetic attempt outcomes" density="sm">
        <TableCaption>One hundred assigned attempts per variant</TableCaption>
        <TableHead><TableRow>
          <TableHeaderCell scope="col">Measure</TableHeaderCell>
          {outcomes.map(row => <TableHeaderCell scope="col" key={row.id} aria-label={`${row.id} · ${row.label}`}>{row.id}</TableHeaderCell>)}
        </TableRow></TableHead>
        <TableBody>
          {([
            ["Activations", (row: typeof outcomes[number]) => row.activated],
            ["Saved", (row: typeof outcomes[number]) => row.confirmed],
            ["Other", (row: typeof outcomes[number]) => row.other],
            ["Missing", (row: typeof outcomes[number]) => outcomeRates(row).missing],
            ["Save bounds", (row: typeof outcomes[number]) => {
              const rates = outcomeRates(row);
              return `${percent(rates.lower)}–${percent(rates.upper)}`;
            }],
          ] as const).map(([label, value]) => (
            <TableRow key={label}><TableHeaderCell scope="row">{label}</TableHeaderCell>
              {outcomes.map(row => <TableCell key={row.id}>{value(row)}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export function SlotFigure() {
  const cells = [
    { id: "preview", label: "Preview", value: 2 },
    { id: "save", label: "Save", value: 6 },
    { id: "layout", label: "Layout", value: 1 },
    { id: "reset", label: "Reset", value: 0 },
  ] as const;
  const [preview, save, layout, reset] = cells;
  const placements = [
    { label: "Save on the right", cells },
    { label: "Save on the left", cells: [save, preview, layout, reset] },
  ];
  return (
    <Card padding="sm">
      <div className="elea-grid">
        {placements.map(placement => (
          <Card key={placement.label} variant="subtle" padding="sm" className="elea-col-md-4 elea-col-lg-6">
            <CardTitle as="h3">{placement.label}</CardTitle>
            <MeasurementMap cells={placement.cells} maximum={6} />
          </Card>
        ))}
      </div>
    </Card>
  );
}

export function TimestampFigure() {
  const lanes: MeasurementLane[] = signals.filter(signal => sample.some(record => record.event.kind === signal.kind))
    .map(signal => ({
      id: signal.kind,
      label: signal.label,
      marks: sample.filter(record => record.event.kind === signal.kind).map(record => ({
        id: String(record.index), at: record.elapsedMs, shape: signal.kind === "task.outcome" ? "square" : "circle",
      })),
    }));
  return (
    <Card padding="sm">
      <MeasurementPlot min={0} max={2500} lanes={lanes} format={ms}
        label="Synthetic focus, exposure, activations and save outcome on the same time scale"
        caption="The final activation and the outcome share the displayed time. The event list keeps their insertion order." />
      <Table label="Order within the last time bucket" density="sm">
        <TableCaption>Two records at 2,260 ms</TableCaption>
        <TableHead><TableRow>
          <TableHeaderCell scope="col">Order</TableHeaderCell><TableHeaderCell scope="col">Signal</TableHeaderCell>
          <TableHeaderCell scope="col">Time</TableHeaderCell>
        </TableRow></TableHead>
        <TableBody>{sample.slice(-2).map(record => (
          <TableRow key={record.index}>
            <TableHeaderCell scope="row">{record.index}</TableHeaderCell>
            <TableCell>{signals.find(signal => signal.kind === record.event.kind)?.label}</TableCell>
            <TableCell>{ms(record.elapsedMs)}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </Card>
  );
}

export function DwellFigure() {
  const traces = [
    { label: "Continuous", intervals: uninterruptedTrace },
    { label: "Interrupted", intervals: exposureTrace },
  ] as const;
  const lanes: MeasurementLane[] = traces.map(({ label, intervals }) => {
    const qualify = firstQualification(intervals);
    const marks: MeasurementLane["marks"] = [
      ...intervals.filter(eligible).map(({ start, end }) => ({ id: String(start), from: start, to: end, tone: "neutral" as const })),
      ...(qualify === null ? [] : [{ id: "qualification", at: qualify, shape: "square" as const }]),
    ];
    return { id: label, label, marks };
  });
  return (
    <Card padding="sm">
      <MeasurementPlot min={0} max={1200} lanes={lanes} format={ms}
        label="Continuous and interrupted exposure traces with equal eligible durations"
        caption={<>Both traces contain {ms(eligibleDuration(exposureTrace))} of eligible time.
          The squares mark first qualification at {ms(firstQualification(uninterruptedTrace)!)} and {ms(firstQualification(exposureTrace)!)}.</>} />
    </Card>
  );
}

function signed(value: number, decimals = 0) {
  const magnitude = Math.abs(value).toFixed(decimals);
  if (value < 0) return `−${magnitude}`;
  return value > 0 ? `+${magnitude}` : magnitude;
}

export function ContrastFigure() {
  const { lower, upper, observed } = outcomeContrast();
  return (
    <Card padding="sm">
      <MeasurementPlot min={-20} max={20} format={value => `${signed(value)} pp`}
        lanes={[
          { id: "zero", label: "Equal rates", marks: [{ id: "zero", at: 0, tone: "neutral" }] },
          { id: "observed", label: "Observed only", marks: [{ id: "estimate", at: observed }] },
          { id: "bounds", label: "All assigned", marks: [{ id: "bounds", from: lower, to: upper, hatched: true }] },
        ]}
        label="Difference in save proportions between leading and trailing layout, in percentage points"
        caption={<>A minus B. The observed subset gives {signed(observed, 1)} percentage points. Assigning the missing outcomes to
          their extremes yields a range from {signed(lower)} to {signed(upper)} points.</>} />
    </Card>
  );
}
