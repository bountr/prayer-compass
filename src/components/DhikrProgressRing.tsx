/**
 * Zikir sayacı için dairesel hedef göstergesi.
 * - İlerleme YALNIZCA count/target'tan türetilir (kalıcı yüzde saklanmaz).
 * - Saat 12'den başlar, saat yönünde ilerler; RTL dillerde de yön değişmez.
 * - Tam hedefte görünür boşluk kalmaması için 360° kapalı çizim yapılır.
 */
type Props = {
  count: number;
  target: number;
  done: boolean;
  size?: number;
  children: React.ReactNode;
};

const STROKE = 10;

export function DhikrProgressRing({ count, target, done, size = 224, children }: Props) {
  const safeTarget = Number.isFinite(target) && target > 0 ? Math.floor(target) : 1;
  const ratio = Math.min(1, Math.max(0, count / safeTarget));
  const r = (size - STROKE) / 2;
  const c = 2 * Math.PI * r;
  // Tam dolu durumda dashoffset 0; strokeLinecap kaynaklı boşluk oluşmaz.
  const offset = c * (1 - ratio);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-border/60"
        />
        {ratio > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={done ? STROKE + 2 : STROKE}
            strokeLinecap={ratio >= 1 ? "butt" : "round"}
            strokeDasharray={c}
            strokeDashoffset={offset}
            className={`transition-[stroke-dashoffset,stroke-width] duration-200 ease-out motion-reduce:transition-none ${
              done ? "stroke-gold" : "stroke-primary"
            }`}
          />
        )}
      </svg>
      {children}
    </div>
  );
}
