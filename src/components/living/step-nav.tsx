"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Locale = "en" | "ar";

/** The four steps, in page order. Short labels so all four fit on one line at 375 px. */
const STEPS = [
  { id: "month", en: "Your month", ar: "شهرك" },
  { id: "compare", en: "Cities", ar: "المدن" },
  { id: "workday", en: "A day's wage", ar: "أجر يوم" },
  { id: "earn", en: "Jobs & pay", ar: "الشغل والأجر" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

/**
 * A sticky bar under the site header with the page's four steps. The links
 * work without JavaScript; with it, the step on screen is highlighted
 * (aria-current) so people always know where they are on a long page.
 */
export function StepNav({ locale }: { locale: Locale }) {
  const [active, setActive] = useState<StepId | null>(null);

  useEffect(() => {
    const sections = STEPS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null);
    if (!sections.length || typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, boolean>();
    // A section counts as "current" while it crosses a line 40 % down the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        const current = STEPS.find((s) => visible.get(s.id));
        setActive(current ? current.id : null);
      },
      { rootMargin: "-40% 0px -59% 0px" },
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label={locale === "ar" ? "خطوات الصفحة" : "Steps on this page"}
      className="sticky top-16 z-30 -mx-4 border-b border-border-subtle bg-bg/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-bg/80 sm:-mx-6 sm:px-6 lg:top-[72px] lg:-mx-8 lg:px-8"
    >
      <ol className="mx-auto grid max-w-6xl grid-cols-4 gap-1.5 sm:gap-2">
        {STEPS.map((s, i) => {
          const on = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={on ? "step" : undefined}
                className={cn(
                  "flex h-full min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-center text-[11px] font-semibold leading-tight transition-colors sm:flex-row sm:gap-2 sm:text-sm",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none",
                  on ? "bg-brand text-bg" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                    on ? "bg-bg text-brand" : "bg-bg-muted text-text-primary",
                  )}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                {s[locale]}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
