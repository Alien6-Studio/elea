import { Button, Select } from "@alien6-studio/elea-ui";
import { colorThemes } from "@alien6-studio/elea-tokens/palette";
import { useState } from "react";
import { sitePath } from "../links.js";
import { brandRoute, studioTheme, type StudioThemeId } from "../pages/brandTheme.js";
import { siteScope } from "../siteProfile.js";
import { siteProfileOptions } from "./SiteProfileSelect.js";

function Edition({ id }: { id: StudioThemeId }) {
  const theme = studioTheme(id);
  return <article className="comparison-edition" data-elea-theme={siteScope(id)} aria-label={colorThemes[id].name}>
    <img src={sitePath + "assets/harbour-light.webp"} width="1536" height="1024" loading="lazy" alt="A red lighthouse on a concrete breakwater" />
    <div className="comparison-edition__body">
      <p className="comparison-edition__folio">Field notes</p>
      <h3>Harbour light</h3>
      <p className="comparison-edition__reading">The red lighthouse marks the harbour entrance. From the water, its silhouette breaks the long line of the quay.</p>
      <Button size="sm" href={sitePath + "playground/" + brandRoute("theme", theme)} trailingIcon="→" aria-label={"Explore the " + colorThemes[id].name + " theme in the studio"}>Explore this edition</Button>
    </div>
  </article>;
}

export function ThemeComparison({ interactive = true }: { interactive?: boolean }) {
  const [challenger, setChallenger] = useState<StudioThemeId>("braise");
  const reference = studioTheme("reserve");
  const other = studioTheme(challenger);
  const options = siteProfileOptions.filter(option => option.value !== "reserve");
  const decisions = [
    ["Primary colour", reference.seed, other.seed],
    ["Reading type", reference.typeface, other.typeface],
    ["Reading rhythm", reference.rhythm, other.rhythm],
    ["Control treatment", reference.controls, other.controls],
  ];
  return <>
    <div className="comparison-pair">
      <div className="comparison-slot"><div className="comparison-caption">Reference <strong>Réserve</strong></div><Edition id="reserve" /></div>
      <div className="comparison-slot"><div className="comparison-caption"><span id="compare-theme-label">Compare with</span>
        {interactive ? <Select id="compare-theme" labelledBy="compare-theme-label" size="sm" value={challenger} options={options} onChange={value => {
          const option = options.find(item => item.value === value);
          if (option) setChallenger(option.value);
        }} /> : <strong>{colorThemes[challenger].name}</strong>}</div><Edition id={challenger} /></div>
    </div>
    <details className="comparison-decisions"><summary>Compare design decisions</summary>
      <table><thead><tr><th scope="col">Decision</th><th scope="col">Réserve</th><th scope="col">{colorThemes[challenger].name}</th></tr></thead>
        <tbody>{decisions.map(([label, left, right]) => <tr key={label}><th scope="row">{label}</th><td>{left}</td><td>{right}</td></tr>)}
          <tr><th scope="row">Action silhouette</th>{(["reserve", challenger] as const).map(id =>
            <td key={id}><span className="comparison-action-shape" data-elea-theme={siteScope(id)}
              role="img" aria-label={colorThemes[id].name + " action radius " + colorThemes[id].shapes.action}
              title={colorThemes[id].shapes.action} /></td>)}</tr>
        </tbody></table>
      <p>Both editions use the same heading order and motion policy. Reading rhythm sets the size and line spacing of the body text. Reduced motion follows the reader’s device preference.</p>
    </details>
  </>;
}
