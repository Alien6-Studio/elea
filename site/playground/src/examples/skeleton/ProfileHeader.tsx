import { useState } from "react";
import { Avatar, Button, Skeleton, Toggle } from "@alien6-studio/elea-ui";

export function ProfileHeader() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Toggle
        label="Loading the profile"
        checked={loading}
        onCheckedChange={setLoading}
      />
      <Skeleton loading={loading}>
        <Avatar name="Ada Lovelace" />
      </Skeleton>
      <Skeleton loading={loading}>
        <strong>Ada Lovelace</strong>
      </Skeleton>
      <Skeleton loading={loading}>Member since 2019</Skeleton>
      <Skeleton loading={loading}>
        <Button variant="secondary">Follow</Button>
      </Skeleton>
    </>
  );
}
