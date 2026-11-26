export function channels(hex: string) {
  return [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
}

function luminance(colour: string) {
  const [r = 0, g = 0, b = 0] = channels(colour).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

export function contrast(foreground: string, background: string) {
  const a = luminance(foreground) + 0.05;
  const b = luminance(background) + 0.05;
  return Math.max(a / b, b / a);
}
