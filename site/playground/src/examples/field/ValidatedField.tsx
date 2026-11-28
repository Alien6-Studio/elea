import { useState } from "react";
import { Field, Input } from "@alien6-studio/elea-ui";

export function ValidatedField() {
  const [email, setEmail] = useState("");
  const invalid = email.length > 0 && !email.includes("@");

  return (
    <Field
      label="Email"
      help="We never share it"
      error={invalid ? "Enter a valid address" : undefined}
      required
      requiredMarker="*"
    >
      {(control) => (
        <Input
          {...control}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          invalid={invalid}
        />
      )}
    </Field>
  );
}
