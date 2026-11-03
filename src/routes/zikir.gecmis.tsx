import { Link } from "@tanstack/react-router";
import { BarChart3, ChevronLeft } from "lucide-react";
import { useDhikr } from "@/hooks/useDhikr";
import { useI18n } from "@/hooks/useI18n";
import { usePro } from "@/hooks/usePro";
import { formatGregorian, formatNumber } from "@/lib/i18n";

export function ZikirGecmis() {
  const { t, locale } = useI18n();
  const { history } = useDhikr();
  const { isPro } = usePro();

  // Temel kayıt listesi ücretsiz; yalnızca toplu istatistikler PRO'dur.
  const total = history.reduce((sum, row) => sum + row.total, 0);
  const best = history.reduce((max, row) => Math.max(max, row.total), 0);
  const activeDays = history.filter((row) => row.total > 0).length;

  return (
    <main>
      <header className="mb-6">
        <Link
          to="/zikir"
          className="inline-flex items-center gap-1 rounded-full py-2 pe-3 text-sm text-muted-foreground"
        >
          <ChevronLeft className="size-4 rtl:rotate-180" /> {t("dhikr.title")}
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold">{t("dhikr.history")}</h1>
      </header>

      <section className="surface-card mb-4 rounded-3xl p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="size-4 text-primary" /> {t("pro.statsTitle")}
        </p>
        {isPro ? (
          <div className="mt-3 space-y-1 text-sm">
            <p>{t("pro.statsTotal", { count: formatNumber(total, locale) })}</p>
            <p>{t("pro.statsBestDay", { count: formatNumber(best, locale) })}</p>
            <p>{t("pro.statsActiveDays", { count: formatNumber(activeDays, locale) })}</p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t("pro.statsUpsell")}
            </p>
            <Link
              to="/ayarlar/pro"
              className="mt-3 inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold text-primary"
            >
              {t("pro.lockedCta")}
            </Link>
          </>
        )}
      </section>


      <section className="surface-card overflow-hidden rounded-3xl">
        {history.length === 0 ? (
          <p className="px-5 py-5 text-sm text-muted-foreground">{t("dhikr.historyEmpty")}</p>
        ) : (
          history.map((row) => (
            <div
              key={row.dateISO}
              className="flex min-h-12 items-center justify-between gap-3 border-b border-border/60 px-5 py-3 last:border-0"
            >
              <span className="text-sm">{formatGregorian(row.dateISO, locale)}</span>
              <span className="text-sm font-semibold tabular-nums text-primary">
                {t("dhikr.totalCount", { count: formatNumber(row.total, locale) })}
              </span>
            </div>
          ))
        )}
      </section>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        {t("dhikr.historyNote")}
      </p>
    </main>
  );
}
