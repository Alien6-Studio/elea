import { useState } from "react";
import { DropZone, ImageCropper, useObjectUrl, type CropRect } from "@alien6-studio/elea-media";
import { Button } from "@alien6-studio/elea-ui";
import { Demo, PropsTable } from "../components/Demo.js";

const UploadIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>;
const LABELS = { zoom: "Zoom", rotation: "Rotation", confirm: "Use this image", cancel: "Start over", image: "Picture to frame" };

export function DropZonePage() {
  const [names, setNames] = useState<string[]>([]);
  const [refused, setRefused] = useState<string | null>(null);
  return (
    <>
      <h1>Drop zone</h1>
      <p className="lead">Takes files by drop, click or keyboard. The input underneath is a real file input, so forms, assistive technology and test tooling all see it; the label makes the whole zone its target.</p>
      <Demo title="Images only" description={names.length ? `Received: ${names.join(", ")}` : "Drop a file or press Enter on the zone."} code={`<DropZone
  accept="image/*"
  multiple
  icon={<UploadIcon />}
  label="Click to add images"
  hint="or drop them here"
  onFiles={(files) => setNames(files.map((file) => file.name))}
  onRejected={(files) => setRefused(\`\${files.length} file(s) are not images\`)}
  error={refused}
/>`}>
        <div style={{ width: "100%" }}>
          <DropZone accept="image/*" multiple icon={<UploadIcon />} label="Click to add images" hint="or drop them here" onFiles={(files) => { setNames(files.map((file) => file.name)); setRefused(null); }} onRejected={(files) => setRefused(`${files.length} file(s) are not images`)} error={refused} />
        </div>
      </Demo>
      <Demo title="Busy and custom content" code={`<DropZone label="Add" busy busyLabel="Uploading" onFiles={() => {}} />
<DropZone label="Add" onFiles={() => {}}><strong>Any content</strong> as the target</DropZone>`}>
        <div style={{ display: "grid", gap: "var(--elea-space-3)", width: "100%" }}>
          <DropZone label="Add" busy busyLabel="Uploading" onFiles={() => {}} />
          <DropZone label="Add" onFiles={() => {}}><span><strong>Any content</strong> as the target</span></DropZone>
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "onFiles", type: "(files: File[]) => void", description: "The accepted files; one at most unless multiple." },
        { name: "accept", type: "string", description: "Like the file input: MIME types, wildcards or extensions. Dropped files outside it go to onRejected." },
        { name: "multiple, disabled, busy", type: "boolean", defaultValue: "false", description: "Busy keeps the zone visible but inert and shows busyLabel." },
        { name: "label, hint, icon, error", type: "ReactNode", description: "The zone's text; the error is announced as an alert." },
        { name: "children", type: "ReactNode", description: "Replaces label, hint and icon." },
      ]} />
    </>
  );
}

export function CropperPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ url: string; rect: CropRect } | null>(null);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const url = useObjectUrl(file);
  return (
    <>
      <h1>Image cropper</h1>
      <p className="lead">Frames a picture: drag to move it, zoom with the wheel or the slider, rotate with the slider. The frame always stays covered, so the export never has empty corners. The geometry is pure functions, exported for hosts that draw their own frame.</p>
      <Demo title="Pick, frame, export" description="The export is drawn through a canvas on your machine; nothing is uploaded." code={`const url = useObjectUrl(file);

<ImageCropper
  src={url}
  aspect={16 / 9}
  labels={{ zoom: "Zoom", rotation: "Rotation", confirm: "Use this image", cancel: "Start over", image: "Picture to frame" }}
  onConfirm={(blob, rect) => setResult({ url: URL.createObjectURL(blob ?? file), rect })}
  onCancel={() => setFile(null)}
/>`}>
        <div style={{ width: "100%" }}>
          {!file && <DropZone accept="image/*" label="Click to add a picture" hint="or drop one here" onFiles={([first]) => { setFile(first ?? null); setResult(null); }} />}
          {file && url && !result && (
            <>
              <div style={{ display: "flex", gap: "var(--elea-space-2)", marginBottom: "var(--elea-space-3)" }}>
                {[{ label: "16:9", value: 16 / 9 }, { label: "Square", value: 1 }, { label: "4:5", value: 4 / 5 }, { label: "Free", value: undefined }].map((option) => (
                  <Button key={option.label} size="sm" variant={aspect === option.value ? "primary" : "outline"} onClick={() => setAspect(option.value)}>{option.label}</Button>
                ))}
              </div>
              <ImageCropper src={url} aspect={aspect} labels={LABELS} onConfirm={(blob, rect) => setResult({ url: URL.createObjectURL(blob ?? file), rect })} onCancel={() => setFile(null)} />
            </>
          )}
          {result && (
            <div style={{ display: "grid", gap: "var(--elea-space-3)" }}>
              <img src={result.url} alt="The framed picture" style={{ maxWidth: "100%", borderRadius: "var(--elea-radius-lg)" }} />
              <code style={{ alignSelf: "start" }}>{`crop: ${Math.round(result.rect.width)} × ${Math.round(result.rect.height)} px at ${Math.round(result.rect.x)}, ${Math.round(result.rect.y)}`}</code>
              <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>Another picture</Button>
            </div>
          )}
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "src", type: "string", description: "Object URL, data URL or address of the picture." },
        { name: "aspect", type: "number", description: "Width over height; the picture's own ratio when absent." },
        { name: "shape", type: '"rect" | "round"', defaultValue: '"rect"', description: "A round mask for avatars; the export stays rectangular." },
        { name: "maxZoom, maxHeight", type: "number", defaultValue: "3, 480", description: "Zoom over the covering scale; height cap of the frame in pixels." },
        { name: "export", type: "{ type?, quality?, maxWidth? }", description: "Output format, encoder quality and a width cap for the exported picture." },
        { name: "labels", type: "ImageCropperLabels", description: "Zoom, rotation, confirm, cancel and the accessible name of the frame." },
        { name: "onConfirm", type: "(blob | null, rect, state) => void", description: "The exported picture, null where canvases cannot draw, with the crop window in rotated image pixels." },
      ]} />
      <h2>In the editor</h2>
      <p>The content editor frames every picture before it calls the host's upload service. Pass <code>imageCrop</code> to the provider to fix the ratio, cap the output width, or turn it off.</p>
      <pre><code>{`<ContentProvider imageCrop={{ aspect: 16 / 9, maxWidth: 1600, type: "image/webp", quality: 0.85 }} ...>
<ContentProvider imageCrop={false} ...>`}</code></pre>
    </>
  );
}
