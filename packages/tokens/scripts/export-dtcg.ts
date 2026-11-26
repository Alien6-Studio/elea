import { mkdirSync, writeFileSync } from "node:fs";
import light from "../tokens/elea.tokens.json" with { type: "json" };
import dark from "../tokens/elea.dark.tokens.json" with { type: "json" };
import { mergeTokens, type TokenGroup, type TokenLeaf } from "../src/dtcg.js";

const version = "2025.10";
const directory = new URL(`../dist/dtcg/${version}/`, import.meta.url);
const schema = `https://www.designtokens.org/schemas/${version}/format.json`;

function quantity(input: string, units: readonly string[]) {
  const parts = /^(-?\d+(?:\.\d+)?)([a-z]+)$/.exec(input);
  if (!parts || !units.includes(parts[2]!)) throw new Error(`Unsupported quantity: ${input}`);
  return { value: Number(parts[1]), unit: parts[2]! };
}

function srgb(channels: number[], alpha = 1) {
  if (channels.some(channel => channel < 0 || channel > 255) || alpha < 0 || alpha > 1) {
    throw new Error("An sRGB channel or alpha is outside its range");
  }
  return { colorSpace: "srgb", components: channels.map(channel => channel / 255), alpha };
}

function color(input: string) {
  if (!/^#[\da-f]{6}$/i.test(input)) throw new Error(`Expected a six-digit sRGB color: ${input}`);
  const channels = [1, 3, 5].map(start => Number.parseInt(input.slice(start, start + 2), 16));
  return { ...srgb(channels), hex: input };
}

// The source uses four lengths followed by an sRGB color in CSS space notation.
function shadowLayer(layer: string) {
  const parts = layer.trim().split(" rgb(");
  const lengths = parts[0]!.split(" ");
  const channels = /^(\d+) (\d+) (\d+) \/ (\d+(?:\.\d+)?)\)$/.exec(parts[1] ?? "");
  if (parts.length !== 2 || lengths.length !== 4 || !channels) throw new Error(`Unsupported shadow layer: ${layer}`);
  const [offsetX, offsetY, blur, spread] = lengths.map(length =>
    quantity(length === "0" ? "0px" : length, ["px", "rem"])
  );
  return { offsetX, offsetY, blur, spread, color: srgb(channels.slice(1, 4).map(Number), Number(channels[4])) };
}

function exchangeValue(type: string | undefined, value: unknown): unknown {
  if (typeof value === "string" && /^\{[^{}]+\}$/.test(value)) return value;
  switch (type) {
    case "color": return color(String(value));
    case "dimension": return quantity(String(value), ["px", "rem"]);
    case "duration": return quantity(String(value), ["ms", "s"]);
    case "shadow": {
      const layers = String(value).split(",").map(shadowLayer);
      return layers.length === 1 ? layers[0] : layers;
    }
    case "cubicBezier":
    case "fontFamily":
    case "fontWeight":
    case "number": return value;
    default: throw new Error(`Unsupported token type: ${type}`);
  }
}

function exchangeGroup(group: TokenGroup, inheritedType?: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const type = typeof group.$type === "string" ? group.$type : inheritedType;
  for (const [name, item] of Object.entries(group)) {
    if (name.startsWith("$")) {
      result[name] = item;
      continue;
    }
    if (!item || typeof item !== "object") throw new Error(`Expected a token or group at ${name}`);
    if ("$value" in item) {
      const token = item as TokenLeaf;
      result[name] = { ...token, $value: exchangeValue(token.$type ?? type, token.$value) };
    } else {
      result[name] = exchangeGroup(item, type);
    }
  }
  return result;
}

mkdirSync(directory, { recursive: true });
for (const [name, source] of [
  ["elea", light],
  ["elea.dark", mergeTokens(light, dark)],
] as const) {
  const document = { ...exchangeGroup(source), $schema: schema };
  writeFileSync(new URL(`${name}.tokens.json`, directory), JSON.stringify(document, null, 2) + "\n");
}
