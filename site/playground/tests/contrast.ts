import type { Locator } from "@playwright/test";

export async function textContrast(locator: Locator): Promise<number> {
  return locator.evaluate((element) => {
    // Draw the CSS colors on one pixel to resolve transparent and color-mix backgrounds.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("A canvas context is required to compute contrast");
    const draw = (color: string) => {
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
    };
    const luminance = () => {
      const [red = 0, green = 0, blue = 0] = Array.from(context.getImageData(0, 0, 1, 1).data)
        .slice(0, 3)
        .map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    const layers = [];
    for (let node: Element | null = element; node; node = node.parentElement) {
      layers.unshift(getComputedStyle(node));
    }
    draw("#ffffff");
    for (const layer of layers) {
      context.filter = layer.filter;
      draw(layer.backgroundColor);
    }
    const background = luminance();
    draw(getComputedStyle(element).color);
    const text = luminance();
    return (Math.max(background, text) + 0.05) / (Math.min(background, text) + 0.05);
  });
}
