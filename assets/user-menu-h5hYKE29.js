var e=`import { useState } from "react";
import { CreditCard, Settings, UserRound } from "lucide-react";
import UserMenu from "@/registry/components/user-menu/user-menu";
import { avatar } from "@/lib/media";
import { Caption, Room, Row, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

// Below 640px the menu opens as a bottom sheet over the whole page (with the page scroll locked), so the preview only starts
// open on wider screens; on a phone it waits for a tap.
const wide = () => typeof window === "undefined" || !window.matchMedia("(max-width: 639px)").matches;

export default function UserMenuDemo() {
  const [startOpen] = useState(wide);
  const [signedOut, setSignedOut] = useState(false);
  return (
    // On wide screens Emma's menu is already open under her avatar. portal={false} keeps both panels inside the stage instead of the page body.
    <Stack gap={4} align="center">
      <Room below={startOpen ? 252 : 0}>
      <Row justify="center" gap={8}>
        <UserMenu
          user={{ name: "Emma Collins", email: "emma@northwind.io", plan: "Pro", avatarSrc: avatar("emma-collins") }}
          defaultStatus="available"
          showName
          defaultOpen={startOpen}
          portal={false}
          items={[
            { label: "Profile", icon: <UserRound size={15} aria-hidden="true" />, keys: ["⌘", "P"] },
            { label: "Settings", icon: <Settings size={15} aria-hidden="true" />, keys: ["⌘", ","] },
            { label: "Billing", icon: <CreditCard size={15} aria-hidden="true" /> },
          ]}
          onSignOut={() => setSignedOut(true)}
        />
        <UserMenu
          user={{ name: "Marcus Johnson", email: "marcus@northwind.io", avatarSrc: avatar("marcus-johnson") }}
          showTheme={false}
          align="start"
          portal={false}
        />
      </Row>
      </Room>
      <Caption>{signedOut ? "Signed out (demo only). Open the menu again to keep exploring." : "Open the avatar menu: status, theme, account links, sign out."}</Caption>
    </Stack>
  );
}
`;export{e as default};