"use client";

import { BUILTIN_BLOCK_TYPES } from "@alien6-studio/elea-content";
import { blockTypeIcons } from "./icons.js";
import { useContentServices } from "./provider.js";

export interface QuickAddButtonsProps {
  onAdd: (type: string) => void;
  /** Block types offered; defaults to the seven built-in blocks. */
  types?: readonly string[] | undefined;
}

/** One button per block type, labelled from the messages. */
export function QuickAddButtons({ onAdd, types = BUILTIN_BLOCK_TYPES }: QuickAddButtonsProps) {
  const { messages } = useContentServices();
  const labels = messages.blockTypes as Record<string, string | undefined>;
  return (
    <div className="elea-quick-add">
      {types.map((type) => {
        const Icon = blockTypeIcons[type];
        const label = labels[type] ?? type;
        return (
          <button key={type} type="button" role="menuitem" className="elea-icon-button" onClick={() => onAdd(type)} aria-label={label} title={label}>
            {Icon ? <Icon /> : <span className="elea-toolbar__text">{label.slice(0, 2)}</span>}
          </button>
        );
      })}
    </div>
  );
}
