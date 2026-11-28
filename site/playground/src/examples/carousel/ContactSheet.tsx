import { Carousel } from "@alien6-studio/elea-ui";

const plates = [
  { src: "/plates/primary.webp", alt: "Primary colours" },
  { src: "/plates/secondary.webp", alt: "Secondary colours" },
  { src: "/plates/tertiary.webp", alt: "Tertiary colours" },
  { src: "/plates/complements.webp", alt: "Complementary pairs" },
];

export function ContactSheet() {
  return (
    <Carousel
      items={plates}
      itemKey={(plate) => plate.src}
      loop
      label="Contact sheet"
      roleDescription="carousel"
      previousLabel="Previous plate"
      nextLabel="Next plate"
      defaultIndex={1}
      itemsPerView={2}
      minItemWidth={100}
      gap="sm"
      navigation="dots"
      controlsPosition="bottom"
      controlsAlign="center"
      getDotLabel={(index) => `Show plate ${index + 1}`}
      renderItem={(plate) => (
        <img src={plate.src} alt={plate.alt} width={840} height={560} />
      )}
    />
  );
}
