import { sitePath } from "../links.js";

export function Logo() {
  return <a className="site__wordmark" href={sitePath} aria-label="Elea">elea</a>;
}
