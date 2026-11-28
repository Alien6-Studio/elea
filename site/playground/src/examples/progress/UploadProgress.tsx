import { useState } from "react";
import { Button, Progress } from "@alien6-studio/elea-ui";

const total = 8;

export function UploadProgress() {
  const [files, setFiles] = useState(3);

  return (
    <>
      <Progress
        label="Uploading images"
        value={files}
        max={total}
        showValue
        formatValue={(value, max) => `${value} of ${max} files`}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => setFiles((count) => (count >= total ? 0 : count + 1))}
      >
        {files >= total ? "Start again" : "Upload next file"}
      </Button>
    </>
  );
}
