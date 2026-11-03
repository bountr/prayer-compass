import { INTL_LOCALE, type Locale } from "@/lib/i18n";

/**
 * Saat dilimi güvenli tarih/saat yardımcıları.
 * Namaz vakitleri konumun saat diliminde verilir; cihaz saat dilimi farklı
 * olabilir (manuel şehir seçimi, seyahat, DST). Bu yüzden tüm dönüşümler
 * hedef saat dilimi üzerinden yapılır.
 */

const PARTS_FORMATTERS = new Map<string, Intl.DateTimeFormat>();
const COUNTDOWN_FORMATTERS = new Map<Locale, Intl.NumberFormat>();

function partsFormatter(tz: string) {
  let dtf = PARTS_FORMATTERS.get(tz);
  if (!dtf) {
    dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    PARTS_FORMATTERS.set(tz, dtf);
    // Çok sayıda manuel şehir gezinmesinde önbelleğin sınırsız büyümesini önle.
    if (PARTS_FORMATTERS.size > 24) {
      const oldest = PARTS_FORMATTERS.keys().next().value as string | undefined;
      if (oldest) PARTS_FORMATTERS.delete(oldest);
    }
  }
  return dtf;
}

function countdownFormatter(locale: Locale) {
  let fmt = COUNTDOWN_FORMATTERS.get(locale);
  if (!fmt) {
    fmt = new Intl.NumberFormat(INTL_LOCALE[locale], {
      minimumIntegerDigits: 2,
      maximumFractionDigits: 0,
      useGrouping: false,
    });
    COUNTDOWN_FORMATTERS.set(locale, fmt);
  }
  return fmt;
}

function partsIn(tz: string, at: Date) {
  const out: Record<string, number> = {};
  for (const p of partsFormatter(tz).formatToParts(at)) {
    if (p.type !== "literal") out[p.type] = Number(p.value);
  }
  return out;
}

/** tz'nin verilen anda UTC'ye göre farkı (ms). */
function tzOffsetMs(tz: string, at: Date) {
  try {
    const p = partsIn(tz, at);
    const asUTC = Date.UTC(
      p["year"] ?? 1970,
      (p["month"] ?? 1) - 1,
      p["day"] ?? 1,
      (p["hour"] ?? 0) % 24,
      p["minute"] ?? 0,
      p["second"] ?? 0,
    );
    return asUTC - at.getTime();
  } catch {
    return -new Date().getTimezoneOffset() * 60000;
  }
}

/** "2026-09-04" + "05:12" (tz yerel saati) -> epoch ms */
export function zonedToEpoch(dateISO: string, hhmm: string, tz: string): number {
  const [y, m, d] = dateISO.split("-").map(Number);
  const [h, min] = hhmm.split(":").map(Number);
  const guess = Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, h ?? 0, min ?? 0);
  // DST sınırlarında iki geçişle stabil sonuç
  let ts = guess - tzOffsetMs(tz, new Date(guess));
  ts = guess - tzOffsetMs(tz, new Date(ts));
  return ts;
}

/** tz'de o anın takvim günü, "YYYY-MM-DD" */
export function todayISOIn(tz: string, at: Date = new Date()): string {
  try {
    const p = partsIn(tz, at);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${p["year"] ?? 1970}-${pad(p["month"] ?? 1)}-${pad(p["day"] ?? 1)}`;
  } catch {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;
  }
}

/** "YYYY-MM-DD" gününe gün ekler. */
export function addDaysISO(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

/** Cihazın saat dilimi kimliği. */
export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** Negatif olmayan, dile göre rakamları yerelleştirilmiş geri sayım (HH:MM:SS). */
export function formatRemaining(ms: number, locale?: Locale) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const values = [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60];
  if (!locale) return values.map((n) => String(n).padStart(2, "0")).join(":");
  try {
    const fmt = countdownFormatter(locale);
    return values.map((n) => fmt.format(n)).join(":");
  } catch {
    return values.map((n) => String(n).padStart(2, "0")).join(":");
  }
}
