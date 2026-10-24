import { useId } from "react";
import { formatNumber, parseFormattedNumber } from "@/shared/lib/format";

interface TermSliderProps {
  value: number;
  min: number;
  max: number;
  error?: string;
  onChange: (termMonths: number) => void;
}

function formatTerm(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${plural(years, "год", "года", "лет")}`);
  if (rest > 0) parts.push(`${rest} ${plural(rest, "месяц", "месяца", "месяцев")}`);
  return parts.join(" ") || "0 месяцев";
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** Поле срока кредита: range + input в месяцах */
export function TermSlider({ value, min, max, error, onChange }: TermSliderProps) {
  const id = useId();
  const clamped = Math.min(Math.max(value, min), max);
  const fillPercent = max > min ? ((clamped - min) / (max - min)) * 100 : 0;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-cocoa-700">
        Срок кредита
      </label>
      <div className="flex flex-col gap-3">
        <div className="relative">
          <input
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={formatNumber(value)}
            onChange={(e) => {
              const parsed = parseFormattedNumber(e.target.value);
              if (!Number.isNaN(parsed)) onChange(parsed);
              else if (e.target.value.trim() === "") onChange(0);
            }}
            className="w-full rounded-xl border border-milk-300 bg-milk-50/70 px-4 py-2.5 pr-14 text-right font-semibold text-cocoa-900 transition focus:border-caramel-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-caramel-100"
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-cocoa-400">
            мес
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={clamped}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, rgb(185 143 92) ${fillPercent}%, rgb(235 224 206) ${fillPercent}%)`,
          }}
          data-fill-percent={fillPercent}
          className="range-filled h-2 w-full cursor-pointer appearance-none rounded-full accent-caramel-500"
          aria-label="Срок кредита слайдером"
        />
      </div>
      <p className="mt-1.5 text-xs text-cocoa-400">
        От {min} до {max} мес ({formatTerm(value)})
      </p>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
