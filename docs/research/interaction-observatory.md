---
title: Interaction Observatory
description: What an interface can establish about an action, an exposure and the outcome of a task.
---

# Interaction Observatory

A save control can be activated twice while the application saves a
document once. A preview can occupy most of the viewport while the
reader is busy elsewhere. The interface can draw these events on one
timeline. Each mark still needs a source, a rule and a claim it can
support.

Follow a save through the [laboratory](interaction-observatory/laboratory.md)
or start with the two worked constructions below. The figures use synthetic
inputs. The laboratory shows either a labelled synthetic sequence or the
current opt-in session. The comparison at the end is a proposed study. The [atlas](interaction-observatory/atlas.md) draws four comparisons on shared scales.

## Draw the exposure rule

The laboratory uses the implicit viewport root. Let `r` be the area of
the intersection rectangle divided by the area of the target's bounding
rectangle. The target must have positive area. An interval is eligible
while `r ≥ 0.5` and the document reports itself visible. The collector
reports one qualification after **600 ms of continuous eligible time**.
A crossing below the threshold or a hidden document clears the pending
interval. The threshold and dwell are instrument settings chosen for
this demonstration. [Intersection Observer](https://www.w3.org/TR/intersection-observer/) ·
[HTML Page Visibility](https://html.spec.whatwg.org/multipage/interaction.html#page-visibility).

<!-- elea-observatory:exposure -->

In this construction, the first eligible interval lasts 300 ms. While the
document is hidden, the intersection stays at 75% and the dwell stops.
Eligibility resumes at 450 ms. The first qualification falls at **1,050 ms**
in the idealised trace. Adding the earlier 300 ms would put the mark at
750 ms and would change the measurement from continuous to accumulated
exposure. Each input interval includes its start and excludes its end.

In the live browser, dwell starts when the collector processes a qualifying
intersection notification. Notifications arrive asynchronously and the
timer runs when it can be scheduled. Short excursions may go unreported.
The illustration uses exact input boundaries to show the rule. It makes
no claim about callback latency or what someone saw. An element may satisfy
the geometric rule under an overlay.

## Give each signal a source

An interface has several clocks and several ways to describe the same
moment. A browser delivers an event. The application changes a state.
A persistence service may report what happened later. The observatory
assigns a separate mark to each occurrence.

- **Activation.** A registered control receives a browser click or the host
  reports a command. The keyboard shortcut for Save in the laboratory is
  an explicit application command. Some browser clicks leave the input
  modality unknown. The DOM trust flag distinguishes browser dispatch
  from script dispatch in this collector and still admits browser automation.
- **Focus.** Focus arrives at or leaves a registered DOM element. The signal
  may result from keyboard navigation or an application moving focus.
  Assistive technology can navigate through routes outside that DOM signal.
- **Exposure.** The target meets a stated intersection and dwell rule.
  The browser provides geometric evidence.
- **State and result.** The application reports a committed state change
  or a terminal task outcome. The end of a CSS transition belongs to a
  separate rendering measurement. A button activation supplies no persistence
  outcome on its own.

The registered role describes the control's semantics. The slot describes
its function in a particular surface. A button might keep the role
`button` and the slot `save` while it moves to another place in the layout.
Variant, theme and density can record the conditions under which that
slot was used. Every recorded code comes from a declared catalog.
[DOM Standard](https://dom.spec.whatwg.org/#dom-event-istrusted) ·
[HTML focus](https://html.spec.whatwg.org/multipage/interaction.html#focus) ·
[CSS transition events](https://www.w3.org/TR/css-transitions-2/#transition-events).

## Read time and space from the record

The laboratory timestamp is relative to enabling collection and floored
to a 10 ms step. Two marks in the same bucket retain their insertion order
in the event list. That order describes collection, and a delayed browser
callback can arrive after a later action. For a responsiveness measure
with browser rendering time, use a separate instrument such as Event
Timing and report its coverage, duration threshold and grouping rules.
[High Resolution Time](https://www.w3.org/TR/hr-time-3/#monotonic-clock) ·
[Event Timing](https://www.w3.org/TR/event-timing/).

The activation map counts approved events by registered zone. The
arrangement mirrors the demonstration controls and the darkest cell is
relative to the largest count in the current displayed window. Read the
printed counts when comparing windows. The map keeps keyboard activations
and mouse activations in the same zones. It does not collect the pointer
position. The event history holds at most 120 records and discards the
oldest when full, so counts describe the window rather than the whole visit.

## Common totals can hide different outcomes

Consider two layouts for the same Save command. Each receives 120
activation records across 100 assigned attempts. An attempt can
activate Save more than once. The application reports a terminal
outcome separately, and some attempts have no recorded outcome.

<!-- elea-observatory:outcomes -->

Among attempts with outcomes, A has 56 saves in 80 attempts (70%) and B has
60 in 95 (63.2%). Those percentages describe the observed subsets. To
keep all assigned attempts in view, bracket each rate between two
extremes. If every missing outcome failed to save, the rate is
`confirmed / assigned`. If every missing outcome saved, the rate is
`(confirmed + missing) / assigned`.

A lies between **56% and 76%** and B between **60% and 65%**. The difference
A minus B can range from **−9 to +16 percentage points**. These bounds
describe uncertainty from missing outcomes in the constructed counts.
Sampling uncertainty is a separate question. The synthetic example has
no preferred layout. The local event stream also has no attempt identifier.
An independent study instrument would have to supply the assignment and
outcome denominators.

## Evidence about people

**Attention.** Simons and Chabris asked observers to count passes in moving
scenes. Some observers missed an unexpected visible event. Their result
establishes a boundary for this instrument. An opportunity to see a preview
and noticing the preview are separate quantities. [Gorillas in our midst
(1999)](https://www.chabris.com/Simons1999.pdf).

**Gaze.** Huang, White and Buscher measured both gaze and cursor position
during web search. In their study, subject-level average separations
ranged from roughly 130 to 280 pixels. This is evidence for variation under
their search conditions. Gaze in an editor calls for its own observation
protocol, such as calibrated eye tracking. [User See, User Point (2012)](https://jeffhuang.com/papers/GazeCursor_CHI12.pdf).

**Usability.** Frøkjær, Hertzum and Hornbæk found negligible correlation
between task time and solution quality in their programming
information-retrieval tasks. A reported save, the time to finish, and
a participant's judgment of the experience answer different questions.
Keep their measurements separate. [Measuring Usability (2000)](https://orbit.dtu.dk/en/publications/measuring-usability-are-effectiveness-efficiency-and-satisfaction/).

## A comparison to run

**Open question.** Does the position of Save in a toolbar change the chance of
saving the intended document within 30 seconds? Compare a leading and a
trailing placement while holding the label, size, surrounding controls,
theme, density, task and reading direction fixed. A trial with a new
disclosure step would test a different change.

Randomise consenting participants to one layout and give each one attempt
on the same seeded document. Define the time origin as delivery of the
task instruction with the editor ready. Verify the expected document in
the persistence harness. A click can explain what happened before that
check. The check determines the primary outcome. Record elapsed time
and self-reported ease separately.

Set the smallest effect of interest, sample size and stopping rule before
recruitment. Compare the proportion verified by the deadline across
assigned attempts, report an interval for the difference and mark
unresolved outcomes explicitly. Report the counts at assignment and at
outcome ascertainment per arm. Investigate assignment imbalance and
differential observation loss before interpreting the result. A
comparison conditioned on preview exposure can describe that subset.
Exposure itself can be affected by the toolbar placement.
[Kohavi, Henne and Sommerfield (2007)](https://ai.stanford.edu/~ronnyk/GuideControlledExperiments.pdf) ·
[Fabijan et al. (2019)](https://www.microsoft.com/en-us/research/publication/diagnosing-sample-ratio-mismatch-in-online-controlled-experiments-a-taxonomy-and-rules-of-thumb-for-practitioners/).

## Method and limits

The figures are built at site generation from the declared intervals and
counts in the article's fixture. The article and the laboratory use the
same plotting component and the same exposure rule. The test fixtures
confirm the arithmetic and the build renders the figures without browser
JavaScript.

The demonstration starts on explicit activation and keeps approved
records in memory until stopped, cleared or left. It neither transmits
the records nor stores form contents, screenshots or identifiers.
Collecting participant data for the proposed comparison would require a
specific protocol, retention plan and assessment of terminal access and
personal data for that deployment. [EDPB Guidelines 2/2023](https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf) ·
[CNIL audience measurement guidance](https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience).

[Open the Interaction laboratory](interaction-observatory/laboratory.md).
