import ChatAppPreview from "@/registry/blocks/chat-app/chat-app";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "fill", frame: true, height: 680 };

export default function ChatAppDemo() {
  return <ChatAppPreview />;
}
