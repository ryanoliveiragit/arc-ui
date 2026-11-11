var e=`import { useMemo, useState } from "react";
import LiquidityHeatmap from "@/registry/components/liquidity-heatmap/liquidity-heatmap";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

/** Small seeded generator: the same seed always draws the same book, so the demo never changes between visits. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

const COLS = 48, ROWS = 24;

/** Four hours of resting orders in five-minute buckets: a wandering price, a thin background and a few large walls that vanish once the price trades through them. */
function book(seed: number, mid: number, tick: number, depth: number) {
  const rand = seeded(seed);
  const prices = Array.from({ length: ROWS }, (_, row) => mid + (row - ROWS / 2) * tick);
  const times = Array.from({ length: COLS }, (_, col) => { const minutes = 9 * 60 + col * 5; return \`\${String(Math.floor(minutes / 60)).padStart(2, "0")}:\${String(minutes % 60).padStart(2, "0")}\`; });
  const rows: number[] = [];
  let level = ROWS / 2 - 3;
  for (let col = 0; col < COLS; col++) {
    const trend = Math.sin(col / 7.5 + seed) * .55 + .12;
    level = Math.min(ROWS - 4, Math.max(3, level + trend + (rand() - .5) * 1.5));
    rows.push(level);
  }
  const walls = Array.from({ length: 7 }, () => ({ row: 1 + Math.floor(rand() * (ROWS - 2)), from: Math.floor(rand() * 26), length: 12 + Math.floor(rand() * 26), size: depth * (.5 + rand() * .5) }));
  const values = Array.from({ length: COLS }, (_, col) => Array.from({ length: ROWS }, (_, row) => {
    const distance = Math.abs(row - rows[col]!);
    if (distance < .8) return 0;
    let size = depth * (.01 + rand() * .15) * Math.min(1, distance / 5);
    for (const wall of walls) {
      if (wall.row !== row || col < wall.from || col >= wall.from + wall.length) continue;
      const traded = rows.slice(wall.from, col + 1).some((at, index, list) => index > 0 && (at - row) * (list[index - 1]! - row) <= 0);
      if (!traded) size += wall.size * Math.min(1, (col - wall.from + 1) / 3) * (.85 + rand() * .15);
    }
    return Math.round(size * 10) / 10;
  }));
  return { times, prices, values, path: rows.map(row => Math.round((mid + (row - ROWS / 2) * tick) * 10) / 10) };
}

const markets = {
  btc: { name: "BTC-USD", unit: "BTC", ...book(11, 64_200, 25, 180) },
  eth: { name: "ETH-USD", unit: "ETH", ...book(29, 3_420, 2, 2400) },
};

export default function LiquidityHeatmapDemo() {
  const [market, setMarket] = useState<keyof typeof markets>("btc");
  const [cell, setCell] = useState<{ time: string; price: number; value: number } | null>(null);
  const data = markets[market];
  const largest = useMemo(() => {
    let best = { value: 0, price: 0, time: "" };
    data.values.forEach((column, col) => column.forEach((value, row) => { if (value > best.value) best = { value, price: data.prices[row]!, time: data.times[col]! }; }));
    return best;
  }, [data]);

  return (
    <Stack gap={4} width={720}>
      <SegmentedControl label="Market" value={market} onValueChange={value => setMarket(value as keyof typeof markets)}
        options={[{ value: "btc", label: "BTC-USD" }, { value: "eth", label: "ETH-USD" }]} />
      <Surface>
        <LiquidityHeatmap label={\`\${data.name} resting liquidity, 09:00 to 13:00\`} times={data.times} prices={data.prices} values={data.values} path={data.path} unit={data.unit} onCellChange={setCell} />
      </Surface>
      <Caption>
        {cell
          ? \`\${cell.value.toLocaleString("en-US")} \${data.unit} waiting at \${cell.price.toLocaleString("en-US")} at \${cell.time}.\`
          : \`Largest wall: \${largest.value.toLocaleString("en-US")} \${data.unit} at \${largest.price.toLocaleString("en-US")}, \${largest.time}. Move over the grid or focus it and use the arrow keys.\`}
      </Caption>
    </Stack>
  );
}
`;export{e as default};