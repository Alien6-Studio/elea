# Alien6 Observe

Observe is a dependency-free TypeScript SDK for registered, semantic interface
events. The root export runs without a DOM. The browser collector is in
`@alien6-studio/observe/browser` and works with native HTML or forwarded
component refs. The [guide](https://elea.alien6.com/observe/) explains the
catalog, the grant and the five events.

```sh
npm install @alien6-studio/observe
```

The package shares the version of the ELEA packages and does not depend on
them.

## Bind a native button

```ts
import { createLocalObserve, type ObserveContextV1, type ObserveTargetV1 } from "@alien6-studio/observe";
import { createBrowserCollector } from "@alien6-studio/observe/browser";

export function bind(button: HTMLButtonElement, enable: HTMLButtonElement, disable: HTMLButtonElement) {
  const target = {
    surface: "editor", component: "button", slot: "document.save",
    role: "button", state: "ready", variant: null,
  } satisfies ObserveTargetV1;
  const context = { theme: null, appearance: null, density: null, experiment: null } satisfies ObserveContextV1;
  const kinds = ["interaction.activated", "focus.changed"] as const;
  const observer = createLocalObserve({
    purpose: "local-demo",
    catalog: { revision: "editor-1", entries: [{ target, context, kinds }] },
    collectors: [createBrowserCollector([{ element: button, target: () => target, activation: true, focus: true }], () => context)],
  });
  const start = () => observer.setGrant({ purpose: "local-demo", destination: "memory", kinds });
  const stop = () => observer.setGrant(null);
  enable.addEventListener("click", start);
  disable.addEventListener("click", stop);
  return {
    observer,
    dispose() {
      enable.removeEventListener("click", start);
      disable.removeEventListener("click", stop);
      observer.dispose();
    },
  };
}
```

## Rules

- The host owns consent, scope and teardown. A grant attaches only the
  collectors for its kinds. Revoking it clears the buffer and pending dwell
  measurements; release any snapshot you kept.
- The SDK stores, transfers and exports nothing, and refuses export grants.
- A catalog entry lists one approved target and context, its event kinds and
  its transition, task or exposure codes. Review it as application code.
- `createEventValidator(catalog)` rejects unknown fields and unregistered
  combinations and returns a frozen event. Filters receive that event and
  return `true` to keep it; keep them pure.
- Report state transitions and task outcomes with `record`. Use one
  activation source per action. A browser click reports `pointer` or
  `unknown`; an application keyboard command can report `keyboard`.
- A local record adds a sequence number and a relative time rounded to 10 ms.
  Both stay outside the wire event. A full buffer drops its oldest record.
- Keep coordinates and form content out of the catalog and the events.

## Extension points

- **Motion.** A host callback can report a committed state transition. Timing
  or animation observations need a separately versioned schema first.
- **Experiment.** The context callback supplies an approved key, revision and
  arm. Keep the assignment fixed during a grant and replace the grant when it
  changes. Assignment, analysis and permission stay with the host.
- **Delivery.** A sink can implement `ObserveSinkV1` once each destination
  and its privacy policy are reviewed.

See the [integration decisions](../../docs/architecture/interaction-observatory/README.md).

## Check local overhead

Build the package and run `node packages/observe/scripts/benchmark.mjs` from
the repository root. It compares the disabled recording path with validation
and insertion into a full 120-record buffer, without DOM delivery or
rendering.
