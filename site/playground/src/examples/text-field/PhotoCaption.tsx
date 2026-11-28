import { Field, Textarea } from "@alien6-studio/elea-ui";

export function PhotoCaption() {
  return (
    <Field label="Photo caption">
      {(control) => (
        <Textarea
          {...control}
          defaultValue="Ice at dawn"
          counter={{ max: 80 }}
        />
      )}
    </Field>
  );
}
