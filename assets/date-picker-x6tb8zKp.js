var e=`import { useState } from "react";
import { DatePicker } from "@/registry/components/date-picker/date-picker";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

export default function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Stack gap={3} width={320}>
      <DatePicker label="Delivery date" description="Pick a weekday." value={date} onChange={setDate} showToday minDate={new Date()} disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6} />
      <Caption>{date ? \`Arriving \${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.\` : "No date chosen yet."}</Caption>
    </Stack>
  );
}
`;export{e as default};