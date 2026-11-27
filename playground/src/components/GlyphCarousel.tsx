import { Button, Carousel } from "@alien6-studio/elea-ui";
import { useState, type KeyboardEvent } from "react";
import glyphData from "../data/specimen-glyphs.json" with { type: "json" };

type Glyph = keyof typeof glyphData;
const characters = Object.keys(glyphData) as Glyph[];
const sets = {
  Letters: characters.filter(char => /\p{L}/u.test(char)),
  Figures: characters.filter(char => /\p{N}/u.test(char)),
  Symbols: characters.filter(char => /[\p{P}\p{S}]/u.test(char)),
};
type GlyphSet = keyof typeof sets;
const setNames = Object.keys(sets) as GlyphSet[];
const xHeight = 510;
const capHeight = 695;

// Fit the whole alphabet once so a font unit keeps the same scale on every slide.
const glyphs = Object.values(glyphData);
const labelX = Math.min(0, ...glyphs.map(g => g.bounds[0]!)) - 215;
const edge = Math.max(...glyphs.map(g => Math.max(g.advance, g.bounds[2]!))) + 24;
const upper = Math.max(capHeight, ...glyphs.map(g => g.bounds[3]!)) + 36;
const measureY = -Math.min(0, ...glyphs.map(g => g.bounds[1]!)) + 55;
const viewBox = `${labelX - 12} ${-upper} ${edge - labelX + 28} ${upper + measureY + 65}`;

function kindOf(letter: string) {
  if (/\p{Lu}/u.test(letter)) return "uppercase";
  if (/\p{Ll}/u.test(letter)) return "lowercase";
  return /\p{N}/u.test(letter) ? "figure" : "symbol";
}

function GlyphDiagram({ letter }: Readonly<{ letter: keyof typeof glyphData }>) {
  const { d, advance, bounds, curve } = glyphData[letter];
  const [left, bottom, right, top] = bounds as [number, number, number, number];
  const kind = kindOf(letter);
  const uppercase = kind === "uppercase";
  // Optical overshoot is part of a round letter, not a descender.
  const descends = bottom < -50;
  const guides = [
    { y: -xHeight, label: "X-height" },
    { y: 0, label: "Baseline" },
  ];
  if (uppercase) guides.unshift({ y: -capHeight, label: "Cap height" });
  if (descends && (kind === "lowercase" || uppercase)) {
    let label = "Descender";
    if (letter.toLowerCase() === "ç") label = "Cedilla";
    else if (letter === "Q") label = "Tail";
    guides.push({ y: -bottom, label });
  }

  return (
    <svg id="glyph-diagram" viewBox={viewBox}
      role="img" aria-labelledby="glyph-title" aria-describedby="glyph-description">
      <title id="glyph-title">{`Construction of ${kind} ${letter}`}</title>
      <desc id="glyph-description">Horizontal guides locate the glyph against the baseline. The vertical guides mark an advance of {advance} font units.</desc>
      <defs>
        <path id="regular-glyph" vectorEffect="non-scaling-stroke" d={d}/>
        <clipPath id="ink-half"><rect x={left} y={bottom} width={(right - left) / 2} height={top - bottom}/></clipPath>
      </defs>
      <g className="type-plate__guide">
        {guides.map(({ y }) => <line key={y} x1={labelX} x2={edge} y1={y} y2={y}/>)}
        {[0, advance].map(x => <line key={x} x1={x} x2={x} y1={-upper + 15} y2={measureY}/>)}
      </g>
      <g transform="scale(1,-1)">
        <use href="#regular-glyph" fill="currentColor" clipPath="url(#ink-half)"/>
        <use href="#regular-glyph" className="type-plate__outline"/>
        {curve && <>
          <polyline className="type-plate__handles" points={curve.map(point => point.join(",")).join(" ")}/>
          <g className="type-plate__nodes">
            {curve.map(([x, y], i) => i === 1
              ? <circle key={`${x},${y}`} cx={x} cy={y} r="5"/>
              : <rect key={`${x},${y}`} x={x! - 6} y={y! - 6} width="12" height="12"/>)}
          </g>
        </>}
      </g>
      <path className="type-plate__measure" d={`M0 ${measureY}H${advance}M0 ${measureY - 8}v16M${advance} ${measureY - 8}v16`}/>
      <g className="type-plate__labels">
        {guides.map(({ y, label }) => <text key={label} x={labelX} y={y - 12}>{label}</text>)}
        <text x={advance / 2} y={measureY + 44} textAnchor="middle">{advance} units</text>
      </g>
    </svg>
  );
}

export function GlyphCarousel() {
  const [letter, setLetter] = useState<Glyph>("a");
  const activeSet = setNames.find(name => sets[name].includes(letter))!;
  const entries = sets[activeSet];
  const index = entries.indexOf(letter);
  const noun = { Letters: "letter", Figures: "figure", Symbols: "symbol" }[activeSet];
  function jumpToGlyph(event: KeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || event.nativeEvent.isComposing) return;
    if (!Object.hasOwn(glyphData, event.key)) return;
    event.preventDefault();
    setLetter(event.key as Glyph);
  }

  return (
    <div className="type-plate" onKeyDown={jumpToGlyph}>
      <Carousel label="Glyph anatomy" controlsLabel="Glyph navigation" roleDescription="carousel"
        previousLabel={`Previous ${noun}`} nextLabel={`Next ${noun}`}
        items={entries} itemKey={char => char} renderItem={char => <GlyphDiagram letter={char} />}
        index={index} onIndexChange={next => setLetter(entries[next]!)} loop
        itemsPerView={1} gap="none" navigation="arrows" controlsPosition="top" controlsAlign="end" showCounter
        heading={<h2 id="anatomy" aria-live="polite" aria-atomic="true">Anatomy of {letter}</h2>}
        toolbar={<div className="type-plate__sets" role="group" aria-label="Glyph set">
          {setNames.map(name => <Button key={name} variant="ghost" size="sm" aria-pressed={activeSet === name}
            aria-controls="glyph-diagram" onClick={() => setLetter(sets[name][0]!)}>{name}</Button>)}
        </div>}
      />
    </div>
  );
}
