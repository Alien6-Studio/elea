import { Button } from "@alien6-studio/elea-ui";

const css = `
.teal-info {
  --elea-color-action-info: light-dark(#0e7490, #67e8f9);
  --elea-color-action-info-text: light-dark(white, black);
  --elea-color-action-info-hover: color-mix(
    in srgb,
    var(--elea-color-action-info) 90%,
    light-dark(black, white)
  );
  --elea-color-action-info-pressed: color-mix(
    in srgb,
    var(--elea-color-action-info) 80%,
    light-dark(black, white)
  );
}
`;

export function TealInfo() {
  return (
    <>
      <style>{css}</style>
      <Button variant="info" className="teal-info">
        Teal info
      </Button>
    </>
  );
}
