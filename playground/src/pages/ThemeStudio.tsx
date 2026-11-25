import { Button, Field, Input, RadioGroup, Select } from "@alien6-studio/elea-ui";
import { useEffect, useState } from "react";
import { createDocument, en } from "@alien6-studio/elea-content";
import { notebookBlocks, notebookSummary, notebookTitle } from "../samples.js";
import { ReaderEdition } from "./ReaderEdition.js";
import { corners, editions, makeBrandTheme, rhythms, typefaces, typeFamilies, type BrandTheme, type Corners } from "@alien6-studio/elea-tokens/brand";
import { brandRoute, readBrandTheme, validBrand } from "./brandTheme.js";
import "./studio.css";

const notebook = createDocument(notebookBlocks);

function studioBrand(): BrandTheme {
  return readBrandTheme() ?? editions.Precision;
}

export function ThemeStudioPage({ replaceRoute }: { replaceRoute: (route: string) => void }) {
  const [brand, setBrand] = useState(studioBrand);
  const [mobileView, setMobileView] = useState<"preview" | "settings">("preview");
  // What is being typed for the free values; the theme takes them once the generator accepts them.
  const [draft, setDraft] = useState(() => ({ radius: brand.radius ?? "", font: brand.font ?? "" }));
  useEffect(() => {
    const followLocation = () => {
      const next = studioBrand();
      setBrand(next);
      setDraft({ radius: next.radius ?? "", font: next.font ?? "" });
    };
    window.addEventListener("hashchange", followLocation);
    return () => window.removeEventListener("hashchange", followLocation);
  }, []);
  const { seed, corner, typeface, rhythm, accent } = brand;
  const { css, colours } = makeBrandTheme(brand);
  const defaultAccent = brand.edition ? editions[brand.edition].accent : undefined;
  const displayedAccent = accent ?? defaultAccent;
  const currentPreset = brandRoute("theme", { ...brand, accent: displayedAccent });

  function changeBrand(next: typeof brand) {
    setBrand(next);
    replaceRoute(brandRoute("theme", next));
  }
  function changeEdition(next: BrandTheme) {
    setDraft({ radius: next.radius ?? "", font: next.font ?? "" });
    changeBrand(next);
  }
  function changeCorners(corner: Corners) {
    const { radius: _removed, ...rest } = brand;
    setDraft({ ...draft, radius: "" });
    changeBrand({ ...rest, corner });
  }
  function changeFree(key: "radius" | "font", value: string) {
    setDraft({ ...draft, [key]: value });
    const { [key]: _previous, ...rest } = brand;
    const next = validBrand(value.trim() ? { ...rest, [key]: value.trim() } : rest);
    if (next) changeBrand(next);
  }
  const refused = (key: "radius" | "font") => draft[key].trim() !== (brand[key] ?? "");
  return (
    <div className="theme-studio">
      <style>{css}</style>
      <header className="studio-intro">
        <div>
          <h1 className="site-page-title">Theme studio</h1>
          <p>Choose an edition, then tune its colour, type and spacing. Try it on components or in the editorial workspace.</p>
        </div>
        <Button href={brandRoute("ui", brand)} trailingIcon="→">Open themed gallery</Button>
      </header>
      <div className="studio-presets" role="group" aria-label="Theme presets">
        {Object.entries(editions).map(([name, edition]) => {
          const active = currentPreset === brandRoute("theme", edition);
          return (
            <Button key={name} variant="outline" aria-label={name} aria-pressed={active} aria-describedby={`edition-${name}`} onClick={() => changeEdition(edition)}>
              <span className="studio-preset__mark" aria-hidden="true" style={{ backgroundColor: edition.seed }} />
              <span className="studio-preset__text">
                <span style={{ fontFamily: typeFamilies[edition.typeface] }}>{name}</span>
                <small id={`edition-${name}`}>{edition.typeface} · {edition.rhythm} spacing</small>
              </span>
            </Button>
          );
        })}
      </div>
      <div className="studio-view-switch" role="group" aria-label="Studio view">
        <Button size="sm" variant="ghost" aria-controls="studio-canvas" aria-pressed={mobileView === "preview"} onClick={() => setMobileView("preview")}>Preview</Button>
        <Button size="sm" variant="ghost" aria-controls="studio-controls" aria-pressed={mobileView === "settings"} onClick={() => setMobileView("settings")}>Settings</Button>
      </div>
      <div className="studio-workbench" data-view={mobileView}>
        <div id="studio-controls" className="studio-controls">
          <h2>Brand settings</h2>
          <Field label="Brand colour">{({ id }) => <div className="studio-colour">
            <input id={id} type="color" value={seed} onChange={(event) => changeBrand({ ...brand, seed: event.currentTarget.value })} /><code>{seed.toUpperCase()}</code>
          </div>}</Field>
          <div className="studio-ramp" aria-hidden="true">{colours.map((color, index) => <i key={index} style={{ background: color }} />)}</div>
          <div className="studio-reading">
            <div><span className="elea-field__label" id="studio-typeface">Reading typeface</span>
              <Select labelledBy="studio-typeface" value={typeface} options={typefaces.map((value) => ({ value, label: value }))}
                onChange={(value) => changeBrand({ ...brand, typeface: value as typeof typeface })} />
            </div>
            <div><span className="elea-field__label" id="studio-rhythm">Reading density</span>
              <Select labelledBy="studio-rhythm" value={rhythm} options={rhythms.map((value) => ({ value, label: value }))}
                onChange={(value) => changeBrand({ ...brand, rhythm: value as typeof rhythm })} />
            </div>
          </div>
          <RadioGroup label="Corners" name="corners" value={corner} onChange={(value) => changeCorners(value as Corners)} options={corners.map((value) => ({ value, label: value }))} />
          <h2>Your product’s identity</h2>
          <Field label="Second colour" help="Fills secondary buttons.">{({ id, ...described }) => <div className="studio-colour">
            <input id={id} {...described} type="color" value={displayedAccent ?? "#82591c"} onChange={(event) => changeBrand({ ...brand, accent: event.currentTarget.value })} />
            <code>{displayedAccent?.toUpperCase() ?? "Elea default"}</code>
            {accent && accent !== defaultAccent && <Button size="xs" variant="ghost" onClick={() => { const { accent: _removed, ...rest } = brand; changeBrand(rest); }}>Remove</Button>}
          </div>}</Field>
          <Field label="Corner radius" help="In rem or px; replaces the corner steps." error={refused("radius") ? "Use a length such as 10px or 0.625rem." : undefined}>
            {(control) => <Input {...control} placeholder="0.625rem" value={draft.radius} invalid={refused("radius")} onChange={(event) => changeFree("radius", event.currentTarget.value)} />}
          </Field>
          <Field label="Interface font" help="Any CSS font stack your product loads." error={refused("font") ? "Use font names, quotes, commas and var() only." : undefined}>
            {(control) => <Input {...control} placeholder="var(--font-inter), system-ui" value={draft.font} invalid={refused("font")} onChange={(event) => changeFree("font", event.currentTarget.value)} />}
          </Field>
        </div>
        <div id="studio-canvas" className="studio-canvas">
          <section data-elea-theme="brand" aria-labelledby="studio-preview-title">
            <h2 className="site__visually-hidden" id="studio-preview-title">Publication preview</h2>
            <ReaderEdition document={notebook} title={notebookTitle} summary={notebookSummary} audience="Members" messages={en} />
          </section>
        </div>
        <div className="studio-export">
          <div className="studio-export__actions">
            <Button href={brandRoute("playground", brand)} trailingIcon="→">Open themed workspace</Button>
            <Button href={`data:text/css;charset=utf-8,${encodeURIComponent(css)}`} download="elea-brand.css" variant="outline" trailingIcon="↓">Download CSS</Button>
          </div>
          <p>Load it with Elea’s styles and set <code>data-elea-theme="brand"</code> on a container: dialogs and toasts opened from it follow.</p>
        </div>
      </div>
      <details className="studio-source"><summary>View CSS</summary><pre tabIndex={0}><code>{css}</code></pre></details>
    </div>
  );
}
