import { useMemo } from "react";
import { GitMerge, Rocket, TriangleAlert } from "lucide-react";
import { Timeline, type TimelineEvent } from "@/registry/components/timeline/timeline";
import { avatar } from "@/lib/media";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

export default function TimelineDemo() {
  const now = useMemo(() => Date.now(), []);
  const m = 60_000, h = 60 * m;
  const events: TimelineEvent[] = [
    { id: "e1", at: now - 8 * m, actor: "Marcus Johnson", title: "merged Checkout redesign into main", meta: "Pull request #482", avatar: avatar("marcus-johnson"), detail: "Squashed 7 commits. 24 files changed, 3 reviewers approved." },
    { id: "e2", at: now - 20 * m, title: "Production deploy succeeded", meta: "Build 2041", icon: <Rocket size={14} aria-hidden="true" />, tone: "success", detail: "Deployed to 3 regions in 2m 41s." },
    { id: "e3", at: now - 3 * h, actor: "Emma Collins", title: "commented on Hero headline", avatar: avatar("emma-collins") },
    { id: "e4", at: now - 5 * h, title: "Staging deploy failed", meta: "Build 2039", icon: <TriangleAlert size={14} aria-hidden="true" />, tone: "danger", detail: "Type check failed in billing/invoice.ts on line 88." },
    { id: "e5", at: now - 26 * h, actor: "Olivia Bennett", title: "approved Billing migration", meta: "Pull request #471", icon: <GitMerge size={14} aria-hidden="true" />, avatar: avatar("olivia-bennett") },
    { id: "e6", at: now - 30 * h, actor: "Jasmine Brooks", title: "opened Pricing page experiment", meta: "Pull request #476", avatar: avatar("jasmine-brooks") },
  ];
  return (
    <Stack width={480}>
      <Timeline events={events} now={now} label="Project activity" maxHeight={460} />
    </Stack>
  );
}
