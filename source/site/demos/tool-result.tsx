import { useEffect, useState } from "react";
import ToolResult from "@/registry/components/tool-result/tool-result";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

const docs = { matches: 2, results: [{ title: "Rate limits", path: "/docs/api/rate-limits", score: 0.94 }, { title: "Response headers", path: "/docs/api/headers", score: 0.81 }].map(item => `${item.title} (${item.path})`), cached: true };
const tests = { passed: 48, failed: 0, skipped: 2, durationMs: 3180, slowest: "checkout.spec.ts" };

export default function ToolResultDemo() {
  /** Bumped to run the test call again. */
  const [run, setRun] = useState(0);
  const [testing, setTesting] = useState(true);
  /** One record open at a time keeps the transcript compact, the way a long agent log would. */
  const [open, setOpen] = useState<string | null>("search");
  const bind = (id: string) => ({ open: open === id, onOpenChange: (next: boolean) => setOpen(next ? id : null) });

  useEffect(() => {
    setTesting(true);
    const timer = window.setTimeout(() => setTesting(false), 3200);
    return () => window.clearTimeout(timer);
  }, [run]);

  return (
    <Stack width={500} gap={3}>
      <ToolResult tool="search_docs" summary="rate limit headers" durationMs={420} input={{ query: "rate limit headers", limit: 2, includeDrafts: false }} output={docs} {...bind("search")} />
      <ToolResult key={run} tool="run_tests" summary="tests/checkout" status={testing ? "running" : "success"} durationMs={testing ? undefined : tests.durationMs} input={{ path: "tests/checkout", retries: 0 }} output={testing ? undefined : tests} {...bind("tests")} />
      <ToolResult tool="fetch_invoice" summary="inv_8841" status="error" durationMs={1840} input={{ id: "inv_8841" }} error="404 Not Found: no invoice with id inv_8841 in workspace acme." {...bind("invoice")} />
      <Row justify="space-between">
        <Button size="sm" variant="secondary" onClick={() => setRun(current => current + 1)}>Run tests again</Button>
        <Caption>{testing ? "run_tests is still running." : "Open a record to see its input and output."}</Caption>
      </Row>
    </Stack>
  );
}
