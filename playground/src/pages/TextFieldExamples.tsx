import { lazy, Suspense } from "react";
import { Field, FieldSkeleton, Input, Textarea } from "@alien6-studio/elea-ui";
import { Demo } from "../components/Demo.js";
import { IdentifierFields } from "./IdentifierFields.js";
import identifierSource from "./IdentifierFields.tsx?raw";
import telephoneSource from "./CountryTelephone.tsx?raw";

const CountryTelephone = lazy(() => import("./CountryTelephone.js"));

export function TextFieldExamples() {
  return <>
    <Demo title="Character counter" description="A soft limit lets writers paste a draft and shorten it. Set maxLength as well when the form requires a hard limit." code={`<Field label="Photo caption">
  {control => <Textarea {...control} defaultValue="Ice at dawn" counter={{ max: 80 }} />}
</Field>`}>
      <div style={{ width: "min(100%, 24rem)" }}>
        <Field label="Photo caption">
          {control => <Textarea {...control} defaultValue="Ice at dawn" counter={{ max: 80 }} />}
        </Field>
      </div>
    </Demo>
    <Demo title="Grouped input mask" description="Each # takes one digit. Type or paste the archive number. The native input and its change event carry the formatted value." code={`<Field label="Archive number" help="Nine digits in groups of three.">
  {control => <Input {...control} name="archive" inputMode="numeric"
    mask="### ### ###" placeholder="123 456 789" />}
</Field>`}>
      <div style={{ width: "min(100%, 24rem)" }}>
        <Field label="Archive number" help="Nine digits in groups of three.">
          {control => <Input {...control} name="archive" inputMode="numeric" mask="### ### ###" placeholder="123 456 789" />}
        </Field>
      </div>
    </Demo>
    <Demo title="Bank and business identifiers"
      description="Paste a whole identifier or edit a single group. Each field submits one value with the spaces removed."
      code={identifierSource}>
      <IdentifierFields />
    </Demo>
    <Demo title="Telephone numbers by country"
      description="Choose a country for a national number, or paste a number starting with +. An E.164 value appears when the number has a possible length for its numbering plan."
      code={telephoneSource}>
      <Suspense fallback={<FieldSkeleton />}><CountryTelephone /></Suspense>
    </Demo>
  </>;
}
