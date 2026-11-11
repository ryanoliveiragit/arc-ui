import { useState } from "react";
import { AvatarGroup } from "@/registry/components/avatar-group/avatar-group";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack } from "./_kit";
import { people } from "@/lib/media";

export default function AvatarGroupDemo() {
  const [count, setCount] = useState(6);
  const members = people.slice(0, count).map((p, i) => ({ name: p.name, src: p.src, status: i % 3 === 0 ? ("online" as const) : undefined }));
  return (
    <Stack gap={6} align="center">
      <AvatarGroup members={members} max={4} size="lg" label="Design team" />
      <Row>
        <Button size="sm" variant="secondary" onClick={() => setCount(c => Math.min(people.length, c + 1))}>Add a member</Button>
        <Button size="sm" variant="ghost" onClick={() => setCount(c => Math.max(1, c - 1))}>Remove one</Button>
      </Row>
      <AvatarGroup members={people.slice(0, 3).map(p => ({ name: p.name, src: p.src }))} size="sm" />
      <Caption>{count} people on the project.</Caption>
    </Stack>
  );
}
