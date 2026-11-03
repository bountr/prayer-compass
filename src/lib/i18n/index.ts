/**
 * Merkezî yerelleştirme katmanı (i18n).
 * Görünen tüm metinler buradan gelir; kanonik veri kimlikleri (imsak, dhuhr,
 * method değerleri…) dilden bağımsız kalır.
 */
import { tr, type TranslationKey } from "@/lib/i18n/tr";
import { en } from "@/lib/i18n/en";
import { fromHijri } from "@/lib/hijri";

export type Locale =
  | "tr"
  | "en"
  | "ar"
  | "de"
  | "fr"
  | "ru"
  | "id"
  | "ms"
  | "ur"
  | "fa"
  | "bn"
  | "hi"
  | "zh-Hans";

/** Dil üstverisi: BCP-47 etiketi, yazım yönü ve etiket anahtarı. */
export const LOCALE_META: Record<
  Locale,
  { intl: string; rtl: boolean; labelKey: TranslationKey }
> = {
  tr: { intl: "tr-TR", rtl: false, labelKey: "language.tr" },
  en: { intl: "en-US", rtl: false, labelKey: "language.en" },
  ar: { intl: "ar", rtl: true, labelKey: "language.ar" },
  de: { intl: "de-DE", rtl: false, labelKey: "language.de" },
  fr: { intl: "fr-FR", rtl: false, labelKey: "language.fr" },
  ru: { intl: "ru-RU", rtl: false, labelKey: "language.ru" },
  id: { intl: "id-ID", rtl: false, labelKey: "language.id" },
  ms: { intl: "ms-MY", rtl: false, labelKey: "language.ms" },
  ur: { intl: "ur-PK", rtl: true, labelKey: "language.ur" },
  fa: { intl: "fa-IR", rtl: true, labelKey: "language.fa" },
  bn: { intl: "bn-BD", rtl: false, labelKey: "language.bn" },
  hi: { intl: "hi-IN", rtl: false, labelKey: "language.hi" },
  "zh-Hans": { intl: "zh-Hans", rtl: false, labelKey: "language.zh-Hans" },
};

const ALL_LOCALES = Object.keys(LOCALE_META) as Locale[];

/** Varsayılan dil Türkçe; cihaz diline göre otomatik değişmez. */
export const DEFAULT_LOCALE: Locale = "tr";

export const LOCALE_KEY = "nv:locale";

type Dict = Partial<Record<TranslationKey, string>>;

/**
 * Türkçe ve İngilizce ilk pakette kalır: Türkçe SSR/ilk çizim dili, İngilizce
 * güvenli yedektir. Diğer 11 sözlük yalnızca kullanıcı o dili seçtiğinde
 * dinamik olarak yüklenir.
 */
const DICTS: Partial<Record<Locale, Dict>> = { tr, en };

const LOADERS: Partial<Record<Locale, () => Promise<Dict>>> = {
  ar: () => import("@/lib/i18n/ar").then((m) => m.ar),
  de: () => import("@/lib/i18n/de").then((m) => m.de),
  fr: () => import("@/lib/i18n/fr").then((m) => m.fr),
  ru: () => import("@/lib/i18n/ru").then((m) => m.ru),
  id: () => import("@/lib/i18n/id").then((m) => m.id),
  ms: () => import("@/lib/i18n/ms").then((m) => m.ms),
  ur: () => import("@/lib/i18n/ur").then((m) => m.ur),
  fa: () => import("@/lib/i18n/fa").then((m) => m.fa),
  bn: () => import("@/lib/i18n/bn").then((m) => m.bn),
  hi: () => import("@/lib/i18n/hi").then((m) => m.hi),
  "zh-Hans": () => import("@/lib/i18n/zh-Hans").then((m) => m.zhHans),
};

const loading = new Map<Locale, Promise<void>>();

/** Seçili sözlüğü bir kez yükler; aynı anda gelen çağrılar tek isteği paylaşır. */
export function loadLocale(locale: Locale): Promise<void> {
  if (DICTS[locale]) return Promise.resolve();
  const existing = loading.get(locale);
  if (existing) return existing;
  const loader = LOADERS[locale];
  if (!loader) return Promise.resolve();

  const job = loader()
    .then((dict) => {
      DICTS[locale] = dict;
    })
    .finally(() => loading.delete(locale));
  loading.set(locale, job);
  return job;
}

/** CI sözlük anahtar eşitliğini doğruladığı için yayınlanmış diller eksiksizdir. */
export function isLocaleComplete(locale: Locale) {
  return ALL_LOCALES.includes(locale);
}

/**
 * Yayın dalgaları (Faz 5D.2). 13 dilin tamamı yayınlandı; bir dil yalnızca
 * %100 çevrilmişse listede görünür (eksik çeviri kullanıcıya sunulmaz).
 */
export const RELEASED_LOCALES: Locale[] = [...ALL_LOCALES];

