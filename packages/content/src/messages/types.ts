import type { en } from "./en.js";

/** Recursively widens literal strings so that translations can carry any text. */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

/** Every label of the viewer and editor. Consumers pass a full object or merge over `en`. */
type DefaultMessages = Widen<typeof en>;
export type EleaMessages = Omit<DefaultMessages, "source" | "list" | "image" | "video" | "attachment"> & Partial<Pick<DefaultMessages, "list">> & {
  image: Omit<DefaultMessages["image"], "errorSvg"> & { errorSvg?: string };
  source?: DefaultMessages["source"] & { /** @deprecated */ blockComments?: string };
  video: Omit<DefaultMessages["video"], "remove"> & { remove?: string };
  attachment: Omit<DefaultMessages["attachment"], "replace"> & { replace?: string };
};

/** Fills a partial translation with the English defaults, section by section. */
export function withDefaultMessages(partial: DeepPartial<EleaMessages>, defaults: EleaMessages): EleaMessages {
  const result = { ...defaults } as Record<string, Record<string, string>>;
  for (const [section, values] of Object.entries(partial)) {
    if (!values || !(section in result)) continue;
    result[section] = { ...result[section], ...(values as Record<string, string>) };
  }
  return result as EleaMessages;
}

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> };

/** Replaces `{name}` placeholders in a message. */
export function formatMessage(message: string, values: Record<string, string | number> = {}): string {
  return message.replaceAll(/\{(\w+)\}/g, (match: string, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}
