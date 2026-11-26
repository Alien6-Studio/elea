import { Button, Carousel } from "@alien6-studio/elea-ui";
import { type CSSProperties, useState } from "react";
import { makeBrandTheme, type BrandColorRole } from "@alien6-studio/elea-tokens/brand";
import { colorThemes, surfaceFamilies } from "@alien6-studio/elea-tokens/palette";
import { colourPlates } from "../data/colourPlates.js";
import { brandRoute, featuredColourThemes, matchingColourTheme, resetStudioColours, studioTheme, studioThemeName, usesStudioColours, type BrandTheme, type StudioThemeId } from "./brandTheme.js";
import { ColourAtlas } from "./ColourAtlas.js";
import { ColourRoles } from "./ColourRoles.js";
import "./studio.css";

function ThemePlate({ id, selected, onSelect }: { id: StudioThemeId; selected: boolean; onSelect: () => void }) {
  const { name, style, colours } = colorThemes[id];
  const plate = colourPlates[id];
  const paper = surfaceFamilies[plate.paper];
  return (
    <Button className="colour-theme" variant="ghost" aria-label={name} aria-describedby={`theme-style-${id}`}
      aria-pressed={selected} onClick={onSelect} style={{
        "--paper": paper[0]!.value, "--shadow": paper.at(-1)!.value,
        "--poster-stock": `var(--${plate.stock})`, "--poster-ink": `var(--${plate.ink})`,
        "--primary": colours.primary, "--secondary": colours.secondary, "--tertiary": colours.tertiary,
      } as CSSProperties}>
      <span className="colour-theme__poster" data-theme-id={id}>
        <strong>{name}</strong>
        <img src={plate.src} alt="" decoding="async" />
      </span>
      <span className="colour-theme__caption">
        <span className="colour-theme__legend" id={`theme-style-${id}`}>
          <span>{style}</span>
          <small>Study after <cite>{plate.reference.title}</cite><br />
            {plate.reference.artist} · {plate.reference.date}</small>
        </span>
        {selected && <span className="colour-theme__selected" aria-hidden="true">✓</span>}
        <span className="colour-theme__swatches" aria-hidden="true"><i /><i /><i /></span>
      </span>
    </Button>
  );
}

export function ColoursPage({ brand, onChange }: { brand: BrandTheme; onChange: (next: BrandTheme) => void }) {
  const { css, palettes, roleScales } = makeBrandTheme(brand);
  const [role, setRole] = useState<BrandColorRole>("primary");
  const [atlasVersion, setAtlasVersion] = useState(0);
  const activeTheme = matchingColourTheme(brand);
  const origin = brand.profile ?? featuredColourThemes.find(id => id === activeTheme);
  const reference = origin && colourPlates[origin].reference;
  function chooseTheme(id: StudioThemeId) {
    setRole("primary");
    setAtlasVersion(version => version + 1);
    onChange(studioTheme(id));
  }

  return (
    <div className="colours-page">
      <style>{css}</style>
      <header className="studio-intro">
        <h1 className="site-page-title">Colours</h1>
        <div className="studio-page-actions" data-elea-theme="brand">
          <Button href={brandRoute("theme", brand)} variant="outline">Open theme studio</Button>
          <Button href={brandRoute("ui", brand)} trailingIcon="→">Open themed gallery</Button>
        </div>
      </header>
      <Carousel className="colour-themes" label="Colour themes" controlsLabel="Theme navigation" roleDescription="carousel"
        previousLabel="Previous themes" nextLabel="Next themes"
        heading={<div className="colour-themes__heading">
          <h2>Colour themes</h2>
          {activeTheme && !Object.hasOwn(colourPlates, activeTheme) &&
            <span>Current theme · {colorThemes[activeTheme].name}</span>}
        </div>}
        items={featuredColourThemes} itemKey={id => id} itemsPerView={3} minItemWidth={320} gap="md"
        navigation="both" controlsPosition="bottom" controlsAlign="center" showCounter={false}
        getDotLabel={index => `Show themes starting at ${colorThemes[featuredColourThemes[index]!].name}`}
        defaultIndex={Math.max(0, featuredColourThemes.findIndex(id => id === (activeTheme ?? brand.profile)))}
        renderItem={id => <ThemePlate id={id} selected={id === activeTheme} onSelect={() => chooseTheme(id)} />}
      />
      <ColourRoles brand={brand} activeRole={role} />
      <ColourAtlas key={atlasVersion} brand={brand} onChange={onChange} palettes={palettes}
        roleScales={roleScales} themeName={studioThemeName(brand)} reference={reference}
        role={role} onRoleChange={setRole} />
      <div className="studio-page-actions colours-export" data-elea-theme="brand">
        <Button href={`data:text/css;charset=utf-8,${encodeURIComponent(css)}`} download="elea-brand.css" variant="outline" trailingIcon="↓">Download CSS</Button>
        <Button variant="ghost" disabled={usesStudioColours(brand)} onClick={() => onChange(resetStudioColours(brand))}>Reset colours</Button>
      </div>
      <details className="studio-source"><summary>View CSS</summary><pre tabIndex={0}><code>{css}</code></pre></details>
    </div>
  );
}
