import { IconButton } from "@alien6-studio/elea-ui";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import glyphData from "../data/specimen-glyphs.json" with { type: "json" };

const letters = Object.keys(glyphData) as (keyof typeof glyphData)[];
const xHeight = 510;
const capHeight = 695;

// Fit the whole alphabet once so a font unit keeps the same scale on every slide.
const glyphs = Object.values(glyphData);
const labelX = Math.min(0, ...glyphs.map(g => g.bounds[0]!)) - 215;
const edge = Math.max(...glyphs.map(g => Math.max(g.advance, g.bounds[2]!))) + 24;
const upper = Math.max(capHeight, ...glyphs.map(g => g.bounds[3]!)) + 36;
const measureY = -Math.min(0, ...glyphs.map(g => g.bounds[1]!)) + 55;
const viewBox = `${labelX - 12} ${-upper} ${edge - labelX + 28} ${upper + measureY + 65}`;

function GlyphDiagram({ letter }: { letter: keyof typeof glyphData }) {
  const { d, advance, bounds, curve } = glyphData[letter];
  const [left, bottom, right, top] = bounds as [number, number, number, number];
  const uppercase = letter === letter.toUpperCase();
  // Optical overshoot is part of a round letter, not a descender.
  const descends = bottom < -50;
  const guides = [
    { y: -xHeight, label: "X-height" },
    { y: 0, label: "Baseline" },
  ];
  if (uppercase) guides.unshift({ y: -capHeight, label: "Cap height" });
  if (descends) {
    const label = letter.toLowerCase() === "ç" ? "Cedilla" : letter === "Q" ? "Tail" : "Descender";
    guides.push({ y: -bottom, label });
  }

  return (
    <svg id="glyph-diagram" viewBox={viewBox}
      role="img" aria-labelledby="glyph-title" aria-describedby="glyph-description">
      <title id="glyph-title">{`Construction of ${uppercase ? "uppercase" : "lowercase"} ${letter}`}</title>
      <desc id="glyph-description">Horizontal guides show where the letter sits relative to the baseline. The vertical guides mark an advance of {advance} font units.</desc>
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
              ? <circle key={i} cx={x} cy={y} r="5"/>
              : <rect key={i} x={x! - 6} y={y! - 6} width="12" height="12"/>)}
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
  const [index, setIndex] = useState(0);
  const [interactive, setInteractive] = useState(false);
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  useEffect(() => setInteractive(true), []);
  const letter = letters[index]!;
  const step = (delta: number) => setIndex(i => (i + delta + letters.length) % letters.length);

  function startSwipe(event: PointerEvent) {
    swipe.current = event.pointerType === "touch" && event.isPrimary
      ? { id: event.pointerId, x: event.clientX, y: event.clientY }
      : null;
  }

  function endSwipe(event: PointerEvent) {
    const start = swipe.current;
    swipe.current = null;
    if (!start || event.pointerId !== start.id) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > 1.5 * Math.abs(event.clientY - start.y)) step(dx < 0 ? 1 : -1);
  }

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (event.ctrlKey || event.altKey || event.metaKey || event.nativeEvent.isComposing) return;
    switch (event.key) {
      case "ArrowLeft": step(-1); break;
      case "ArrowRight": step(1); break;
      case "Home": setIndex(0); break;
      case "End": setIndex(letters.length - 1); break;
      default: {
        if (!Object.hasOwn(glyphData, event.key)) return;
        setIndex(letters.indexOf(event.key as keyof typeof glyphData));
      }
    }
    event.preventDefault();
  }

  return (
    <section className="type-plate" aria-labelledby="anatomy">
      <div className="type-plate__header">
        <h2 id="anatomy" aria-live="polite" aria-atomic="true">Anatomy of {letter}</h2>
        {interactive && <div className="type-plate__controls" role="group" aria-label="Letter navigation" onKeyDown={navigate}>
          <IconButton label="Previous letter" aria-controls="glyph-diagram" onClick={() => step(-1)}>←</IconButton>
          <span aria-hidden="true">{index + 1} / {letters.length}</span>
          <IconButton label="Next letter" aria-controls="glyph-diagram" onClick={() => step(1)}>→</IconButton>
        </div>}
      </div>
      <div className="type-plate__drawing" onPointerDown={startSwipe} onPointerUp={endSwipe} onPointerCancel={() => { swipe.current = null; }}>
        <GlyphDiagram letter={letter}/>
      </div>
    </section>
  );
}
