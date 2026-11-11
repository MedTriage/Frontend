"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatValue,
  latestByKind,
  niceTicks,
  parseDay,
  previousLine,
  seriesFor,
  shortDay,
  timeTicks,
  type Reading,
  type ReadingKind,
} from "../../lib/dashboard";

export type ChartKind = Exclude<ReadingKind, "height">;

export const CHART_TABS: { kind: ChartKind; label: string; unit: string }[] = [
  { kind: "weight", label: "Weight", unit: "kg" },
  { kind: "blood_pressure", label: "Blood pressure", unit: "mmHg" },
  { kind: "pulse", label: "Pulse", unit: "bpm" },
];

const RANGES: { label: string; days: number | null }[] = [
  { label: "3 months", days: 90 },
  { label: "1 year", days: 365 },
  { label: "All", days: null },
];

const MARGIN = { left: 38, right: 18, top: 22, bottom: 26 };

/* Straight lines between real readings with every reading marked. The reference's smooth curve
   would draw values nobody measured, and readings here are days or weeks apart. */
export function HealthChart({
  readings,
  kind,
  onKind,
  today,
}: {
  readings: Reading[] | null;
  kind: ChartKind;
  onKind: (kind: ChartKind) => void;
  today: Date;
}) {
  const [days, setDays] = useState<number | null>(365);
  const [active, setActive] = useState<number | null>(null);
  // Measured, so the type stays one size at every width. Nothing is drawn until then: a guessed
  // width would stretch the page before the first measurement corrects it.
  const [width, setWidth] = useState(0);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const tab = CHART_TABS.find((t) => t.kind === kind)!;
  const all = readings ?? [];
  const series = seriesFor(all, kind, days, today);
  const latest = latestByKind(all)[kind];
  const previous = previousLine(all, kind);
  const twoLines = kind === "blood_pressure";

  const HEIGHT = width > 0 && width < 460 ? 190 : 268;
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 40);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const values = series.flatMap((p) => (p.value2 === null ? [p.value] : [p.value, p.value2]));
  const ticks = values.length > 0 ? niceTicks(Math.min(...values), Math.max(...values)) : [];
  const yMin = ticks[0] ?? 0;
  const yMax = ticks.at(-1) ?? 1;
  const start = series[0]?.at ?? 0;
  const end = series.at(-1)?.at ?? 0;
  const single = start === end;

  const x = (at: number) => (single ? MARGIN.left + plotWidth / 2 : MARGIN.left + ((at - start) / (end - start)) * plotWidth);
  const y = (v: number) => MARGIN.top + (1 - (v - yMin) / (yMax - yMin)) * plotHeight;
  const xTicks = series.length > 0 ? timeTicks(start, end, width < 460 ? 3 : 5) : [];

  const line = series.map((p) => `${x(p.at)},${y(p.value)}`).join(" ");
  const lowerLine = twoLines ? series.map((p) => `${x(p.at)},${y(p.value2 ?? p.value)}`).join(" ") : "";
  const baseline = MARGIN.top + plotHeight;
  const area = series.length > 1 ? `${x(start)},${baseline} ${line} ${x(end)},${baseline}` : "";

  const nearest = (clientX: number, left: number) => {
    if (series.length === 0) return;
    const at = clientX - left;
    let best = 0;
    series.forEach((p, i) => {
      if (Math.abs(x(p.at) - at) < Math.abs(x(series[best].at) - at)) best = i;
    });
    setActive(best);
  };

  const shown = active !== null ? series[active] : undefined;
  const last = series.at(-1);
  // Beside the last point, on whichever side the line isn't coming from.
  const before = series.at(-2);
  const lastLabelY = last && (before && before.value > last.value && !twoLines ? y(last.value) + 20 : y(last.value) - 10);
  const rangeWords = days === null ? "" : days === 90 ? " in the last 3 months" : " in the last year";

  return (
    <section aria-labelledby="chart-title" className="bg-card border border-border rounded-2xl p-5">
      <h2 id="chart-title" className="sr-only">Your readings over time</h2>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div role="group" aria-label="Reading on the chart" className="flex flex-wrap gap-x-4 gap-y-1">
          {CHART_TABS.map((t) => {
            const on = t.kind === kind;
            return (
              <button
                key={t.kind}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  onKind(t.kind);
                  setActive(null);
                }}
                className={`flex items-center gap-2 text-[15px] sm:text-[17px] tracking-[-0.01em] transition-colors ${
                  on ? "font-medium text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                {on && <span aria-hidden className="w-[7px] h-[7px] rounded-full bg-t1" />}
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex rounded-full bg-background p-0.5" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              aria-pressed={days === r.days}
              onClick={() => {
                setDays(r.days);
                setActive(null);
              }}
              className={`h-7 px-3 rounded-full text-[12px] transition-colors ${
                days === r.days ? "bg-card font-medium border border-border" : "text-muted hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-[13px] text-muted">
          {latest
            ? `Latest ${formatValue(latest)} ${latest.unit} on ${shortDay(parseDay(latest.measured_on))}.${previous ? ` ${previous}.` : ""}`
            : readings === null
              ? " "
              : `No ${tab.label.toLowerCase()} recorded yet.`}
        </p>
        {twoLines && series.length > 0 && (
          <ul className="flex gap-3.5 text-[12px] text-muted" aria-label="Lines">
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="w-2 h-2 rounded-full bg-chart-1" />
              Upper number
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="w-2 h-2 bg-chart-2" />
              Lower number
            </li>
          </ul>
        )}
      </div>

      <div ref={frame} className="relative mt-2 w-full min-w-0" style={{ minHeight: HEIGHT }}>
        {width === 0 ? null : series.length === 0 ? (
          <div style={{ height: HEIGHT }} className="rounded-xl border border-dashed border-border flex items-center justify-center px-6 text-center">
            <p className="text-[13px] text-muted leading-relaxed">
              {all.some((r) => r.kind === kind)
                ? `No ${tab.label.toLowerCase()} readings${rangeWords}. Try a longer range.`
                : `Your ${tab.label.toLowerCase()} over time appears here once you add a reading below.`}
            </p>
          </div>
        ) : (
          <>
            <svg
              width={width}
              height={HEIGHT}
              role="img"
              tabIndex={0}
              aria-label={`${tab.label}, ${series.length} ${series.length === 1 ? "reading" : "readings"}${rangeWords}. Use the left and right arrow keys to read each one.`}
              className="block outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 rounded-lg touch-pan-y"
              onPointerMove={(e) => nearest(e.clientX, e.currentTarget.getBoundingClientRect().left)}
              onPointerDown={(e) => nearest(e.clientX, e.currentTarget.getBoundingClientRect().left)}
              onPointerLeave={() => setActive(null)}
              onBlur={() => setActive(null)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                e.preventDefault();
                const step = e.key === "ArrowLeft" ? -1 : 1;
                setActive((current) => {
                  const from = current ?? (step > 0 ? -1 : series.length);
                  return Math.max(0, Math.min(series.length - 1, from + step));
                });
              }}
            >
              {ticks.map((t) => (
                <g key={t}>
                  <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth={1} />
                  <text x={MARGIN.left - 8} y={y(t) + 3.5} textAnchor="end" fontSize={11} fill="var(--muted)" className="data">
                    {t}
                  </text>
                </g>
              ))}
              {xTicks.map((t, i) => (
                <text
                  key={t.at}
                  x={x(t.at)}
                  y={HEIGHT - 8}
                  fontSize={11}
                  fill="var(--muted)"
                  className="data"
                  textAnchor={single ? "middle" : i === 0 ? "start" : i === xTicks.length - 1 && x(t.at) > width - 60 ? "end" : "middle"}
                >
                  {t.label}
                </text>
              ))}

              {!twoLines && area && <polygon points={area} fill="var(--chart-1)" opacity={0.12} />}
              {series.length > 1 && (
                <polyline points={line} fill="none" stroke="var(--chart-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              )}
              {twoLines && series.length > 1 && (
                <polyline points={lowerLine} fill="none" stroke="var(--chart-2)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              )}

              {shown && (
                <line x1={x(shown.at)} x2={x(shown.at)} y1={MARGIN.top} y2={baseline} stroke="var(--muted)" strokeWidth={1} strokeDasharray="3 3" />
              )}

              {series.map((p, i) => (
                <g key={p.day + i}>
                  <circle
                    cx={x(p.at)}
                    cy={y(p.value)}
                    r={active === i ? 5.5 : 4}
                    fill="var(--chart-1)"
                    stroke="var(--card)"
                    strokeWidth={2}
                  />
                  {twoLines && p.value2 !== null && (
                    <rect
                      x={x(p.at) - (active === i ? 5 : 4)}
                      y={y(p.value2) - (active === i ? 5 : 4)}
                      width={active === i ? 10 : 8}
                      height={active === i ? 10 : 8}
                      fill="var(--chart-2)"
                      stroke="var(--card)"
                      strokeWidth={2}
                    />
                  )}
                </g>
              ))}

              {/* The latest value, named directly so it can be read without hovering. */}
              {last && active === null && (
                <>
                  <text
                    x={x(last.at)}
                    y={lastLabelY}
                    textAnchor={x(last.at) > width - 40 ? "end" : "middle"}
                    fontSize={12}
                    fontWeight={600}
                    fill="var(--foreground)"
                    className="data"
                  >
                    {last.value}
                  </text>
                  {twoLines && last.value2 !== null && (
                    <text
                      x={x(last.at)}
                      y={y(last.value2) + 19}
                      textAnchor={x(last.at) > width - 40 ? "end" : "middle"}
                      fontSize={12}
                      fontWeight={600}
                      fill="var(--foreground)"
                      className="data"
                    >
                      {last.value2}
                    </text>
                  )}
                </>
              )}
            </svg>

            {shown && (
              <div
                role="status"
                className="absolute top-0 pointer-events-none bg-foreground text-background rounded-lg px-3 py-2 shadow-[var(--shadow-1)] whitespace-nowrap"
                style={{ left: Math.max(0, Math.min(x(shown.at) - 60, width - 136)) }}
              >
                <p className="text-[11px] opacity-80">{shortDay(new Date(shown.at))} {new Date(shown.at).getFullYear()}</p>
                <p className="text-[14px] font-medium">
                  {formatValue(shown)} {tab.unit}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* The same readings as a table, for anyone who can't use the chart. */}
      {series.length > 0 && (
        <table className="sr-only">
          <caption>{tab.label} readings</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Value ({tab.unit})</th>
            </tr>
          </thead>
          <tbody>
            {series.map((p, i) => (
              <tr key={p.day + i}>
                <td>{p.day}</td>
                <td>{formatValue(p)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
