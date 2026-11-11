import { useState } from "react";
import { CreditCard, RefreshCcw, ShieldCheck, Users } from "lucide-react";
import { BouncyAccordion } from "@/registry/components/bouncy-accordion/bouncy-accordion";
import type { BouncyAccordionItem } from "@/registry/components/bouncy-accordion/bouncy-accordion";
import Switch from "@/registry/components/switch/switch";
import { Stack } from "./_kit";

const questions: BouncyAccordionItem[] = [
  { value: "seats", icon: <Users size={17} />, title: "Can I change the number of seats later?", content: "Yes. Add or remove seats at any time from Billing. New seats are charged for the days left in the cycle, and removed seats turn into credit on your next invoice." },
  { value: "billing", icon: <CreditCard size={17} />, title: "Which payment methods do you accept?", content: "All major credit and debit cards. Annual plans above 20 seats can also pay by bank transfer with a 30 day invoice." },
  { value: "refunds", icon: <RefreshCcw size={17} />, title: "What is your refund policy?", content: "Monthly plans can be cancelled whenever you like and stay active until the end of the period. Annual plans are refunded in full during the first 30 days." },
  { value: "security", icon: <ShieldCheck size={17} />, title: "Where is my data stored?", content: "In the region you choose when you create the workspace: Frankfurt, Virginia or São Paulo. Backups are encrypted and stay in the same region." },
];

export default function BouncyAccordionDemo() {
  const [open, setOpen] = useState<string[]>(["billing"]);
  const [multiple, setMultiple] = useState(false);
  return (
    <Stack gap={5} width={480}>
      <BouncyAccordion items={questions} value={open} onValueChange={setOpen} multiple={multiple} />
      <Switch label="Keep several answers open" checked={multiple} onCheckedChange={next => { setMultiple(next); if (!next) setOpen(current => current.slice(-1)); }} />
    </Stack>
  );
}
