"use client";

import { useState } from "react";
import { PlusIcon } from "./icons.js";
import { useContentServices } from "./provider.js";
import { QuickAddButtons } from "./QuickAddButtons.js";

export interface AddBlockButtonProps {
  onAdd: (type: string) => void;
  types?: readonly string[] | undefined;
}

/** A plus button that opens the menu of block types; Escape closes it. */
export function AddBlockButton({ onAdd, types }: AddBlockButtonProps) {
  const { messages } = useContentServices();
  const [open, setOpen] = useState(false);
  return (
    <div className="elea-add-block">
      <button
        type="button"
        className="elea-icon-button elea-add-block__trigger"
        onClick={() => setOpen((previous) => !previous)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        aria-label={messages.actions.addBlock}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <PlusIcon />
      </button>
      {open && (
        <div role="menu" aria-label={messages.actions.blockTypesMenu} className="elea-add-block__menu">
          <QuickAddButtons
            types={types}
            onAdd={(type) => {
              onAdd(type);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
