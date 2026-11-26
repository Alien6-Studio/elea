import { useState } from "react";
import { Field } from "@alien6-studio/elea-ui";
import { PhoneInput, phoneToE164, type CountryCode } from "@alien6-studio/elea-ui/phone";
import "@alien6-studio/elea-ui/bundle.css";

export default function CountryTelephone() {
  const [country, setCountry] = useState<CountryCode>("FR");
  const [value, setValue] = useState("0199000123");
  const international = phoneToE164(value, country);

  return <div style={{ display: "grid", gap: "var(--elea-space-4)", width: "min(100%, 32rem)" }}>
    <Field label="Telephone number">
      {control => <PhoneInput {...control} name="telephone" locale="en" country={country}
        onCountryChange={setCountry} value={value} onValueChange={setValue}
        labels={{ country: "Country or region", countryPlaceholder: "Find a country or calling code", empty: "No matching countries" }} />}
    </Field>
    <Field label="International number (E.164)">
      {({ id }) => <output id={id}>{international ?? "Enter a complete number"}</output>}
    </Field>
  </div>;
}
