import { Avatar, AvatarGroup } from "@alien6-studio/elea-ui";

export function Editors() {
  return (
    <AvatarGroup aria-label="Editors" max={3}>
      <Avatar name="Ada Lovelace" tone="primary" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Alan Turing" tone="secondary" />
      <Avatar name="Katherine Johnson" />
      <Avatar name="Hedy Lamarr" />
    </AvatarGroup>
  );
}
