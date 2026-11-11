import { Folder, FileText } from "lucide-react";
import { TreeTable, type TreeTableColumn, type TreeTableRow } from "@/registry/components/tree-table/tree-table";
import { Stack } from "./_kit";

type Item = { name: string; owner: string; size: number; kind: "folder" | "file" };

const file = (id: string, name: string, owner: string, size: number): TreeTableRow<Item> => ({ id, data: { name, owner, size, kind: "file" } });
const folder = (id: string, name: string, owner: string, children?: TreeTableRow<Item>[]): TreeTableRow<Item> => ({ id, data: { name, owner, size: 0, kind: "folder" }, children, hasChildren: !children });

const rows: TreeTableRow<Item>[] = [
  folder("design", "Design", "Emma Collins", [
    file("brand", "Brand guidelines.pdf", "Emma Collins", 4200),
    folder("icons", "Icons", "Jasmine Brooks", [file("i1", "Outline set.fig", "Jasmine Brooks", 1800), file("i2", "Filled set.fig", "Jasmine Brooks", 2100)]),
  ]),
  folder("eng", "Engineering", "Nathan Cole", [
    file("arch", "Architecture.md", "Olivia Bennett", 48),
    file("api", "API reference.md", "Daniel Kim", 126),
  ]),
  folder("finance", "Finance", "Andre Williams"),
];

const fmt = (kb: number) => (kb >= 1000 ? `${(kb / 1000).toFixed(1)} MB` : `${kb} KB`);

const columns: TreeTableColumn<Item>[] = [
  { id: "name", header: "Name", width: "minmax(0, 2fr)", sortValue: d => d.name, cell: d => <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", minWidth: 0 }}>{d.kind === "folder" ? <Folder size={16} aria-hidden="true" /> : <FileText size={16} aria-hidden="true" />}<span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span></span> },
  { id: "owner", header: "Owner", width: "minmax(0, 1fr)", hideBelow: 480, sortValue: d => d.owner, cell: d => d.owner },
  { id: "size", header: "Size", width: "90px", align: "end", sortValue: d => d.size, cell: d => d.kind === "file" ? fmt(d.size) : "" },
];

const loadChildren = (row: TreeTableRow<Item>) => new Promise<TreeTableRow<Item>[]>(resolve => window.setTimeout(() => resolve([
  file(`${row.id}-1`, "Q3 budget.xlsx", "Andre Williams", 320),
  file(`${row.id}-2`, "Invoices 2026.zip", "Andre Williams", 8400),
]), 900));

export default function TreeTableDemo() {
  return (
    <Stack width={680}>
      <TreeTable rows={rows} columns={columns} label="Team files" selectable defaultExpanded={["design"]} defaultSort={null} loadChildren={loadChildren} rowLabel={d => d.name} maxHeight={380} />
    </Stack>
  );
}