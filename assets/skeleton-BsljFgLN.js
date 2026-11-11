var e=`import { useState } from "react";
import { Skeleton } from "@/registry/components/skeleton/skeleton";
import { Avatar } from "@/registry/components/avatar/avatar";
import { Button } from "@/registry/components/button/button";
import { Caption, Stack, Surface } from "./_kit";
import { avatar } from "@/lib/media";

export default function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <Stack gap={5} width={420}>
      <Surface>
        <Skeleton avatar lines={3} loading={loading} label="Loading comment">
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <Avatar name="Emma Collins" src={avatar("emma-collins")} />
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <strong>Emma Collins</strong>
              <span style={{ color: "var(--text-secondary)" }}>The new onboarding flow cut our setup time in half. Support was quick, and the migration took one afternoon.</span>
            </div>
          </div>
        </Skeleton>
      </Surface>
      <Button variant="secondary" onClick={() => setLoading(l => !l)}>{loading ? "Finish loading" : "Load again"}</Button>
      <Caption>The placeholder crossfades into the real content.</Caption>
    </Stack>
  );
}
`;export{e as default};