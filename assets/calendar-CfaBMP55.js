var e=`import { useState } from "react";
import { Calendar, addDays, startOfDay } from "@/registry/components/calendar/calendar";
import { Caption, Stack } from "./_kit";

export default function CalendarDemo() {
  const today = startOfDay(new Date());
  const [value, setValue] = useState<Date>(addDays(today, 3));
  return (
    <Stack gap={4} align="center">
      <Calendar
        value={value}
        onChange={setValue}
        showToday
        disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
      />
      <Caption>Selected: {value.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}. Weekends are unavailable.</Caption>
    </Stack>
  );
}
`;export{e as default};