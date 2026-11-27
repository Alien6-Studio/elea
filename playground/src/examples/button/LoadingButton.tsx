import { useState } from "react";
import { Button } from "@alien6-studio/elea-ui";

export function LoadingButton() {
  const [loading, setLoading] = useState(false);

  function save() {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  }

  return (
    <>
      <Button loading={loading} loadingLabel="Saving" onClick={save}>
        Save
      </Button>
      <Button disabled>Disabled</Button>
      <Button href="https://example.org" variant="outline">
        A link
      </Button>
      <Button href="https://example.org" variant="outline" disabled>
        Unavailable link
      </Button>
    </>
  );
}
