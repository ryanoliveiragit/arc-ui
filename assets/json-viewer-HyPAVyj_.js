var e=`import { JsonViewer } from "@/registry/components/json-viewer/json-viewer";
import { Stack } from "./_kit";

const order = {
  id: "ord_8f3k2m",
  status: "paid",
  createdAt: "2026-11-04T14:22:09Z",
  total: { amount: 12480, currency: "USD" },
  customer: { id: "cus_91ab", name: "Hannah Walsh", email: "hannah.walsh@example.com", vip: true },
  items: [
    { sku: "CH-204", name: "Lounge chair", quantity: 2, price: 4200 },
    { sku: "LP-118", name: "Table lamp", quantity: 1, price: 1890 },
    { sku: "LT-032", name: "Linen throw", quantity: 3, price: 730 },
  ],
  shipping: { method: "express", address: { city: "Lisbon", country: "PT", postalCode: "1200-195" }, tracking: null },
  tags: ["gift", "priority"],
};

export default function JsonViewerDemo() {
  return (
    <Stack width={560}>
      <JsonViewer data={order} rootName="order" defaultExpandDepth={2} maxHeight={360} label="Order payload" />
    </Stack>
  );
}
`;export{e as default};