import{r as e,t}from"./Demo-CK3YOxY1.js";import{n,t as r}from"./jsx-runtime-Am8b9ysO.js";import{n as i,r as a,t as o}from"./createCropFormats-DGMqQU1X.js";import{t as s}from"./DropZone-BGsgem2Q.js";import{t as c}from"./Button-CDE3YPd-.js";import{a as l,c as u,o as d,t as f}from"./Card-LV6_Jpv9.js";/* empty css                         */var p=n(),m=r(),h={value:`cover`,label:`Article cover · 1600 × 900`,outputSize:{width:1600,height:900}},g={value:`card`,label:`Feature card · 1080 × 1350`,outputSize:{width:1080,height:1350}},_={value:`square`,label:`Square · 1080 × 1080`,outputSize:{width:1080,height:1080}},v={cover:h,card:g},y={format:`Crop format`,width:`Width (px)`,height:`Height (px)`,custom:`Custom dimensions`,original:`Original ratio`,free:`Free ratio`,move:`Move crop area`,resize:`Resize crop area`,corners:{topLeft:`Resize from top left`,topRight:`Resize from top right`,bottomLeft:`Resize from bottom left`,bottomRight:`Resize from bottom right`},invalidSize:`Use whole pixels from 1 to 8192 per side, up to 16,777,216 pixels in total.`},b={cover:o({labels:y,presets:[h,_,{value:`portrait`,label:`Portrait · 1080 × 1350`,outputSize:g.outputSize}]}),card:o({labels:y,presets:[g,_,{value:`landscape`,label:`Landscape · 1600 × 900`,outputSize:h.outputSize}]})};function x(e,t){let n=v[t].outputSize,r=e.width/e.height,i=n.width/n.height,a=.9*Math.min(1,i/r),o=a*r/i,s=e.sample&&t===`card`?.72:.5;return{zoom:1,rotation:0,offset:{x:0,y:0},aspect:r,format:t,outputSize:n,mask:{x:Math.min(1-a,Math.max(0,s-a/2)),y:(1-o)/2,width:a,height:o}}}var S={cover:`Article cover`,card:`Feature card`};function C({slot:e,source:t,saved:n,onEdit:r}){let i=a(n?.blob),o=x(t,e).mask,s=v[e].outputSize,p=e===`cover`?`img`:d,h=i?{display:`block`,width:`100%`,height:`100%`,objectFit:`contain`}:{position:`absolute`,inset:0,width:`${100/o.width}%`,height:`auto`,maxWidth:`none`,transform:`translate(${-o.x*100}%, ${-o.y*100}%)`},g={position:`relative`,overflow:`hidden`,aspectRatio:s.width/s.height},_=(0,m.jsx)(`div`,{className:`crop-placement__image`,style:g,children:(0,m.jsx)(p,{src:i??t.url,alt:t.sample?`Red lighthouse on a breakwater under a grey sky`:t.title,style:h})});return(0,m.jsxs)(`section`,{className:`crop-placement`,"aria-label":S[e],children:[(0,m.jsxs)(`div`,{className:`crop-placement__heading`,children:[(0,m.jsx)(`h3`,{children:S[e]}),(0,m.jsx)(c,{size:`sm`,variant:`outline`,onClick:r,"data-adjust":e,children:`Adjust crop`})]}),e===`cover`?(0,m.jsxs)(`article`,{className:`crop-cover`,children:[_,(0,m.jsxs)(`header`,{className:`crop-cover__caption`,children:[(0,m.jsx)(`p`,{children:`Field notes`}),(0,m.jsx)(`h4`,{children:t.title})]})]}):(0,m.jsxs)(f,{padding:`none`,className:`crop-story-card`,children:[_,(0,m.jsx)(l,{children:(0,m.jsx)(u,{as:`h4`,children:t.title})})]}),i&&(0,m.jsx)(c,{size:`sm`,variant:`ghost`,href:i,download:`${t.filename}-${e}.png`,children:`Download PNG`})]})}function w({source:e,replace:t,focusOnMount:n}){let[r,a]=(0,p.useState)(`cover`),[o,s]=(0,p.useState)({}),[l,u]=(0,p.useState)(``),d=(0,p.useRef)(null),f=(0,p.useRef)(null),h=(0,p.useRef)(null),g=(0,p.useRef)(n);(0,p.useEffect)(()=>{r&&g.current?(f.current?.focus(),g.current=!1):!r&&h.current&&(d.current?.querySelector(`[data-adjust="${h.current}"]`)?.focus(),h.current=null)},[r]);function _(e){g.current=!0,u(``),e===r?f.current?.focus():a(e)}function v(){h.current=r,a(null),u(``)}return(0,m.jsxs)(`div`,{className:`crop-showcase`,children:[r&&(0,m.jsxs)(`section`,{className:`crop-workbench`,"aria-labelledby":`crop-editor-heading`,children:[(0,m.jsxs)(`div`,{className:`crop-workbench__heading`,children:[(0,m.jsxs)(`h2`,{id:`crop-editor-heading`,tabIndex:-1,ref:f,children:[`Frame the `,r]}),(0,m.jsx)(c,{size:`sm`,variant:`outline`,onClick:t,children:`Replace image`})]}),(0,m.jsx)(i,{src:e.url,formats:b[r],initialCrop:o[r]?.recipe??x(e,r),maxHeight:430,export:{type:`image/png`},labels:{image:r===`cover`?`Cover crop`:`Card crop`,zoom:`Zoom`,rotation:`Rotation`,cancel:`Cancel`,confirm:`Apply crop`},onCancel:v,onConfirm:(e,t,n,i)=>{!e||!i?u(`The crop could not be exported. Try again.`):(s(t=>({...t,[r]:{blob:e,recipe:i}})),v())}},r),l&&(0,m.jsx)(`p`,{className:`elea-field-error`,role:`alert`,children:l})]}),(0,m.jsxs)(`section`,{className:`crop-proofs`,"aria-labelledby":`crop-proofs-heading`,children:[(0,m.jsxs)(`div`,{className:`crop-workbench__heading`,children:[(0,m.jsx)(`h2`,{id:`crop-proofs-heading`,children:`In publication`}),!r&&(0,m.jsx)(c,{size:`sm`,variant:`outline`,onClick:t,children:`Replace image`})]}),(0,m.jsxs)(`div`,{className:`crop-proofs__spread`,ref:d,children:[(0,m.jsx)(C,{slot:`cover`,source:e,saved:o.cover,onEdit:()=>_(`cover`)}),(0,m.jsx)(C,{slot:`card`,source:e,saved:o.card,onEdit:()=>_(`card`)})]})]})]})}function T({sampleUrl:e}){let[t,n]=(0,p.useState)(`sample`),[r,i]=(0,p.useState)(),[a,o]=(0,p.useState)(!1),[l,u]=(0,p.useState)(``),d=(0,p.useRef)(!1),f=(0,p.useRef)(null),h=(0,p.useRef)(null);return(0,p.useEffect)(()=>{if(!t)return;let r=t===`sample`?void 0:t,a=r?URL.createObjectURL(r):e,s=new Image,c=!0,l=!1;return s.onload=()=>{if(!c)return;l=!0;let e=r?.name.replace(/\.[^.]+$/,``)||`harbour-light`;i({url:a,width:s.naturalWidth,height:s.naturalHeight,filename:e,title:r?e.replaceAll(/[-_]+/g,` `):`Harbour light`,sample:!r}),u(``),o(!1),n(null)},s.onerror=()=>{c&&(u(`This image could not be opened. Choose another image.`),o(!0),n(null))},s.src=a,()=>{c=!1,r&&!l&&URL.revokeObjectURL(a)}},[t,e]),(0,p.useEffect)(()=>()=>{r&&!r.sample&&URL.revokeObjectURL(r.url)},[r]),(0,p.useEffect)(()=>{a?f.current?.querySelector(`label[tabindex="0"]`)?.focus():d.current&&h.current?.querySelector(`h2[tabindex], button`)?.focus()},[a]),(0,m.jsxs)(m.Fragment,{children:[r&&(0,m.jsx)(`div`,{ref:h,className:`crop-session`,hidden:a,children:(0,m.jsx)(w,{source:r,focusOnMount:d.current,replace:()=>{d.current=!0,o(!0)}},r.url)}),a&&(0,m.jsxs)(`div`,{ref:f,className:`crop-picker`,children:[(0,m.jsx)(s,{accept:`image/jpeg,image/png,image/webp`,label:`Choose an image`,hint:`Drop a JPEG, PNG or WebP here.`,error:l,onRejected:()=>{n(null),u(`Choose a JPEG, PNG or WebP image.`)},onFiles:([e])=>{e&&n(e)}}),(0,m.jsxs)(`div`,{className:`crop-picker__actions`,children:[(0,m.jsx)(c,{size:`sm`,variant:`outline`,onClick:()=>n(`sample`),children:`Use sample photo`}),r&&(0,m.jsx)(c,{size:`sm`,variant:`ghost`,onClick:()=>{n(null),u(``),o(!1)},children:`Cancel`})]})]}),!r&&!a&&(0,m.jsx)(`p`,{role:`status`,children:`Opening image…`})]})}var E=`"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  createCropFormats,
  DropZone,
  ImageCropper,
  useObjectUrl,
  type CropRecipe,
  type Size,
} from "@alien6-studio/elea-media";
import {
  Button,
  Card,
  CardHeader,
  CardImage,
  CardTitle,
} from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-media/styles.css";
import "@alien6-studio/elea-media/crop-adjustments.css";

const cover = {
  value: "cover",
  label: "Article cover · 1600 × 900",
  outputSize: { width: 1600, height: 900 },
};
const card = {
  value: "card",
  label: "Feature card · 1080 × 1350",
  outputSize: { width: 1080, height: 1350 },
};
const square = {
  value: "square",
  label: "Square · 1080 × 1080",
  outputSize: { width: 1080, height: 1080 },
};
const destinations = { cover, card };
type Destination = keyof typeof destinations;
type Original = Size & {
  url: string;
  title: string;
  filename: string;
  sample: boolean;
};
type Saved = { blob: Blob; recipe: CropRecipe };

const labels = {
  format: "Crop format",
  width: "Width (px)",
  height: "Height (px)",
  custom: "Custom dimensions",
  original: "Original ratio",
  free: "Free ratio",
  move: "Move crop area",
  resize: "Resize crop area",
  corners: {
    topLeft: "Resize from top left",
    topRight: "Resize from top right",
    bottomLeft: "Resize from bottom left",
    bottomRight: "Resize from bottom right",
  },
  invalidSize:
    "Use whole pixels from 1 to 8192 per side, " +
    "up to 16,777,216 pixels in total.",
};
const formats = {
  cover: createCropFormats({
    labels,
    presets: [
      cover,
      square,
      {
        value: "portrait",
        label: "Portrait · 1080 × 1350",
        outputSize: card.outputSize,
      },
    ],
  }),
  card: createCropFormats({
    labels,
    presets: [
      card,
      square,
      {
        value: "landscape",
        label: "Landscape · 1600 × 900",
        outputSize: cover.outputSize,
      },
    ],
  }),
};

/** The lighthouse starts inside both compositions; new photos start centred. */
function initialCrop(source: Original, slot: Destination): CropRecipe {
  const outputSize = destinations[slot].outputSize;
  const aspect = source.width / source.height;
  const ratio = outputSize.width / outputSize.height;
  const width = 0.9 * Math.min(1, ratio / aspect);
  const height = (width * aspect) / ratio;
  const focalX = source.sample && slot === "card" ? 0.72 : 0.5;
  const x = Math.min(1 - width, Math.max(0, focalX - width / 2));
  return {
    zoom: 1,
    rotation: 0,
    offset: { x: 0, y: 0 },
    aspect,
    format: slot,
    outputSize,
    mask: { x, y: (1 - height) / 2, width, height },
  };
}

const titles = { cover: "Article cover", card: "Feature card" };

function Placement({
  slot,
  source,
  saved,
  onEdit,
}: Readonly<{
  slot: Destination;
  source: Original;
  saved?: Saved;
  onEdit: () => void;
}>) {
  const result = useObjectUrl(saved?.blob);
  const initial = initialCrop(source, slot);
  const mask = initial.mask!;
  const size = destinations[slot].outputSize;
  const Image = slot === "cover" ? "img" : CardImage;
  const position: CSSProperties = result
    ? { display: "block", width: "100%", height: "100%", objectFit: "contain" }
    : {
        position: "absolute",
        inset: 0,
        width: \`\${100 / mask.width}%\`,
        height: "auto",
        maxWidth: "none",
        transform: \`translate(\${-mask.x * 100}%, \${-mask.y * 100}%)\`,
      };
  const frame: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    aspectRatio: size.width / size.height,
  };
  const image = (
    <div className="crop-placement__image" style={frame}>
      <Image
        src={result ?? source.url}
        alt={
          source.sample
            ? "Red lighthouse on a breakwater under a grey sky"
            : source.title
        }
        style={position}
      />
    </div>
  );
  return (
    <section className="crop-placement" aria-label={titles[slot]}>
      <div className="crop-placement__heading">
        <h3>{titles[slot]}</h3>
        <Button size="sm" variant="outline" onClick={onEdit} data-adjust={slot}>
          Adjust crop
        </Button>
      </div>
      {slot === "cover" ? (
        <article className="crop-cover">
          {image}
          <header className="crop-cover__caption">
            <p>Field notes</p>
            <h4>{source.title}</h4>
          </header>
        </article>
      ) : (
        <Card padding="none" className="crop-story-card">
          {image}
          <CardHeader>
            <CardTitle as="h4">{source.title}</CardTitle>
          </CardHeader>
        </Card>
      )}
      {result && (
        <Button
          size="sm"
          variant="ghost"
          href={result}
          download={\`\${source.filename}-\${slot}.png\`}
        >
          Download PNG
        </Button>
      )}
    </section>
  );
}

function CropSession({
  source,
  replace,
  focusOnMount,
}: Readonly<{
  source: Original;
  replace: () => void;
  focusOnMount: boolean;
}>) {
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
      gallery.current
        ?.querySelector<HTMLElement>(\`[data-adjust="\${returnTo.current}"]\`)
        ?.focus();
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

  return (
    <div className="crop-showcase">
      {active && (
        <section
          className="crop-workbench"
          aria-labelledby="crop-editor-heading"
        >
          <div className="crop-workbench__heading">
            <h2 id="crop-editor-heading" tabIndex={-1} ref={heading}>
              Frame the {active}
            </h2>
            <Button size="sm" variant="outline" onClick={replace}>
              Replace image
            </Button>
          </div>
          <ImageCropper
            key={active}
            src={source.url}
            formats={formats[active]}
            initialCrop={saved[active]?.recipe ?? initialCrop(source, active)}
            maxHeight={430}
            export={{ type: "image/png" }}
            labels={{
              image: active === "cover" ? "Cover crop" : "Card crop",
              zoom: "Zoom",
              rotation: "Rotation",
              cancel: "Cancel",
              confirm: "Apply crop",
            }}
            onCancel={finish}
            onConfirm={(blob, _rect, _state, recipe) => {
              if (!blob || !recipe) {
                setError("The crop could not be exported. Try again.");
                return;
              }
              setSaved((previous) => ({
                ...previous,
                [active]: { blob, recipe },
              }));
              finish();
            }}
          />
          {error && (
            <p className="elea-field-error" role="alert">
              {error}
            </p>
          )}
        </section>
      )}
      <section className="crop-proofs" aria-labelledby="crop-proofs-heading">
        <div className="crop-workbench__heading">
          <h2 id="crop-proofs-heading">In publication</h2>
          {!active && (
            <Button size="sm" variant="outline" onClick={replace}>
              Replace image
            </Button>
          )}
        </div>
        <div className="crop-proofs__spread" ref={gallery}>
          <Placement
            slot="cover"
            source={source}
            saved={saved.cover}
            onEdit={() => edit("cover")}
          />
          <Placement
            slot="card"
            source={source}
            saved={saved.card}
            onEdit={() => edit("card")}
          />
        </div>
      </section>
    </div>
  );
}

export function ImageUploadExample({
  sampleUrl,
}: Readonly<{ sampleUrl: string }>) {
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
      const filename = file?.name.replace(/\\.[^.]+$/, "") || "harbour-light";
      setSource({
        url,
        width: image.naturalWidth,
        height: image.naturalHeight,
        filename,
        title: file ? filename.replaceAll(/[-_]+/g, " ") : "Harbour light",
        sample: !file,
      });
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
  useEffect(
    () => () => {
      if (source && !source.sample) URL.revokeObjectURL(source.url);
    },
    [source],
  );
  useEffect(() => {
    if (choosing)
      picker.current
        ?.querySelector<HTMLElement>('label[tabindex="0"]')
        ?.focus();
    else if (changed.current)
      session.current
        ?.querySelector<HTMLElement>("h2[tabindex], button")
        ?.focus();
  }, [choosing]);

  return (
    <>
      {source && (
        <div ref={session} className="crop-session" hidden={choosing}>
          <CropSession
            key={source.url}
            source={source}
            focusOnMount={changed.current}
            replace={() => {
              changed.current = true;
              setChoosing(true);
            }}
          />
        </div>
      )}
      {choosing && (
        <div ref={picker} className="crop-picker">
          <DropZone
            accept="image/jpeg,image/png,image/webp"
            label="Choose an image"
            hint="Drop a JPEG, PNG or WebP here."
            error={error}
            onRejected={() => {
              setRequest(null);
              setError("Choose a JPEG, PNG or WebP image.");
            }}
            onFiles={([file]) => {
              if (file) setRequest(file);
            }}
          />
          <div className="crop-picker__actions">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRequest("sample")}
            >
              Use sample photo
            </Button>
            {source && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setRequest(null);
                  setError("");
                  setChoosing(false);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
      {!source && !choosing && <p role="status">Opening image…</p>}
    </>
  );
}
`;function D(){return(0,m.jsxs)(`div`,{className:`crop-guide`,children:[(0,m.jsx)(`h1`,{children:`Image upload and crop`}),(0,m.jsx)(`p`,{className:`lead`,children:`Frame one photo for a cover and a card. Reopen either crop to refine it.`}),(0,m.jsx)(t,{title:`Cover and card crops`,code:E,children:(0,m.jsx)(T,{sampleUrl:`/assets/harbour-light.webp`})}),(0,m.jsx)(`h2`,{children:`Parts`}),(0,m.jsx)(e,{parts:!0,rows:[{name:`DropZone`,type:`accept, onFiles, onRejected`,description:`Opens the native picker and accepts dropped files. Use the same accepted formats for both.`},{name:`createCropFormats`,type:`labels, presets`,description:`Name the formats your publication uses. A preset can specify a ratio or exact output dimensions.`},{name:`ImageCropper`,type:`src, formats, initialCrop, onConfirm`,description:`Keep the original alongside the recipe returned on confirmation. Pass both back to adjust the framing.`},{name:`useObjectUrl`,type:`Blob | null`,description:`Creates the preview and download URL for the result, then releases it when replaced or unmounted.`}]})]})}export{D as MediaPage};