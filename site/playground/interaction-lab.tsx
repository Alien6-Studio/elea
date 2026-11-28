import { Button, Card, CardDescription, CardFooter, CardHeader, CardTitle, SaveStatus } from "@alien6-studio/elea-ui";
import { MeasurementLog, MeasurementMap, MeasurementPlot, MeasurementRecord, type MeasurementLane } from "@alien6-studio/elea-ui/measurement";
import { createLocalObserve, type LocalObservation, type LocalObserve, type ObserveEventV1 } from "@alien6-studio/observe";
import { createBrowserCollector, type BrowserBinding } from "@alien6-studio/observe/browser";
import { useEffect, useRef, useState, type MouseEvent, type KeyboardEvent } from "react";
import { createRoot } from "react-dom/client";
import { catalog, controls, exposureKey, exposureRule, layout, presentation, preview, sample, saved, signals, tools, type ToolKey } from "./src/observe/model.js";

const purpose = "interaction-workbench";
const last = 120;
const noRecords: readonly LocalObservation[] = [];
const seconds = (ms: number) => `${(ms / 1000).toFixed(2)} s`;
const metadata = (kind: ObserveEventV1["kind"]) => signals.find(signal => signal.kind === kind)!;
const context = () => presentation(document.documentElement.dataset.theme === "dark" ? "dark" : "light");

function ActivationMap({ records }: Readonly<{ records: readonly LocalObservation[] }>) {
  const counts = new Map<string, number>();
  for (const { event } of records) {
    if (event.kind === "interaction.activated") counts.set(event.target.slot, (counts.get(event.target.slot) ?? 0) + 1);
  }
  return <MeasurementMap cells={tools.map(({ key, label }) => ({ id: key, label, value: counts.get(key) ?? 0 }))}
    caption="Activations per registered zone in the displayed window. Shading scales to its highest count." />;
}

function Timeline({ records, selected, onSelect }: Readonly<{
  records: readonly LocalObservation[];
  selected: LocalObservation | undefined;
  onSelect: (index: number) => void;
}>) {
  if (!records.length) return <CardDescription>Events appear here when the workbench reports them.</CardDescription>;
  const start = records[0]!.elapsedMs;
  const end = records.at(-1)!.elapsedMs;
  const lanes: MeasurementLane[] = signals.map(signal => ({
    id: signal.kind,
    label: signal.label,
    marks: records.filter(({ event }) => event.kind === signal.kind).map(record => ({
      id: String(record.index),
      at: record.elapsedMs,
      tone: signal.kind === "focus.changed" || signal.kind === "state.transitioned" ? "neutral" : "accent",
      shape: signal.kind === "state.transitioned" || signal.kind === "task.outcome" ? "square" : "circle",
      selected: record === selected,
    })),
  }));
  return (
    <>
      <MeasurementPlot min={start} max={Math.max(start + 1000, end)} lanes={lanes} format={seconds}
        label="Relative time by signal. The event sequence gives the exact recorded times."
        caption="Time since session start. Select a row to inspect its event." />
      <MeasurementLog aria-label="Event sequence" controls="observe-inspector"
        selected={selected ? String(selected.index) : undefined} onSelect={id => onSelect(Number(id))}
        entries={records.map(record => ({
          id: String(record.index),
          label: `${metadata(record.event.kind).label} · ${record.event.target.slot}`,
          value: <time dateTime={`PT${record.elapsedMs / 1000}S`}>{seconds(record.elapsedMs)}</time>,
        }))} />
    </>
  );
}

const halfSpan = "elea-col-2 elea-col-md-4 elea-col-lg-6";

function Preview({ arrangement }: Readonly<{ arrangement: "single" | "split" }>) {
  const span = arrangement === "split" ? halfSpan : undefined;
  return (
    <Card variant="subtle" padding="sm">
      <div className="elea-grid">
        <div className={span}>
          <strong>Field notes</strong><CardDescription>A short entry for the demonstration.</CardDescription>
        </div>
        <div className={span}>
          <strong>Layout</strong><CardDescription>{arrangement === "single" ? "Single column" : "Two columns"}</CardDescription>
        </div>
      </div>
    </Card>
  );
}

