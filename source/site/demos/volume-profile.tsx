import { useState } from "react";
import VolumeProfile, { type VolumePoint } from "@/registry/components/volume-profile/volume-profile";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface, type DemoStage } from "./_kit";

export const stage: DemoStage = { height: 580 };

const stamp = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" });
const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", timeZone: "UTC" });
const dayName = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** A small seeded generator, so the sample trades are the same on every load. */
function seeded(seed: number) {
  let state = seed;
  return () => { state = (state * 1664525 + 1013904223) % 4294967296; return state / 4294967296; };
}

/** One session from 9:30 in equal steps. The price is pulled back toward an anchor, and volume is heavier at the open and the close. */
function session(next: () => number, day: number, start: number, anchor: number, points: number, minutes: number, swing: number, hourMarks: boolean): VolumePoint[] {
  let price = start;
  return Array.from({ length: points }, (_, at) => {
    const time = new Date(Date.UTC(2026, 10, day, 9, 30 + at * minutes));
    price += (anchor - price) * .09 + (next() - .5) * swing;
    const edge = Math.abs(at / (points - 1) - .5) * 2;
    const firstOfDay = at === 0;
    return {
      key: time.toISOString(),
      label: stamp.format(time),
      axisLabel: hourMarks ? (time.getUTCMinutes() === 0 && time.getUTCHours() % 2 === 0 ? clock.format(time) : undefined) : firstOfDay ? dayName.format(time) : undefined,
      price: Math.round(price * 100) / 100,
      volume: Math.round((38000 + edge * edge * 64000) * (.6 + next() * .8) * (minutes / 5)),
    };
  });
}

const todayRandom = seeded(77);
const today = session(todayRandom, 10, 196.9, 198.7, 78, 5, 1.1, true);
const daysRandom = seeded(41);
const threeDays = [
  ...session(daysRandom, 6, 191.6, 193.4, 26, 15, 1.7, false),
  ...session(daysRandom, 9, 194.2, 196.3, 26, 15, 1.7, false),
  ...session(daysRandom, 10, 196.9, 198.7, 26, 15, 1.7, false),
];

export default function VolumeProfileDemo() {
  const [range, setRange] = useState("today");
  return (
    <Stack gap={4} width={600}>
      <SegmentedControl label="Range" value={range} onValueChange={setRange} options={[{ value: "today", label: "Today" }, { value: "days", label: "3 sessions" }]} />
      <Surface>
        <VolumeProfile data={range === "today" ? today : threeDays} label="Northwind Corp. (NWC)" formatPrice={(value) => `$${value.toFixed(2)}`} />
      </Surface>
      <Caption>Each bar is the volume traded at that price. The brightest bar is the point of control; hover a level or use the arrow keys to read it.</Caption>
    </Stack>
  );
}
