import LoginCentered from "@/registry/blocks/login-centered/login-centered";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "center", height: 720 };

export default function LoginCenteredDemo() {
  return <LoginCentered />;
}
