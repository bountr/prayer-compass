/**
 * Hicri takvim dönüşümleri (Faz 5D).
 *
 * Kurallar:
 * - Namaz vakti verisi ASLA burada üretilmez; bu modül yalnızca takvim
 *   (Hicri <-> Miladi) dönüşümü yapar.
 * - Dönüşüm için platformun Intl "islamic-umalqura" takvimi kullanılır
 *   (Ümmü'l-Kura). Cihaz desteklemiyorsa aritmetik yaklaşıma düşülür.
 * - Sonuçlar hesaplanmış takvimdir; yerel hilal gözlemi ±1 gün farklı olabilir.
 *   Bu belirsizlik arayüzde açıkça belirtilir.
 */

export type HijriDate = { year: number; month: number; day: number };

const MS_DAY = 86400000;

function utcNoon(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12);
}

function isoFromUtc(ts: number) {
  const dt = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

let fmt: Intl.DateTimeFormat | null | undefined;

function formatter() {
  if (fmt !== undefined) return fmt;
  try {
    const f = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
      timeZone: "UTC",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    // Desteklenmiyorsa tarayıcı sessizce gregoryan'a düşer; kabaca doğrula.
    const probe = f.formatToParts(new Date(Date.UTC(2000, 0, 1, 12)));
    const year = Number(probe.find((p) => p.type === "year")?.value ?? 0);
    fmt = year > 1300 && year < 1500 ? f : null;
  } catch {
    fmt = null;
  }
  return fmt;
}

/** Aritmetik yedek dönüşüm (tablo tabanlı takvim yoksa). */
function fallbackFromGregorian(ts: number): HijriDate {
  const days = Math.floor(ts / MS_DAY);
  // 1970-01-01 = 1389-10-22 (yaklaşık)
  const hijriDays = days + 492148;
  const cycle = Math.floor(hijriDays / 10631);
  let rest = hijriDays - cycle * 10631;
  let year = cycle * 30;
  const yearLen = (y: number) => (((y * 11 + 14) % 30) < 11 ? 355 : 354);
  while (rest >= yearLen(year + 1)) {
    rest -= yearLen(year + 1);
    year += 1;
  }
  year += 1;
  let month = 1;
  const monthLen = (m: number) => (m % 2 === 1 ? 30 : m === 12 ? (yearLen(year) === 355 ? 30 : 29) : 29);
  while (rest >= monthLen(month)) {
    rest -= monthLen(month);
    month += 1;
  }
  return { year, month, day: rest + 1 };
}

/** "YYYY-MM-DD" (miladi) -> Hicri tarih. */
export function toHijri(dateISO: string): HijriDate {
  const ts = utcNoon(dateISO);
  const f = formatter();
  if (!f) return fallbackFromGregorian(ts);
  try {
    const parts = f.formatToParts(new Date(ts));
    const num = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    const year = num("year");
    const month = num("month");
    const day = num("day");
    if (year > 0 && month >= 1 && month <= 12 && day >= 1) return { year, month, day };
  } catch {
    /* yedek yola düş */
  }
  return fallbackFromGregorian(ts);
}

/** İki hicri tarih arasındaki kaba gün farkı (arama için). */
function hijriDelta(a: HijriDate, b: HijriDate) {
  return (a.year - b.year) * 354.367 + (a.month - b.month) * 29.53 + (a.day - b.day);
}

/**
 * Hicri tarihin miladi karşılığı ("YYYY-MM-DD").
 * Yaklaşık tahminden başlayıp gün gün daraltarak kesin sonucu bulur.
 */
export function fromHijri(target: HijriDate): string | null {
  const approxYear = Math.floor(target.year * 0.970224 + 621.5774);
  let ts = Date.UTC(approxYear, 0, 1, 12);
  for (let i = 0; i < 12; i++) {
    const cur = toHijri(isoFromUtc(ts));
    const delta = hijriDelta(target, cur);
    if (Math.abs(delta) < 1) break;
    ts += Math.round(delta) * MS_DAY;
  }
  // ±45 gün içinde tam eşleşmeyi tara
  for (let offset = 0; offset <= 45; offset++) {
    for (const sign of offset === 0 ? [1] : [1, -1]) {
      const probe = ts + sign * offset * MS_DAY;
      const h = toHijri(isoFromUtc(probe));
      if (h.year === target.year && h.month === target.month && h.day === target.day) {
        return isoFromUtc(probe);
      }
    }
  }
  return null;
}

/** Hicri ayın gün sayısı (29 veya 30). */
export function hijriMonthLength(year: number, month: number): number {
  const start = fromHijri({ year, month, day: 1 });
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const next = fromHijri({ year: nextYear, month: nextMonth, day: 1 });
  if (!start || !next) return 30;
  return Math.round((utcNoon(next) - utcNoon(start)) / MS_DAY);
}

/** İki miladi gün arasındaki tam gün farkı. */
export function daysBetweenISO(fromISO: string, toISO: string): number {
  return Math.round((utcNoon(toISO) - utcNoon(fromISO)) / MS_DAY);
}

/** "YYYY-MM-DD" gününün haftanın günü (0 = Pazar). */
export function weekdayOfISO(dateISO: string): number {
  return new Date(utcNoon(dateISO)).getUTCDay();
}
