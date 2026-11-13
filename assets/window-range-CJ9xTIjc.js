var e=`import { useMemo, useState, type CSSProperties } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { WindowRange, type WindowRangeTick } from "@/registry/components/window-range/window-range";
import { Stack, Surface } from "./_kit";
import styles from "./window-range.module.css";

const DAY = 86_400_000;
const FIRST = Date.UTC(2026, 3, 1); // Apr 1, 2026 — 182 daily points through Sep 29
const LAST = 181;
const dayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const numFmt = new Intl.NumberFormat("en-US");

/** Deterministic series: LCG noise with a late-August spike, then the two 30-day blocks are scaled so the
    headline reads exactly like the reference — 104,263 visits, +6.6% over the previous 30 days. */
function buildVisits(): number[] {
  let s = 20260401;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const raw = new Array<number>(LAST + 1);
  for (let i = 0; i <= LAST; i++) {
    const drift = 1 + (i / LAST) * 0.35;
    const wave = 1 + 0.16 * Math.sin(i / 2.7) + 0.1 * Math.sin(i / 11.3);
    let v = 3100 * drift * wave + (rand() - 0.5) * 2400;
    const d = Math.abs(i - 104);
    if (d < 10) v *= 1 + Math.exp(-d / 2.6) * 2.4;
    raw[i] = Math.max(450, v);
  }
  const sum = (lo: number, hi: number) => { let t = 0; for (let i = lo; i <= hi; i++) t += raw[i]!; return t; };
  const f0 = 97808 / sum(122, 151);
  const f1 = 104263 / sum(152, LAST);
  for (let i = 122; i <= LAST; i++) raw[i]! *= f0 + ((f1 - f0) * (i - 122)) / 59;
  const fix = (lo: number, hi: number, target: number) => {
    const delta = (target - sum(lo, hi)) / (hi - lo + 1);
    for (let i = lo; i <= hi; i++) raw[i]! += delta;
  };
  fix(122, 151, 97808);
  fix(152, LAST, 104263);
  return raw;
}

const PRESETS = [{ days: 7, label: "7d" }, { days: 30, label: "30d" }, { days: 90, label: "90d" }];
const TICKS: WindowRangeTick[] = [
  { value: 30, label: "May" },
  { value: 61, label: "Jun" },
  { value: 91, label: "Jul" },
  { value: 122, label: "Aug" },
  { value: 153, label: "Sep" },
];

export default function WindowRangeDemo(_props?: { variant?: string }) {
  const visits = useMemo(buildVisits, []);
  const [range, setRange] = useState<[number, number]>([LAST - 29, LAST]);
  const [s, e] = range;
  const days = e - s + 1;

  const total = useMemo(() => { let t = 0; for (let i = s; i <= e; i++) t += visits[i]!; return Math.round(t); }, [visits, s, e]);
  const prevTotal = useMemo(() => {
    const lo = s - days;
    if (lo < 0) return null;
    let t = 0; for (let i = lo; i < s; i++) t += visits[i]!;
    return Math.round(t);
  }, [visits, s, days]);
  const delta = prevTotal ? ((total - prevTotal) / prevTotal) * 100 : null;

  return (
    <Stack gap={4} width={480}>
      <Surface padding={5} style={{ "--series-1": "var(--tone-sky)" } as CSSProperties}>
        <div className={styles.head}>
          <div>
            <span className={styles.label}>Visitors</span>
            <strong className={styles.total}>{numFmt.format(total)}</strong>
            <span className={styles.deltaRow}>
              {delta !== null && (delta >= 0 ? <TrendingUp size={14} strokeWidth={2.5} /> : <TrendingDown size={14} strokeWidth={2.5} />)}
              <b className={\`\${styles.pct}\${delta !== null && delta < 0 ? \` \${styles.down}\` : ""}\`}>
                {delta === null ? "—" : \`\${delta >= 0 ? "+" : ""}\${delta.toFixed(1)}%\`}
              </b>
              <span className={styles.vs}>vs previous {days} days</span>
            </span>
          </div>
          <div className={styles.presets} role="group" aria-label="Report window">
            {PRESETS.map(preset => {
              const on = e === LAST && s === LAST - preset.days + 1;
              return (
                <button key={preset.days} type="button" className={\`\${styles.preset}\${on ? \` \${styles.presetOn}\` : ""}\`} aria-pressed={on} onClick={() => setRange([LAST - preset.days + 1, LAST])}>
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.chartGap}>
          <WindowRange
            label="Report dates"
            data={visits}
            value={range}
            onValueChange={setRange}
            minSpan={6}
            height={168}
            live
            format={index => dayFmt.format(FIRST + index * DAY)}
            formatSpan={span => \`\${span + 1} days\`}
            ticks={TICKS}
          />
        </div>
      </Surface>
    </Stack>
  );
}
`;export{e as default};