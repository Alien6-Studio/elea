import { Field, Select } from "@alien6-studio/elea-ui";
import { useSyncExternalStore } from "react";
import { sitePath } from "../links.js";

export function SiteTypefaceField() {
  const fonts = globalThis.eleaSiteFont;
  const value = useSyncExternalStore(fonts.subscribe, fonts.get);
  return (
    <Field
      id="site-typeface"
      label={<span id="site-typeface-label">Site typeface</span>}
      help={<a href={`${sitePath}typography/`}>View type specimen</a>}
    >
      {({ id, "aria-describedby": describedBy }) => (
        <Select
          id={id}
          labelledBy="site-typeface-label"
          triggerProps={{ "aria-describedby": describedBy }}
          value={value}
          options={fonts.options}
          onChange={(next) => {
            const option = fonts.options.find(({ value }) => value === next);
            if (option) fonts.set(option.value);
          }}
        />
      )}
    </Field>
  );
}
