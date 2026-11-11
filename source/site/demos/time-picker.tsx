import { useState } from "react";
import { TimePicker } from "@/registry/components/time-picker/time-picker";
import { Caption, Row, Stack } from "./_kit";

export default function TimePickerDemo() {
  const [time, setTime] = useState("14:30");
  return (
    <Stack width={420} gap={4}>
      <Row gap={4} align="start">
        <TimePicker label="Meeting starts" value={time} onChange={setTime} description="15 minute steps" />
        <TimePicker label="Reminder (24h)" format="24h" minuteStep={5} defaultValue="08:45" />
      </Row>
      <Caption>Stored value: {time}</Caption>
    </Stack>
  );
}
