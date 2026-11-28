import { useEffect, useRef, useState } from "react";
import {
  Field, SaveStatus, Textarea, Toggle, type SaveState,
} from "@alien6-studio/elea-ui";

const clock = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

export function DraftAutosave() {
  const [state, setState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState("");
  const [offline, setOffline] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Stands for the request an application sends to its own server
  function save() {
    clearTimeout(timer.current);
    setState("saving");
    timer.current = setTimeout(() => {
      if (offline) return setState("error");
      setSavedAt(clock.format(new Date()));
      setState("saved");
    }, 900);
  }

  const text = {
    idle: "No changes yet",
    saving: "Saving",
    saved: `Saved at ${savedAt}`,
    error: "Not saved",
  }[state];

  return (
    <>
      <Field label="Standfirst">
        {(control) => (
          <Textarea
            {...control}
            rows={3}
            defaultValue="Three winters on the ice, told by its surveyors."
            onChange={save}
          />
        )}
      </Field>
      <SaveStatus state={state} onRetry={save} retryLabel="Retry">
        {text}
      </SaveStatus>
      <Toggle
        checked={offline}
        onCheckedChange={setOffline}
        label="Lose the connection"
      />
    </>
  );
}
