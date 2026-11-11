"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import { photo } from "@/lib/media";
import styles from "./project-folder.module.css";

export interface ProjectFile {
  /** File name, printed at the top of its sheet. */
  name: string;
  /** What the little sheet shows: lines of text, a bar chart, or a picture. */
  kind?: "text" | "chart" | "image";
  /** Picture for `image` sheets. */
  image?: string;
}

export interface ProjectFolderProps {
  /** Folder name, shown under it. */
  name: string;
  /** Short line under the name while the folder is closed, such as "12 files, edited 2h ago". */
  meta?: string;
  /** Files in the folder. The first three peek out; the rest are counted. */
  files?: ProjectFile[];
  /** `accent` fills the folder with the accent color; `neutral` keeps it quiet. */
  tone?: "accent" | "neutral";
  /** Whether the folder is open. Pass it with `onOpenChange` to control it. */
  open?: boolean;
  /** Whether the folder starts open when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when a click or key press opens or closes the folder. */
  onOpenChange?: (open: boolean) => void;
  /** Extra class for the folder button. */
  className?: string;
}

/** How far each sheet travels, in percent of its own size, for the closed, peeking (hover) and open states. */
const POSES = {
  closed: [{ x: "-4%", y: "0%", rotate: -2 }, { x: "0%", y: "0%", rotate: 0 }, { x: "4%", y: "0%", rotate: 2 }],
  peek: [{ x: "-16%", y: "-20%", rotate: -7 }, { x: "0%", y: "-30%", rotate: 0 }, { x: "16%", y: "-20%", rotate: 7 }],
  open: [{ x: "-62%", y: "-46%", rotate: -14 }, { x: "0%", y: "-66%", rotate: 0 }, { x: "62%", y: "-46%", rotate: 14 }],
} as const;
const FLAP = { closed: 0, peek: -24, open: -42 } as const;
const BARS = [46, 72, 58, 88];

function Sheet({ file }: { file: ProjectFile }) {
  const kind = file.kind ?? "text";
  return (
    <span className={styles.paper} data-kind={kind}>
      <span className={styles.paperTitle}>{file.name}</span>
      {kind === "image" ? <img className={styles.picture} src={file.image ?? photo("mountain-ridges").src} alt="" draggable={false} /> : null}
      {kind === "chart" ? <span className={styles.bars}>{BARS.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</span> : null}
      {kind === "text" ? <span className={styles.lines}><span /><span /><span /><span /><span /></span> : <span className={styles.lines}><span /><span /></span>}
    </span>
  );
}

/** A folder whose flap leans open on hover and whose sheets rise and fan out on click. */
export function ProjectFolder({ name, meta, files = [], tone = "neutral", open, defaultOpen = false, onOpenChange, className }: ProjectFolderProps) {
  const reduceMotion = useReducedMotion();
  const [internal, setInternal] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);
  const isOpen = open ?? internal;
  const pose = isOpen ? "open" : hovered ? "peek" : "closed";
  const sheets = files.slice(0, 3);
  const extra = files.length - sheets.length;
  const names = `${sheets.map(file => file.name).join(", ")}${extra > 0 ? ` and ${extra} more` : ""}`;
  const toggle = () => { if (open === undefined) setInternal(!isOpen); onOpenChange?.(!isOpen); };
  // The fan is a little springy; the flap is heavier and settles without bounce.
  const fan = reduceMotion ? { duration: 0 } : { type: "spring" as const, visualDuration: 0.42, bounce: 0.28 };

  return (
    <button
      type="button"
      className={[styles.folder, className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-pose={pose}
      aria-expanded={isOpen}
      onClick={toggle}
      onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setHovered(true); }}
      onBlur={() => setHovered(false)}
    >
      <span className={styles.shape} aria-hidden="true">
        <span className={styles.tab} />
        <span className={styles.back} />
        {sheets.map((file, index) => {
          // Two sheets take the outer poses; one sheet takes the middle.
          const slot = sheets.length === 1 ? 1 : sheets.length === 2 ? index * 2 : index;
          return (
            <motion.span key={file.name} className={styles.sheet} style={{ zIndex: slot === 1 ? 2 : 1 }} initial={false} animate={POSES[pose][slot]} transition={{ ...fan, delay: reduceMotion ? 0 : (pose === "closed" ? sheets.length - 1 - index : index) * 0.045 }}>
              <Sheet file={file} />
            </motion.span>
          );
        })}
        <motion.span className={styles.flap} initial={false} animate={{ rotateX: reduceMotion ? 0 : FLAP[pose] }} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.gentle}>
          {files.length ? <span className={styles.badge}>{files.length}</span> : null}
        </motion.span>
      </span>
      <span className={styles.name}>{name}</span>
      <span className={styles.meta}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={isOpen ? "files" : "meta"} className={styles.metaLine} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }} transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}>
            {isOpen && names ? names : meta ?? `${files.length} files`}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}

const PROJECTS: { name: string; meta: string; tone: "accent" | "neutral"; files: ProjectFile[] }[] = [
  { name: "Brand refresh", meta: "12 files, edited 2h ago", tone: "accent", files: [{ name: "Moodboard", kind: "image", image: photo("terracotta-waves").src }, { name: "Launch brief" }, { name: "Reach by week", kind: "chart" }, ...Array.from({ length: 9 }, (_, index) => ({ name: `Draft ${index + 1}` }))] },
  { name: "Q4 planning", meta: "7 files, edited yesterday", tone: "neutral", files: [{ name: "Roadmap" }, { name: "Budget", kind: "chart" }, { name: "Offsite", kind: "image", image: photo("alpine-lake").src }, ...Array.from({ length: 4 }, (_, index) => ({ name: `Notes ${index + 1}` }))] },
  { name: "Client contracts", meta: "4 files, edited Monday", tone: "neutral", files: [{ name: "Northwind MSA" }, { name: "Renewal terms" }, { name: "Invoices", kind: "chart" }, { name: "Signed copy" }] },
];

/** Ready preview: three project folders; opening one closes the others. */
export function ProjectFolderPreview() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section className={styles.preview} aria-label="Projects">
      <div className={styles.shelf}>
        {PROJECTS.map(project => (
          <ProjectFolder key={project.name} {...project} open={open === project.name} onOpenChange={next => setOpen(next ? project.name : null)} />
        ))}
      </div>
      <p className={styles.hint}>Hover a folder to let its files peek out; click to spread them.</p>
    </section>
  );
}

export default ProjectFolderPreview;
