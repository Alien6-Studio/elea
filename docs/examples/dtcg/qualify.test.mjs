import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";

const base = "@alien6-studio/elea-tokens/dtcg/2025.10/";
const light = fileURLToPath(import.meta.resolve(base + "elea.tokens.json"));
const dark = fileURLToPath(import.meta.resolve(base + "elea.dark.tokens.json"));
const sourceBase = fileURLToPath(import.meta.resolve("@alien6-studio/elea-tokens/tokens/elea.tokens.json"));
const sourceDark = fileURLToPath(import.meta.resolve("@alien6-studio/elea-tokens/tokens/elea.dark.tokens.json"));
const output = fileURLToPath(new URL("../../../artifacts/examples/dtcg/", import.meta.url));

function dictionary(input, destination) {
  return new StyleDictionary({
    ...input,
    usesDtcg: true,
    log: { warnings: "error" },
    platforms: {
      css: {
        transformGroup: "css",
        buildPath: output,
        files: [{
          destination,
          format: "css/variables",
          options: { outputReferences: true, showFileHeader: false },
        }],
      },
    },
  });
}

function aliasTarget(token) {
  const value = token.original.$value;
  return typeof value === "string" && value.startsWith("{") ? value : undefined;
}

function comparableValue(token) {
  // CSS serializes zero shadow lengths as 0 or 0px, and zero RGB channels as 0 or 0%.
  if (token.$type === "shadow") return token.$value.replaceAll(/(?<![\w.-])0(?:px|%)(?=[ ,)]|$)/g, "0");
  return token.$value;
}

for (const [name, file, source, infoColor] of [
  ["light", light, { source: [sourceBase] }, "#324fb4"],
  ["dark", dark, { include: [sourceBase], source: [sourceDark] }, "#8ea8e8"],
]) {
  test(name + " export builds standalone CSS and preserves reference chains", async (t) => {
    const destination = name + ".css";
    const sd = dictionary({ source: [file] }, destination);
    const { tokens, allTokens } = await sd.getPlatformTokens("css");
    assert.deepEqual(tokens.space["3"].original.$value, { value: 0.75, unit: "rem" });
    assert.deepEqual(tokens.motion.duration.fast.original.$value, { value: 100, unit: "ms" });
    assert.equal(tokens.space["3"].$value, "0.75rem");
    assert.equal(tokens.radius.full.$value, "9999px");
    assert.equal(tokens.motion.duration.fast.$value, "0.1s");
    assert.equal(tokens.motion.easing.spring.$value, "cubic-bezier(0.34, 1.56, 0.64, 1)");
    assert.equal(tokens.shadow.md.$value,
      "0px 4px 6px -1px rgb(0% 0% 0% / 0.1), 0px 2px 4px -2px rgb(0% 0% 0% / 0.1)");
    assert.equal(tokens.color.action.info.$value, infoColor);

    await sd.buildPlatform("css");
    const css = await readFile(output + destination, "utf8");
    assert.doesNotMatch(css, /\[object Object\]/);
    const historical = await dictionary(source, destination).getPlatformTokens("css");
    const byKey = new Map(allTokens.map(token => [token.key, token]));
    assert.deepEqual(new Set(byKey.keys()), new Set(historical.allTokens.map(token => token.key)));
    let aliasCount = 0;
    for (const previous of historical.allTokens) {
      const token = byKey.get(previous.key);
      assert.equal(token.$type, previous.$type, token.key);
      assert.deepEqual(comparableValue(token), comparableValue(previous), token.key);
      const reference = aliasTarget(previous);
      assert.equal(aliasTarget(token), reference, token.key);
      if (reference) {
        aliasCount++;
        const target = byKey.get(reference);
        assert.equal(token.$value, target.$value, token.key);
        const declaration = "--" + token.name + ": var(--" + target.name + ");";
        assert.ok(css.includes(declaration), declaration);
      }
    }
    t.diagnostic(allTokens.length + " token values and " + aliasCount + " alias references checked");
  });
}

test("a consumer can rebrand a primitive and its chained aliases follow", async () => {
  const tokens = JSON.parse(await readFile(light, "utf8"));
  tokens.color.primary["600"].$value = { colorSpace: "srgb", components: [1, 0, 0] };
  const sd = dictionary({ tokens }, "rebranded.css");
  const result = await sd.getPlatformTokens("css");
  assert.equal(result.tokens.color.info.$value, "#ff0000");
  assert.equal(result.tokens.color.action.info.$value, "#ff0000");
  assert.equal(result.tokens.color.primary["500"].$value, "#4567cf");
});
