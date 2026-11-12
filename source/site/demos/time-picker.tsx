import { useState } from "react";
import { TimePicker } from "@/registry/components/time-picker/time-picker";
import { Caption, Room, Row, Stack } from "./_kit";

export default function TimePickerDemo() {
  const [time, setTime] = useState("14:30");
  // The first picker opens with the list centered on its time, so the preview shows the list, not just two buttons.
  // The caption sits under the second picker, clear of the open list.
  return (
    <Room below={200}>
      <Row gap={4} align="start" justify="center">
        <TimePicker label="Meeting starts" value={time} onChange={setTime} defaultOpen />
        <Stack gap={3}>
          <TimePicker label="Reminder (24h)" format="24h" minuteStep={5} defaultValue="08:45" />
          <Caption>Stored value: {time}</Caption>
        </Stack>
      </Row>
    </Room>
  );
}
