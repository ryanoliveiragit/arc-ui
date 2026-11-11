import { useState } from "react";
import { CreditCard, Settings, UserRound } from "lucide-react";
import UserMenu from "@/registry/components/user-menu/user-menu";
import { avatar } from "@/lib/media";
import { Caption, Row, Stack } from "./_kit";

export default function UserMenuDemo() {
  const [signedOut, setSignedOut] = useState(false);
  return (
    <Stack gap={6} align="center">
      <Row justify="center" gap={8}>
        <UserMenu
          user={{ name: "Emma Collins", email: "emma@northwind.io", plan: "Pro", avatarSrc: avatar("emma-collins") }}
          defaultStatus="available"
          showName
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
        />
      </Row>
      <Caption>{signedOut ? "Signed out (demo only). Open the menu again to keep exploring." : "Open the avatar menu: status, theme, account links, sign out."}</Caption>
    </Stack>
  );
}
