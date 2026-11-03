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
  BUILT_IN_DHIKR,
  EMPTY_STATE,
  makeCustomDhikr,
  readDhikrState,
  writeDhikrState,
  type Dhikr,
  type DhikrState,
} from "@/lib/dhikr";
import { useI18n } from "@/hooks/useI18n";
import { countHaptic, targetHaptic } from "@/lib/haptics";
import { deviceTimezone, todayISOIn } from "@/lib/time";

type Ctx = {
  items: Dhikr[];
  today: string;
  countOf: (id: string) => number;
  targetOf: (id: string) => number;
  totalToday: number;
  increment: (id: string) => void;
  reset: (id: string) => void;
  setTarget: (id: string, target: number) => void;
  addCustom: (input: { arabic: string; transliteration: string; meaning: string; target: number }) => Dhikr;
  removeCustom: (id: string) => void;
  history: Array<{ dateISO: string; total: number }>;
  find: (id: string) => Dhikr | null;
};

const DhikrCtx = createContext<Ctx | null>(null);

export function DhikrProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const [state, setState] = useState<DhikrState>(EMPTY_STATE);
  const [today, setToday] = useState(() => todayISOIn(deviceTimezone()));

  useEffect(() => {
    setState(readDhikrState());
  }, []);

  // Gün dönümünde sayaçlar yeni güne geçer (geçmiş kayıt korunur).
  useEffect(() => {
    const check = () => {
      const d = todayISOIn(deviceTimezone());
      setToday((prev) => (prev === d ? prev : d));
    };
    const id = setInterval(check, 30000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  const persist = useCallback((next: DhikrState) => {
    setState(next);
    writeDhikrState(next);
  }, []);

  const items = useMemo(() => [...BUILT_IN_DHIKR, ...state.custom], [state.custom]);

  const countOf = useCallback(
    (id: string) => state.daily[today]?.[id] ?? 0,
    [state.daily, today],
  );

  const targetOf = useCallback(
    (id: string) =>
      state.targets[id] ?? items.find((i) => i.id === id)?.defaultTarget ?? 33,
    [state.targets, items],
  );

  const increment = useCallback(
    (id: string) => {
      const day = { ...(state.daily[today] ?? {}) };
      const next = (day[id] ?? 0) + 1;
      day[id] = next;
      persist({ ...state, daily: { ...state.daily, [today]: day } });
      const target = state.targets[id] ?? items.find((i) => i.id === id)?.defaultTarget ?? 33;
      if (next === target) void targetHaptic();
      else void countHaptic();
    },
    [state, today, persist, items],
  );

  const reset = useCallback(
    (id: string) => {
      const day = { ...(state.daily[today] ?? {}) };
      delete day[id];
      persist({ ...state, daily: { ...state.daily, [today]: day } });
    },
    [state, today, persist],
  );

  const setTarget = useCallback(
    (id: string, target: number) => {
      persist({ ...state, targets: { ...state.targets, [id]: Math.max(1, Math.round(target)) } });
    },
    [state, persist],
  );

  const addCustom = useCallback(
    (input: { arabic: string; transliteration: string; meaning: string; target: number }) => {
      const item = makeCustomDhikr({ ...input, locale });
      persist({ ...state, custom: [...state.custom, item] });
      return item;
    },
    [state, persist, locale],
  );

  const removeCustom = useCallback(
    (id: string) => {
      persist({ ...state, custom: state.custom.filter((c) => c.id !== id) });
    },
    [state, persist],
  );

  const totalToday = useMemo(
    () => Object.values(state.daily[today] ?? {}).reduce((a, b) => a + b, 0),
    [state.daily, today],
  );

  const history = useMemo(
    () =>
      Object.entries(state.daily)
        .map(([dateISO, counts]) => ({
          dateISO,
          total: Object.values(counts).reduce((a, b) => a + b, 0),
        }))
        .filter((row) => row.total > 0)
        .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
        .slice(0, 30),
    [state.daily],
  );

  const find = useCallback((id: string) => items.find((i) => i.id === id) ?? null, [items]);

  const value = useMemo<Ctx>(
    () => ({
      items,
      today,
      countOf,
      targetOf,
      totalToday,
      increment,
      reset,
      setTarget,
      addCustom,
      removeCustom,
      history,
      find,
    }),
    [
      items,
      today,
      countOf,
      targetOf,
      totalToday,
      increment,
      reset,
      setTarget,
      addCustom,
      removeCustom,
      history,
      find,
    ],
  );

  return <DhikrCtx.Provider value={value}>{children}</DhikrCtx.Provider>;
}

export function useDhikr() {
  const ctx = useContext(DhikrCtx);
  if (!ctx) throw new Error("useDhikr must be used inside DhikrProvider");
  return ctx;
}
