import {
  AvatarSkeleton,
  BadgeSkeleton,
  ButtonSkeleton,
  CardSkeleton,
  FieldSkeleton,
  TableSkeleton,
} from "@alien6-studio/elea-ui";

export function Companions() {
  return (
    <>
      <AvatarSkeleton size="lg" />
      <ButtonSkeleton>Save changes</ButtonSkeleton>
      <BadgeSkeleton>Draft</BadgeSkeleton>
      <FieldSkeleton help />
      <CardSkeleton
        description
        lines={2}
        footer={<ButtonSkeleton size="sm">Open</ButtonSkeleton>}
      />
      <TableSkeleton rows={2} columns={3} />
    </>
  );
}
