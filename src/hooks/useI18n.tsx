import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  loadLocale,
  readStoredLocale,
  translate,
  writeStoredLocale,
  type Locale,
  type TParams,
  type TranslationKey,
} from "@/lib/i18n";
import { isRTL } from "@/lib/i18n";

type Ctx = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: TParams) => string;
};

const I18nCtx = createContext<Ctx | null>(null);

/** Dil değişimini dinleyen diğer katmanlar (bildirim planlayıcı) için olay. */
export const LOCALE_EVENT = "nv:locale-changed";

export function I18nProvider({ children }: { children: ReactNode }) {
  // SSR ile aynı ilk çizim: varsayılan Türkçe, ardından kayıtlı tercih.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    let alive = true;
    const stored = readStoredLocale();
    if (stored !== locale) {
      void loadLocale(stored)
        .then(() => {
          if (alive) setLocaleState(stored);
        })
        .catch(() => {
          // Çevrimdışı ilk açılışta chunk yoksa varsayılan dil kullanılmaya devam eder.
        });
    }
    return () => {
      alive = false;
    };
    // yalnızca ilk yüklemede
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // <html lang> ve yön bilgisi (gelecekte RTL için tek nokta)
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    // RTL diller (ar, ur, fa) için tüm arayüz yönü çevrilir.
    document.documentElement.dir = isRTL(locale) ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    // Dil state'i yalnızca sözlük hazır olduğunda değişir. Böylece tek kare bile
    // İngilizce/Türkçe fallback ile yanlış dilde görünmez.
    void loadLocale(next)
      .then(() => {
        setLocaleState(next);
        writeStoredLocale(next);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: next }));
        }
      })
      .catch(() => {
        // Yüklenemeyen dil paketi seçili dili bozmaz; kullanıcı tekrar deneyebilir.
      });
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TParams) => translate(locale, key, params),
    [locale],
  );

  const value = useMemo<Ctx>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

const FALLBACK: Ctx = {
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key, params) => translate(DEFAULT_LOCALE, key, params),
};

export function useI18n() {
  return useContext(I18nCtx) ?? FALLBACK;
}
