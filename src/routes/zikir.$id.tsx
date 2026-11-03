import { Link, useParams } from "@tanstack/react-router";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DhikrProgressRing } from "@/components/DhikrProgressRing";
import { useDhikr } from "@/hooks/useDhikr";
import { useI18n } from "@/hooks/useI18n";
import { TARGET_PRESETS, dhikrReading, displaySource, meaningFor, reviewedAudioSrc } from "@/lib/dhikr";
import { LOCALE_META, formatNumber, isRTL } from "@/lib/i18n";

export function ZikirDetay() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { t, locale } = useI18n();
  const { find, countOf, targetOf, increment, reset, setTarget } = useDhikr();
  const item = find(id);
  const [customTarget, setCustomTarget] = useState("");
  const [pulse, setPulse] = useState(false);

  const liveCount = item ? countOf(item.id) : 0;
  const liveTarget = item ? targetOf(item.id) : 1;
  const prevCount = useRef(liveCount);

  // Tamamlanma vurgusu yalnızca (hedef−1 → hedef) artışında bir kez oynar.
  useEffect(() => {
    const crossed = prevCount.current === liveTarget - 1 && liveCount === liveTarget;
    prevCount.current = liveCount;
    if (!crossed) return;
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 320);
    return () => clearTimeout(timer);
  }, [liveCount, liveTarget]);

  if (!item) {
    return (
      <main>
        <Link
          to="/zikir"
          className="inline-flex items-center gap-1 py-2 pe-3 text-sm text-muted-foreground"
        >
          <ChevronLeft className="size-4 rtl:rotate-180" /> {t("dhikr.title")}
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">{t("dhikr.notFound")}</p>
      </main>
    );
  }

  const count = liveCount;
  const target = liveTarget;
  const done = count >= target;
  // Ses yalnızca incelenmiş kayıt varsa; oynatma sayacı ARTIRMAZ.
  const audioSrc = reviewedAudioSrc(item);
  const meaning = meaningFor(item, locale);
  const source = displaySource(item);

  return (
    <main>
      <header className="mb-4">
        <Link
          to="/zikir"
          className="inline-flex items-center gap-1 rounded-full py-2 pe-3 text-sm text-muted-foreground"
        >
          <ChevronLeft className="size-4 rtl:rotate-180" /> {t("dhikr.title")}
        </Link>
      </header>

      <section className="motif-grid surface-card rounded-3xl px-6 py-6 text-center">
        {item.arabic && (
          <p className="font-display text-2xl leading-relaxed" lang="ar" dir="rtl">
            {item.arabic}
          </p>
        )}
        {(locale !== "ar" || !item.builtIn) && dhikrReading(item, locale) && (
          <p
            className="mt-2 text-sm font-semibold"
            lang={locale}
            dir={item.builtIn && isRTL(locale) ? "rtl" : "auto"}
          >
            {dhikrReading(item, locale)}
          </p>
        )}
        {meaning.text && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{meaning.text}</p>
        )}
        {/* Yedek meal, yerelleştirilmiş gibi gösterilmez; dili açıkça yazılır. */}
        {meaning.text && !meaning.localized && meaning.language && (
          <p className="mt-1 text-[11px] text-muted-foreground/80">
            {t("content.meaningIn", { language: t(LOCALE_META[meaning.language].labelKey) })}
          </p>
        )}
        {/* Dinleme yalnızca incelenmiş kayıt varsa; yapay ses üretilmez,
            otomatik başlamaz, döngüye alınmaz ve sayaca bağlı değildir. */}
        {audioSrc && (
          <audio
            className="mx-auto mt-3 w-full"
            controls
            preload="none"
            autoPlay={false}
            loop={false}
            src={audioSrc}
          >
            <track kind="captions" />
          </audio>
        )}
      </section>

      <div className="mt-5 flex flex-col items-center">
        <DhikrProgressRing count={count} target={target} done={done}>
          <button
            onClick={() => increment(item.id)}
            className={`absolute inset-2 flex select-none flex-col items-center justify-center rounded-full transition-transform duration-200 [touch-action:manipulation] motion-reduce:transition-none ${
              done ? "bg-gold/10" : "bg-primary/10"
            } ${pulse ? "scale-[1.03]" : "scale-100"}`}
            aria-label={`${t("dhikr.count")}: ${formatNumber(count, locale)} / ${formatNumber(target, locale)}`}
          >
            {/* Sayaç değerleri RTL dillerde de soldan sağa okunur (bidi izolasyonu). */}
            <span
              dir="ltr"
              className="font-display text-[3.5rem] font-bold tabular-nums [unicode-bidi:isolate]"
            >
              {formatNumber(count, locale)}
            </span>
            <span dir="ltr" className="mt-1 text-xs tabular-nums text-muted-foreground [unicode-bidi:isolate]">
              {formatNumber(count, locale)} / {formatNumber(target, locale)}
            </span>
            {done && (
              <span className="mt-1 text-[11px] font-semibold text-gold">{t("dhikr.completed")}</span>
            )}
          </button>
        </DhikrProgressRing>
        <p aria-live="polite" className="sr-only">
          {formatNumber(count, locale)} / {formatNumber(target, locale)}
        </p>
        <p className="mt-3 text-[11px] text-muted-foreground">{t("dhikr.tapToCount")}</p>


        <button
          onClick={() => {
            if (window.confirm(t("dhikr.resetConfirm"))) reset(item.id);
          }}
          className="mt-4 inline-flex min-h-12 items-center gap-1.5 rounded-full border border-border px-5 text-sm"
        >
          <RotateCcw className="size-4" /> {t("dhikr.reset")}
        </button>
      </div>

      <section className="surface-card mt-6 rounded-3xl p-5">
        <h2 className="text-sm font-semibold">{t("dhikr.target")}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {TARGET_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setTarget(item.id, preset)}
              aria-pressed={target === preset}
              className={`min-h-11 rounded-full border px-4 text-sm ${
                target === preset
                  ? "border-primary/60 bg-primary/10 font-semibold text-primary"
                  : "border-border text-foreground/90"
              }`}
            >
              {formatNumber(preset, locale)}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <input
            value={customTarget}
            onChange={(e) => setCustomTarget(e.target.value)}
            inputMode="numeric"
            dir="ltr"
            aria-label={t("dhikr.customTarget")}
            placeholder={t("dhikr.customTarget")}
            className="min-h-12 min-w-0 w-full rounded-2xl border border-border bg-transparent px-4 text-sm"
          />
          <button
            onClick={() => {
              const value = Number(customTarget);
              if (Number.isFinite(value) && value > 0) setTarget(item.id, value);
              setCustomTarget("");
            }}
            className="min-h-12 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            {t("dhikr.addSave")}
          </button>
        </div>
        {/* Hedef sayılar dinî bir hüküm bildirmez. */}
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/80">
          {t("dhikr.targetNote")}
        </p>
        {/* Atıf yalnızca kaynak biliniyorsa gösterilir; uydurma atıf yok. */}
        {source && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            {t("dhikr.source")}: {source}
          </p>
        )}
      </section>
    </main>
  );
}
