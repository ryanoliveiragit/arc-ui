import TokenSwapPreview from "@/registry/blocks/token-swap/token-swap";
import { demoStage } from "./_kit";

export default function TokenSwapDemo() {
  // The token menus open inside the preview stage, so a menu near the edge is never cut.
  return <TokenSwapPreview container={demoStage()} />;
}
