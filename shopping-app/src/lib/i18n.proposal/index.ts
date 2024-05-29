import SettingsClient from "../../clients/SettingsClient";
import moment from "moment";

export type LANGS = "es" | "en";
// Use the instance of Settings to get the language
const DEFAULT_LANGUAGE: LANGS = "es";

export type Locales<T extends string, V = string> = Record<T, V>;

export function setLocale(language: string) {
  const lng = language || DEFAULT_LANGUAGE;

  const momentlng = lng === "en" ? "en-gb" : lng; // "EN" DOESNT EXIST :/, WEIRD
  require(`moment/locale/${momentlng}`); // MOMENT BUG TO SET LOCALE
  moment.locale(momentlng); // Set Moment Locale

  SettingsClient.set("LANGUAGE", lng); // Set locale language
}

export type Localize<L extends string = any, R = string> = (
  label: L,
  replacements?: any
) => R;

export default function i18<
  L extends string = any,
  V = string,
  T extends string = LANGS
>(locales: Record<T, Locales<L, V>>): Localize<L, V> {
  const language: T = SettingsClient.get("LANGUAGE", DEFAULT_LANGUAGE);
  const localizations = locales[language] ?? locales[DEFAULT_LANGUAGE as T];

  return (label: L, replacements: any = {}) => {
    try {
      let labelValue: any = localizations[label];
      if (!labelValue) {
        throw new Error(
          `The label ${label} is not defined in the locale resource`
        );
      }

      if (typeof labelValue == "string")
        Object.keys(replacements).forEach((key) => {
          labelValue = (labelValue as string).replace(
            new RegExp(`{${key}}`, "ig"),
            replacements[key]
          );
        });

      return labelValue;
    } catch (ex) {
      console.error(ex);
      return "";
    }
  };
}
