var e=`import { useEffect, useRef, useState } from "react";
import { FileArchive } from "lucide-react";
import ToastProgress from "@/registry/components/toast-progress/toast-progress";
import type { ToastProgressStatus } from "@/registry/components/toast-progress/toast-progress";
import { Button } from "@/registry/components/button/button";
import { Caption, Row } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./toast-progress.module.css";

export const stage: DemoStage = { height: 480 };

const file = { name: "brand-kit.zip", megabytes: 42 };
/** Percent gained on each tick. A fixed sequence, so the demo plays the same way every time. */
const steps = [3, 6, 4, 8, 5, 9, 4, 7, 6, 5];
/** Where the weak connection gives up. */
const dropAt = 64;

interface Upload { open: boolean; status: ToastProgressStatus; value: number }

const fileState: Record<ToastProgressStatus | "idle", string> = { idle: "Ready to upload", loading: "Uploading", success: "Uploaded to Brand assets", error: "Upload interrupted" };

export default function ToastProgressDemo() {
  const [upload, setUpload] = useState<Upload | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const stop = () => window.clearInterval(timer.current);
  useEffect(() => stop, []);

  function start(from: number, failAt?: number) {
    stop();
    let value = from;
    let tick = 0;
    setUpload({ open: true, status: "loading", value });
    timer.current = window.setInterval(() => {
      value = Math.min(value + steps[tick++ % steps.length]!, failAt ?? 100);
      const status: ToastProgressStatus = failAt !== undefined && value >= failAt ? "error" : value >= 100 ? "success" : "loading";
      if (status !== "loading") stop();
      setUpload(current => current && { ...current, status, value });
    }, 150);
  }

  const status = upload?.status ?? "idle";
  const value = upload?.value ?? 0;
  // The full upload takes about three seconds at this pace.
  const secondsLeft = Math.max(Math.ceil((100 - value) * 3 / 100), 1);
  const copy = status === "success"
    ? { title: "Upload complete", description: \`\${file.name} is ready to share.\` }
    : status === "error"
      ? { title: "Upload interrupted", description: \`The connection dropped at \${value}%. Nothing was lost.\` }
      : { title: \`Uploading \${file.name}\`, description: \`About \${secondsLeft} \${secondsLeft === 1 ? "second" : "seconds"} left\` };

  return (
    <div className={styles.scene}>
      <section className={styles.panel} aria-label="Brand assets">
        <div className={styles.file}>
          <span className={styles.tile} aria-hidden="true"><FileArchive width={20} height={20} strokeWidth={1.75} /></span>
          <span className={styles.text}><span className={styles.name}>{file.name}</span><span className={styles.detail}>{file.megabytes} MB, {fileState[status]}</span></span>
        </div>
        <Row gap={2}>
          <Button onClick={() => start(0)}>Upload file</Button>
          <Button variant="secondary" onClick={() => start(0, dropAt)}>Upload on a weak signal</Button>
        </Row>
      </section>
      <Caption className={styles.note}>The weak signal drops at {dropAt}%: press Retry in the toast to pick up from there.</Caption>
      <ToastProgress
        open={upload?.open ?? false}
        onOpenChange={open => { if (!open) stop(); setUpload(current => current && { ...current, open }); }}
        position="bottom-center"
        contained
        className={styles.toast}
        // Success is left to the component: it shows as soon as the value reaches 100. Only the failure has to be told.
        status={status === "error" ? "error" : undefined}
        value={value}
        title={copy.title}
        description={copy.description}
        onRetry={() => start(value)}
        duration={4000}
      />
    </div>
  );
}
`;export{e as default};