import { useState } from "react";
import { Popover, type PopoverAnchor } from "@alien6-studio/elea-ui";

export function ClickPosition() {
  const [point, setPoint] = useState<PopoverAnchor | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={({ clientX, clientY }) =>
          setPoint({
            getBoundingClientRect: () => new DOMRect(clientX, clientY, 0, 0),
          })
        }
      >
        Click anywhere in this area
      </button>
      <Popover
        label="Position"
        anchor={point}
        open={point !== null}
        onOpenChange={() => setPoint(null)}
      >
        Opened where you clicked.
      </Popover>
    </>
  );
}
