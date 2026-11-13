import { useCallback, useRef, useState } from "react";
import AvatarUpload, { type AvatarUploadHandle } from "@/registry/components/avatar-upload/avatar-upload";
import { portrait } from "@/lib/media";
import type { DemoStage } from "./_kit";
import styles from "./avatar-upload.module.css";

export const stage: DemoStage = { height: 540 };

type PortraitId = Parameters<typeof portrait>[0];

/** Pseudo-random bytes, so a fake oversized file actually reports its weight. */
const readBytes = (value: number) => {
  const buffer = new ArrayBuffer(value);
  const view = new DataView(buffer);
  let seed = 0x9e3779b9;
  for (let i = 0; i < value; i += 512) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    view.setUint32(i, seed, true);
  }
  return buffer;
};

interface UploadOptions {
  report(progress: number): void;
  signal: AbortSignal;
  /** Progress point at which this attempt breaks, when the "Fail next upload" chip is armed. */
  failAt?: number;
}

/** ~1.2 s of ticking progress, abortable through the signal. */
function simulateUpload({ report, signal, failAt }: UploadOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    let p = 0;
    const tick = window.setInterval(() => {
      if (signal.aborted) {
        window.clearInterval(tick);
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      p = Math.min(1, p + 0.045 + Math.random() * 0.05);
      report(p);
      if (failAt != null && p >= failAt) {
        window.clearInterval(tick);
        reject(new Error("network"));
        return;
      }
      if (p >= 1) {
        window.clearInterval(tick);
        resolve();
      }
    }, 80);
    signal.addEventListener(
      "abort",
      () => {
        window.clearInterval(tick);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

const SAMPLES = [
  { id: "andre-williams", name: "Andre Williams" },
  { id: "sofia-ramirez", name: "Sofia Ramirez" },
  { id: "mateo-alvarez", name: "Mateo Alvarez" },
] as const;

export default function AvatarUploadDemo() {
  const picker = useRef<AvatarUploadHandle>(null);
  const [photo, setPhoto] = useState<string | null>(() => portrait("chloe-nguyen"));
  const [failArmed, setFailArmed] = useState(false);
  const failArmedRef = useRef(failArmed);
  failArmedRef.current = failArmed;

  const onUpload = useCallback(
    (image: Blob, options: { report: (progress: number) => void; signal: AbortSignal }) =>
      simulateUpload({
        report: options.report,
        signal: options.signal,
        // Consumed once: the retry that follows the failure succeeds, like the network clearing up.
        failAt: failArmedRef.current ? 0.62 : undefined,
      }).finally(() => {
        if (failArmedRef.current) setFailArmed(false);
      }),
    [],
  );

  /** Samples ship as SVG stand-ins; rasterize them through a canvas into real PNG files so decode always succeeds. */
  const useSample = useCallback((id: PortraitId) => {
    void (async () => {
      try {
        const res = await fetch(portrait(id));
        const blob = await res.blob();
        const img = new Image();
        img.onload = async () => {
          const source = img.src;
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 128;
          canvas.height = img.naturalHeight || 128;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const png = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
          if (png) picker.current?.selectFile(new File([png], `${id}.png`, { type: "image/png" }));
          URL.revokeObjectURL(source);
        };
        img.src = URL.createObjectURL(blob);
      } catch {
        // Media unavailable in this build: ignore.
      }
    })();
  }, []);

  const twelveMb = useCallback(() => {
    picker.current?.selectFile(new File([readBytes(12_400_000)], "summer-trip.png", { type: "image/png" }));
  }, []);

  const pdfFile = useCallback(() => {
    picker.current?.selectFile(new File(["%PDF-1.4\n% invoice"], "invoice.pdf", { type: "application/pdf" }));
  }, []);

  return (
    <section className={styles.card} aria-labelledby="avatar-upload-demo-title">
      <header className={styles.header}>
        <h3 id="avatar-upload-demo-title" className={styles.title}>Profile</h3>
        <p className={styles.lede}>Click or drop a photo on the avatar. Uploads are simulated.</p>
      </header>

      <AvatarUpload
        ref={picker}
        name="Chloe Nguyen"
        src={photo}
        onUpload={onUpload}
        onRemove={() => setPhoto(null)}
      />

      <div className={styles.tools}>
        <div className={styles.group}>
          <span id="avatar-upload-samples" className={styles.groupLabel}>Sample photos</span>
          <div role="group" aria-labelledby="avatar-upload-samples" className={styles.samples}>
            {SAMPLES.map(sample => (
              <button
                key={sample.id}
                type="button"
                className={styles.sample}
                aria-label={`Use photo of ${sample.name}`}
                onClick={() => useSample(sample.id)}
              >
                <img src={portrait(sample.id)} alt="" width={32} height={32} />
              </button>
            ))}
          </div>
        </div>
        <div className={styles.group}>
          <span className={styles.groupLabel}>Try a failure</span>
          <div className={styles.chips}>
            <button type="button" className={styles.chip} onClick={twelveMb}>12 MB photo</button>
            <button type="button" className={styles.chip} onClick={pdfFile}>PDF file</button>
            <button
              type="button"
              className={styles.chip}
              aria-pressed={failArmed}
              onClick={() => setFailArmed(current => !current)}
            >
              <span className={styles.check} aria-hidden="true" />Fail next upload
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
