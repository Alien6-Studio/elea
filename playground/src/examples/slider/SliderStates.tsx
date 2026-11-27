import { Slider } from "@alien6-studio/elea-ui";

export function SliderStates() {
  return (
    <>
      <Slider size="sm" aria-label="Zoom" defaultValue={25} />
      <Slider label="Brightness" defaultValue={70} />
      <Slider label="Locked" defaultValue={55} disabled />
    </>
  );
}
