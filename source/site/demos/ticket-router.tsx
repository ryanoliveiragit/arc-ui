import { TicketRouter } from "@/registry/components/ticket-router/ticket-router";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

export default function TicketRouterDemo() {
  return (
    <Stack gap={3} width={760}>
      <TicketRouter />
    </Stack>
  );
}
