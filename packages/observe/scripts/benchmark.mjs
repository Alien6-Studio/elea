import { performance } from "node:perf_hooks";
import { createLocalObserve } from "../dist/index.js";

const kind = "interaction.activated";
const context = { theme: null, appearance: null, density: null, experiment: null };
const target = { surface: "bench", component: "button", slot: "save", role: "button", state: null, variant: null };
const event = { schemaVersion: 1, kind, target, context, detail: { source: "browser-click", modality: "pointer" } };
const purpose = "benchmark";
const capacity = 120;
const options = { purpose, capacity, catalog: { revision: "bench-1", entries: [{ target, context, kinds: [kind] }] } };
const disabled = createLocalObserve(options);
const enabled = createLocalObserve(options);
enabled.setGrant({ purpose, destination: "memory", kinds: [kind] });

const iterations = 30_000;
const rounds = 9;

function time(observer) {
  const started = performance.now();
  let accepted = 0;
  for (let index = 0; index < iterations; index++) accepted += Number(observer.record(event));
  return { timePerCallUs: (performance.now() - started) * 1000 / iterations, accepted };
}

const summarize = samples => {
  const times = samples.map(sample => sample.timePerCallUs).sort((a, b) => a - b);
  return { medianUsPerCall: times[Math.floor(times.length / 2)], maxUsPerCall: times.at(-1) };
};

time(disabled);
time(enabled);
const inactiveSamples = [];
const activeSamples = [];
for (let round = 0; round < rounds; round++) {
  inactiveSamples.push(time(disabled));
  activeSamples.push(time(enabled));
}
if (inactiveSamples.some(result => result.accepted !== 0) || activeSamples.some(result => result.accepted !== iterations)
  || disabled.snapshot().length !== 0 || enabled.snapshot().length !== capacity) {
  throw new Error("Observe benchmark did not exercise the expected recording paths");
}
console.log(JSON.stringify({
  node: process.version, arch: process.arch, iterations, rounds, capacity,
  inactive: summarize(inactiveSamples), active: summarize(activeSamples),
}, null, 2));