/** Kullanıcıya sunulan diller — yayınlanan ve tam çevrilmiş olanlar. */
export const LOCALES: Locale[] = ALL_LOCALES.filter(
  (l) => RELEASED_LOCALES.includes(l) && isLocaleComplete(l),
);

export function isRTL(locale: Locale) {
  return LOCALE_META[locale].rtl;
}

/** BCP-47 etiketi — Intl biçimlendirmeleri için. */
export const INTL_LOCALE: Record<Locale, string> = Object.fromEntries(
  ALL_LOCALES.map((l) => [l, LOCALE_META[l].intl]),
) as Record<Locale, string>;

export function readStoredLocale(): Locale {
  if (typeof localStorage === "undefined") return DEFAULT_LOCALE;
  try {
    const raw = localStorage.getItem(LOCALE_KEY);
    if (raw && (LOCALES as string[]).includes(raw)) {
      return raw as Locale;
    }
  } catch {
    /* yoksay */
  }
  return DEFAULT_LOCALE;
}

export function writeStoredLocale(locale: Locale) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    /* kota */
  }
}

export type TParams = Record<string, string | number>;

/** Anahtarı verilen dile çevirir; {param} yer tutucularını doldurur. */
export function translate(locale: Locale, key: TranslationKey, params?: TParams): string {
  const dict = DICTS[locale];
  // Türkçe kanonik kaynak; diğer dillerin chunk'ı henüz yüklenmediyse
  // kullanıcıya yanlışlıkla Türkçe göstermek yerine İngilizce güvenli yedek.
  let out =
    dict?.[key] ??
    (locale === DEFAULT_LOCALE ? DICTS[DEFAULT_LOCALE]![key] : DICTS.en![key]) ??
    DICTS[DEFAULT_LOCALE]![key] ??
    key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      out = out.split(`{${name}}`).join(String(value));
    }
  }
  return out;
}

export type Translator = (key: TranslationKey, params?: TParams) => string;

export function translatorFor(locale: Locale): Translator {
  return (key, params) => translate(locale, key, params);
}

export type { TranslationKey };

/* --------------------------- Tarih / sayı biçimleri -------------------------- */

/** "YYYY-MM-DD" -> "04 Eylül 2026" / "September 4, 2026" */
export function formatGregorian(dateISO: string, locale: Locale): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  const at = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12));
  try {
    return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      day: locale === "tr" ? "2-digit" : "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(at);
  } catch {
    return dateISO;
  }
}

/** Locale'e duyarlı tarih+saat (son güncelleme vb.). */
export function formatDateTime(at: number, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(at));
  } catch {
    return "";
  }
}

/** Tam tarih+saat (tanılama listeleri). */
export function formatFullDateTime(at: number, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      dateStyle: "short",
      timeStyle: "short",
      hour12: false,
    }).format(new Date(at));
  } catch {
    return "";
  }
}

/** 24 saatlik gösterim her iki dilde de korunur (Faz 4). */
export function formatClock(at: number, timezone: string, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(at));
  } catch {
    return "";
  }
}

/** 2405 -> "2.405" (tr) / "2,405" (en). Sayısal değer değişmez. */
export function formatNumber(value: number, locale: Locale): string {
  try {
    return new Intl.NumberFormat(INTL_LOCALE[locale]).format(value);
  } catch {
    return String(value);
  }
}

/** "05:42" gibi bir namaz saatini seçili dilin rakamlarıyla gösterir. */
export function formatPrayerTime(value: string, locale: Locale): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return value;
  try {
    const fmt = new Intl.NumberFormat(INTL_LOCALE[locale], {
      minimumIntegerDigits: 2,
      maximumFractionDigits: 0,
      useGrouping: false,
    });
    return `${fmt.format(Number(match[1]))}:${fmt.format(Number(match[2]))}`;
  } catch {
    return value;
  }
}

export function formatPercent(fraction: number, locale: Locale): string {
  try {
    return new Intl.NumberFormat(INTL_LOCALE[locale], {
      style: "percent",
      maximumFractionDigits: 0,
    }).format(fraction);
  } catch {
    return `${Math.round(fraction * 100)}%`;
  }
}

