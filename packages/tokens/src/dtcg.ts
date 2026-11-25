/** A leaf of a DTCG token file: `$value` with an optional `$type`. */
export interface TokenLeaf {
  $type?: string;
  $value: unknown;
  $description?: string;
}

/** A DTCG token tree: groups nest, leaves carry `$value`. `$schema` and other `$` keys are metadata. */
export interface TokenGroup {
  [key: string]: TokenGroup | TokenLeaf | string | undefined;
}

export interface FlatToken {
  /** Dot path of the token, e.g. `color.text.default`. */
  path: string;
  type: string;
  /** The raw value, references (`{color.neutral.900}`) resolved to their final value. */
  value: unknown;
}

function isLeaf(node: unknown): node is TokenLeaf {
  return typeof node === "object" && node !== null && "$value" in node;
}

/** Walks a token tree into a list of leaves, with references resolved against `root`. */
export function flattenTokens(tree: TokenGroup, root: TokenGroup = tree): FlatToken[] {
  const result: FlatToken[] = [];
  const walk = (node: TokenGroup, prefix: string, inheritedType: string | undefined) => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith("$") || child === undefined || typeof child === "string") continue;
      const path = prefix ? `${prefix}.${key}` : key;
      if (isLeaf(child)) {
        result.push({ path, type: child.$type ?? inheritedType ?? "unknown", value: resolveReference(child.$value, root, [path]) });
      } else {
        walk(child, path, child.$type as string | undefined);
      }
    }
  };
  walk(tree, "", undefined);
  return result;
}

const REFERENCE = /^\{([^}]+)\}$/;

/** Resolves `{a.b.c}` aliases, following chains and refusing cycles. */
export function resolveReference(value: unknown, root: TokenGroup, trail: string[] = []): unknown {
  if (typeof value !== "string") return value;
  const match = REFERENCE.exec(value.trim());
  if (!match?.[1]) return value;
  const path = match[1];
  if (trail.includes(path)) throw new Error(`Circular token reference: ${[...trail, path].join(" -> ")}`);
  let node: unknown = root;
  for (const segment of path.split(".")) {
    node = typeof node === "object" && node !== null ? (node as Record<string, unknown>)[segment] : undefined;
  }
  if (!isLeaf(node)) throw new Error(`Unknown token reference: {${path}}`);
  return resolveReference(node.$value, root, [...trail, path]);
}

/** Deeply merges token overrides (a theme) over a base tree. */
export function mergeTokens(base: TokenGroup, overrides: TokenGroup): TokenGroup {
  const result: TokenGroup = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    const current = result[key];
    if (typeof value === "object" && value !== null && !isLeaf(value) && typeof current === "object" && current !== null && !isLeaf(current)) {
      result[key] = mergeTokens(current, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
