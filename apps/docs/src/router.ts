import { useEffect, useState } from "react";

/** The route after the hash, so the site works from any static host without rewrites. */
export function useHashRoute(): string {
  const read = () => globalThis.location.hash.replace(/^#\/?/, "") || "home";
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      globalThis.scrollTo(0, 0);
    };
    globalThis.addEventListener("hashchange", onChange);
    return () => globalThis.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export const href = (route: string) => `#/${route}`;
