import { Demo, PropsTable } from "../components/Demo.js";
import { glacierImage } from "../notebook.js";
import { ImageUploadExample } from "./ImageUploadExample.js";
import example from "./ImageUploadExample.tsx?raw";

export function MediaPage() {
  return (
    <>
      <h1>Image upload and crop</h1>
      <p className="lead">Prepare a cover image in your browser. Start with the glacier photo or choose a file from your device.</p>
      <Demo title="Crop a cover" description="Drag the crop area to move it. Drag its corner to resize it. Choose a preset, frame freely or enter exact dimensions before exporting the PNG." code={example}>
        <ImageUploadExample sampleUrl={glacierImage.data.file.url} />
      </Demo>
      <h2>Parts</h2>
      <PropsTable parts rows={[
        { name: "DropZone", type: "accept, onFiles, onRejected", description: "Opens the native picker and accepts dropped files. Use the same accepted formats for both." },
        { name: "ImageCropper", type: "file, src, formats, onConfirm", description: "Pass formats for a movable crop area with presets, free framing and custom pixel dimensions. The confirm callback receives the exported Blob, crop rectangle and crop state." },
        { name: "useObjectUrl", type: "Blob | null", description: "Creates the preview and download URL for the result, then releases it when replaced or unmounted." },
      ]} />
    </>
  );
}
