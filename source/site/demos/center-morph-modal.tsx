import { useState } from "react";
import { BellRing, CalendarCheck, MailPlus, ReceiptText } from "lucide-react";
import { CenterMorphModal } from "@/registry/components/center-morph-modal/center-morph-modal";
import type { CenterMorphItem } from "@/registry/components/center-morph-modal/center-morph-modal";
import { Button } from "@/registry/components/button/button";
import { Caption, Stack, demoStage } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./center-morph-modal.module.css";

function Steps({ when, then }: { when: string; then: string[] }) {
  return (
    <>
      <dl className={styles.steps}>
        <div><dt>When</dt><dd>{when}</dd></div>
        {then.map((step, index) => <div key={step}><dt>{index === 0 ? "Then" : "And"}</dt><dd>{step}</dd></div>)}
      </dl>
    </>
  );
}

const recipes: CenterMorphItem[] = [
  {
    id: "digest", title: "Weekly digest", subtitle: "Every Monday at 9:00", meta: "Popular", media: <CalendarCheck size={20} />,
    summary: "Send the team a summary of what shipped last week.",
    content: <><p>Collects everything marked done in the last seven days and posts one tidy summary, grouped by project, to the channel you choose.</p><Steps when="It is Monday, 9:00 in the workspace time zone" then={["Gather tasks completed since last Monday", "Post the summary to #team-updates"]} /></>,
  },
  {
    id: "stale", title: "Stale task nudge", subtitle: "Checks once a day", meta: "2 steps", media: <BellRing size={20} />,
    summary: "Remind the owner when a task has not moved in 5 days.",
    content: <><p>Keeps work from going quiet. The owner gets a direct message with the task and a one-tap way to update its status or hand it over.</p><Steps when="A task in progress has no activity for 5 days" then={["Send the owner a reminder", "Add the label “Needs attention”"]} /></>,
  },
  {
    id: "lead", title: "New lead alert", subtitle: "Runs instantly", meta: "3 steps", media: <MailPlus size={20} />,
    summary: "Create a contact and tell sales when a form comes in.",
    content: <><p>Turns every form submission into a contact, assigns it by region and lets the right person know within seconds.</p><Steps when="Someone submits the contact form" then={["Create the contact with the form answers", "Assign it to the regional owner", "Notify them in #sales"]} /></>,
  },
  {
    id: "invoice", title: "Invoice follow-up", subtitle: "3 days after the due date", meta: "2 steps", media: <ReceiptText size={20} />,
    summary: "Send a polite reminder when an invoice is overdue.",
    content: <><p>Sends a friendly reminder with the payment link, then tells finance if the invoice is still open a week later.</p><Steps when="An invoice is 3 days past its due date" then={["Email the customer a reminder", "Alert finance after 7 more days"]} /></>,
  },
];

export const stage: DemoStage = { height: 560 };

export default function CenterMorphModalDemo() {
  // On the docs page the chosen card grows to the center of the preview, so the modal opens whole and the page keeps scrolling.
  const [container] = useState(demoStage);
  const [open, setOpen] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<string[]>([]);
  return (
    <Stack gap={4} width={560}>
      <CenterMorphModal
        container={container}
        items={recipes.map(recipe => enabled.includes(recipe.id) ? { ...recipe, meta: "On" } : recipe)}
        value={open}
        onValueChange={setOpen}
        renderFooter={(item, close) => {
          const on = enabled.includes(item.id);
          return (
            <>
              <Button variant="ghost" onClick={close}>Not now</Button>
              <Button onClick={() => { setEnabled(current => on ? current.filter(id => id !== item.id) : [...current, item.id]); close(); }}>{on ? "Turn off" : "Use this recipe"}</Button>
            </>
          );
        }}
      />
      <Caption>Pick a recipe: the card itself becomes the dialog. {enabled.length ? `${enabled.length} turned on.` : "None turned on yet."}</Caption>
    </Stack>
  );
}
