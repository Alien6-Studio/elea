import { sitePath } from "../links.js";

export function Logo({ height = 34 }: { height?: number }) {
  return <img src={`${sitePath}assets/elea.svg`} width={Math.round(height * 105 / 46)} height={height} alt="Elea" />;
}
