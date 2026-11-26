"use client";

import { forwardRef, useMemo } from "react";
import { Combobox } from "./Combobox.js";
import { Input, type InputProps } from "./TextControls.js";
import { cx } from "./cx.js";
import { getCountries, getCountryCallingCode, phoneFormat, phoneToE164, type CountryCode } from "./phoneFormat.js";

export interface PhoneInputLabels {
  /** Accessible name for the country search. Country names come from the locale. */
  country: string;
  empty: string;
  countryPlaceholder?: string | undefined;
}

export interface PhoneInputProps extends Pick<InputProps,
  "id" | "name" | "form" | "placeholder" | "disabled" | "readOnly" | "required" | "className"
  | "autoComplete" | "onFocus" | "onBlur" | "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-invalid"
> {
  locale: string;
  labels: PhoneInputLabels;
  country: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  /** Editable national digits or international digits starting with +. */
  value: string;
  onValueChange: (raw: string) => void;
}

/** A searchable country and a telephone input. A named field submits a complete number in E.164. */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput({
  locale, labels, country, onCountryChange, value, onValueChange, name, form, disabled, readOnly, className, ...input
}, ref) {
  const options = useMemo(() => {
    const names = new Intl.DisplayNames(locale, { type: "region" });
    const collator = new Intl.Collator(locale);
    return getCountries().map(code => ({
      value: code,
      label: `${names.of(code) ?? code} (+${getCountryCallingCode(code)})`,
    })).sort((a, b) => collator.compare(a.label, b.label));
  }, [locale]);
  const format = phoneFormat(country);
  const international = phoneToE164(value, country);
  return (
    <div className={cx("elea-phone-input", className)}>
      <Combobox value={country} options={options} label={labels.country} emptyMessage={labels.empty}
        placeholder={labels.countryPlaceholder} disabled={disabled || readOnly} onChange={code => {
          const option = options.find(item => item.value === code);
          if (option) onCountryChange(option.value);
        }} />
      <Input {...input} ref={ref} type="tel" value={value} format={format} form={form}
        disabled={disabled} readOnly={readOnly} pattern={international ? undefined : ""}
        onChange={event => onValueChange(format.parse(event.currentTarget.value))} />
      {name && <input type="hidden" name={name} form={form} disabled={disabled} value={international ?? ""} />}
    </div>
  );
});
