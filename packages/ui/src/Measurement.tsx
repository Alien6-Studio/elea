import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { Button } from "./Button.js";
import { cx } from "./cx.js";

export type MeasurementTone = "accent" | "neutral" | "muted";

export type MeasurementMark = {
  id: string;
  tone?: MeasurementTone | undefined;
} & ({
  at: number;
  shape?: "circle" | "square" | undefined;
  selected?: boolean | undefined;
} | {
  from: number;
  to: number;
  hatched?: boolean | undefined;
});

export interface MeasurementLane {
  id: string;
  label: ReactNode;
  marks: readonly MeasurementMark[];
}

export interface MeasurementPlotProps extends HTMLAttributes<HTMLElement> {
  min: number;
  max: number;
  lanes: readonly MeasurementLane[];
  label: string;
  format: (value: number) => string;
  caption?: ReactNode;
}

function rangePosition(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 0;
  return Math.max(0, Math.min(100, (value - min) / (max - min) * 100));
}

/** A common horizontal scale for point or interval marks. Supply exact values in accessible text or a table. */
export const MeasurementPlot = forwardRef<HTMLElement, MeasurementPlotProps>(function MeasurementPlot({
  min, max, lanes, label, format, caption, className, ...rest
}, ref) {
  return (
    <figure {...rest} ref={ref} className={cx("elea-measurement", className)}>
      <div role="img" aria-label={label}>
        {lanes.map(lane => (
          <div className="elea-measurement__lane" key={lane.id}>
            <span>{lane.label}</span>
            <div className="elea-measurement__track">
              {lane.marks.map(mark => {
                if ("at" in mark) {
                  return <i key={mark.id} className="elea-measurement__point" data-tone={mark.tone}
                    data-shape={mark.shape} data-selected={mark.selected || undefined}
                    style={{ insetInlineStart: `${rangePosition(mark.at, min, max)}%` }} />;
                }
                const start = rangePosition(mark.from, min, max);
                const width = Math.max(0, rangePosition(mark.to, min, max) - start);
                return <i key={mark.id} className="elea-measurement__range" data-tone={mark.tone}
                  data-hatched={mark.hatched || undefined}
                  style={{ insetInlineStart: `${start}%`, inlineSize: `${width}%` }} />;
              })}
            </div>
          </div>
        ))}
        <div className="elea-measurement__axis"><span>{format(min)}</span><span>{format(max)}</span></div>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
});

export interface MeasurementCell {
  id: string;
  label: ReactNode;
  value: number;
}

export interface MeasurementMapProps extends HTMLAttributes<HTMLElement> {
  cells: readonly MeasurementCell[];
  /** A fixed maximum lets different maps share a scale. Defaults to the largest displayed value. */
  maximum?: number | undefined;
  caption?: ReactNode;
}

/** Values in reading order on a two-column grid. Shading supplements each printed value. */
export const MeasurementMap = forwardRef<HTMLElement, MeasurementMapProps>(function MeasurementMap({
  cells, maximum = Math.max(1, ...cells.map(cell => cell.value)), caption, className, ...rest
}, ref) {
  return (
    <figure {...rest} ref={ref} className={cx("elea-measurement", className)}>
      <dl className="elea-measurement__map">
        {cells.map(cell => (
          <div key={cell.id} className="elea-measurement__cell"
            style={{ "--elea-measurement-density": `${Math.round(60 * rangePosition(cell.value, 0, maximum) / 100)}%` } as CSSProperties}>
            <dt>{cell.label}</dt><dd>{cell.value}</dd>
          </div>
        ))}
      </dl>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
});

export interface MeasurementLogEntry {
  id: string;
  label: ReactNode;
  value: ReactNode;
}

export interface MeasurementLogProps extends Omit<HTMLAttributes<HTMLOListElement>, "onSelect"> {
  entries: readonly MeasurementLogEntry[];
  selected?: string | undefined;
  controls?: string | undefined;
  onSelect: (id: string) => void;
}

/** A keyboard-operable sequence whose selection remains under host control. */
export const MeasurementLog = forwardRef<HTMLOListElement, MeasurementLogProps>(function MeasurementLog({
  entries, selected, controls, onSelect, className, ...rest
}, ref) {
  return (
    <ol {...rest} role="list" ref={ref} className={cx("elea-measurement__log", className)}>
      {entries.map(entry => (
        <li key={entry.id}>
          <Button size="sm" variant="ghost" tone="neutral" className="elea-measurement__row" fullWidth
            aria-pressed={entry.id === selected} aria-controls={controls} onClick={() => onSelect(entry.id)}>
            <span>{entry.label}</span><span>{entry.value}</span>
          </Button>
        </li>
      ))}
    </ol>
  );
});

export const MeasurementRecord = forwardRef<HTMLPreElement, HTMLAttributes<HTMLPreElement>>(function MeasurementRecord({
  className, ...rest
}, ref) {
  return <pre {...rest} ref={ref} className={cx("elea-measurement__record", className)} />;
});
