import { useState } from "react";
import { RadioGroup } from "@/registry/components/radio-group/radio-group";
import { Caption, Stack } from "./_kit";

export default function RadioGroupDemo() {
  const [plan, setPlan] = useState("pro");
  return (
    <Stack width={380} gap={4}>
      <RadioGroup
        label="Billing plan"
        value={plan}
        onValueChange={setPlan}
        options={[
          { value: "starter", label: "Starter", description: "For side projects, up to 3 members" },
          { value: "pro", label: "Pro", description: "Unlimited projects and priority support" },
          { value: "enterprise", label: "Enterprise", description: "SSO, audit logs and a dedicated manager" },
        ]}
      />
      <Caption>Current plan: {plan}</Caption>
    </Stack>
  );
}
