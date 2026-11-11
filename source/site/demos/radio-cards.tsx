import { useState } from "react";
import { Package, Truck, Zap } from "lucide-react";
import RadioCards from "@/registry/components/radio-cards/radio-cards";
import { Caption, Stack } from "./_kit";

const options = [
  { value: "standard", label: "Standard", description: "Arrives in 5 to 7 business days", meta: "Free", icon: <Package size={16} aria-hidden="true" /> },
  { value: "express", label: "Express", description: "Arrives in 2 business days", meta: "$9.00", icon: <Truck size={16} aria-hidden="true" /> },
  { value: "overnight", label: "Overnight", description: "Order by 2 pm, delivered tomorrow", meta: "$24.00", icon: <Zap size={16} aria-hidden="true" /> },
  { value: "pickup", label: "Store pickup", description: "Not available for this address", icon: <Package size={16} aria-hidden="true" />, disabled: true, disabledReason: "Unavailable for this address" },
];

export default function RadioCardsDemo() {
  const [value, setValue] = useState<string | null>("express");
  return (
    <Stack width={560} gap={4}>
      <RadioCards aria-label="Delivery method" options={options} value={value} onValueChange={setValue} minColumnWidth={200} />
      <Caption>Selected: {value}. Use the arrow keys to move the ring.</Caption>
    </Stack>
  );
}
