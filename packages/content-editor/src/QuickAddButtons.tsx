"use client";

import { BUILTIN_BLOCK_TYPES, formatMessage } from "@alien6-studio/elea-content";
import { blockTypeIcons } from "./icons.js";
import { useContentServices } from "./provider.js";

export interface QuickAddButtonsProps {
  onAdd: (type: string) => void;
  /** Block types offered; defaults to the seven built-in blocks. */
  types?: readonly string[] | undefined;
  /** Laid out in a row of plain buttons, for a toolbar, instead of a column of menu items. */
  row?: boolean | undefined;
}

/** One entry per block type, icon and label from the messages. */
export function QuickAddButtons({ onAdd, types = BUILTIN_BLOCK_TYPES, row = false }: Readonly<QuickAddButtonsProps>) {
  const { messages } = useContentServices();
  const labels = messages.blockTypes as Record<string, string | undefined>;
  return (
    <div className={`elea-quick-add${row ? " elea-quick-add--row" : ""}`}>
      {types.map((type) => {
        const Icon = blockTypeIcons[type];
        const label = labels[type] ?? type;
        const action = row ? formatMessage(messages.actions.addBlockType, { type: label }) : undefined;
        return (
          <button
            key={type}
            type="button"
            role={row ? undefined : "menuitem"}
            className="elea-quick-add__item"
            onClick={() => onAdd(type)}
            aria-label={action}
            title={action}
            // In a bar, the press must not take the focus away from the field it inserts after
            onMouseDown={row ? (event) => event.preventDefault() : undefined}
          >
            {Icon ? <Icon /> : null}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
