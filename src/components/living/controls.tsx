"use client";

import { useId, type ReactNode } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A native range input with its label and live value. Native, so it works
 * with keyboard (arrows, Page Up/Down, Home/End), touch and screen readers.
 */
export function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
  hint,
  color,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  /** Text for the visible value and for screen readers (aria-valuetext). */
  display: string;
  hint?: ReactNode;
  color?: string;
}) {
  const id = useId();
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
        <output htmlFor={id} className="text-base font-semibold text-text-primary tabular-nums" dir="ltr">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--fill" as string]: `${fill}%`, ...(color ? { ["--fill-color" as string]: color } : {}) }}
      />
      {hint && <p className="-mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

/** A segmented control made of real radio buttons (one tab stop, arrow keys move). */
export function Segmented<T extends string>({
  legend,
  options,
  value,
  onChange,
  hideLegend,
  size = "md",
}: {
  legend: string;
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  hideLegend?: boolean;
  size?: "sm" | "md";
}) {
  const name = useId();
  return (
    <fieldset>
      <legend className={cn("mb-2 text-sm font-medium text-text-secondary", hideLegend && "sr-only")}>{legend}</legend>
      <div className="flex flex-wrap gap-1.5 rounded-2xl bg-bg-muted/70 p-1.5">
        {options.map((o) => (
          <label key={o.value} className="relative flex-1 min-w-fit cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl px-3 text-center font-semibold transition-colors",
                size === "sm" ? "min-h-10 text-sm" : "min-h-11 text-sm sm:text-base",
                "text-text-secondary hover:text-text-primary",
                "peer-checked:bg-surface peer-checked:text-text-primary peer-checked:shadow-[0_1px_3px_rgba(11,31,58,0.18)]",
                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
              )}
            >
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** − 2 + : the quantity control on each grocery card. */
export function Stepper({
  value,
  onDec,
  onInc,
  labelDec,
  labelInc,
  display,
  incClassName = "bg-brand text-bg hover:bg-brand-hover",
  size = "md",
  phoneHidesDisplay = false,
}: {
  /** "sm" for compact list rows: 36 px buttons, still well above the 24 px minimum target. */
  size?: "sm" | "md";
  /** Below 640 px show only − and + (screen readers still hear the value), when the quantity is shown elsewhere. */
  phoneHidesDisplay?: boolean;
  /** Colour of the + button (defaults to brand blue). Keep text/background at AA. */
  incClassName?: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
  labelDec: string;
  labelInc: string;
  display: string;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border-subtle bg-surface">
      <button
        type="button"
        onClick={onDec}
        disabled={value <= 0}
        aria-label={labelDec}
        className={`grid ${size === "sm" ? "h-9 w-9" : "h-10 w-10"} place-items-center rounded-full text-text-secondary hover:bg-surface-hover hover:text-text-primary disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand`}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className={`${size === "sm" ? "min-w-8" : "min-w-10"} ${phoneHidesDisplay ? "max-sm:sr-only" : ""} text-center text-sm font-semibold tabular-nums text-text-primary`} dir="ltr">
        {display}
      </span>
      <button
        type="button"
        onClick={onInc}
        aria-label={labelInc}
        className={`grid ${size === "sm" ? "h-9 w-9" : "h-10 w-10"} place-items-center rounded-full hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${incClassName}`}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Small label that says what kind of number this is. */
export function BasisTag({ kind, children }: { kind: "official" | "retailer" | "statistics" | "estimate" | "yours" | "ad"; children: ReactNode }) {
  const styles: Record<typeof kind, string> = {
    official: "bg-teal-soft text-teal-ink",
    retailer: "bg-sky-soft text-sky-ink",
    ad: "bg-sky-soft text-sky-ink",
    statistics: "bg-violet-soft text-violet-ink",
    estimate: "bg-gold-soft text-gold-ink",
    yours: "bg-bg-muted text-text-secondary",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-5", styles[kind])}>{children}</span>;
}

/** "Step 2 of 4" marker for the section eyebrows; the number is visual, the words are for screen readers. */
export function StepNumber({ n, locale }: { n: number; locale: "en" | "ar" }) {
  return (
    <>
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-current" aria-hidden="true">
        <span className="text-[11px] font-bold leading-none text-bg">{n}</span>
      </span>
      <span className="sr-only">{locale === "ar" ? `الخطوة ${n} من 4: ` : `Step ${n} of 4: `}</span>
    </>
  );
}

/**
 * A native <details> panel: works without JavaScript, keyboard and screen
 * readers announce it as expanded or collapsed. Used to fold reference
 * material (rules, sources, guides) so the calculators stay in front.
 */
export function Disclosure({
  summary,
  hint,
  children,
  className,
  tone = "bg-surface",
}: {
  summary: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: string;
}) {
  return (
    <details className={cn("group rounded-2xl border border-border-subtle", tone, className)}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 text-start hover:bg-surface-hover/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-sans text-base font-semibold text-text-primary">{summary}</span>
          {hint && <span className="mt-0.5 block text-sm text-text-muted">{hint}</span>}
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-brand transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}
