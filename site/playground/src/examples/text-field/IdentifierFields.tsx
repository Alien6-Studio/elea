import {
  CardNumberInput,
  Field,
  IbanInput,
  SirenInput,
  SiretInput,
} from "@alien6-studio/elea-ui";

const segmentLabel = (index: number, count: number) =>
  `Group ${index + 1} of ${count}`;

export function IdentifierFields() {
  return (
    <form
      aria-label="Bank and business identifiers"
      onSubmit={(event) => event.preventDefault()}
      className="identifier-form"
    >
      <Field label="IBAN">
        {(control) => (
          <IbanInput
            {...control}
            label="IBAN"
            name="iban"
            segmentLabel={segmentLabel}
          />
        )}
      </Field>
      <Field label="Test card number" help="Try 4242 4242 4242 4242.">
        {(control) => (
          <CardNumberInput
            {...control}
            label="Test card number"
            name="card"
            segmentLabel={segmentLabel}
            autoComplete="off"
          />
        )}
      </Field>
      <div className="identifier-form__business">
        <Field label="SIREN" help="Nine digits identify a French business.">
          {(control) => (
            <SirenInput
              {...control}
              label="SIREN"
              name="siren"
              segmentLabel={segmentLabel}
            />
          )}
        </Field>
        <Field
          label="SIRET"
          help="The last five digits identify its establishment."
        >
          {(control) => (
            <SiretInput
              {...control}
              label="SIRET"
              name="siret"
              segmentLabel={segmentLabel}
            />
          )}
        </Field>
      </div>
    </form>
  );
}
