import { useState } from "react";
import { ColorPicker } from "@alien6-studio/elea-ui";

export function CoverInk() {
  const [ink, setInk] = useState("#047857");

  return (
    <ColorPicker
      label="Ink colour"
      hexLabel="Ink hex"
      value={ink}
      onChange={setInk}
      invalidMessage="Enter a six-digit hex colour."
    />
  );
}
