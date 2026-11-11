import { useState } from "react";
import ApprovalCard from "@/registry/components/approval-card/approval-card";
import type { ApprovalStatus } from "@/registry/components/approval-card/approval-card";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

const notes: Record<ApprovalStatus, string> = {
  pending: "The agent is waiting. Nothing is sent until you decide.",
  approved: "The agent sent the refund and replied to the customer.",
  rejected: "The agent dropped the refund and will ask the customer for photos.",
};

export default function ApprovalCardDemo() {
  const [status, setStatus] = useState<ApprovalStatus>("pending");
  return (
    <Stack width={440} gap={4}>
      <ApprovalCard
        source="Billing agent"
        title="Refund $240.00 to Maya Torres"
        summary="Order 48213 arrived with a cracked lid. The agent wants to refund the full amount to the original card and close the ticket."
        details={[
          { label: "Customer", value: "Maya Torres" },
          { label: "Order", value: "48213, delivered May 2" },
          { label: "Amount", value: "$240.00" },
          { label: "Refund to", value: "Visa ending 4421" },
          { label: "Policy", value: "Inside the 30-day window" },
        ]}
        approveLabel="Approve refund"
        resolvedLabels={{ approved: "Refund approved", rejected: "Refund rejected" }}
        status={status}
        onStatusChange={setStatus}
      />
      <Caption>{notes[status]}</Caption>
    </Stack>
  );
}
