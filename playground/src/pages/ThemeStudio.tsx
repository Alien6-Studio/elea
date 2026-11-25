import { Button, Field, Input, RadioGroup, Select } from "@alien6-studio/elea-ui";
import { useEffect, useState } from "react";
import { createDocument, en } from "@alien6-studio/elea-content";
import { SiteTypefaceField } from "../components/SiteTypefaceField.js";
import { notebookBlocks, notebookSummary, notebookTitle } from "../samples.js";
import { ReaderEdition } from "./ReaderEdition.js";
import { corners, makeBrandTheme, rhythms, typefaces, type Corners } from "@alien6-studio/elea-tokens/brand";
import { colorThemes } from "@alien6-studio/elea-tokens/palette";
import { brandRoute, featuredColourThemes, readBrandTheme, studioTheme, studioThemeName, validBrand, type BrandTheme, type StudioThemeId } from "./brandTheme.js";
import "./studio.css";

const notebook = createDocument(notebookBlocks);

function themeOption(id: StudioThemeId) {
  const { name, colours } = colorThemes[id];
  return {
    value: id, label: <span className="studio-colour-option">
      <span className="studio-colour-option__swatches" aria-hidden="true">
        {[colours.primary, colours.secondary, colours.tertiary].map((colour, index) =>
          <span key={index} style={{ backgroundColor: colour }} />)}
      </span>
      {name}
    </span>,
  };
}

export function ThemeStudioPage({ brand, onChange }: { brand: BrandTheme; onChange: (next: BrandTheme) => void }) {
  const [mobileView, setMobileView] = useState<"preview" | "settings">("preview");
  // What is being typed for the free values; the theme takes them once the generator accepts them.
  const [draft, setDraft] = useState(() => ({ radius: brand.radius ?? "", font: brand.font ?? "" }));
  useEffect(() => {
    const followLocation = () => {
      const next = readBrandTheme();
      setDraft({ radius: next?.radius ?? "", font: next?.font ?? "" });
    };
    window.addEventListener("hashchange", followLocation);
    return () => window.removeEventListener("hashchange", followLocation);
  }, []);
  const { corner, typeface, rhythm } = brand;
  const { css } = makeBrandTheme(brand);
  const selectedProfile = brand.profile && brandRoute("theme", brand) === brandRoute("theme", studioTheme(brand.profile))
    ? brand.profile : null;

  function changeTheme(next: BrandTheme) {
    setDraft({ radius: next.radius ?? "", font: next.font ?? "" });
    onChange(next);
  }
  function changeCorners(corner: Corners) {
    const { radius: _removed, ...rest } = brand;
    setDraft({ ...draft, radius: "" });
    onChange({ ...rest, corner });
  }
  function changeFree(key: "radius" | "font", value: string) {
    setDraft({ ...draft, [key]: value });
    const { [key]: _previous, ...rest } = brand;
    const next = validBrand(value.trim() ? { ...rest, [key]: value.trim() } : rest);
    if (next) onChange(next);
  }
  const refused = (key: "radius" | "font") => draft[key].trim() !== (brand[key] ?? "");
  return (
    <div className="theme-studio" data-elea-theme="brand">
      <style>{css}</style>
      <header className="studio-intro">
        <div>
          <h1 className="site-page-title">Theme studio</h1>
          <p>Choose a theme, then adjust its colours, type, spacing and corners.</p>
        </div>
        <div className="studio-page-actions">
          <Button href={brandRoute("ui", brand)} trailingIcon="→">Open themed gallery</Button>
        </div>
      </header>
      <div className="studio-colour-theme">
        <Field label={<span id="studio-colour-theme-label">Theme</span>} id="studio-colour-theme">
          {({ id }) => <Select id={id} labelledBy="studio-colour-theme-label"
            value={selectedProfile} placeholder={brand.profile ? studioThemeName(brand) + " (customised)" : "Custom theme"}
            options={featuredColourThemes.map(themeOption)}
            onChange={value => changeTheme(studioTheme(value as StudioThemeId))} />}
        </Field>
        <Button href={brandRoute("colours", brand)} variant="ghost">Edit colours</Button>
      </div>
      <div className="studio-view-switch" role="group" aria-label="Studio view">
        <Button size="sm" variant="ghost" aria-controls="studio-canvas" aria-pressed={mobileView === "preview"} onClick={() => setMobileView("preview")}>Preview</Button>
        <Button size="sm" variant="ghost" aria-controls="studio-controls" aria-pressed={mobileView === "settings"} onClick={() => setMobileView("settings")}>Settings</Button>
      </div>
      <div className="studio-workbench" data-view={mobileView}>
        <div id="studio-controls" className="studio-controls">
          <SiteTypefaceField />
          <h2>Brand settings</h2>
          <div className="studio-reading">
            <div><span className="elea-field__label" id="studio-typeface">Reading typeface</span>
              <Select labelledBy="studio-typeface" value={typeface} options={typefaces.map((value) => ({ value, label: value }))}
                onChange={(value) => onChange({ ...brand, typeface: value as typeof typeface })} />
            </div>
            <div><span className="elea-field__label" id="studio-rhythm">Reading density</span>
              <Select labelledBy="studio-rhythm" value={rhythm} options={rhythms.map((value) => ({ value, label: value }))}
                onChange={(value) => onChange({ ...brand, rhythm: value as typeof rhythm })} />
            </div>
          </div>
          <RadioGroup label="Corners" name="corners" value={corner} onChange={(value) => changeCorners(value as Corners)} options={corners.map((value) => ({ value, label: value }))} />
          <h2>Your product’s identity</h2>
          <Field label="Corner radius" help="In rem or px; replaces the corner steps." error={refused("radius") ? "Use a length such as 10px or 0.625rem." : undefined}>
            {(control) => <Input {...control} placeholder="0.625rem" value={draft.radius} invalid={refused("radius")} onChange={(event) => changeFree("radius", event.currentTarget.value)} />}
          </Field>
          <Field label="Interface font" help="Any CSS font stack your product loads." error={refused("font") ? "Use font names, quotes, commas and var() only." : undefined}>
            {(control) => <Input {...control} placeholder="var(--font-inter), system-ui" value={draft.font} invalid={refused("font")} onChange={(event) => changeFree("font", event.currentTarget.value)} />}
          </Field>
        </div>
        <div id="studio-canvas" className="studio-canvas">
          <section aria-labelledby="studio-preview-title">
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
