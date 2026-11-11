import { useMemo, useState } from "react";
import PriceTargetFan, { type PricePoint, type PriceTargetKey, type PriceTargets } from "@/registry/components/price-target-fan/price-target-fan";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

/** Small seeded generator: the same seed always draws the same history, so the demo never changes between visits. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

/** Eighteen months of weekly closes ending November 10, 2026, walking from `from` to `to` with some weather on the way. */
function closes(seed: number, from: number, to: number, swing: number): PricePoint[] {
  const rand = seeded(seed);
  const weeks = 78;
  const last = Date.UTC(2026, 10, 10);
  let drift = 0;
  return Array.from({ length: weeks }, (_, index) => {
    const progress = index / (weeks - 1);
    drift = (drift + (rand() - 0.5) * swing) * 0.9;
    const wave = Math.sin(progress * Math.PI * 3 + seed) * swing * 0.9 * Math.sin(progress * Math.PI);
    const value = from + (to - from) * progress + (drift + wave) * (1 - progress ** 6);
    return { date: new Date(last - (weeks - 1 - index) * 7 * 86_400_000).toISOString().slice(0, 10), value: Math.round(value * 100) / 100 };
  });
}

const companies: Record<string, { name: string; analysts: number; history: PricePoint[]; targets: PriceTargets }> = {
  nwd: { name: "Northwind Robotics", analysts: 34, history: closes(5, 118, 197.2, 16), targets: { high: 262, median: 228, low: 168 } },
  hlx: { name: "Helix Biologics", analysts: 19, history: closes(17, 92, 64.4, 9), targets: { high: 96, median: 71, low: 48 } },
};

const notes: Record<PriceTargetKey, string> = {
  high: "The most optimistic desk assumes the new product line ships on time and margins keep widening.",
  median: "Half of the covering analysts sit above this price and half below.",
  low: "The most cautious desk expects slower demand and a lower multiple.",
};

export default function PriceTargetFanDemo() {
  const [ticker, setTicker] = useState("nwd");
  const [target, setTarget] = useState<PriceTargetKey | null>(null);
  const company = companies[ticker]!;
  const label = useMemo(() => `${company.name} weekly closes and 12-month analyst targets`, [company]);

  return (
    <Stack gap={4} width={680}>
      <SegmentedControl label="Company" value={ticker} onValueChange={setTicker} options={[{ value: "nwd", label: "Northwind" }, { value: "hlx", label: "Helix" }]} />
      <Surface>
        <PriceTargetFan label={label} history={company.history} targets={company.targets} targetDate="2027-11-10" activeTarget={target} onActiveTargetChange={setTarget} />
      </Surface>
      <Caption>
        {target ? notes[target] : `${company.name}, weekly closes with targets from ${company.analysts} analysts. Hover a target to bring it forward, click to keep it, or scrub the history.`}
      </Caption>
    </Stack>
  );
}
