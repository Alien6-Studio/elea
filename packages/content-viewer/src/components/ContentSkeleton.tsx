import type { EleaMessages } from "@alien6-studio/elea-content";

export interface ContentSkeletonProps {
  messages: EleaMessages;
  className?: string;
}

const LINES: ReadonlyArray<{ kind: "title" | "subtitle" | "line" | "bullet"; width: string }> = [
  { kind: "title", width: "75%" },
  { kind: "line", width: "100%" },
  { kind: "line", width: "100%" },
  { kind: "line", width: "80%" },
  { kind: "subtitle", width: "50%" },
  { kind: "line", width: "100%" },
  { kind: "line", width: "83%" },
  { kind: "bullet", width: "75%" },
  { kind: "bullet", width: "67%" },
  { kind: "bullet", width: "80%" },
  { kind: "subtitle", width: "40%" },
  { kind: "line", width: "100%" },
  { kind: "line", width: "100%" },
  { kind: "line", width: "83%" },
];

/** A static placeholder with the rhythm of an article, announced as a loading status. */
export function ContentSkeleton({ messages, className }: Readonly<ContentSkeletonProps>) {
  return (
    <div className={["elea-content-skeleton", className].filter(Boolean).join(" ")} role="status" aria-live="polite" aria-busy="true" aria-label={messages.viewer.loadingContent}>
      {LINES.map((line, index) => (
        <div key={index} className={`elea-content-skeleton__line elea-content-skeleton__line--${line.kind}`} style={{ width: line.width }} aria-hidden="true" />
      ))}
    </div>
  );
}
