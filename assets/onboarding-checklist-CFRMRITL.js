var e=`import { OnboardingChecklist } from "@/registry/components/onboarding-checklist/onboarding-checklist";
import { Stack } from "./_kit";

const wait = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));
let inviteAttempts = 0;

export default function OnboardingChecklistDemo() {
  return (
    <Stack width={440}>
      <OnboardingChecklist
        title="Set up your workspace"
        defaultCompleted={["profile"]}
        steps={[
          { id: "profile", title: "Create your profile", description: "Add your name and a photo so teammates recognise you." },
          { id: "invite", title: "Invite your team", description: "Send invitations to up to five teammates so you can work together.", actionLabel: "Send invites", onAction: async () => { await wait(900); if (inviteAttempts++ === 0) throw new Error("We could not reach the mail service. Try again."); } },
          { id: "repo", title: "Connect a repository", description: "Link GitHub to see deploys next to your pull requests.", actionLabel: "Connect GitHub", onAction: () => wait(900) },
          { id: "billing", title: "Choose a plan", description: "Pick Starter or Pro. You can change it any time." },
        ]}
      />
    </Stack>
  );
}
`;export{e as default};