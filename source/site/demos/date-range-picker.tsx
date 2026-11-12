import { useMemo, useState } from "react";
import DateRangePicker, { type DateRange } from "@/registry/components/date-range-picker/date-range-picker";
import { Caption, demoStage } from "./_kit";
import styles from "./date-range-picker.module.css";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const day = (t: Date, offset = 0) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + offset);

export default function DateRangePickerDemo() {
  // The preview opens on load with the last 7 days selected, so the stretching range highlight is visible at once.
  // The panel is bound to the stage, not the window: at any stage width it opens whole, beside its trigger.
  const preset = useMemo(() => {
    const today = new Date();
    return { start: day(today, -6), end: day(today) };
  }, []);
  const [range, setRange] = useState<DateRange | null>(preset);
  const days = range ? Math.round((day(range.end).getTime() - day(range.start).getTime()) / 86400000) + 1 : 0;
  return (
    <div className={styles.box}>
      <div className={styles.room}>
        <DateRangePicker label="Reporting period" value={range} onChange={setRange} placeholder="Select dates" defaultOpen boundary={demoStage}
          presets={[
            { label: "Last 7 days", range: t => ({ start: day(t, -6), end: day(t) }) },
            { label: "Last 30 days", range: t => ({ start: day(t, -29), end: day(t) }) },
            { label: "This month", range: t => ({ start: new Date(t.getFullYear(), t.getMonth(), 1), end: day(t) }) },
            { label: "Last month", range: t => ({ start: new Date(t.getFullYear(), t.getMonth() - 1, 1), end: new Date(t.getFullYear(), t.getMonth(), 0) }) },
            { label: "This quarter", range: t => ({ start: new Date(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3, 1), end: day(t) }) },
            { label: "Year to date", range: t => ({ start: new Date(t.getFullYear(), 0, 1), end: day(t) }) },
          ]} />
      </div>
      <Caption>{days ? `${days} days selected. Pick a preset or two days, then Apply.` : "No dates selected."}</Caption>
    </div>
  );
}
