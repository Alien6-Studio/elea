import { useState } from "react";
import { Button, Sheet, type SheetProps } from "@alien6-studio/elea-ui";

type Side = NonNullable<SheetProps["side"]>;

const sides: Side[] = ["start", "end", "top", "bottom"];
const revisions = Array.from({ length: 14 }, (_, index) => 14 - index);

export function Revisions() {
  const [side, setSide] = useState<Side | null>(null);

  return (
    <>
      {sides.map((name) => (
        <Button
          key={name}
          variant="outline"
          size="sm"
          onClick={() => setSide(name)}
        >
          {name}
        </Button>
      ))}
      <Sheet
        open={side !== null}
        onClose={() => setSide(null)}
        side={side ?? "end"}
        size="sm"
        title="Revisions"
        closeLabel="Close"
      >
        <ol>
          {revisions.map((revision) => (
            <li key={revision}>Revision {revision}</li>
          ))}
        </ol>
      </Sheet>
    </>
  );
}
