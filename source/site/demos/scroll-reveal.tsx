import { useRef, useState } from "react";
import { CalendarClock, FileSpreadsheet, Gauge, KeyRound, Sparkles, Workflow } from "lucide-react";
import { ScrollProgress, ScrollReveal } from "@/registry/components/scroll-reveal/scroll-reveal";
import Switch from "@/registry/components/switch/switch";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./scroll-reveal.module.css";

export const stage: DemoStage = { height: 600 };

const numbers = [
  { value: "2.4×", label: "faster first load" },
  { value: "38%", label: "smaller exports" },
  { value: "112", label: "fixes shipped" },
];

const features = [
  { icon: Workflow, title: "Automations", text: "Chain triggers and actions without leaving the board." },
  { icon: CalendarClock, title: "Scheduled reports", text: "Send a digest to any channel, on your calendar." },
  { icon: FileSpreadsheet, title: "Spreadsheet import", text: "Map columns once and reuse the mapping next time." },
  { icon: KeyRound, title: "Scoped API keys", text: "Limit a key to one workspace and one permission set." },
];

const fixes = ["Comments keep their place after a reload", "Filters survive switching between views", "Avatars no longer flicker in long lists", "Keyboard focus returns to the row you edited", "CSV exports respect the visible columns", "Mentions work in private projects"];

export default function ScrollRevealDemo() {
  const scroller = useRef<HTMLDivElement>(null);
  const [repeat, setRepeat] = useState(false);

  return (
    <Stack gap={4} width={540}>
      <div ref={scroller} className={styles.scroller} tabIndex={0} role="region" aria-label="Atlas 3.0 release notes">
        <ScrollProgress container={scroller} label="Reading progress" />
        {/* The key remounts the page when the mode changes, so every section starts hidden again. */}
        <article key={repeat ? "repeat" : "once"} className={styles.page}>
          <ScrollReveal root={scroller} effect="blur" once={!repeat} amount={0.4}>
            <p className={styles.kicker}><Sparkles size={14} aria-hidden="true" />Release notes</p>
            <h3 className={styles.title}>Atlas 3.0 is here</h3>
            <p className={styles.lead}>A faster workspace, automations for the repetitive parts, and a long list of fixes you asked for. Scroll to see what changed.</p>
          </ScrollReveal>

          <ScrollReveal root={scroller} effect="scale" once={!repeat} stagger={0.1} className={styles.numbers}>
            {numbers.map(item => <div key={item.label} className={styles.number}><strong>{item.value}</strong><span>{item.label}</span></div>)}
          </ScrollReveal>

          <ScrollReveal root={scroller} effect="slide" from="bottom" once={!repeat} className={styles.features}>
            {features.map(item => (
              <div key={item.title} className={styles.feature}>
                <span className={styles.featureIcon}><item.icon size={17} aria-hidden="true" /></span>
                <div><strong>{item.title}</strong><p>{item.text}</p></div>
              </div>
            ))}
          </ScrollReveal>

          <ScrollReveal root={scroller} effect="slide" from="left" once={!repeat} amount={0.5}>
            <figure className={styles.quote}>
              <Gauge size={18} aria-hidden="true" />
              <blockquote>“Our monthly close went from two days of exports to one scheduled report.”</blockquote>
              <figcaption>Sofia Ramirez, operations lead</figcaption>
            </figure>
          </ScrollReveal>

          <ScrollReveal root={scroller} effect="fade" once={!repeat} stagger={0.05}>
            <h4 className={styles.subtitle}>Fixes</h4>
            <ul className={styles.fixes}>{fixes.map(fix => <li key={fix}>{fix}</li>)}</ul>
            <p className={styles.end}>That is everything in 3.0. Thanks for the reports.</p>
          </ScrollReveal>
        </article>
      </div>
      <Switch label="Replay on re-entry" checked={repeat} onCheckedChange={setRepeat} />
    </Stack>
  );
}
