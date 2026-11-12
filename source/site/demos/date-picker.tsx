import { useState } from "react";
import { DatePicker } from "@/registry/components/date-picker/date-picker";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 600 };

export default function DatePickerDemo() {
  // The preview opens the calendar on load (focus stays on the page). The space below the field is reserved for it,
  // so the open calendar never covers the caption nor touches the stage edge.
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Stack gap={3} width={320}>
      <div style={{ paddingBottom: 412 }}>
        <DatePicker label="Delivery date" value={date} onChange={setDate} showToday defaultOpen minDate={new Date()} disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6} />
      </div>
      <Caption>{date ? `Arriving ${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.` : "Weekends are unavailable. Pick a weekday."}</Caption>
    </Stack>
  );
}
