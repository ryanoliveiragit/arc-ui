import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/registry/components/popover/popover";
import { Button } from "@/registry/components/button/button";
import { Caption, Room, Stack, demoStage, useQuietFirstOpen } from "./_kit";

export default function PopoverDemo() {
  // O preview já abre o painel, preso ao palco: dá para ver o gatilho e o painel juntos, inteiros.
  const quiet = useQuietFirstOpen();
  return (
    <Room below={168}>
      <Popover defaultOpen>
        <PopoverTrigger asChild><Button variant="secondary">Share link</Button></PopoverTrigger>
        <PopoverContent container={demoStage()} align="center" onOpenAutoFocus={quiet}>
          <Stack gap={3} style={{ width: 260 }}>
            <strong style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)" }}>Anyone with the link can view</strong>
            <Caption>atlas.example.com/p/q3-roadmap</Caption>
            <PopoverClose asChild><Button size="sm">Copy link</Button></PopoverClose>
          </Stack>
        </PopoverContent>
      </Popover>
    </Room>
  );
}
