import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { OnboardingChecklist, type OnboardingStep } from "@/registry/components/onboarding-checklist/onboarding-checklist";
import { Stack } from "./_kit";

const steps: OnboardingStep[] = [
  { id: "create-workspace", title: "Create your workspace" },
  { id: "invite-team", title: "Invite your team", description: "Priya and Jonas are waiting.", actionLabel: "Send invites", onAction: () => {} },
  { id: "connect-github", title: "Connect GitHub", description: "Link the repository you want to sync.", actionLabel: "Connect", onAction: () => {} },
  { id: "two-factor", title: "Turn on two-factor sign-in" },
];

export default function OnboardingChecklistDemo() {
  // Remontar pelo key zera o estado interno do checklist.
  const [run, setRun] = useState(0);
  return (
    <Stack gap={4} width={440}>
      <OnboardingChecklist key={run} title="Set up Northwind" doneTitle="Northwind is ready" steps={steps} defaultCompleted={["create-workspace"]} />
      <button type="button" style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 6, padding: 0, border: 0, background: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "var(--text-sm)", fontFamily: "inherit", letterSpacing: "var(--tracking-body)" }} onClick={() => setRun(value => value + 1)}>
        <RotateCcw size={14} strokeWidth={1.75} aria-hidden="true" />
        Reset demo
      </button>
    </Stack>
  );
}
