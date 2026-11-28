# Observe

Alien6 Observe is a TypeScript SDK that records what happens to the controls
you register: an activation, a focus change, an exposure, a state transition
or the outcome of a task. It has no dependency and does not require ELEA. It
keeps the records in memory and sends nothing.

```sh
npm install @alien6-studio/observe
```

The [package](https://github.com/Alien6-Studio/elea/tree/main/packages/observe)
is released with the ELEA packages, under the same version, from 0.1.5.

## Three things to declare

| You declare | What it does |
| --- | --- |
| A **catalog** | Lists every target you allow, with its context and its event kinds. An event that matches no entry is rejected. |
| A **grant** | Starts collection for one purpose and a set of event kinds. Until the host gives one, nothing is recorded. |
| **Bindings** | Attach a registered target to a DOM element, for the events a browser can establish. |

A target names a control by its function, not by its label or position:
a `surface`, a `component`, a `slot` such as `document.save`, a `role`, and
the current `state` and `variant` or `null`. The context carries the theme,
appearance, density and experiment arm, each `null` when unknown. Every code
is 1 to 64 characters among lowercase letters, digits, `.`, `_` and `-`.

## Record a save

This example counts the clicks on a save button and records whether the
save succeeded. The browser establishes the click. The application reports
the outcome, because only it knows the document was stored.

```ts
import {
  createLocalObserve, type ObserveCatalogV1, type ObserveContextV1, type ObserveTargetV1,
} from "@alien6-studio/observe";
import { createBrowserCollector } from "@alien6-studio/observe/browser";

const save = {
  surface: "editor", component: "button", slot: "document.save",
  role: "button", state: "ready", variant: null,
} satisfies ObserveTargetV1;
const context = { theme: null, appearance: null, density: null, experiment: null } satisfies ObserveContextV1;

const catalog = {
  revision: "editor-1",
  entries: [{
    target: save, context,
    kinds: ["interaction.activated", "task.outcome"],
    tasks: ["document.save"],
  }],
} satisfies ObserveCatalogV1;

const observe = createLocalObserve({
  purpose: "local-demo",
  catalog,
  collectors: [
    createBrowserCollector([{ element: button, target: () => save, activation: true }], () => context),
  ],
});

// Nothing is recorded before the grant.
observe.setGrant({
  purpose: "local-demo", destination: "memory",
  kinds: ["interaction.activated", "task.outcome"],
});

// Once the document is stored:
observe.record({
  schemaVersion: 1, kind: "task.outcome", target: save, context,
  detail: { source: "application-task", task: "document.save", outcome: "succeeded", duration: "under-1s" },
});

observe.snapshot();     // the records, oldest first
observe.setGrant(null); // stops collection and clears the records
```

`record` returns `false` when it refuses an event. `snapshot` returns frozen
records, each with an `index`, an `elapsedMs` rounded to 10 ms and the
`event`. The buffer holds 128 records by default, 1,024 at most, and drops
the oldest first. `subscribe` calls a listener after each change, to refresh
a display. `dispose` ends the instance.

## The five events

| Event | Reported by | It establishes |
| --- | --- | --- |
| `interaction.activated` | A binding with `activation`, or `record` for an application command | The target was activated. The modality stays `unknown` unless the source proves it. |
| `focus.changed` | A binding with `focus` | DOM focus entered or left the element. |
| `exposure.qualified` | A binding with `exposure` and a catalog rule | The element kept a minimum share of its area in the viewport of a visible document for a minimum time. It does not establish that anyone looked at it. |
| `state.transitioned` | `record` | The target moved from a state listed in `fromStates` to its current `state`. |
| `task.outcome` | `record` | A task listed in `tasks` succeeded, failed or was cancelled, with a duration band or `null`. |

A binding only reports trusted browser events on a connected element, and
ignores a control that is disabled or inert. Use one activation source per
action: the click binding or the application command, not both.

## What it leaves to you

- **Consent and purpose.** The host decides when to grant and when to revoke.
  Replacing or revoking a grant detaches the listeners and discards the records.
- **Delivery.** The SDK stores, transfers and exports nothing, and refuses a
  grant whose destination is `export`.
- **Content.** The event has no field for a label, a form value, a URL, a
  coordinate or an identifier of a person, a device or a session. Keep them
  out of the codes you register.
- **Untrusted input.** `createEventValidator(catalog)` checks a value against
  the catalog and returns a frozen event or `null`.

The [Interaction Observatory](research/interaction-observatory.md) explains
what each event can support as a claim, and its
[laboratory](research/interaction-observatory/laboratory.md) runs this SDK on
a save. To display records, the UI package provides
[measurement displays](https://github.com/Alien6-Studio/elea/tree/main/packages/ui#measurement-displays).
