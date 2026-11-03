import { Link } from "@tanstack/react-router";
import { ChevronRight, History, Plus } from "lucide-react";
import { useState } from "react";
import { useDhikr } from "@/hooks/useDhikr";
import { useI18n } from "@/hooks/useI18n";
import { dhikrReading, meaningFor } from "@/lib/dhikr";
import { formatNumber, isRTL, LOCALE_META } from "@/lib/i18n";

export function ZikirSayfasi() {
  const { t, locale } = useI18n();
  const { items, countOf, targetOf, totalToday, addCustom, removeCustom } = useDhikr();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ arabic: "", transliteration: "", meaning: "", target: "33" });

  const builtIn = items.filter((i) => i.builtIn);
  const custom = items.filter((i) => !i.builtIn);

  function save() {
    if (!form.arabic.trim() && !form.transliteration.trim()) return;
    addCustom({
      arabic: form.arabic,
      transliteration: form.transliteration,
      meaning: form.meaning,
      target: Number(form.target) || 33,
    });
    setForm({ arabic: "", transliteration: "", meaning: "", target: "33" });
    setOpen(false);
  }

  return (
    <main>
      <header className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">{t("dhikr.eyebrow")}</p>
        <h1 className="font-display text-3xl font-bold">{t("dhikr.title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("dhikr.description")}
        </p>
      </header>

      <div className="space-y-4">
        <section className="motif-grid surface-card rounded-3xl px-6 py-5 text-center">
          <p className="text-sm text-muted-foreground">
            {t("dhikr.todayTotal", { count: formatNumber(totalToday, locale) })}
          </p>
          <Link
            to="/zikir/gecmis"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-foreground"
          >
            <History className="size-3.5" /> {t("dhikr.historyRow")}
          </Link>
        </section>

        <section className="surface-card overflow-hidden rounded-3xl">
          {builtIn.map((item) => {
            const meaning = meaningFor(item, locale);
            return (
              <Link
                key={item.id}
                to="/zikir/$id"
                params={{ id: item.id }}
                className="flex min-h-16 items-center gap-3 border-b border-border/60 px-5 py-3 last:border-0"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg" lang="ar" dir="rtl">
                    {item.arabic}
                  </span>
                  {locale !== "ar" && (
                    <span
                      className="mt-0.5 block text-sm font-semibold"
                      lang={locale}
                      dir={isRTL(locale) ? "rtl" : "ltr"}
                    >
                      {dhikrReading(item, locale)}
                    </span>
                  )}
                  <span className="mt-0.5 block break-words text-xs text-muted-foreground">
                    {meaning.text}
                  </span>
                  {meaning.text && !meaning.localized && meaning.language && (
                    <span className="mt-0.5 block text-[10px] text-muted-foreground/70">
                      {t("content.meaningIn", {
                        language: t(LOCALE_META[meaning.language].labelKey),
                      })}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-end">
                  <span className="block text-sm font-semibold tabular-nums text-primary">
                    {formatNumber(countOf(item.id), locale)}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    / {formatNumber(targetOf(item.id), locale)}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
              </Link>
            );
          })}
        </section>

        <section className="surface-card rounded-3xl p-5">
          <h2 className="text-sm font-semibold">{t("dhikr.customSection")}</h2>
          {custom.length > 0 && (
            <div className="mt-3 space-y-2">
              {custom.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-2xl border border-border px-4 py-3"
                >
                  <Link to="/zikir/$id" params={{ id: item.id }} className="min-w-0 flex-1">
                    {item.arabic ? (
                      <span className="block font-display text-base" lang="ar" dir="rtl">
                        {item.arabic}
                      </span>
                    ) : (
                      <span className="block text-sm font-semibold" dir="ltr">
                        {item.transliteration}
                      </span>
                    )}
                    <span className="block text-xs text-muted-foreground">
                      {formatNumber(countOf(item.id), locale)} /{" "}
                      {formatNumber(targetOf(item.id), locale)}
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm(t("dhikr.removeConfirm"))) removeCustom(item.id);
                    }}
                    aria-label={t("dhikr.remove")}
                    className="rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground"
                  >
                    {t("dhikr.remove")}
                  </button>
                </div>
              ))}
            </div>
          )}

          {open ? (
            <div className="mt-3 space-y-2">
              <input
                value={form.arabic}
                onChange={(e) => setForm({ ...form, arabic: e.target.value })}
                placeholder={t("dhikr.addArabic")}
                dir="rtl"
                className="min-h-12 w-full rounded-2xl border border-border bg-transparent px-4 text-sm"
              />
              <input
                value={form.transliteration}
                onChange={(e) => setForm({ ...form, transliteration: e.target.value })}
                placeholder={t("dhikr.addTranslit")}
                dir="ltr"
                className="min-h-12 w-full rounded-2xl border border-border bg-transparent px-4 text-sm"
              />
              <input
                value={form.meaning}
                onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                placeholder={t("dhikr.addMeaning")}
                className="min-h-12 w-full rounded-2xl border border-border bg-transparent px-4 text-sm"
              />
              <input
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                inputMode="numeric"
                dir="ltr"
                aria-label={t("dhikr.addTarget")}
                className="min-h-12 w-full rounded-2xl border border-border bg-transparent px-4 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={save}
                  className="min-h-12 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                >
                  {t("dhikr.addSave")}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="min-h-12 flex-1 rounded-full border border-border text-sm"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-1.5 rounded-full border border-border text-sm font-semibold"
            >
              <Plus className="size-4" /> {t("dhikr.addOpen")}
            </button>
          )}
        </section>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {t("dhikr.historyNote")}
        </p>
      </div>
    </main>
  );
}
