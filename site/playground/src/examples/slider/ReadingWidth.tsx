import { useState } from "react";
import { Slider } from "@alien6-studio/elea-ui";

export function ReadingWidth() {
  const [width, setWidth] = useState(68);

  return (
    <Slider
      label="Reading width"
      min={48}
      max={96}
      step={4}
      value={width}
      onChange={setWidth}
      showValue
      formatValue={(value) => `${value} characters`}
    />
  );
}
