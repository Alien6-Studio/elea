import { Button } from "@alien6-studio/elea-ui";

const tones = [
  "primary",
  "secondary",
  "tertiary",
  "neutral",
  "danger",
  "warning",
  "success",
  "info",
] as const;
const variants = ["solid", "outline", "ghost"] as const;

export function ActionPalette() {
  return variants.map((variant) => (
    <fieldset key={variant}>
      <legend>{variant}</legend>
      {tones.map((tone) => (
        <Button key={tone} variant={variant} tone={tone}>
          {tone}
        </Button>
      ))}
    </fieldset>
  ));
}
