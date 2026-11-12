"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { translate, type Locale } from "@/lib/translations";

const storageKey = "somos-cardoso-language";
const changeEvent = "somos-cardoso-language-change";
let fallbackLocale: Locale = "pt-BR";

function readLocale(): Locale {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "en" || saved === "pt-BR") return saved;
  } catch {
    /* The language switch also works when browser storage is blocked. */
  }
  return fallbackLocale;
}

function subscribe(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

const LanguageContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
}>({ locale: "pt-BR", setLocale: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribe,
    readLocale,
    () => "pt-BR" as Locale,
  );
  function setLocale(next: Locale) {
    fallbackLocale = next;
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      /* Use in-memory preference. */
    }
    window.dispatchEvent(new Event(changeEvent));
  }
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translate(locale, "Somos Cardoso · Our family, together");
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        translate(
          locale,
          "A little closer, wherever we are. Our family's place for shared moments and Secret Santa.",
        ),
      );
  }, [locale]);
  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const { locale, setLocale } = useContext(LanguageContext);
  return {
    locale,
    setLocale,
    t: (text: string, values?: Record<string, string | number>) =>
      translate(locale, text, values),
  };
}

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  return (
    <div className="language-switch" role="group" aria-label={t("Language")}>
      <button
        type="button"
        lang="pt-BR"
        aria-label="Português (Brasil)"
        aria-pressed={locale === "pt-BR"}
        onClick={() => setLocale("pt-BR")}
      >
        PT-BR
      </button>
      <button
        type="button"
        lang="en"
        aria-label="English"
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}
