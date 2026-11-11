import { useState } from "react";
import { WheelPicker } from "@/registry/components/wheel-picker/wheel-picker";
import type { WheelColumn, WheelValue } from "@/registry/components/wheel-picker/wheel-picker";
import { Caption, Row, Stack } from "./_kit";

const two = (value: number) => String(value).padStart(2, "0");

const time: WheelColumn[] = [
  { id: "hour", label: "Hour", options: Array.from({ length: 12 }, (_, index) => ({ value: String(index + 1) })), suffix: ":", align: "end" },
  { id: "minute", label: "Minute", options: Array.from({ length: 12 }, (_, index) => ({ value: two(index * 5) })) },
  { id: "period", label: "AM or PM", options: [{ value: "AM" }, { value: "PM" }] },
];

const delivery: WheelColumn[] = [
  {
    id: "day",
    label: "Delivery day",
    options: [
      { value: "mon", label: "Mon, Nov 16" },
      { value: "tue", label: "Tue, Nov 17", disabled: true },
      { value: "wed", label: "Wed, Nov 18" },
      { value: "thu", label: "Thu, Nov 19" },
      { value: "fri", label: "Fri, Nov 20", disabled: true },
      { value: "sat", label: "Sat, Nov 21" },
      { value: "mon2", label: "Mon, Nov 23" },
    ],
  },
];

export default function WheelPickerDemo() {
  const [at, setAt] = useState<WheelValue>({ hour: "7", minute: "30", period: "AM" });
  const [slot, setSlot] = useState<WheelValue>({ day: "wed" });
  const day = delivery[0]!.options.find(option => option.value === slot.day)?.label;

  return (
    <Row gap={8} justify="center" align="flex-start">
      <Stack gap={3} align="center">
        <WheelPicker label="Alarm time" columns={time} value={at} onValueChange={setAt} />
        <Caption>Alarm set for {at.hour}:{at.minute} {at.period}</Caption>
      </Stack>
      <Stack gap={3} align="center">
        <WheelPicker label="Delivery" columns={delivery} value={slot} onValueChange={setSlot} visibleCount={5} />
        <Caption>Arrives {day}. Struck days are fully booked.</Caption>
      </Stack>
    </Row>
  );
}
