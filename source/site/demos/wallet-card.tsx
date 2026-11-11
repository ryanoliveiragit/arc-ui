import WalletCardPreview from "@/registry/blocks/wallet-card/wallet-card";
import type { DemoStage } from "./_kit";

// Card, actions and four transactions are taller than the default block stage.
export const stage: DemoStage = { height: 760 };

export default function WalletCardDemo() {
  return <WalletCardPreview />;
}
