import { useMemo, useState } from "react";
import ReturnsCalendar, { type DailyReturn } from "@/registry/components/returns-calendar/returns-calendar";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

/** Small seeded generator: the same seed always draws the same year, so the demo never changes between visits. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

const HOLIDAYS = new Set(["2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19", "2026-07-03", "2026-09-07"]);
/** Average daily drift of each month in percent: a soft spring, a rally into summer, a wobble in autumn. */
const DRIFT = [0.09, 0.02, -0.16, 0.06, 0.2, 0.08, 0.12, -0.05, -0.12, 0.14, 0.05];

/** Trading days from January 2 to November 10, 2026, weekends and market holidays left out. */
function year(): DailyReturn[] {
  const rand = seeded(41);
  const days: DailyReturn[] = [];
  for (let time = Date.UTC(2026, 0, 1); time <= Date.UTC(2026, 10, 10); time += 86_400_000) {
    const date = new Date(time);
    const iso = date.toISOString().slice(0, 10);
    if (date.getUTCDay() === 0 || date.getUTCDay() === 6 || HOLIDAYS.has(iso)) continue;
    const noise = (rand() + rand() + rand() - 1.5) * 1.5;
    const shock = rand() > 0.95 ? (rand() - 0.45) * 4 : 0;
    days.push({ date: iso, value: Math.round((DRIFT[date.getUTCMonth()]! + noise + shock) * 100) / 100 });
  }
  return days;
}

const percent = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero" });
const dayLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

export default function ReturnsCalendarDemo() {
  const [half, setHalf] = useState("h1");
  const [selected, setSelected] = useState<string | null>(null);
  const all = useMemo(year, []);
  const returns = useMemo(() => all.filter(day => (day.date < "2026-07-01") === (half === "h1")), [all, half]);
  const picked = returns.find(day => day.date === selected);

  return (
    <Stack gap={4} width={600}>
      <SegmentedControl label="Period" value={half} onValueChange={value => { setHalf(value); setSelected(null); }}
        options={[{ value: "h1", label: "First half" }, { value: "h2", label: "Second half to date" }]} />
      <Surface>
        <ReturnsCalendar label={`Daily returns of the Core Growth portfolio, ${half === "h1" ? "January to June" : "July to November"} 2026`} returns={returns} selectedDate={selected} onSelectDate={setSelected} />
      </Surface>
      <Caption>
        {picked
          ? `${dayLabel.format(new Date(`${picked.date}T00:00:00Z`))}: the portfolio closed ${percent.format(picked.value)}%.`
          : "Core Growth portfolio, daily close to close. Hover a day, walk the calendar with the arrow keys, or click a day to pin it."}
      </Caption>
    </Stack>
  );
}
