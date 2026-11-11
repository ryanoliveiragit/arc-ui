var e=`import { useState } from "react";
import { BillingPrice, BillingToggle } from "@/registry/components/billing-toggle/billing-toggle";
import { Caption, Stack, Surface } from "./_kit";

const options = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly", badge: "Save 20%", activeBadge: "You save $48" },
];

export default function BillingToggleDemo() {
  const [period, setPeriod] = useState("monthly");
  const yearly = period === "yearly";
  return (
    <Stack gap={5} align="center">
      <BillingToggle value={period} onValueChange={setPeriod} options={options} label="Billing period" />
      <Surface width={320} padding={6}>
        <Stack gap={2}>
          <Caption>Team plan</Caption>
          <div style={{ fontSize: "var(--text-3xl, 2rem)", fontWeight: 600 }}>
            <BillingPrice amount={yearly ? 19 : 24} was={yearly ? 24 : undefined} period={yearly ? "per month, billed yearly" : "per month"} />
          </div>
        </Stack>
      </Surface>
      <Caption>Switch the period and watch the price roll.</Caption>
    </Stack>
  );
}
`;export{e as default};