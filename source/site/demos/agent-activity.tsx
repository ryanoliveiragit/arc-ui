import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { AgentActivity } from "@/registry/components/agent-activity/agent-activity";
import type { AgentStep } from "@/registry/components/agent-activity/agent-activity";
import { Button } from "@/registry/components/button/button";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 600 };

/** Milliseconds between two things happening in the simulated run. */
const BEAT = 620;

const script: Omit<AgentStep, "status" | "duration">[] = [
  { id: "search", kind: "search", title: "Searching the codebase", detail: 'grep "rate limit" src/server', items: ["middleware.ts", "redis.ts", "billing.ts"] },
  { id: "read", kind: "read", title: "Reading 3 files", detail: "src/server", items: ["middleware.ts · 84 lines", "redis.ts · 31 lines", "billing.ts · 127 lines"] },
  { id: "plan", kind: "think", title: "Planning the change", detail: "Limits per plan, stored next to billing" },
  { id: "write", kind: "write", title: "Editing rate-limit.ts", detail: "+10 −6", items: ["rate-limit.ts", "rate-limit.test.ts"] },
  { id: "test", kind: "run", title: "Running the tests", detail: "vitest run src/server", items: ["14 passed"] },
];

/** Every step takes one beat to start, one per item it collects, and one to finish. */
const beatsOf = (step: (typeof script)[number]) => (step.items?.length ?? 0) + 2;
const totalBeats = script.reduce((sum, step) => sum + beatsOf(step), 0);

function stepsAt(beat: number): AgentStep[] {
  let start = 0;
  return script.map(step => {
    const length = beatsOf(step);
    const local = beat - start;
    start += length;
    if (local <= 0) return { ...step, status: "pending", items: undefined };
    if (local >= length) return { ...step, status: "done", duration: length * BEAT };
    return { ...step, status: "running", items: step.items?.slice(0, local - 1) };
  });
}

export default function AgentActivityDemo() {
  const [beat, setBeat] = useState(1);
  const [run, setRun] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setBeat(current => (current >= totalBeats ? current : current + 1)), BEAT);
    return () => window.clearInterval(timer);
  }, [run]);
  const steps = useMemo(() => stepsAt(beat), [beat]);
  const finished = beat >= totalBeats;

  return (
    <Stack width={460} gap={3} style={{ minHeight: 520 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <Caption>{finished ? "Open the summary row to read the finished steps." : "Finished steps fold into the summary row."}</Caption>
        <Button size="sm" variant="secondary" style={{ flex: "none" }} onClick={() => { setBeat(1); setRun(current => current + 1); }}>
          <RotateCcw size={14} aria-hidden="true" />
          Run again
        </Button>
      </div>
      <AgentActivity key={run} title="Add rate limits per plan" steps={steps} />
    </Stack>
  );
}
