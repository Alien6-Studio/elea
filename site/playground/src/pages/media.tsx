import { Demo, PropsTable } from "../components/Demo.js";
import { sitePath } from "../links.js";
import { ImageUploadExample } from "../examples/media/ImageUploadExample.js";
import example from "../examples/media/ImageUploadExample.tsx?raw";
import "./media.css";

export function MediaPage() {
  return (
    <div className="crop-guide">
      <h1>Image upload and crop</h1>
      <p className="lead">Frame one photo for a cover and a card. Reopen either crop to refine it.</p>
      <Demo title="Cover and card crops" code={example}>
        <ImageUploadExample sampleUrl={`${sitePath}assets/harbour-light.webp`} />
      </Demo>
      <h2>Parts</h2>
      <PropsTable parts rows={[
        { name: "DropZone", type: "accept, onFiles, onRejected", description: "Opens the native picker and accepts dropped files. Use the same accepted formats for both." },
        { name: "createCropFormats", type: "labels, presets", description: "Name the formats your publication uses. A preset can specify a ratio or exact output dimensions." },
        { name: "ImageCropper", type: "src, formats, initialCrop, onConfirm", description: "Keep the original alongside the recipe returned on confirmation. Pass both back to adjust the framing." },
        { name: "useObjectUrl", type: "Blob | null", description: "Creates the preview and download URL for the result, then releases it when replaced or unmounted." },
      ]} />
    </div>
  );
}
