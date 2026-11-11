var e=`import { useState } from "react";
import { FileDiff } from "@/registry/components/file-diff/file-diff";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 600 };

const rateLimitBefore = \`import { redis } from "./redis";
import { logger } from "./logger";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 100;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

function keyFor(userId: string) {
  return \\\`rate:\\\${userId}\\\`;
}

/** Usage is tracked per user, in fixed one minute windows. */
export async function currentUsage(userId: string) {
  const raw = await redis.get(keyFor(userId));
  return raw ? Number(raw) : 0;
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const key = keyFor(userId);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  if (count > MAX_REQUESTS) {
    logger.warn("rate limit hit", { userId });
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: MAX_REQUESTS - count };
}

export async function resetRateLimit(userId: string) {
  await redis.del(keyFor(userId));
}

export async function resetMany(userIds: string[]) {
  if (userIds.length === 0) return;
  await redis.del(...userIds.map(keyFor));
  logger.info("rate limits cleared", { count: userIds.length });
}
\`;

const rateLimitAfter = \`import { redis } from "./redis";
import { logger } from "./logger";
import type { Plan } from "./billing";

const WINDOW_SECONDS = 60;
const LIMITS: Record<Plan, number> = { free: 60, pro: 600, team: 3000 };

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

function keyFor(userId: string) {
  return \\\`rate:\\\${userId}\\\`;
}

/** Usage is tracked per user, in fixed one minute windows. */
export async function currentUsage(userId: string) {
  const raw = await redis.get(keyFor(userId));
  return raw ? Number(raw) : 0;
}

export async function checkRateLimit(userId: string, plan: Plan = "free"): Promise<RateLimitResult> {
  const key = keyFor(userId);
  const limit = LIMITS[plan];
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  if (count > limit) {
    const retryAfter = await redis.ttl(key);
    logger.warn("rate limit hit", { userId, plan });
    return { allowed: false, remaining: 0, retryAfter };
  }
  return { allowed: true, remaining: limit - count };
}

export async function resetRateLimit(userId: string) {
  await redis.del(keyFor(userId));
}

export async function resetMany(userIds: string[]) {
  if (userIds.length === 0) return;
  await redis.del(...userIds.map(keyFor));
  logger.info("rate limits cleared", { count: userIds.length });
}
\`;

const testAfter = \`import { describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("uses the limit of the plan", async () => {
    await resetRateLimit("user_1");
    const result = await checkRateLimit("user_1", "pro");
    expect(result.remaining).toBe(599);
  });
});
\`;

const files = {
  modified: { filename: "src/server/rate-limit.ts", before: rateLimitBefore, after: rateLimitAfter },
  added: { filename: "src/server/rate-limit.test.ts", before: "", after: testAfter },
} as const;

type FileKey = keyof typeof files;

export default function FileDiffDemo() {
  const [file, setFile] = useState<FileKey>("modified");
  return (
    <Stack width={680} gap={3}>
      <div style={{ alignSelf: "flex-start" }}>
        <SegmentedControl
          label="File"
          value={file}
          onValueChange={value => setFile(value as FileKey)}
          options={[{ value: "modified", label: "Modified file" }, { value: "added", label: "New file" }]}
        />
      </div>
      <FileDiff key={file} {...files[file]} maxHeight={428} />
      <Caption>Open a folded range to read the unchanged lines around a change. The header button shows or folds them all.</Caption>
    </Stack>
  );
}
`;export{e as default};