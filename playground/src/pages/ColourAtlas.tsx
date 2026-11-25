import { useRef, useState, type KeyboardEvent } from "react";
import { Tabs } from "@alien6-studio/elea-ui";
import { brandColorRoles, type BrandColorRole, type BrandTheme, type makeBrandTheme } from "@alien6-studio/elea-tokens/brand";
import { colorFamilies, colorSteps, defaultColorStep, defaultTertiaryFamily, surfaceFamilies, type ColorFamily, type ColorStep } from "@alien6-studio/elea-tokens/palette";
import { colourRoleLabels, ColourRoleEditor } from "./ColourRoles.js";
import "./colour-atlas.css";

type Theme = ReturnType<typeof makeBrandTheme>;
type AtlasControls = {
  palettes: Theme["palettes"];
  role: BrandColorRole;
  onRoleChange: (role: BrandColorRole) => void;
  brand: BrandTheme;
  onChange: (brand: BrandTheme) => void;
};

interface AtlasRow {
  label: string;
  shades: readonly { step: ColorStep; value: string }[];
  family?: ColorFamily | undefined;
}

const referenceRows: AtlasRow[] = (Object.keys(colorFamilies) as ColorFamily[]).map(family =>
  ({ label: family, shades: colorFamilies[family], family }));

function AtlasPanel({ rows, mode, initialRow, initialStep, ...controls }: AtlasControls & {
  rows: AtlasRow[];
  mode: "theme" | "reference";
  initialRow: string;
  initialStep: ColorStep;
}) {
  const [selected, setSelected] = useState({ row: initialRow, step: initialStep });
  const table = useRef<HTMLTableElement>(null);
  const isReference = mode === "reference";
  const row = rows.find(({ label }) => label === selected.row) ?? rows[0]!;
  const swatch = row.shades[colorSteps.indexOf(selected.step)]!;

  function move(event: KeyboardEvent<HTMLTableCellElement>, row: number, col: number) {
    let nextRow = row;
    let nextCol = col;
    switch (event.key) {
      case "ArrowLeft": nextCol--; break;
      case "ArrowRight": nextCol++; break;
      case "ArrowUp": nextRow--; break;
      case "ArrowDown": nextRow++; break;
      case "Home": nextCol = 0; if (event.ctrlKey) nextRow = 0; break;
      case "End": nextCol = colorSteps.length - 1; if (event.ctrlKey) nextRow = rows.length - 1; break;
      default: return;
    }
    event.preventDefault();
    const targetRow = Math.max(0, Math.min(rows.length - 1, nextRow));
    const tone = Math.max(0, Math.min(colorSteps.length - 1, nextCol));
    table.current?.tBodies[0]?.rows[targetRow]?.cells[tone + 1]?.focus();
  }

  return (
    <div className="colour-atlas__layout">
      <div className="colour-atlas__scroll">
        <table ref={table} role="grid" aria-label={isReference ? "Reference colours" : "Theme colours"} className="colour-atlas__grid">
          <thead><tr><th scope="col">{isReference ? "Family" : "Role"}</th>{colorSteps.map(step => <th scope="col" key={step}>{step}</th>)}</tr></thead>
          <tbody>{rows.map(({ label, shades }, index) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {shades.map(({ value, step }, col) => {
                const active = label === row.label && step === selected.step;
                return (
                  <td key={step} role="gridcell" aria-label={`${label} ${step}`} aria-selected={active} tabIndex={active ? 0 : -1}
                    title={`${label} ${step} · ${value.toUpperCase()}`} style={{ backgroundColor: value }}
                    onFocus={() => setSelected({ row: label, step })} onClick={event => event.currentTarget.focus()}
                    onKeyDown={event => move(event, index, col)}>
                    {active && <span aria-hidden="true" className="colour-atlas__selection">✓</span>}
                  </td>
                );
              })}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="colour-atlas__inspector">
        <div className="colour-atlas__sample" style={{ backgroundColor: swatch.value }} aria-hidden="true" />
        <div className="colour-atlas__readout"><h3>{row.label} {swatch.step}</h3><code>{swatch.value.toUpperCase()}</code></div>
        <ColourRoleEditor {...controls} hex={swatch.value} selection={row.family && { family: row.family, step: swatch.step }} />
      </div>
    </div>
  );
}

export function ColourAtlas({ roleScales, themeName, ...controls }: AtlasControls & {
  roleScales: Theme["roleScales"];
  themeName: string;
}) {
  const { palette, edition } = controls.brand;
  const themeRows: AtlasRow[] = brandColorRoles.flatMap(role => {
    const shades = roleScales[role];
    const assignment = palette?.[role];
    const family = assignment && "family" in assignment ? assignment.family
      : role === "tertiary" && !assignment && edition ? defaultTertiaryFamily : undefined;
    return shades ? [{ label: colourRoleLabels[role], shades, family }] : [];
  });
  if (palette?.neutral) {
    const family = Object.hasOwn(colorFamilies, palette.neutral) ? palette.neutral as ColorFamily : undefined;
    themeRows.push({ label: "Surface", shades: surfaceFamilies[palette.neutral], family });
  }
  const reference = palette?.primary ?? palette?.secondary ?? { family: "Emerald", step: defaultColorStep };

  return (
    <section className="colour-atlas" aria-labelledby="atlas-title">
      <header className="colour-atlas__heading">
        <h2 id="atlas-title">Colour atlas</h2>
      </header>
      <Tabs label="Atlas palettes" defaultValue="theme" presentation="underline" items={[
        {
          value: "theme", label: "Theme palette", panel: <>
            <h3 className="colour-atlas__palette-name">{themeName}</h3>
            <AtlasPanel {...controls} mode="theme" rows={themeRows}
              initialRow="Primary" initialStep={palette?.primary?.step ?? defaultColorStep} />
          </>,
        },
        {
          value: "reference", label: "Reference families", panel: <>
            <p className="colour-atlas__hint">Choose a shade to assign to a colour role.</p>
            <AtlasPanel {...controls} mode="reference" rows={referenceRows}
              initialRow={reference.family} initialStep={reference.step} />
          </>,
        },
      ]} />
    </section>
  );
}
