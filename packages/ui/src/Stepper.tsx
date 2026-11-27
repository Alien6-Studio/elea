"use client";

import { forwardRef, useId, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx.js";
import { Button } from "./Button.js";
import { Skeleton } from "./Skeleton.js";

export type StepperOrientation = "horizontal" | "vertical";

export type StepperBadgeTone = "neutral" | "primary" | "success" | "info" | "warning" | "danger";

export interface StepperStep {
  /** Stable identifier within this sequence. */
  id: string;
  label: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  /** Localized equivalent of a visual badge, such as "3 errors". */
  badgeLabel?: string | undefined;
  /** Colour of a text badge, such as `danger` for points to fix. */
  badgeTone?: StepperBadgeTone | undefined;
  disabled?: boolean | undefined;
}

interface StepperNavigationProps {
  steps: readonly StepperStep[];
  /** Step id or zero-based index. */
  current: string | number;
  onSelect: (step: StepperStep) => void;
}

type StepperRootAttributes<Element extends HTMLElement> = Omit<HTMLAttributes<Element>, "children" | "dangerouslySetInnerHTML" | "onSelect">;

export interface StepperProps extends StepperNavigationProps, Omit<StepperRootAttributes<HTMLElement>, "role" | "aria-label"> {
  /** Accessible name of the navigation landmark. */
  label: string;
  orientation?: StepperOrientation | undefined;
  /** Only the current and preceding steps can be selected directly. */
  linear?: boolean | undefined;
  /** `solid` fills the marker of every step, where `outline` fills the current one only. */
  indicator?: "outline" | "solid" | undefined;
  /** `dotted` draws the segments that lead to upcoming steps as dots. */
  connector?: "solid" | "dotted" | undefined;
}

function currentIndex(steps: readonly StepperStep[], current: string | number) {
  if (typeof current === "string") return steps.findIndex(step => step.id === current);
  return Number.isInteger(current) && current >= 0 && current < steps.length ? current : -1;
}

function moveFocus(event: KeyboardEvent<HTMLButtonElement>, orientation: StepperOrientation) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const button = event.currentTarget;
  const buttons = Array.from(button.closest("ol")!.querySelectorAll<HTMLButtonElement>(":scope > li > .elea-stepper__item > .elea-stepper__body > .elea-stepper__button:enabled"));
  const index = buttons.indexOf(button);
  const direction = orientation === "horizontal" && getComputedStyle(button).direction === "rtl" ? -1 : 1;
  const previousKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
  const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
  let destination: number;
  switch (event.key) {
    case "Home": destination = 0; break;
    case "End": destination = buttons.length - 1; break;
    case previousKey: destination = index - direction; break;
    case nextKey: destination = index + direction; break;
    default: return;
  }
  event.preventDefault();
  buttons[destination]?.focus();
}

/** Controlled progress navigation. Arrow keys explore the sequence; activating a button requests a step. */
export const Stepper = forwardRef<HTMLElement, StepperProps>(function Stepper({ label, steps, current, onSelect, orientation = "horizontal", linear = false, indicator, connector, className, ...rest }, ref) {
  const id = useId();
  const active = currentIndex(steps, current);
  if (steps.length === 0) return null;
  return (
    <nav {...rest} ref={ref} className={cx("elea-stepper", className)} data-orientation={orientation} data-indicator={indicator} data-connector={connector} aria-label={label}>
      <ol className="elea-stepper__list">
        {steps.map((step, index) => {
          const selected = index === active;
          const passed = index < active;
          let state = "upcoming";
          if (selected) state = "current";
          else if (passed) state = "done";
          const disabled = step.disabled || (linear && index > active);
          const descriptionId = step.description == null ? undefined : `${id}-${index}-description`;
          const badgeId = step.badge == null ? undefined : `${id}-${index}-badge`;
          const describedBy = [descriptionId, badgeId].filter(Boolean).join(" ") || undefined;
          return (
            <li key={step.id} className="elea-stepper__step" data-state={state} data-disabled={disabled || undefined}>
              <div className="elea-stepper__item">
                <span className="elea-stepper__indicator" aria-hidden="true">
                  {passed
                    ? <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8 3 3 7-7" /></svg>
                    : index + 1}
                </span>
                <div className="elea-stepper__body">
                  <button type="button" className="elea-stepper__button elea-stepper__label" disabled={disabled}
                    aria-current={selected ? "step" : undefined} aria-describedby={describedBy}
                    onClick={() => onSelect(step)} onKeyDown={event => moveFocus(event, orientation)}>{step.label}</button>
                  {descriptionId && <span className="elea-stepper__description" id={descriptionId}>{step.description}</span>}
                  {badgeId && <>
                    <span className="elea-stepper__badge" data-tone={step.badgeTone} id={step.badgeLabel ? undefined : badgeId} aria-hidden={step.badgeLabel ? true : undefined}>{step.badge}</span>
                    {step.badgeLabel && <span id={badgeId} hidden>{step.badgeLabel}</span>}
                  </>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

export interface StepperPanelProps extends StepperNavigationProps, StepperRootAttributes<HTMLDivElement> {
  previousLabel: string;
  nextLabel: string;
  /** Host action shown in place of Next on the final available step. */
  finish?: ReactNode;
}

/** Optional footer. Previous and Next move one available step, including in a linear flow. */
export const StepperPanel = forwardRef<HTMLDivElement, StepperPanelProps>(function StepperPanel(
  // Hosts may share props with Stepper. Only the navigation uses these three settings.
  { steps, current, onSelect, previousLabel, nextLabel, finish, className, linear: _linear, label: _label, orientation: _orientation, indicator: _indicator, connector: _connector, ...rest }:
    StepperPanelProps & Partial<Pick<StepperProps, "linear" | "label" | "orientation" | "indicator" | "connector">>,
  ref,
) {
  const active = currentIndex(steps, current);
  if (active < 0) return null;
  const previous = steps.slice(0, active).reverse().find(step => !step.disabled);
  const next = steps.slice(active + 1).find(step => !step.disabled);
  return (
    <div {...rest} ref={ref} className={cx("elea-stepper__panel", className)}>
      <Button variant="outline" disabled={!previous} onClick={() => previous && onSelect(previous)}>{previousLabel}</Button>
      {next || finish == null
        ? <Button disabled={!next} onClick={() => next && onSelect(next)}>{nextLabel}</Button>
        : finish}
    </div>
  );
});

export interface StepperSkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "dangerouslySetInnerHTML" | "aria-hidden"> {
  steps?: number | undefined;
  orientation?: StepperOrientation | undefined;
}

/** Decorative placeholder with the same indicator, label and connector layout. */
export const StepperSkeleton = forwardRef<HTMLDivElement, StepperSkeletonProps>(function StepperSkeleton({ steps = 3, orientation = "horizontal", className, ...rest }, ref) {
  const count = Number.isFinite(steps) ? Math.floor(steps) : 0;
  if (count < 1) return null;
  return (
    <div {...rest} ref={ref} className={cx("elea-stepper", className)} data-orientation={orientation} aria-hidden="true">
      <ol className="elea-stepper__list">
        {Array.from({ length: count }, (_, index) => index + 1).map(ordinal => (
          <li key={ordinal} className="elea-stepper__step">
            <div className="elea-stepper__item">
              <Skeleton className="elea-stepper__indicator" variant="circle" />
              <div className="elea-stepper__body"><Skeleton width="6em" /></div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
});
