import { useEffect, useState } from "react";
import { Progress } from "@/registry/components/progress/progress";
import { Button } from "@/registry/components/button/button";
import { Row, Stack } from "./_kit";

export default function ProgressDemo() {
  const [value, setValue] = useState(8);
  const [running, setRunning] = useState(true);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setValue(v => (v >= 100 ? (setRunning(false), 100) : Math.min(100, v + 7))), 700);
    return () => window.clearInterval(timer);
  }, [running]);
  return (
    <Stack gap={6} width={420}>
      <Progress label="Uploading Q3-report.pdf" value={value} showValue />
      <Row>
        <Button size="sm" variant="secondary" onClick={() => { setValue(0); setRunning(true); }}>Restart upload</Button>
        <Button size="sm" variant="ghost" onClick={() => setRunning(r => !r)}>{running ? "Pause" : "Resume"}</Button>
      </Row>
      <Progress label="Profile completeness" value={72} showValue />
      <Progress label="Storage used" value={18} max={50} showValue />
    </Stack>
  );
}
