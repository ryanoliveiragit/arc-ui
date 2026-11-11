import { useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { ShaderBackground } from "@/registry/components/shader-background/shader-background";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Button } from "@/registry/components/button/button";
import type { DemoStage } from "./_kit";
import styles from "./shader-background.module.css";

export const stage: DemoStage = { layout: "fill", height: 480 };

const moods = [{ value: "calm", label: "Calm" }, { value: "flow", label: "Flow" }, { value: "rush", label: "Rush" }];
const speeds: Record<string, number> = { calm: 0.45, flow: 1, rush: 2.6 };

export default function ShaderBackgroundDemo() {
  const [mood, setMood] = useState("flow");
  const [paused, setPaused] = useState(false);

  return (
    <ShaderBackground className={styles.hero} speed={speeds[mood] ?? 1} paused={paused}>
      <div className={styles.copy}>
        <p className={styles.kicker}>Tidewater Cloud</p>
        <h2 className={styles.title}>Deploys that stay out of your way</h2>
        <p className={styles.lead}>Push a branch and get a preview in seconds. The background is a live shader tinted with your accent color.</p>
        <div className={styles.actions}>
          <Button>Start a project<ArrowRight size={16} aria-hidden="true" /></Button>
          <Button variant="secondary" onClick={() => setPaused(value => !value)} aria-pressed={paused}>
            {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            {paused ? "Resume" : "Pause"}
          </Button>
        </div>
        <SegmentedControl label="Flow speed" options={moods} value={mood} onValueChange={setMood} />
      </div>
    </ShaderBackground>
  );
}
