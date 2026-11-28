import { useState } from "react";
import { Avatar, Skeleton, Toggle } from "@alien6-studio/elea-ui";

export function LoadingArticle() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Toggle label="Loading" checked={loading} onCheckedChange={setLoading} />
      <article aria-busy={loading}>
        {loading ? (
          <>
            <Skeleton variant="circle" width={40} height={40} />
            <Skeleton width="40%" />
            <Skeleton lines={3} />
          </>
        ) : (
          <>
            <Avatar name="Ada Lovelace" />
            <strong>Ada Lovelace</strong>
            <p>Cranes crossed the valley at dawn, earlier than any year.</p>
          </>
        )}
      </article>
    </>
  );
}
