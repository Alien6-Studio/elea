---
title: Interaction Observatory atlas
description: Four synthetic plates on position, ordering, exposure and missing outcomes.
---

# Interaction atlas

Four plates hold one property steady while changing how it is observed.
All values are synthetic. The source rows and scales are part of each
plate so the distinctions can be checked without running the laboratory.

## A slot can move

Move Save from the right cell to the left while keeping every count fixed.
Both drawings use six activations as the upper bound of the colour scale.
The darker area moves with the control, and the count for the registered
Save slot stays at six. This construction holds the data fixed deliberately.
A real relocation could also change the counts.

<!-- elea-observatory:slot -->

A slot makes a stable comparison possible across layouts. Preserve the
registration when the purpose is unchanged, and record the registered
variant when the placement is part of the comparison. A change to the
scale can change the shading before any count changes.

## A clock bucket can hold two records

The diagram uses the same synthetic sequence as the laboratory. A command
and the application's recorded result sit in the same 10 ms bucket at
2,260 ms. The ordered rows preserve the sequence the laboratory received.
They carry no evidence about how far apart the occurrences were inside
that bucket.

<!-- elea-observatory:timestamp -->

Look at the plot to locate a cluster. Use the rows to tell two events
apart when the dots share a coordinate. Measure input-to-paint latency
with a separate browser instrument and a stated sampling rule.

## Equal time, different continuity

Each trace contains 950 ms of eligible overlap. In the second trace the
document becomes hidden from 300 to 450 ms. Continuous dwell starts
again when it becomes visible. The two qualification marks are separated
by 450 ms, even though the accumulated eligible time is equal.

<!-- elea-observatory:dwell -->

The bands occupy half-open intervals and the marks are computed on a
shared 0–1,200 ms axis. This construction isolates the effect of the
reset rule. Actual intersection records arrive asynchronously.

## Which difference is supported?

The study's two synthetic arms both have 120 activations across 100
assigned attempts. The point in the middle row uses only observed outcomes.
The band in the last row uses all assignments and places each unknown
outcome at its most favourable or unfavourable extreme. The band includes
zero. Its width represents missing outcomes, with sampling variation left
for a separate estimate.

<!-- elea-observatory:contrast -->

The [study](../interaction-observatory.md) gives the input counts, source
limitations and a prospective protocol. The [laboratory](laboratory.md)
lets you compare a deterministic example with your own local session.
