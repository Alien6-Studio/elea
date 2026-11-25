export type SiteFont = "elea" | "instrument" | "roboto";

declare global {
  interface Window {
    eleaSiteFont: {
      readonly options: readonly { value: SiteFont; label: string }[];
      get(): SiteFont;
      set(value: SiteFont): void;
      subscribe(listener: () => void): () => void;
    };
  }
}
