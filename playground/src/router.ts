import { useEffect, useState } from "react";

/** The route after the hash, so the site works from any static host without rewrites. */
export function useHashRoute() {
  const read = () => globalThis.location.hash.replace(/^#\/?/, "") || "playground";
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      globalThis.scrollTo(0, 0);
    };
    globalThis.addEventListener("hashchange", onChange);
    return () => globalThis.removeEventListener("hashchange", onChange);
  }, []);
  function replace(next: string) {
    globalThis.history.replaceState(globalThis.history.state, "", next);
    setRoute(read());
  }
  return [route, replace] as const;
}

export const href = (route: string) => `#/${route}`;
