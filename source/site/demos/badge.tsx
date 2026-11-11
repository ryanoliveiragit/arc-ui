import { CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/registry/components/badge/badge";
import { Caption, Row, Stack } from "./_kit";

export default function BadgeDemo() {
  return (
    <Stack gap={6} align="center">
      <Row justify="center">
        <Badge dot>Draft</Badge>
        <Badge tone="success" dot>Active</Badge>
        <Badge tone="info" dot>In review</Badge>
        <Badge tone="warning" dot>Past due</Badge>
        <Badge tone="danger" dot>Failed</Badge>
      </Row>
      <Row justify="center">
        <Badge color="teal" size="sm">GET</Badge>
        <Badge color="sky" size="sm">POST</Badge>
        <Badge color="violet" size="sm">PUT</Badge>
        <Badge color="amber" size="sm">PATCH</Badge>
        <Badge color="rose" size="sm">DELETE</Badge>
        <Badge color="orchid" size="sm">HEAD</Badge>
      </Row>
      <Row justify="center">
        <Badge tone="success" icon={<CheckCircle2 size={14} aria-hidden="true" />} pill>Verified</Badge>
        <Badge tone="info" outline pill size="lg" icon={<Sparkles size={14} aria-hidden="true" />}>New</Badge>
        <Badge tone="warning" outline>Beta</Badge>
      </Row>
      <Caption>Tones for status, colors for categories.</Caption>
    </Stack>
  );
}
