import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FileArchive, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ToastAction from "@/registry/components/toast-action/toast-action";
import type { ToastActionCloseReason } from "@/registry/components/toast-action/toast-action";
import { Button } from "@/registry/components/button/button";
import { motionTokens } from "@/lib/motion-tokens";
import { Caption, demoStage } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./toast-action.module.css";

export const stage: DemoStage = { height: 480 };

interface SharedFile { id: string; name: string; detail: string; Icon: LucideIcon }

const sharedFiles: SharedFile[] = [
  { id: "report", name: "Q3-report.pdf", detail: "2.4 MB, edited yesterday", Icon: FileText },
  { id: "forecast", name: "Forecast-2027.xlsx", detail: "860 KB, edited 2 hours ago", Icon: FileSpreadsheet },
  { id: "brand", name: "brand-kit.zip", detail: "42 MB, shared with 6 people", Icon: FileArchive },
];
const hint = "Delete a file, then hover or focus the toast to hold its countdown.";

export default function ToastActionDemo() {
  const reduce = useReducedMotion();
  // On the docs page the preview starts right after a delete: the last file is gone and its Undo toast is counting down.
  const [inStage] = useState(() => demoStage() !== null);
  const [files, setFiles] = useState(() => inStage ? sharedFiles.slice(0, -1) : sharedFiles);
  const [removed, setRemoved] = useState<{ file: SharedFile; index: number; count: number } | null>(() => inStage ? { file: sharedFiles[sharedFiles.length - 1]!, index: sharedFiles.length - 1, count: 1 } : null);
  const [open, setOpen] = useState(inStage);
  const [note, setNote] = useState(hint);

  function remove(file: SharedFile) {
    setRemoved({ file, index: files.indexOf(file), count: (removed?.count ?? 0) + 1 });
    setFiles(files.filter(item => item !== file));
    setOpen(true);
    setNote(hint);
  }

  function restore() {
    if (!removed) return;
    const next = [...files];
    next.splice(Math.min(removed.index, next.length), 0, removed.file);
    setFiles(next);
    setNote(`${removed.file.name} is back where it was.`);
  }

  function onOpenChange(next: boolean, reason?: ToastActionCloseReason) {
    setOpen(next);
    if (removed && reason !== "action") setNote(`${removed.file.name} was deleted for good.`);
  }

  return (
    <div className={styles.scene}>
      <section className={styles.panel} aria-label="Shared files">
        <header className={styles.header}><span>Shared files</span><span className={styles.count}>{files.length}</span></header>
        <ul className={styles.list}>
          {/* Rows fold their height, so the ones below slide up (or make room again) in the same motion. */}
          <AnimatePresence initial={false}>
            {files.map(file => (
              <motion.li
                key={file.id}
                className={styles.item}
                initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={reduce ? { duration: motionTokens.duration.instant } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}
              >
                <div className={styles.row}>
                  <span className={styles.tile} aria-hidden="true"><file.Icon width={18} height={18} strokeWidth={1.75} /></span>
                  <span className={styles.text}><span className={styles.name}>{file.name}</span><span className={styles.detail}>{file.detail}</span></span>
                  <button type="button" className={styles.remove} aria-label={`Delete ${file.name}`} onClick={() => remove(file)}><Trash2 width={16} height={16} strokeWidth={1.75} aria-hidden="true" /></button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {files.length === 0 ? <div className={styles.empty}><span>No shared files left.</span><Button variant="secondary" size="sm" onClick={() => { setFiles(sharedFiles); setOpen(false); setRemoved(null); setNote(hint); }}>Bring the samples back</Button></div> : null}
      </section>
      <Caption className={styles.note}>{note}</Caption>
      <ToastAction
        open={open}
        onOpenChange={onOpenChange}
        position="bottom-center"
        contained
        className={styles.toast}
        resetKey={removed?.count}
        icon={<Trash2 width={15} height={15} strokeWidth={2} />}
        title={removed ? `${removed.file.name} deleted` : ""}
        description="It stays recoverable until this closes."
        actionLabel="Undo"
        onAction={restore}
        confirmation="File restored"
        confirmationDescription={removed ? `${removed.file.name} is back in Shared files.` : undefined}
        duration={6000}
      />
    </div>
  );
}
