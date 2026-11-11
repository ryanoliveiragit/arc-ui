import SignIn from "@/registry/blocks/sign-in/sign-in";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "center", height: 720 };

export default function SignInDemo() {
  return <SignIn />;
}
