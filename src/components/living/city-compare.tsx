"use client";

import { cn } from "@/lib/utils";
import { cities, type CityKey } from "@/data/costs";
import { SiteImage } from "@/components/site-image";
import { dormNightly, DORM_NIGHTS_PER_MONTH, STUDENT_TRANSPORT, CANTEEN_MEAL, RENT_MAP, flatRent } from "@/data/living/city-costs";
import { fmtCzk, roundEstimate, studentMonth, type MonthSettings, typicalBed, transportMonthly } from "@/lib/living-calc";
import { BasisTag, StepNumber } from "./controls";
import { CITY_PHOTO } from "./student-month";
import { iso } from "./format";

type Locale = "en" | "ar";

const COPY = {
  en: {
    title: "Prague, Brno or Ostrava?",
    lead: "The same month, priced in each city with your settings from the simulator above.",
    yourMonth: "Your month here",
    cheapest: "Lowest",
    rows: {
      dormShared: "Dorm bed, shared room (typical)",
      dormOwn: "Dorm, own room (typical)",
      flat: "Furnished one-room flat, outside centre",
      meal: "Lunch at the university canteen",
      pass: "Student transport, yearly pass ÷ 12",
    },
    perMonth: "a month",
    official: "Official",
    choose: (c: string) => `Use ${c}`,
    less: (amt: string, c: string) => `${amt} less than ${c}`,
    perYear: "a year",
  },
  ar: {
    title: "براغ أم برنو أم أوسترافا؟",
    lead: "الشهر نفسه، محسوبًا في كل مدينة بالإعدادات التي اخترتها في الحاسبة أعلاه.",
    yourMonth: "شهرك هنا",
    cheapest: "الأقل",
    rows: {
      dormShared: "سرير في سكن جامعي، غرفة مشتركة (المعتاد)",
      dormOwn: "سكن جامعي، غرفة خاصة (المعتاد)",
      flat: "شقة مفروشة بغرفة واحدة خارج المركز",
      meal: "غداء في مطعم الجامعة",
      pass: "مواصلات الطلاب، الاشتراك السنوي ÷ 12",
    },
    perMonth: "في الشهر",
    official: "رسمي",
    choose: (c: string) => `اختر ${c}`,
    less: (amt: string, c: string) => `أقل من ${c} بحوالي ${amt}`,
    perYear: "في السنة",
  },
};

const monthRange = ([lo, hi]: [number, number]) =>
  `${(lo * DORM_NIGHTS_PER_MONTH).toLocaleString("en-US")}–${(hi * DORM_NIGHTS_PER_MONTH).toLocaleString("en-US")}`;

