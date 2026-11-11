var e=`import { Sparkline } from "@/registry/components/sparkline/sparkline";
import { Caption, Row, Stack, Surface } from "./_kit";

const days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 8, 8 + i));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
});

const rows = [
  { label: "Revenue", data: [18, 21, 19, 24, 27, 26, 31, 29, 34, 38, 36, 41, 44, 47], value: "$47.2K", change: "+18.6%", tone: "success" as const, fmt: (v: number) => \`$\${v}.0K\` },
  { label: "Churn", data: [2.1, 2.3, 2.2, 2.6, 2.5, 2.9, 3.1, 3.0, 3.4, 3.3, 3.6, 3.9, 3.8, 4.1], value: "4.1%", change: "+2.0 pts", tone: "danger" as const, fmt: (v: number) => \`\${v}%\` },
  { label: "Latency p95", data: [310, 305, 320, 298, 290, 301, 288, 292, 280, 276, 284, 270, 266, 262], value: "262 ms", change: "-15.5%", tone: "accent" as const, fmt: (v: number) => \`\${v} ms\` },
  { label: "Open tickets", data: [42, 40, 45, 51, 49, 55, 58, 54, 60, 57, 52, 49, 53, 56], value: "56", change: "+33%", tone: "warning" as const, fmt: (v: number) => \`\${v}\` },
];

export default function SparklineDemo() {
  return (
    <Stack gap={4} align="center">
      <Surface width={520}>
        <Row gap={8} justify="center" align="start" style={{ rowGap: "var(--space-8)" }}>
          {rows.map((r) => (
            <Sparkline key={r.label} data={r.data} label={r.label} value={r.value} change={r.change} tone={r.tone} labels={days} formatValue={(v) => r.fmt(v)} width={170} height={56} />
          ))}
        </Row>
      </Surface>
      <Caption>Move the pointer or use the arrow keys along a line to scrub its points.</Caption>
    </Stack>
  );
}
`;export{e as default};