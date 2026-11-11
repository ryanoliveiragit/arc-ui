import Accordion from "@/registry/components/accordion/accordion";
import { Stack } from "./_kit";

const faqs = [
  { title: "Can I change my plan later?", content: "Yes. Upgrade or downgrade at any time from Billing. Changes apply immediately and we prorate the difference on your next invoice." },
  { title: "How does the free trial work?", content: "You get 14 days of every feature with no card required. If you do not subscribe, your workspace becomes read-only until you do." },
  { title: "Who can see my data?", content: "Only the members you invite. Data is encrypted at rest and in transit, and our staff access it only with your written permission." },
  { title: "Do you offer refunds?", content: "Annual plans are refundable within 30 days of purchase. Monthly plans can be cancelled at any time without a further charge." },
];

export default function AccordionDemo() {
  return <Stack width={520}><Accordion items={faqs} defaultOpen={0} /></Stack>;
}
