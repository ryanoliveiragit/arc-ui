import { useState } from "react";
import { Gauge } from "@/registry/components/gauge/gauge";
import { Slider } from "@/registry/components/slider/slider";
import { Caption, Row, Stack } from "./_kit";

export default function GaugeDemo() {
  const [load, setLoad] = useState(42);
  return (
    <Stack gap={8} align="center" width={640}>
      <Row gap={8} justify="center" align="start">
        <div style={{ width: 220 }}>
          <Gauge
            value={load}
            label="Server load"
            detail="12 of 16 cores busy"
            thresholds={[
              { from: 0, tone: "success", label: "Healthy" },
              { from: 60, tone: "warning", label: "Busy" },
              { from: 85, tone: "danger", label: "Critical" },
            ]}
          />
        </div>
        <div style={{ width: 220 }}>
          <Gauge value={7.4} min={0} max={10} label="Support score" detail="Average of 312 ratings" />
        </div>
      </Row>
      <Stack gap={2} width={320}>
        <Slider label="Server load" value={load} onValueChange={setLoad} min={0} max={100} />
        <Caption>Drag the slider: the ring, the number and the state label follow the thresholds.</Caption>
      </Stack>
    </Stack>
  );
}
