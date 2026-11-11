import { useEffect, useState } from "react";
import TodoList from "@/registry/components/todo-list/todo-list";
import type { TodoItem } from "@/registry/components/todo-list/todo-list";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const plan = [
  { id: "repro", label: "Reproduce the failing checkout test", detail: "Ran checkout.spec.ts 20 times: 3 failures", time: 1500 },
  { id: "read", label: "Read the payment mock and its timers", detail: "Reading tests/mocks/payment.ts", time: 1900 },
  { id: "fix", label: "Replace the fixed delay with an awaited event", detail: "Editing 2 files", time: 2200 },
  { id: "verify", label: "Run the checkout suite 50 times", detail: "Run 31 of 50, no failures so far", time: 2600 },
  { id: "pr", label: "Open a pull request with the fix", detail: "Writing the description", time: 1600 },
];

export default function TodoListDemo() {
  /** Index of the step in progress; `plan.length` means every step is done. */
  const [step, setStep] = useState(1);
  const [paused, setPaused] = useState(false);
  const finished = step >= plan.length;

  useEffect(() => {
    if (paused || finished) return;
    const timer = window.setTimeout(() => setStep(current => current + 1), plan[step]!.time);
    return () => window.clearTimeout(timer);
  }, [finished, paused, step]);

  const items: TodoItem[] = plan.map((item, index) => ({ id: item.id, label: item.label, detail: item.detail, status: index < step ? "done" : index === step ? "running" : "pending" }));

  return (
    <Stack width={440} gap={4}>
      <TodoList title="Fix the flaky checkout test" items={items} />
      <Row justify="space-between">
        <Row gap={2}>
          <Button size="sm" variant="secondary" onClick={() => { setStep(0); setPaused(false); }}>Run again</Button>
          <Button size="sm" variant="ghost" disabled={finished} onClick={() => setPaused(current => !current)}>{paused ? "Resume" : "Pause"}</Button>
        </Row>
        <Caption>{finished ? "Plan complete." : paused ? "Paused." : "The agent is working…"}</Caption>
      </Row>
    </Stack>
  );
}
