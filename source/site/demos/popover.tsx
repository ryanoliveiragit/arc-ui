import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/registry/components/popover/popover";
import { Button } from "@/registry/components/button/button";
import { Caption, Stack } from "./_kit";

export default function PopoverDemo() {
  return (
    <Stack align="center" gap={4}>
      <Popover>
        <PopoverTrigger asChild><Button variant="secondary">Share link</Button></PopoverTrigger>
        <PopoverContent>
          <Stack gap={3} style={{ width: 260 }}>
            <strong style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)" }}>Anyone with the link can view</strong>
            <Caption>atlas.example.com/p/q3-roadmap</Caption>
            <PopoverClose asChild><Button size="sm">Copy link</Button></PopoverClose>
          </Stack>
        </PopoverContent>
      </Popover>
    </Stack>
  );
}
