var e=`import { Bold, Italic, Link2, Share2 } from "lucide-react";
import Tooltip from "@/registry/components/tooltip/tooltip";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack, demoStage } from "./_kit";

export default function TooltipDemo() {
  // The first tip is already showing, inside the stage; hovering any other control hands over to it.
  const stage = demoStage();
  return (
    <Stack align="center" gap={5}>
      <Row justify="center">
        <Tooltip content="Bold (Ctrl+B)" defaultOpen container={stage}><Button variant="secondary" aria-label="Bold"><Bold size={16} aria-hidden="true" /></Button></Tooltip>
        <Tooltip content="Italic (Ctrl+I)" container={stage}><Button variant="secondary" aria-label="Italic"><Italic size={16} aria-hidden="true" /></Button></Tooltip>
        <Tooltip content="Insert link" side="bottom" container={stage}><Button variant="secondary" aria-label="Insert link"><Link2 size={16} aria-hidden="true" /></Button></Tooltip>
        <Tooltip content="Share with your team" side="right" container={stage}><Button variant="secondary" aria-label="Share"><Share2 size={16} aria-hidden="true" /></Button></Tooltip>
      </Row>
      <Caption>Hover or focus a control; moving between them is instant.</Caption>
    </Stack>
  );
}
`;export{e as default};