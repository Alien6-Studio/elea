/** Feedback roles keep the status colour supplied by the surrounding product. */
export const statusRoles = ["danger", "warning", "info", "success"] as const;
export type StatusRole = typeof statusRoles[number];

function statusPairs(fill: string, surface: string, text: string, edge: string,
  mix: (first: string, amount: number, second: string) => string) {
  return {
    fill, text, ink: fill, onContainer: fill,
    hover: mix(fill, 90, edge), pressed: mix(fill, 80, edge), container: mix(fill, 10, surface),
  };
}

/** Live references let a host change one status colour for every component in its scope. */
export function defaultStatusProperties(role: StatusRole, dark?: boolean, prefix = "elea") {
  const token = (name: string) => `var(--${prefix}-color-${name})`;
  const fixedEdge = dark ? "#ffffff" : "#000000";
  const edge = dark === undefined ? `var(--${prefix}-_status-edge)` : fixedEdge;
  return statusPairs(token(role), token("surface-default"), token("text-inverse"), edge,
    (first, amount, second) => `color-mix(in srgb, ${first} ${amount}%, ${second})`);
}

/** The legacy status fallback must resolve on the element using the action. */
export function statusFallback(path: string, prefix = "elea"): string | undefined {
  const match = /^color\.action\.(success|info|warning|danger)(?:-(text|hover|pressed|ink|container|on-container))?$/.exec(path);
  if (!match) return undefined;
  const properties = defaultStatusProperties(match[1] as StatusRole, undefined, prefix);
  const key = match[2] === "on-container" ? "onContainer" : match[2] ?? "fill";
  return properties[key as keyof typeof properties];
}

/** Resolved sRGB values for DTCG consumers and the colour inspector. */
export function statusColors(fill: string, surface: string, inverse: string, dark: boolean) {
  return statusPairs(fill, surface, inverse, dark ? "#ffffff" : "#000000", (first, amount, second) => {
    const bytes = [1, 3, 5].map(offset => {
      const a = Number.parseInt(first.slice(offset, offset + 2), 16);
      const b = Number.parseInt(second.slice(offset, offset + 2), 16);
      return Math.round((a * amount + b * (100 - amount)) / 100).toString(16).padStart(2, "0");
    });
    return "#" + bytes.join("");
  });
}