/** Mesafeyi seçili dilde kilometre birimiyle gösterir. */
export function formatDistanceKm(value: number, locale: Locale): string {
  try {
    return new Intl.NumberFormat(INTL_LOCALE[locale], {
      style: "unit",
      unit: "kilometer",
      unitDisplay: "short",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${formatNumber(Math.round(value), locale)} km`;
  }
}

/** ISO ülke kodundan yerelleştirilmiş ülke adı; yoksa sağlayıcı adı korunur. */
export function countryName(
  code: string | null | undefined,
  fallback: string | null | undefined,
  locale: Locale,
): string | null {
  if (code && code.length === 2) {
    try {
      const dn = new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "region" });
      const name = dn.of(code.toUpperCase());
      if (name && name !== code.toUpperCase()) return name;
    } catch {
      /* Intl.DisplayNames yoksa sağlayıcı adına düşülür */
    }
  }
  return fallback ?? null;
}

/* ------------------------------- Hicri aylar ------------------------------- */

/** AlAdhan'ın İngilizce ay adları kanonik kimlik olarak kullanılır. */
const HIJRI_MONTHS: Array<{ id: string; tr: string; en: string }> = [
  { id: "Muharram", tr: "Muharrem", en: "Muharram" },
  { id: "Safar", tr: "Safer", en: "Safar" },
  { id: "Rabi al-Awwal", tr: "Rebiülevvel", en: "Rabi al-Awwal" },
  { id: "Rabi al-Thani", tr: "Rebiülahir", en: "Rabi al-Thani" },
  { id: "Jumada al-Awwal", tr: "Cemaziyelevvel", en: "Jumada al-Awwal" },
  { id: "Jumada al-Thani", tr: "Cemaziyelahir", en: "Jumada al-Thani" },
  { id: "Rajab", tr: "Recep", en: "Rajab" },
  { id: "Sha'ban", tr: "Şaban", en: "Sha'ban" },
  { id: "Ramadan", tr: "Ramazan", en: "Ramadan" },
  { id: "Shawwal", tr: "Şevval", en: "Shawwal" },
  { id: "Dhu al-Qi'dah", tr: "Zilkade", en: "Dhu al-Qi'dah" },
  { id: "Dhu al-Hijjah", tr: "Zilhicce", en: "Dhu al-Hijjah" },
];

/** Aksan/işaret farklarını yok sayan eşleme anahtarı. */
function normalizeMonthName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

const BY_NORMALIZED = new Map(
  HIJRI_MONTHS.map((m) => [normalizeMonthName(m.id), m] as const),
);

/**
 * Platformun Intl islamic-umalqura takvimi destekleniyorsa Hicri ay adını
 * doğrudan kullanıcının dilinde üretir. Böylece Arapça, Urduca, Farsça,
 * Bengalce, Hintçe, Çince vb. diller İngilizce ay adına düşmez.
 */
function localizedHijriMonth(monthNumber: number, locale: Locale): string | null {
  if (monthNumber < 1 || monthNumber > 12) return null;
  try {
    const dateISO = fromHijri({ year: 1448, month: monthNumber, day: 1 });
    if (!dateISO) return null;
    const [y, m, d] = dateISO.split("-").map(Number);
    const tag = `${INTL_LOCALE[locale]}-u-ca-islamic-umalqura`;
    const fmt = new Intl.DateTimeFormat(tag, { month: "long", timeZone: "UTC" });
    if (!fmt.resolvedOptions().calendar.includes("islamic")) return null;
    const value = fmt.format(new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1, 12))).trim();
    return value || null;
  } catch {
    return null;
  }
}

/** Sağlayıcının ay adını (veya numarasını) seçili dile çevirir. */
export function hijriMonthName(
  raw: string | null | undefined,
  monthNumber: number | null | undefined,
  locale: Locale,
): string {
  if (monthNumber && monthNumber >= 1 && monthNumber <= 12) {
    const localized = localizedHijriMonth(monthNumber, locale);
    if (localized) return localized;
    const m = HIJRI_MONTHS[monthNumber - 1]!;
    return locale === "tr" ? m.tr : m.en;
  }
  if (raw) {
    const found = BY_NORMALIZED.get(normalizeMonthName(raw));
    if (found) {
      const localized = localizedHijriMonth(HIJRI_MONTHS.indexOf(found) + 1, locale);
      if (localized) return localized;
      return locale === "tr" ? found.tr : found.en;
    }
    return raw;
  }
  return "";
}

/** "22 Rebiülevvel 1448" / "22 Rabi al-Awwal 1448" */
export function formatHijri(
  parts: { day: string | null; monthEn: string | null; monthNumber: number | null; year: string | null },
  locale: Locale,
): string {
  const month = hijriMonthName(parts.monthEn, parts.monthNumber, locale);
  const day = parts.day ? formatNumber(Number(parts.day), locale) : "";
  const year = parts.year ? formatNumber(Number(parts.year), locale) : "";
  return [day, month, year].filter(Boolean).join(" ");
}

/* ------------------------------ Yön adları ------------------------------ */

const CARDINAL_KEYS = [
  "direction.n",
  "direction.ne",
  "direction.e",
  "direction.se",
  "direction.s",
  "direction.sw",
  "direction.w",
  "direction.nw",
] as const satisfies readonly TranslationKey[];

/** Dereceyi yön çeviri anahtarına çevirir (pusula matematiği değişmez). */
export function cardinalKey(deg: number): TranslationKey {
  const i = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return CARDINAL_KEYS[i] ?? "direction.n";
}