function Observatory() {
  const controlsElement = useRef<HTMLDivElement>(null);
  const previewElement = useRef<HTMLElement>(null);
  const session = useRef<{ observe: LocalObserve; unsubscribe: () => void } | null>(null);
  const [mode, setMode] = useState<"live" | "synthetic">("live");
  const [active, setActive] = useState(false);
  const [records, setRecords] = useState(noRecords);
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const [open, setOpen] = useState(false);
  const [arrangement, setArrangement] = useState<"single" | "split">("single");
  const [message, setMessage] = useState("No local save yet.");
  const published = mode === "live" ? records : sample;
  const selected = published.find(record => record.index === selectedIndex) ?? published.at(-1);

  function release() {
    const current = session.current;
    session.current = null;
    current?.unsubscribe();
    current?.observe.dispose();
  }

  useEffect(() => () => {
    const current = session.current;
    current?.unsubscribe();
    current?.observe.dispose();
  }, []);

  function stop() {
    release();
    setActive(false);
    setSelectedIndex(undefined);
    setRecords(noRecords);
  }

  function controlElement(key: ToolKey) {
    return controlsElement.current?.querySelector<HTMLButtonElement>(`#observe-action-${key}`);
  }

  function start() {
    release();
    const bindings: BrowserBinding[] = [];
    for (const tool of tools) {
      const element = controlElement(tool.key);
      if (element) bindings.push({
        element, target: () => controls[tool.key], activation: tool.key !== "save", focus: true,
      });
    }
    if (previewElement.current) bindings.push({
      element: previewElement.current, target: () => preview,
      exposure: { key: exposureKey, rule: exposureRule },
    });
    const observe = createLocalObserve({ catalog, purpose, capacity: last, collectors: [createBrowserCollector(bindings, context)] });
    let frame: number | undefined;
    const unsubscribe = observe.subscribe(() => {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        setRecords(observe.snapshot());
      });
    });
    session.current = {
      observe,
      unsubscribe() {
        unsubscribe();
        if (frame !== undefined) cancelAnimationFrame(frame);
        window.removeEventListener("pagehide", stop);
      },
    };
    observe.setGrant({ purpose, destination: "memory", kinds: signals.map(signal => signal.kind) });
    if (observe.active) {
      window.addEventListener("pagehide", stop);
      setActive(true);
    } else {
      stop();
    }
  }

  function changeMode(next: typeof mode) {
    if (next === mode) return;
    stop();
    setMode(next);
  }

  function report(event: ObserveEventV1) {
    session.current?.observe.record(event);
  }

  function changeLayout(next: typeof arrangement) {
    if (next === arrangement) return;
    setArrangement(next);
    if (session.current?.observe.active) report({
      schemaVersion: 1, kind: "state.transitioned", target: layout(next), context: context(),
      detail: { source: "application-state", fromState: arrangement },
    });
  }

  function save(modality: "keyboard" | "pointer" | "unknown") {
    setMessage("Example saved locally.");
    if (!session.current?.observe.active) return;
    const snapshot = context();
    report({
      schemaVersion: 1, kind: "interaction.activated", target: controls.save, context: snapshot,
      detail: { source: "application-command", modality },
    });
    report({
      schemaVersion: 1, kind: "task.outcome", target: saved, context: snapshot,
      detail: { source: "application-task", task: "save-example", outcome: "succeeded", duration: null },
    });
  }

  function stepOrSave(tool: ToolKey, event: KeyboardEvent<HTMLButtonElement>) {
    if (!event.nativeEvent.isTrusted || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (tool === "save" && event.key === "Enter") {
      event.preventDefault();
      if (!event.repeat) save("keyboard");
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const index = tools.findIndex(item => item.key === tool);
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const next = tools[(index + offset + tools.length) % tools.length]!;
    event.preventDefault();
    controlElement(next.key)?.focus();
  }

  function activate(tool: ToolKey, event: MouseEvent<HTMLButtonElement>) {
    if (!event.nativeEvent.isTrusted) return;
    if (tool === "save") {
      save((event.nativeEvent as PointerEvent).pointerType ? "pointer" : "unknown");
    } else if (tool === "preview") {
      setOpen(!open);
    } else if (tool === "layout") {
      changeLayout(arrangement === "single" ? "split" : "single");
    } else {
      setOpen(false);
      changeLayout("single");
      setMessage("No local save yet.");
    }
  }

  return (
    <div className="elea-grid">
      <CardFooter role="group" aria-label="Data source">
        <Button variant={mode === "live" ? "solid" : "outline"} aria-pressed={mode === "live"}
          onClick={() => changeMode("live")}>Local session</Button>
        <Button variant={mode === "synthetic" ? "solid" : "outline"} aria-pressed={mode === "synthetic"}
          onClick={() => changeMode("synthetic")}>Synthetic example</Button>
      </CardFooter>
      {mode === "live" ? (
        <Card role="region" aria-labelledby="observe-workbench-title" className="elea-col-lg-8" padding="sm" data-elea-density="standard">
          <CardHeader>
            <CardTitle id="observe-workbench-title" as="h2">Workbench</CardTitle>
            <CardDescription role="status">{active ? "Local collection on" : "Collection off"}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" tone="primary" onClick={active ? stop : start}>
              {active ? "Stop and clear" : "Start local session"}
            </Button>
          </CardFooter>
          <CardDescription>Use Tab to reach the controls. Left and Right step through them. Press Enter on Save example to report a keyboard command.</CardDescription>
          <div className="elea-grid" ref={controlsElement}>
            {tools.map(tool => (
              <div className={halfSpan} key={tool.key}>
                <Button id={`observe-action-${tool.key}`} size="sm" variant="outline" tone="neutral" fullWidth
                  aria-expanded={tool.key === "preview" ? open : undefined}
                  aria-controls={tool.key === "preview" ? "observe-preview" : undefined}
                  onClick={event => activate(tool.key, event)}
                  onKeyDown={event => stepOrSave(tool.key, event)}>
                  {tool.label}
                </Button>
              </div>
            ))}
          </div>
          <section id="observe-preview" aria-label="Document preview" ref={previewElement} hidden={!open}>
            <Preview arrangement={arrangement} />
          </section>
          <SaveStatus state={message === "Example saved locally." ? "saved" : "idle"}>{message}</SaveStatus>
        </Card>
      ) : <CardDescription>Prepared records from an example save. This view collects no activity.</CardDescription>}
      <Card role="region" aria-labelledby="observe-map-title" padding="sm" className="elea-col-md-3 elea-col-lg-4">
        <CardTitle id="observe-map-title" as="h2">Activation map</CardTitle>
        <ActivationMap records={published} />
      </Card>
      <Card role="region" aria-labelledby="observe-time-title" padding="sm" className={mode === "live" ? "elea-col-md-5 elea-col-lg-7" : "elea-col-md-5 elea-col-lg-8"}>
        <CardTitle id="observe-time-title" as="h2">Timeline</CardTitle>
        <Timeline records={published} selected={selected} onSelect={setSelectedIndex} />
      </Card>
      <Card role="region" id="observe-inspector" aria-labelledby="observe-inspector-title" padding="sm" className="elea-col-lg-5">
        <CardTitle id="observe-inspector-title" as="h2">Event structure</CardTitle>
        {selected ? (
          <>
            <CardDescription>{selected.event.kind} · {seconds(selected.elapsedMs)} · {catalog.revision}</CardDescription>
            <MeasurementRecord><code>{JSON.stringify(selected.event, null, 2)}</code></MeasurementRecord>
          </>
        ) : <CardDescription>Select an event to inspect its validated fields.</CardDescription>}
      </Card>
      <CardDescription>Exposure reports viewport intersection for at least 600 ms at 50% area. Gaze requires a separate measurement. The local session and synthetic example provide no study results.</CardDescription>
    </div>
  );
}

const mount = document.getElementById("observe-lab");
if (mount) createRoot(mount).render(<Observatory />);
