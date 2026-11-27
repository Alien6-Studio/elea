import { lazy, Suspense } from "react";
import { Field, FieldSkeleton, Input, Textarea } from "@alien6-studio/elea-ui";
import { Demo } from "../components/Demo.js";
import { IdentifierFields } from "../examples/text-field/IdentifierFields.js";
import identifierSource from "../examples/text-field/IdentifierFields.tsx?raw";
import telephoneSource from "../examples/text-field/CountryTelephone.tsx?raw";
import captionSource from "../examples/text-field/CaptionEditor.tsx?raw";
import reviewNoteSource from "../examples/text-field/ReviewNote.tsx?raw";
import photoCaptionSource from "../examples/text-field/PhotoCaption.tsx?raw";
import archiveNumberSource from "../examples/text-field/ArchiveNumber.tsx?raw";

const CountryTelephone = lazy(() => import("../examples/text-field/CountryTelephone.js").then(module => ({ default: module.CountryTelephone })));
const ReviewNote = lazy(() => import("../examples/text-field/ReviewNote.js").then(module => ({ default: module.ReviewNote })));
const CaptionEditor = lazy(() => import("../examples/text-field/CaptionEditor.js").then(module => ({ default: module.CaptionEditor })));

export function TextFieldExamples() {
  return <>
    <Demo title="Character counter" description="A soft limit lets writers paste a draft and shorten it. Set maxLength as well when the form requires a hard limit." code={photoCaptionSource}>
      <div style={{ width: "min(100%, 24rem)" }}>
        <Field label="Photo caption">
          {control => <Textarea {...control} defaultValue="Ice at dawn" counter={{ max: 80 }} />}
        </Field>
      </div>
    </Demo>
    <Demo title="Grouped input mask" description="Each # takes one digit. Type or paste the archive number. The native input and its change event carry the formatted value." code={archiveNumberSource}>
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
    <Demo title="Formatted caption" description="Edit a caption of up to 140 characters, then save it to see the HTML your form can store." code={captionSource}>
      <Suspense fallback={<FieldSkeleton />}><CaptionEditor /></Suspense>
    </Demo>
    <Demo title="A field that accepts part of the editor"
      description={<>This note accepts paragraphs and lists, with bold, italic and links. The saved heading is shown as a paragraph, its rule is left out and reported through <code>onBlocksLeftOut</code>. Place the caret in the link and use the link control to change, remove or open its address.</>}
      code={reviewNoteSource}>
      <Suspense fallback={<FieldSkeleton />}><ReviewNote /></Suspense>
    </Demo>
  </>;
}