export function CityCompare({ locale, settings, city, onCity }: { locale: Locale; settings: MonthSettings; city: CityKey; onCity: (c: CityKey) => void }) {
  const t = COPY[locale];
  const dorm = dormNightly();
  const raw = Object.fromEntries(cities.map((c) => [c.key, studentMonth(c.key, settings).totalCzk])) as Record<CityKey, number>;
  const totals = Object.fromEntries(cities.map((c) => [c.key, roundEstimate(raw[c.key])])) as Record<CityKey, number>;
  // The difference from the dearest city, to the nearest 10 Kč: two cities can round to the same
  // hundred and still differ, and this says by how much without pretending the totals are exact.
  const dearest = cities.reduce((a, b) => (raw[b.key] > raw[a.key] ? b : a));
  const max = Math.max(...Object.values(totals));
  const min = Math.min(...Object.values(totals));

  return (
    <section id="compare" aria-labelledby="compare-title" className="scroll-mt-32 lg:scroll-mt-36">
      <p className="inline-flex items-center gap-2 rounded-full bg-sky-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-ink">
        <StepNumber n={2} locale={locale} />
        {locale === "ar" ? "مقارنة المدن" : "City comparison"}
      </p>
      <h2 id="compare-title" className="mt-3 text-2xl sm:text-4xl font-bold text-text-primary">{t.title}</h2>
      <p className="mt-3 text-text-secondary">{t.lead}</p>

      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {cities.map((c) => {
          const rent = RENT_MAP.cities[c.key].outside;
          const rows: { label: string; value: string; kind: "official"; range?: string; rangeSuffix?: string }[] = [
            // Typical bed (middle of the official range) with the full range under it, as in the month above.
            { label: t.rows.dormShared, value: iso(fmtCzk(typicalBed(dorm[c.key].double) * DORM_NIGHTS_PER_MONTH)), kind: "official", range: monthRange(dorm[c.key].double) },
            { label: t.rows.dormOwn, value: iso(fmtCzk(typicalBed(dorm[c.key].single) * DORM_NIGHTS_PER_MONTH)), kind: "official", range: monthRange(dorm[c.key].single) },
            {
              label: t.rows.flat,
              value: iso(fmtCzk(roundEstimate(flatRent(c.key, "outside")))),
              kind: "official",
              range: `${flatRent(c.key, "outside", rent.lowest).toLocaleString("en-US")}–${flatRent(c.key, "outside", rent.highest).toLocaleString("en-US")}`,
            },
            { label: t.rows.meal, value: iso(fmtCzk(CANTEEN_MEAL[c.key].mealCzk)), kind: "official" },
            { label: t.rows.pass, value: iso(fmtCzk(transportMonthly(c.key))), kind: "official", range: `${STUDENT_TRANSPORT[c.key].yearlyCzk.toLocaleString("en-US")} CZK`, rangeSuffix: t.perYear },
          ];
          const active = c.key === city;
          return (
            <li key={c.key} className={cn("overflow-hidden rounded-3xl border bg-surface", active ? "border-brand ring-2 ring-brand/25" : "border-border-subtle")}>
              <div className="relative h-36">
                <SiteImage id={CITY_PHOTO[c.key]} sizes="(max-width: 768px) 100vw, 400px" whenNear />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h3 className="text-2xl font-bold text-white">{c.label[locale]}</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-medium text-text-muted">{t.yourMonth}</p>
                <p className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-text-primary tabular-nums" dir="ltr">≈ {fmtCzk(totals[c.key])}</span>
                  {totals[c.key] === min && <span className="rounded-full bg-teal-soft px-2 py-0.5 text-[11px] font-semibold text-teal-ink">{t.cheapest}</span>}
                </p>
                {c.key !== dearest.key && (
                  <p className="text-xs font-semibold text-teal-ink">
                    {t.less(iso(fmtCzk(Math.max(10, Math.round((raw[dearest.key] - raw[c.key]) / 10) * 10))), dearest.label[locale])}
                  </p>
                )}
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-bg-muted" aria-hidden="true">
                  <div className="grow-x h-full rounded-full bg-[var(--viz-1)]" style={{ transform: `scaleX(${totals[c.key] / max})` }} />
                </div>
                <dl className="mt-4 space-y-2.5 text-sm">
                  {rows.map((r) => (
                    <div key={r.label} className="flex items-start justify-between gap-3">
                      <dt className="text-text-secondary">
                        {r.label}
                        <span className="ms-1.5 align-middle"><BasisTag kind={r.kind}>{t.official}</BasisTag></span>
                      </dt>
                      <dd className="text-end">
                        <span className="block font-semibold text-text-primary tabular-nums whitespace-nowrap">{r.value}</span>
                        {r.range && (
                          <span className="block whitespace-nowrap text-[11px] text-text-muted tabular-nums">
                            <bdi dir="ltr">{r.range}</bdi>
                            {r.rangeSuffix && ` ${r.rangeSuffix}`}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
                {!active && (
                  <button type="button" onClick={() => onCity(c.key)} className="mt-4 min-h-10 w-full rounded-lg border border-border-subtle text-sm font-semibold text-text-secondary hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-brand">
                    {t.choose(c.label[locale])}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
