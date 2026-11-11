var e=`import { NotificationCenter, type NotificationItem } from "@/registry/components/notification-center/notification-center";
import { avatar } from "@/lib/media";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "center", height: 560 };

const notifications: NotificationItem[] = [
  { id: "n1", title: "Emma Collins commented on Checkout redesign", description: "The review step looks great. Can we show the total while editing?", time: "2m ago", tone: "info", actor: { name: "Emma Collins", photo: avatar("emma-collins") } },
  { id: "n2", title: "Deploy finished", description: "Production is live on version 4.12.0.", time: "18m ago", tone: "success" },
  { id: "n3", title: "Storage is 90% full", description: "Archive old exports or upgrade your workspace storage.", time: "1h ago", tone: "warning" },
  { id: "n4", title: "Marcus Johnson invited you to Mobile app", description: "You can now view and edit the board.", time: "3h ago", read: true, tone: "info", actor: { name: "Marcus Johnson", photo: avatar("marcus-johnson") } },
  { id: "n5", title: "Weekly summary is ready", description: "42 issues closed, 9 opened.", time: "Yesterday", read: true },
];

export default function NotificationCenterDemo() {
  return <NotificationCenter notifications={notifications} />;
}
`;export{e as default};