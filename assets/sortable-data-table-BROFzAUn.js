var e=`import { SortableDataTable, type DataColumn } from "@/registry/components/sortable-data-table/sortable-data-table";
import { Stack } from "./_kit";

type Project = { id: string; name: string; owner: string; status: string; budget: number; progress: number };

const rows: Project[] = [
  { id: "p1", name: "Checkout redesign", owner: "Emma Collins", status: "In progress", budget: 48000, progress: 64 },
  { id: "p2", name: "Mobile onboarding", owner: "Mateo Alvarez", status: "In review", budget: 32500, progress: 90 },
  { id: "p3", name: "Billing migration", owner: "Olivia Bennett", status: "At risk", budget: 76000, progress: 38 },
  { id: "p4", name: "Help center refresh", owner: "Hannah Walsh", status: "Planned", budget: 15800, progress: 0 },
  { id: "p5", name: "Analytics dashboard", owner: "Chloe Nguyen", status: "In progress", budget: 54200, progress: 52 },
  { id: "p6", name: "Partner API v2", owner: "Daniel Kim", status: "Shipped", budget: 61000, progress: 100 },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const columns: DataColumn<Project>[] = [
  { key: "name", label: "Project", sortable: true },
  { key: "owner", label: "Owner", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "budget", label: "Budget", sortable: true, numeric: true, render: v => money.format(v as number) },
  { key: "progress", label: "Progress", sortable: true, numeric: true, render: v => \`\${v}%\` },
];

export default function SortableDataTableDemo() {
  return (
    <Stack width={760}>
      <SortableDataTable rows={rows} columns={columns} rowKey="id" caption="Active projects" defaultSort={{ key: "budget", direction: "desc" }} selectable itemName={{ one: "project", other: "projects" }} />
    </Stack>
  );
}
`;export{e as default};