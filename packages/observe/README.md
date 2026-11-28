# Alien6 Observe

Observe is a dependency-free TypeScript SDK for registered, semantic interface
events. The root export runs without a DOM. The browser collector lives in
`@alien6-studio/observe/browser`; applications can use it with native HTML or
forwarded component refs. This workspace builds an installable local archive.

```sh
npm run build -w packages/observe
npm pack -w packages/observe --pack-destination /tmp
```

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

The host owns consent, scope and teardown. Starting attaches only the requested
collectors. Stopping clears the local buffer and dismisses pending dwell
measurements. The caller owns any previously returned snapshot and should
release it on stop. A subscription is for UI updates and can be removed at any
time. The SDK performs no storage, transfer or export. It refuses export grants.

Each catalog entry lists one approved target and presentation tuple, event
kinds and applicable transition, task or exposure codes. Treat configuration
as reviewed application code. Validate untrusted input with
`createEventValidator(catalog)`. Validation rejects unknown own fields and
unregistered combinations and returns a frozen snapshot. Filters receive the
snapshot and return true to keep it. Supply pure filters. For DOM bindings,
use a stable role and current registered state and presentation. Report
application state transitions or task outcomes explicitly using `record`.
Use one activation source per action. Browser clicks use known pointer
evidence or `unknown`; an explicit application keyboard command can use
`keyboard`.

A display entry adds only a sequence number and relative time rounded to
10 ms around the wire event. These local fields are outside the wire format.
The fixed-capacity buffer drops its oldest event when full. Use stable slot
codes and a separately defined diagram for an activation map. Store neither
coordinates nor form content in the catalog or event stream.

## Extension points

- **Motion** can observe a committed semantic state transition via a host
  callback. Future timing or animation-effect observations need a separately
  versioned schema before joining the event stream.
- **Experiment** supplies only an approved experiment key, revision and arm
  through the context callback. Keep the assignment fixed during a granted
  attempt and replace the grant when it changes. Assignment, analysis and
  permission remain host responsibilities.
- Delivery can implement the sink port in a later increment after each
  destination and privacy policy is reviewed.

See the [integration decisions](../../docs/architecture/interaction-observatory/README.md).

## Check local overhead

Build the package and run `node packages/observe/scripts/benchmark.mjs` from
the repository root. It compares the disabled recording path with validation
and insertion into a full 120-record buffer. The benchmark excludes DOM
delivery and rendering. The observatory batches display updates to the next
animation frame and retains the latest 120 events.
