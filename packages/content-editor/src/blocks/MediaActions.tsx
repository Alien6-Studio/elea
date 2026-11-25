import { IconButton } from "@alien6-studio/elea-ui";
import type { ReactNode, Ref } from "react";
import { TrashIcon } from "../icons.js";

interface MediaActionsProps {
  children?: ReactNode;
  icon: ReactNode;
  replace: string;
  remove: string;
  onReplace: () => void;
  onRemove: () => void;
  replaceRef?: Ref<HTMLButtonElement>;
  canReplace?: boolean;
  busy?: boolean;
}

export function MediaActions({ children, icon, replace, remove, onReplace, onRemove, replaceRef, canReplace = true, busy }: Readonly<MediaActionsProps>) {
  return (
    <div className="elea-media-block__actions">
      {children}
      <IconButton ref={replaceRef} variant="disc" label={replace} disabled={busy || !canReplace} onClick={onReplace}>{icon}</IconButton>
      <IconButton variant="disc" label={remove} disabled={busy} onClick={onRemove}><TrashIcon /></IconButton>
    </div>
  );
}
