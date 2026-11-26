"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  createCropFormats, DropZone, ImageCropper, useObjectUrl, type CropRecipe, type Size,
} from "@alien6-studio/elea-media";
import { Button, Card, CardHeader, CardImage, CardTitle } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-media/styles.css";
import "@alien6-studio/elea-media/crop-adjustments.css";

// Load @alien6-studio/elea-ui/bundle.css once in the application.
const cover = { value: "cover", label: "Article cover · 1600 × 900", outputSize: { width: 1600, height: 900 } };
const card = { value: "card", label: "Feature card · 1080 × 1350", outputSize: { width: 1080, height: 1350 } };
const square = { value: "square", label: "Square · 1080 × 1080", outputSize: { width: 1080, height: 1080 } };
const destinations = { cover, card };
type Destination = keyof typeof destinations;
type Original = Size & { url: string; title: string; filename: string; sample: boolean };
type Saved = { blob: Blob; recipe: CropRecipe };

const labels = {
  format: "Crop format", width: "Width (px)", height: "Height (px)",
  custom: "Custom dimensions", original: "Original ratio", free: "Free ratio",
  move: "Move crop area", resize: "Resize crop area",
  corners: {
    topLeft: "Resize from top left", topRight: "Resize from top right",
    bottomLeft: "Resize from bottom left", bottomRight: "Resize from bottom right",
  },
  invalidSize: "Use whole pixels from 1 to 8192 per side, up to 16,777,216 pixels in total.",
};
const formats = {
  cover: createCropFormats({ labels, presets: [cover, square, { value: "portrait", label: "Portrait · 1080 × 1350", outputSize: card.outputSize }] }),
  card: createCropFormats({ labels, presets: [card, square, { value: "landscape", label: "Landscape · 1600 × 900", outputSize: cover.outputSize }] }),
};

/** Start with the lighthouse inside both compositions. New photos start centred. */
function initialCrop(source: Original, slot: Destination): CropRecipe {
  const outputSize = destinations[slot].outputSize;
  const aspect = source.width / source.height;
  const ratio = outputSize.width / outputSize.height;
  const width = 0.9 * Math.min(1, ratio / aspect);
  const height = width * aspect / ratio;
  const focalX = source.sample && slot === "card" ? 0.72 : 0.5;
  const x = Math.min(1 - width, Math.max(0, focalX - width / 2));
  return {
    zoom: 1, rotation: 0, offset: { x: 0, y: 0 }, aspect, format: slot, outputSize,
    mask: { x, y: (1 - height) / 2, width, height },
  };
}

const titles = { cover: "Article cover", card: "Feature card" };

function Placement({ slot, source, saved, onEdit }: {
  slot: Destination; source: Original; saved?: Saved; onEdit: () => void;
}) {
  const result = useObjectUrl(saved?.blob);
  const initial = initialCrop(source, slot);
  const mask = initial.mask!;
  const size = destinations[slot].outputSize;
  const Image = slot === "cover" ? "img" : CardImage;
  const position: CSSProperties = result ? { display: "block", width: "100%", height: "100%", objectFit: "contain" } : {
    position: "absolute", inset: 0, width: `${100 / mask.width}%`, height: "auto",
    maxWidth: "none", transform: `translate(${-mask.x * 100}%, ${-mask.y * 100}%)`,
  };
  const image = <div className="crop-placement__image" style={{ position: "relative", overflow: "hidden", aspectRatio: size.width / size.height }}>
    <Image src={result ?? source.url} alt={source.sample ? "Red lighthouse on a breakwater under a grey sky" : source.title} style={position} />
  </div>;
  return (
    <section className="crop-placement" aria-label={titles[slot]}>
      <div className="crop-placement__heading">
        <h3>{titles[slot]}</h3>
        <Button size="sm" variant="outline" onClick={onEdit} data-adjust={slot}>Adjust crop</Button>
      </div>
      {slot === "cover" ? (
        <article className="crop-cover">
          {image}
          <header className="crop-cover__caption"><p>Field notes</p><h4>{source.title}</h4></header>
        </article>
      ) : (
        <Card padding="none" className="crop-story-card">
          {image}
          <CardHeader><CardTitle as="h4">{source.title}</CardTitle></CardHeader>
        </Card>
      )}
      {result && <Button size="sm" variant="ghost" href={result} download={`${source.filename}-${slot}.png`}>Download PNG</Button>}
    </section>
  );
}

