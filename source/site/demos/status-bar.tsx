import { useState } from "react";
import StatusBar, { type StatusDay } from "@/registry/components/status-bar/status-bar";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

type Incident = Omit<StatusDay, "date">;
const LAST_DAY = Date.UTC(2026, 10, 10);

/** Ninety days ending on a fixed date; every day is operational unless an incident is listed for it. */
function history(incidents: Record<number, Incident>): StatusDay[] {
  return Array.from({ length: 90 }, (_, index) => ({
    date: new Date(LAST_DAY - (89 - index) * 86_400_000).toISOString().slice(0, 10),
    ...(incidents[index] ?? { status: "operational" as const }),
  }));
}

const services: Record<string, { name: string; days: StatusDay[] }> = {
  api: {
    name: "API gateway",
    days: history({
      12: { status: "degraded", uptime: 99.1, note: "Elevated latency in eu-west for 13 minutes." },
      13: { status: "degraded", uptime: 99.6, note: "Latency recovering after the eu-west rollback." },
      41: { status: "outage", uptime: 94.2, note: "Primary database failover, 83 minutes of errors." },
      58: { status: "maintenance", uptime: 100, note: "Scheduled certificate rotation, no downtime." },
      77: { status: "degraded", uptime: 99.3, note: "Slow token refresh for a share of sessions." },
    }),
  },
  dashboard: {
    name: "Dashboard",
    days: history({
      0: { status: "unknown" }, 1: { status: "unknown" }, 2: { status: "unknown" },
      27: { status: "maintenance", uptime: 100, note: "Planned upgrade of the reporting cluster." },
      63: { status: "degraded", uptime: 98.8, note: "Charts loaded slowly for 17 minutes." },
    }),
  },
  webhooks: {
    name: "Webhooks",
    days: history({
      19: { status: "outage", uptime: 91.5, note: "Delivery queue stalled for two hours." },
      20: { status: "degraded", uptime: 98.9, note: "Backlog draining, deliveries delayed." },
      52: { status: "degraded", uptime: 99.5, note: "Retries delayed by a few minutes." },
      70: { status: "maintenance", uptime: 100, note: "Queue storage migration." },
      88: { status: "degraded", uptime: 99.2, note: "Delayed deliveries to some endpoints." },
      89: { status: "degraded", uptime: 99.7, note: "Still investigating delayed deliveries." },
    }),
  },
};

const dayLabel = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

export default function StatusBarDemo() {
  const [service, setService] = useState("api");
  const [selected, setSelected] = useState<string | null>(null);
  const { name, days } = services[service]!;
  const day = days.find(entry => entry.date === selected);

  return (
    <Stack gap={4} width={640}>
      <SegmentedControl label="Service" value={service} onValueChange={value => { setService(value); setSelected(null); }}
        options={[{ value: "api", label: "API" }, { value: "dashboard", label: "Dashboard" }, { value: "webhooks", label: "Webhooks" }]} />
      <Surface>
        <StatusBar label={name} days={days} selectedDate={selected} onSelectDate={setSelected} />
      </Surface>
      <Caption>
        {day
          ? `${dayLabel.format(new Date(`${day.date}T00:00:00Z`))}: ${day.note ?? (day.status === "unknown" ? "No data recorded for this day." : "No incidents reported.")}`
          : "Hover or use the arrow keys along the strip, click a day to pin it, or pick a status in the legend."}
      </Caption>
    </Stack>
  );
}
