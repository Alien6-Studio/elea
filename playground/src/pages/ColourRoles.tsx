import { useLayoutEffect, useRef, useState } from "react";
import { Button, ColorPicker, Select } from "@alien6-studio/elea-ui";
import { brandColorRoles, type BrandColorRole, type makeBrandTheme, type PaletteSelection } from "@alien6-studio/elea-tokens/brand";
import { cssVar } from "@alien6-studio/elea-tokens";
import { defaultColorStep } from "@alien6-studio/elea-tokens/palette";
import { brandRoute, resetStudioColours, sameRole, type BrandTheme } from "./brandTheme.js";

export const colourRoleLabels = {
  primary: "Primary", secondary: "Secondary", tertiary: "Tertiary",
  success: "Success", info: "Info", warning: "Warning", danger: "Danger",
} as const satisfies Record<BrandColorRole, string>;
const options = brandColorRoles.map(value => ({ value, label: colourRoleLabels[value] }));

function ColourScale({ label, shades }: Readonly<{ label: string; shades: readonly { step: number; value: string }[] }>) {
  return (
    <details className="studio-scale">
      <summary>
        <span className="studio-scale__label">{label}</span>
        <span className="studio-scale__strip" aria-hidden="true">
          {shades.map(({ step, value }) => <span key={step} style={{ backgroundColor: value }} />)}
        </span>
      </summary>
      <ul aria-label={label}>
        {shades.map(({ step, value }) => (
          <li key={step}>
            <span className="studio-scale__sample" aria-hidden="true" style={{ backgroundColor: value }} />
            <span>{step}</span><code>{value.toUpperCase()}</code>
          </li>
        ))}
      </ul>
    </details>
  );
}

// Convert the rendered role fill to the sRGB hex accepted by the colour input.
function renderedHex(element: HTMLElement) {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return undefined;
  context.fillStyle = getComputedStyle(element).color;
  context.fillRect(0, 0, 1, 1);
  const channels = context.getImageData(0, 0, 1, 1).data;
  return "#" + Array.from(channels.subarray(0, 3), channel => channel.toString(16).padStart(2, "0")).join("");
}

export function ColourRoleEditor({ brand, onChange, selection, hex, role, onRoleChange, palettes }: Readonly<{
  brand: BrandTheme;
  onChange: (brand: BrandTheme) => void;
  selection: PaletteSelection | undefined;
  hex: string;
  role: BrandColorRole;
  onRoleChange: (role: BrandColorRole) => void;
  palettes: ReturnType<typeof makeBrandTheme>["palettes"];
}>) {
  const fillSample = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState<string>();
  const base = resetStudioColours(brand);
  const canReset = !sameRole(brand, base, role);
  const scale = role === "primary" || role === "secondary" ? palettes[role] : undefined;
  useLayoutEffect(() => {
    const node = fillSample.current;
    if (!node) return;
    const read = () => setValue(renderedHex(node));
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme", "data-elea-theme"] });
    const appearance = matchMedia("(prefers-color-scheme: dark)");
    appearance.addEventListener("change", read);
    return () => {
      appearance.removeEventListener("change", read);
      observer.disconnect();
    };
  }, [brand, role]);

  function update(seed: string | undefined, shade?: PaletteSelection) {
    const next = { ...brand };
    const assignments = { ...brand.palette };
    delete assignments[role];
    if (role === "primary" || role === "secondary") {
      if (role === "primary") next.seed = seed ?? base.seed;
      else next.accent = seed ?? base.accent;
      if (shade) assignments[role] = shade;
    } else if (seed) {
      assignments[role] = shade ?? { seed };
    }
    const original = base.palette?.[role];
    if (!seed && original) Object.assign(assignments, { [role]: original });
    next.palette = Object.keys(assignments).length ? assignments : undefined;
    onChange(next);
  }

  return (
    <div className="colour-role-editor" data-elea-theme="brand">
      <div className="colour-role-editor__select">
        <label id="colour-role-label" htmlFor="colour-role">Colour role</label>
        <Select id="colour-role" labelledBy="colour-role-label" value={role} options={options} onChange={value => onRoleChange(value as BrandColorRole)} />
      </div>
      <div className="colour-atlas__actions">
        <Button size="sm" onClick={() => update(hex, selection)}>Use as {role}</Button>
      </div>
      <div className="colour-role-editor__custom">
        <span hidden ref={fillSample} style={{ color: cssVar(`color.action.${role}`) }} />
        {value && <ColorPicker key={role} label={`${colourRoleLabels[role]} colour`} hexLabel={`${colourRoleLabels[role]} hex`}
          invalidMessage="Enter a six-digit hex colour." value={value} onChange={value => update(value)} />}
        {canReset && <Button size="xs" variant="ghost" onClick={() => update(undefined)}>Reset {role}</Button>}
      </div>
      {scale && (scale.length
        ? <ColourScale label={`${colourRoleLabels[role]} scale`} shades={scale} />
        : <p className="elea-field__help">The secondary scale is inherited from the surrounding theme.</p>)}
    </div>
  );
}

function roleSource(brand: BrandTheme, role: BrandColorRole) {
  const assignment = brand.palette?.[role];
  if (assignment && "family" in assignment) return `${assignment.family} ${assignment.step}`;
  if (assignment && "seed" in assignment) return assignment.seed.toUpperCase();
  return role === "primary" || role === "secondary" ? `Tone ${defaultColorStep}` : "Theme default";
}

export function ColourRoles({ brand, activeRole }: Readonly<{ brand: BrandTheme; activeRole: BrandColorRole }>) {
  const container = `color.action.${activeRole}`;
  const renderRole = (role: BrandColorRole) => (
    <div key={role} className={`atlas-role--${role}`}
      style={{ backgroundColor: cssVar(`color.action.${role}`), color: cssVar(`color.action.${role}-text`) }}>
      <dt>{colourRoleLabels[role]}</dt><dd>{roleSource(brand, role)}</dd>
    </div>
  );
  return (
    <section className="atlas-roles" aria-labelledby="colour-roles-title" data-elea-theme="brand">
      <h2 id="colour-roles-title">Colour roles</h2>
      <dl className="atlas-roles__brand" aria-label="Brand colours" aria-live="polite">
        {renderRole("primary")}{renderRole("secondary")}{renderRole("tertiary")}
      </dl>
      <dl className="atlas-roles__feedback" aria-label="Feedback colours" aria-live="polite">
        {renderRole("success")}{renderRole("info")}{renderRole("warning")}{renderRole("danger")}
      </dl>
      <dl className="atlas-roles__surfaces" aria-label="Surfaces and text" aria-live="polite">
        <div style={{ backgroundColor: cssVar(`${container}-container`), color: cssVar(`${container}-on-container`) }}>
          <dt>{colourRoleLabels[activeRole]} container</dt><dd>On container</dd>
        </div>
        <div className="atlas-role--surface"><dt>Surface</dt><dd>{brand.palette?.neutral ?? brand.edition ?? "Inherited"}</dd></div>
        <div className="atlas-role--surface-muted"><dt>Muted surface</dt><dd>Muted text</dd></div>
        <div className="atlas-role--surface"><dt>Focus</dt><dd><span className="atlas-roles__ring" aria-hidden="true" />Keyboard ring</dd></div>
        <div className="atlas-role--surface"><dt>Link</dt><dd><a href={brandRoute("ui/button", brand)}>Try buttons</a></dd></div>
      </dl>
    </section>
  );
}