function CropSession({ source, replace, focusOnMount }: { source: Original; replace: () => void; focusOnMount: boolean }) {
  const [active, setActive] = useState<Destination | null>("cover");
  const [saved, setSaved] = useState<Partial<Record<Destination, Saved>>>({});
  const [error, setError] = useState("");
  const gallery = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const returnTo = useRef<Destination | null>(null);
  const focusEditor = useRef(focusOnMount);
  useEffect(() => {
    if (active && focusEditor.current) {
      heading.current?.focus();
      focusEditor.current = false;
    } else if (!active && returnTo.current) {
      gallery.current?.querySelector<HTMLElement>(`[data-adjust="${returnTo.current}"]`)?.focus();
      returnTo.current = null;
    }
  }, [active]);

  function edit(slot: Destination) {
    focusEditor.current = true;
    setError("");
    if (slot === active) heading.current?.focus();
    else setActive(slot);
  }
  function finish() {
    returnTo.current = active;
    setActive(null);
    setError("");
  }

  return <div className="crop-showcase">
    {active && <section className="crop-workbench" aria-labelledby="crop-editor-heading">
      <div className="crop-workbench__heading">
        <h2 id="crop-editor-heading" tabIndex={-1} ref={heading}>Frame the {active}</h2>
        <Button size="sm" variant="outline" onClick={replace}>Replace image</Button>
      </div>
      <ImageCropper key={active} src={source.url} formats={formats[active]}
        initialCrop={saved[active]?.recipe ?? initialCrop(source, active)}
        maxHeight={430} export={{ type: "image/png" }}
        labels={{ image: active === "cover" ? "Cover crop" : "Card crop", zoom: "Zoom", rotation: "Rotation", cancel: "Cancel", confirm: "Apply crop" }}
        onCancel={finish}
        onConfirm={(blob, _rect, _state, recipe) => {
          if (!blob || !recipe) { setError("The crop could not be exported. Try again."); return; }
          setSaved(previous => ({ ...previous, [active]: { blob, recipe } }));
          finish();
        }}
      />
      {error && <p className="elea-field-error" role="alert">{error}</p>}
    </section>}
    <section className="crop-proofs" aria-labelledby="crop-proofs-heading">
      <div className="crop-workbench__heading">
        <h2 id="crop-proofs-heading">In publication</h2>
        {!active && <Button size="sm" variant="outline" onClick={replace}>Replace image</Button>}
      </div>
      <div className="crop-proofs__spread" ref={gallery}>
        <Placement slot="cover" source={source} saved={saved.cover} onEdit={() => edit("cover")} />
        <Placement slot="card" source={source} saved={saved.card} onEdit={() => edit("card")} />
      </div>
    </section>
  </div>;
}

export function ImageUploadExample({ sampleUrl }: { sampleUrl: string }) {
  const [request, setRequest] = useState<File | "sample" | null>("sample");
  const [source, setSource] = useState<Original>();
  const [choosing, setChoosing] = useState(false);
  const [error, setError] = useState("");
  const changed = useRef(false);
  const picker = useRef<HTMLDivElement>(null);
  const session = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!request) return;
    const file = request === "sample" ? undefined : request;
    const url = file ? URL.createObjectURL(file) : sampleUrl;
    const image = new Image();
    let active = true;
    let adopted = false;
    image.onload = () => {
      if (!active) return;
      adopted = true;
      const filename = file?.name.replace(/\.[^.]+$/, "") || "harbour-light";
      setSource({ url, width: image.naturalWidth, height: image.naturalHeight, filename,
        title: file ? filename.replaceAll(/[-_]+/g, " ") : "Harbour light", sample: !file });
      setError("");
      setChoosing(false);
      setRequest(null);
    };
    image.onerror = () => {
      if (!active) return;
      setError("This image could not be opened. Choose another image.");
      setChoosing(true);
      setRequest(null);
    };
    image.src = url;
    return () => {
      active = false;
      if (file && !adopted) URL.revokeObjectURL(url);
    };
  }, [request, sampleUrl]);
  useEffect(() => () => { if (source && !source.sample) URL.revokeObjectURL(source.url); }, [source]);
  useEffect(() => {
    if (choosing) picker.current?.querySelector<HTMLElement>('label[tabindex="0"]')?.focus();
    else if (changed.current) session.current?.querySelector<HTMLElement>("h2[tabindex], button")?.focus();
  }, [choosing]);

  return <>
    {source && <div ref={session} className="crop-session" hidden={choosing}>
      <CropSession key={source.url} source={source} focusOnMount={changed.current}
        replace={() => { changed.current = true; setChoosing(true); }} />
    </div>}
    {choosing && <div ref={picker} className="crop-picker">
      <DropZone accept="image/jpeg,image/png,image/webp" label="Choose an image" hint="Drop a JPEG, PNG or WebP here."
        error={error} onRejected={() => { setRequest(null); setError("Choose a JPEG, PNG or WebP image."); }}
        onFiles={([file]) => { if (file) setRequest(file); }} />
      <div className="crop-picker__actions">
        <Button size="sm" variant="outline" onClick={() => setRequest("sample")}>Use sample photo</Button>
        {source && <Button size="sm" variant="ghost" onClick={() => { setRequest(null); setError(""); setChoosing(false); }}>Cancel</Button>}
      </div>
    </div>}
    {!source && !choosing && <p role="status">Opening image…</p>}
  </>;
}
