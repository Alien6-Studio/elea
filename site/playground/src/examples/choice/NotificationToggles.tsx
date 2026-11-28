import { useState } from "react";
import { Toggle } from "@alien6-studio/elea-ui";

export function NotificationToggles() {
  const [on, setOn] = useState(true);

  return (
    <>
      <Toggle checked={on} onCheckedChange={setOn} label="Notifications" />
      <Toggle
        checked={false}
        onCheckedChange={() => {}}
        label="Disabled"
        disabled
      />
    </>
  );
}
