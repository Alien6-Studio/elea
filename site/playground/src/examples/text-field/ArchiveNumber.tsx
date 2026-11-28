import { Field, Input } from "@alien6-studio/elea-ui";

export function ArchiveNumber() {
  return (
    <Field label="Archive number" help="Nine digits in groups of three.">
      {(control) => (
        <Input
          {...control}
          name="archive"
          inputMode="numeric"
          mask="### ### ###"
          placeholder="123 456 789"
        />
      )}
    </Field>
  );
}
