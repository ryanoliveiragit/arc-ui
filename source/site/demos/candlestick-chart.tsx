import { useState } from "react";
import CandlestickChart, { type Candle } from "@/registry/components/candlestick-chart/candlestick-chart";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface, type DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

const long = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const short = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** A small seeded generator, so the sample prices are the same on every load. */
function seeded(seed: number) {
  let state = seed;
  return () => { state = (state * 1664525 + 1013904223) % 4294967296; return state / 4294967296; };
}

/** Sixty-six trading sessions ending Tue, Nov 10, 2026, walked from a fixed seed. */
function sessions(total: number): Candle[] {
  const next = seeded(2026), days: Date[] = [];
  for (let date = new Date(Date.UTC(2026, 10, 10)); days.length < total; date = new Date(date.getTime() - 86400000)) {
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) days.unshift(date);
  }
  let price = 162.4;
  return days.map((date, at) => {
    const open = price + (next() - .5) * 1.2;
    const drift = Math.sin(at / 9) * .9 + .18;
    const close = open + drift + (next() - .5) * 5.4;
    const high = Math.max(open, close) + next() * 2.2 + .15;
    const low = Math.min(open, close) - next() * 2.2 - .15;
    price = close;
    const round = (value: number) => Math.round(value * 100) / 100;
    return { key: date.toISOString().slice(0, 10), label: long.format(date), axisLabel: date.getUTCDay() === 1 ? short.format(date) : undefined, open: round(open), high: round(high), low: round(low), close: round(close), volume: Math.round((1.8 + next() * 2.6 + Math.abs(close - open) * .35) * 1e6) };
  });
}

const quarter = sessions(66);
const month = quarter.slice(-22);

export default function CandlestickChartDemo() {
  const [range, setRange] = useState("1m");
  return (
    <Stack gap={4} width={600}>
      <SegmentedControl label="Range" value={range} onValueChange={setRange} options={[{ value: "1m", label: "1 month" }, { value: "3m", label: "3 months" }]} />
      <Surface>
        <CandlestickChart data={range === "1m" ? month : quarter} label="Northwind Corp. (NWC)" period={range === "1m" ? "past month" : "past 3 months"} formatValue={(value) => `$${value.toFixed(2)}`} />
      </Surface>
      <Caption>Move across the plot for the crosshair and each session's open, high, low and close. The arrow keys step one candle at a time.</Caption>
    </Stack>
  );
}
