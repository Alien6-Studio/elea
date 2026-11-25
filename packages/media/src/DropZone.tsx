"use client";

import { useId, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from "react";

export interface DropZoneProps {
  /** Receives the files dropped or picked; one at most unless `multiple`. */
  onFiles: (files: File[]) => void;
  /** The `accept` of the file input, e.g. `image/*`; dropped files outside it are refused. */
  accept?: string | undefined;
  multiple?: boolean | undefined;
  disabled?: boolean | undefined;
  /** Shown while the host processes the files: the zone stays visible but inert. */
  busy?: boolean | undefined;
  /** The main line, e.g. "Click to add an image". */
  label: ReactNode;
  /** The second line, e.g. "or drag and drop". */
  hint?: ReactNode | undefined;
  /** What to say while busy, in place of the label. */
  busyLabel?: ReactNode | undefined;
  icon?: ReactNode | undefined;
  error?: ReactNode | undefined;
  /** Replaces the label, hint and icon with custom content. */
  children?: ReactNode | undefined;
  className?: string | undefined;
  /** Text matching `accept`, announced when a dropped file is refused. */
  onRejected?: ((files: File[]) => void) | undefined;
}

/** A file matches an `accept` list the way the browser's file picker reads it. */
export function acceptsFile(file: File, accept: string | undefined): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.split(",").some((entry) => {
    const rule = entry.trim().toLowerCase();
    if (!rule) return false;
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

/**
 * A zone that takes files by drop, click or keyboard. The input is a real file input, so forms,
 * assistive technology and test tooling see it; the label makes the whole zone its target.
 */
export function DropZone({ onFiles, accept, multiple = false, disabled = false, busy = false, label, hint, busyLabel, icon, error, children, className, onRejected }: Readonly<DropZoneProps>) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  const inert = disabled || busy;

  const deliver = (list: FileList | File[] | null | undefined) => {
    if (!list) return;
    const files = [...list];
    const accepted = files.filter((file) => acceptsFile(file, accept));
    const refused = files.filter((file) => !acceptsFile(file, accept));
    if (refused.length > 0) onRejected?.(refused);
    const chosen = multiple ? accepted : accepted.slice(0, 1);
    if (chosen.length > 0) onFiles(chosen);
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!inert) setActive(true);
  };
  const onDragLeave = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActive(false);
  };
  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActive(false);
    if (!inert) deliver(event.dataTransfer?.files);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!inert) inputRef.current?.click();
    }
  };

  const classes = ["elea-dropzone", active ? "elea-dropzone--active" : "", inert ? "elea-dropzone--inert" : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <div className={classes} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <input ref={inputRef} type="file" id={id} className="elea-dropzone__input" accept={accept} multiple={multiple} disabled={inert} onChange={(event) => { deliver(event.target.files); event.target.value = ""; }} />
      <label htmlFor={id} className="elea-dropzone__label" tabIndex={inert ? -1 : 0} onKeyDown={onKeyDown} aria-disabled={inert || undefined}>
        {children ?? (
          <>
            {icon && <span className="elea-dropzone__icon" aria-hidden="true">{icon}</span>}
            <span className="elea-dropzone__title">{busy && busyLabel ? busyLabel : label}</span>
            {hint && <span className="elea-dropzone__hint">{hint}</span>}
          </>
        )}
      </label>
      {error && <p className="elea-dropzone__error" role="alert">{error}</p>}
    </div>
  );
}
