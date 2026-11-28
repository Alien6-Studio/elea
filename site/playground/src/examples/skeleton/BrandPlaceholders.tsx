import { Skeleton } from "@alien6-studio/elea-ui";

// In the stylesheet of the application:
//
// .brand-placeholder {
//   background-color: color-mix(
//     in srgb,
//     var(--elea-color-primary-500) 30%,
//     transparent
//   );
//   border-radius: var(--elea-radius-full);
// }

export function BrandPlaceholders() {
  return (
    <>
      <Skeleton
        variant="rect"
        height={28}
        count={3}
        blockClassName="brand-placeholder"
      />
      <Skeleton lines={3} blockClassName="brand-placeholder" />
    </>
  );
}
