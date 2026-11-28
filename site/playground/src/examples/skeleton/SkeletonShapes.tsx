import { Skeleton } from "@alien6-studio/elea-ui";

export function SkeletonShapes() {
  return (
    <>
      <Skeleton variant="circle" width={48} height={48} />
      <Skeleton variant="rect" width={160} height={96} />
      <Skeleton width={180} />
    </>
  );
}
