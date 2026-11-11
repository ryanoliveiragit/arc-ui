import { useState } from "react";
import { Avatar } from "@/registry/components/avatar/avatar";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack } from "./_kit";
import { avatar } from "@/lib/media";

export default function AvatarDemo() {
  const [online, setOnline] = useState(true);
  return (
    <Stack gap={6} align="center">
      <Row gap={5} justify="center">
        <Avatar name="Emma Collins" src={avatar("emma-collins")} size="sm" />
        <Avatar name="Emma Collins" src={avatar("emma-collins")} size="md" />
        <Avatar name="Emma Collins" src={avatar("emma-collins")} size="lg" />
        <Avatar name="Emma Collins" src={avatar("emma-collins")} size="xl" status={online ? "online" : "offline"} />
      </Row>
      <Row gap={4} justify="center">
        <Avatar name="Marcus Johnson" size="lg" />
        <Avatar name="Sofia Ramirez" size="lg" status="online" />
        <Button size="sm" variant="secondary" onClick={() => setOnline(o => !o)}>Go {online ? "offline" : "online"}</Button>
      </Row>
      <Caption>Without a photo, initials take over.</Caption>
    </Stack>
  );
}
