import { useEffect, useRef, useState } from "react";
import { useAnimationFrame, useMotionValue } from "motion/react";
import VoiceOrb from "@/registry/components/voice-orb/voice-orb";
import type { VoiceOrbState } from "@/registry/components/voice-orb/voice-orb";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Caption, Stack } from "./_kit";

const options = [{ value: "idle", label: "Idle" }, { value: "listening", label: "Listening" }, { value: "thinking", label: "Thinking" }, { value: "speaking", label: "Speaking" }];
/** One voice turn: listen, think, answer, rest. Milliseconds each state lasts before the next one. */
const turn: Partial<Record<VoiceOrbState, { next: VoiceOrbState; after: number }>> = { listening: { next: "thinking", after: 3200 }, thinking: { next: "speaking", after: 2000 }, speaking: { next: "idle", after: 4200 } };
const hints: Record<VoiceOrbState, string> = { idle: "Press the orb to start a turn.", listening: "The rings follow the microphone level.", thinking: "Working on the answer.", speaking: "The bars follow the voice. Press the orb to interrupt." };

export default function VoiceOrbDemo() {
  const [state, setState] = useState<VoiceOrbState>("listening");
  const [auto, setAuto] = useState(true);
  const level = useMotionValue(0);
  const current = useRef(state);
  current.current = state;

  // A stand-in for a real audio level: syllable-like bursts inside slower phrases.
  useAnimationFrame(time => {
    const seconds = time / 1000;
    const live = current.current === "listening" || current.current === "speaking";
    const syllable = (0.5 + 0.5 * Math.sin(seconds * 7.3)) * (0.6 + 0.4 * Math.sin(seconds * 2.1 + 1));
    const phrase = 0.7 + 0.3 * Math.sin(seconds * 0.9);
    level.set(live ? Math.min(1, 0.25 + syllable * 0.75 * phrase) : 0);
  });

  // While a turn is running, each state hands over to the next one on its own.
  useEffect(() => {
    const step = turn[state];
    if (!auto || !step) return;
    const timer = window.setTimeout(() => setState(step.next), step.after);
    return () => window.clearTimeout(timer);
  }, [auto, state]);

  return (
    <Stack gap={5} align="center" width={420}>
      <VoiceOrb state={state} level={level} size={224} label="Assistant voice" onPress={() => { setAuto(true); setState(state === "idle" ? "listening" : "idle"); }} />
      <SegmentedControl label="Orb state" value={state} onValueChange={value => { setAuto(false); setState(value as VoiceOrbState); }} options={options} />
      <Caption>{hints[state]}</Caption>
    </Stack>
  );
}
