"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Mic, MicOff, Pause, Phone, PhoneOff, Play, SkipBack, SkipForward, Timer, X } from "lucide-react";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { motionTokens } from "@/lib/motion-tokens";
import { avatar, photo } from "@/lib/media";
import styles from "./dynamic-island.module.css";

export type IslandActivity = "idle" | "call" | "timer" | "music";

export interface IslandCaller {
  /** Caller's name. */
  name: string;
  /** Avatar image. */
  avatar: string;
}

export interface IslandTrack {
  /** Track title. */
  title: string;
  /** Who plays it. */
  artist: string;
  /** Cover image. */
  cover: string;
  /** Length in seconds. */
  duration: number;
}

export interface DynamicIslandProps {
  /** What the island is showing. Pass it with `onActivityChange` to control it. */
  activity?: IslandActivity;
  /** Activity at the start when uncontrolled. */
  defaultActivity?: IslandActivity;
  /** Called when the island changes activity by itself: a call is declined or ended, or a timer is cancelled. */
  onActivityChange?: (activity: IslandActivity) => void;
  /** Whether the island shows the large view of its activity. Pass it with `onExpandedChange` to control it. */
  expanded?: boolean;
  /** Whether the island starts expanded when uncontrolled. */
  defaultExpanded?: boolean;
  /** Called when a tap, Escape or a click outside expands or collapses the island. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Who is calling in the call activity. */
  caller?: IslandCaller;
  /** Queue for the music activity. */
  tracks?: IslandTrack[];
  /** Length of the timer activity in seconds. */
  timerSeconds?: number;
  /** Extra class for the pill. */
  className?: string;
}

const sampleCaller: IslandCaller = { name: "Jasmine Brooks", avatar: avatar("jasmine-brooks") };
const sampleTracks: IslandTrack[] = [
  { title: "Low Tide", artist: "Marlow Quay", cover: photo("sea-at-dusk").src, duration: 214 },
  { title: "Paper Lanterns", artist: "Juniper Vale", cover: photo("terracotta-waves").src, duration: 187 },
  { title: "Blue Hour", artist: "The Sundials", cover: photo("alpine-lake").src, duration: 242 },
];

/** Outer size of the pill for each view, in px. The content of a view is laid out at its final size, so only the pill itself stretches. */
const SIZES = {
  idle: { width: 122, height: 36, borderRadius: 18 },
  compact: { width: 214, height: 36, borderRadius: 18 },
  call: { width: 344, height: 80, borderRadius: 40 },
  timer: { width: 344, height: 80, borderRadius: 40 },
  music: { width: 344, height: 188, borderRadius: 42 },
} as const;

const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

function Bars({ active }: { active: boolean }) {
  return <span className={styles.bars} data-active={active} aria-hidden="true"><span /><span /><span /><span /></span>;
}

function Round({ label, tone, onClick, children, pressed }: { label: string; tone?: "accept" | "decline" | "accent"; onClick: () => void; children: ReactNode; pressed?: boolean }) {
  return <button type="button" className={styles.round} data-tone={tone} aria-label={label} aria-pressed={pressed} onClick={onClick}>{children}</button>;
}

/** A pill that grows from a resting dot into a compact live activity and on into a full view (call, timer or music), with one spring for every change of shape. */
export function DynamicIsland({ activity, defaultActivity = "idle", onActivityChange, expanded, defaultExpanded = false, onExpandedChange, caller = sampleCaller, tracks: queue = sampleTracks, timerSeconds = 300, className }: DynamicIslandProps) {
  // An empty queue falls back to the samples, so the music view always has something to show.
  const tracks = queue.length ? queue : sampleTracks;
  const reduceMotion = useReducedMotion();
  const [activityInternal, setActivityInternal] = useState(defaultActivity);
  const [expandedInternal, setExpandedInternal] = useState(defaultExpanded);
  const current = activity ?? activityInternal;
  const open = (expanded ?? expandedInternal) && current !== "idle";
  const [call, setCall] = useState({ active: false, seconds: 0, muted: false });
  const [timer, setTimer] = useState({ left: timerSeconds, running: true });
  const [music, setMusic] = useState({ index: 0, position: 48, playing: true });
  const island = useRef<HTMLDivElement>(null);
  const track = tracks[music.index % tracks.length] ?? sampleTracks[0]!;

  const setActivity = (next: IslandActivity) => { if (activity === undefined) setActivityInternal(next); onActivityChange?.(next); };
  const setOpen = (next: boolean) => { if (expanded === undefined) setExpandedInternal(next); onExpandedChange?.(next); };
  const dismiss = () => { setOpen(false); setActivity("idle"); };

  // A new call always starts ringing; a finished timer starts over.
  useEffect(() => {
    if (current === "call") setCall({ active: false, seconds: 0, muted: false });
    if (current === "timer") setTimer(now => (now.left <= 0 ? { left: timerSeconds, running: true } : now));
  }, [current, timerSeconds]);

  // One clock drives whichever activity is live.
  useEffect(() => {
    if (current === "idle") return;
    const tick = window.setInterval(() => {
      if (current === "call") setCall(now => (now.active ? { ...now, seconds: now.seconds + 1 } : now));
      if (current === "timer") setTimer(now => (now.running && now.left > 0 ? { ...now, left: now.left - 1 } : now));
      if (current === "music") setMusic(now => (!now.playing ? now : now.position + 1 >= (tracks[now.index % tracks.length]?.duration ?? 200) ? { ...now, index: (now.index + 1) % tracks.length, position: 0 } : { ...now, position: now.position + 1 }));
    }, 1000);
    return () => window.clearInterval(tick);
  }, [current, tracks]);

  // Expanded, the island behaves like a small popover: Escape or a press outside folds it back.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => { if (event.target instanceof Node && !island.current?.contains(event.target)) setOpen(false); };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const inside = island.current?.contains(document.activeElement);
      setOpen(false);
      if (inside) window.requestAnimationFrame(() => island.current?.querySelector<HTMLElement>("[data-compact]")?.focus());
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the listeners only need to follow `open`
  }, [open]);

  const view = current === "idle" ? "idle" : open ? current : "compact";
  const size = SIZES[view];
  const step = (by: number) => setMusic(now => ({ ...now, index: (now.index + by + tracks.length) % tracks.length, position: 0 }));
  const timerDone = timer.left <= 0;

  const compact = current === "call" ? (
    <><img className={styles.face} src={caller.avatar} alt="" />{call.active ? <><Bars active={!call.muted} /><span className={styles.digits}>{time(call.seconds)}</span></> : <span className={styles.ringing}><Phone size={14} aria-hidden="true" /></span>}</>
  ) : current === "timer" ? (
    <><span className={styles.glyph}><Timer size={15} aria-hidden="true" /></span><span className={styles.digits}>{timerDone ? "Done" : time(timer.left)}</span></>
  ) : (
    <><img className={styles.cover} src={track.cover} alt="" /><Bars active={music.playing} /></>
  );
  const compactLabel = current === "call" ? (call.active ? `Call with ${caller.name}, ${time(call.seconds)}` : `${caller.name} is calling`) : current === "timer" ? (timerDone ? "Timer done" : `Timer, ${time(timer.left)} left`) : `${music.playing ? "Playing" : "Paused"}: ${track.title} by ${track.artist}`;

  return (
    <motion.div
      ref={island}
      className={[styles.island, className].filter(Boolean).join(" ")}
      data-view={view}
      role="group"
      aria-label="Live activity"
      initial={false}
      animate={size}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", visualDuration: 0.42, bounce: 0.26 }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`${current}-${view}`}
          className={styles.view}
          style={{ width: size.width, height: size.height }}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88, filter: `blur(${motionTokens.blur.text}px)` }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: reduceMotion ? { duration: motionTokens.duration.fast } : { ...motionTokens.spring.gentle, delay: 0.06 } }}
          exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.88, filter: `blur(${motionTokens.blur.text}px)`, transition: { duration: motionTokens.duration.instant } }}
        >
          {view === "idle" ? <span className={styles.lens} aria-hidden="true" /> : null}

          {view === "compact" ? <button type="button" data-compact className={styles.compact} aria-expanded={false} aria-label={`${compactLabel}. Expand`} onClick={() => setOpen(true)}>{compact}</button> : null}

          {view === "call" ? (
            <div className={styles.callView}>
              <img className={styles.portrait} src={caller.avatar} alt="" />
              <p className={styles.lines}><span className={styles.small}>{call.active ? (call.muted ? "Muted" : time(call.seconds)) : "Incoming call"}</span><span className={styles.strong}>{caller.name}</span></p>
              {call.active ? <Round label={call.muted ? "Unmute" : "Mute"} pressed={call.muted} onClick={() => setCall(now => ({ ...now, muted: !now.muted }))}>{call.muted ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}</Round> : null}
              <Round label={call.active ? "End call" : "Decline"} tone="decline" onClick={dismiss}><PhoneOff size={18} aria-hidden="true" /></Round>
              {call.active ? null : <Round label="Accept" tone="accept" onClick={() => setCall(now => ({ ...now, active: true }))}><Phone size={18} aria-hidden="true" /></Round>}
            </div>
          ) : null}

          {view === "timer" ? (
            <div className={styles.timerView}>
              <Round label={timerDone ? "Restart timer" : timer.running ? "Pause timer" : "Resume timer"} tone="accent" onClick={() => setTimer(now => (now.left <= 0 ? { left: timerSeconds, running: true } : { ...now, running: !now.running }))}>{timer.running && !timerDone ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}</Round>
              <Round label="Cancel timer" onClick={dismiss}><X size={18} aria-hidden="true" /></Round>
              <p className={styles.countdown}><span className={styles.small}>{timerDone ? "Time is up" : timer.running ? "Timer" : "Paused"}</span><span className={styles.big} role="timer">{time(timer.left)}</span></p>
              <span className={styles.meter} aria-hidden="true"><span style={{ transform: `scaleX(${timer.left / Math.max(1, timerSeconds)})` }} /></span>
            </div>
          ) : null}

          {view === "music" ? (
            <div className={styles.musicView}>
              <div className={styles.nowPlaying}>
                <img className={styles.art} src={track.cover} alt="" />
                <p className={styles.lines}><span className={styles.strong}>{track.title}</span><span className={styles.small}>{track.artist}</span></p>
                <Bars active={music.playing} />
              </div>
              <div className={styles.scrub}>
                <span className={styles.digits}>{time(music.position)}</span>
                <span className={styles.progress} role="progressbar" aria-label="Playback position" aria-valuemin={0} aria-valuemax={track.duration} aria-valuenow={music.position} aria-valuetext={`${time(music.position)} of ${time(track.duration)}`}><span style={{ transform: `scaleX(${music.position / track.duration})` }} /></span>
                <span className={styles.digits}>-{time(track.duration - music.position)}</span>
              </div>
              <div className={styles.transport}>
                <Round label="Previous track" onClick={() => step(-1)}><SkipBack size={18} aria-hidden="true" /></Round>
                <Round label={music.playing ? "Pause" : "Play"} tone="accent" onClick={() => setMusic(now => ({ ...now, playing: !now.playing }))}>{music.playing ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}</Round>
                <Round label="Next track" onClick={() => step(1)}><SkipForward size={18} aria-hidden="true" /></Round>
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

const ACTIVITIES = [{ value: "idle", label: "Idle" }, { value: "call", label: "Call" }, { value: "timer", label: "Timer" }, { value: "music", label: "Music" }];

/** Ready preview: the island at the top of a phone screen, with a switch for the activity it shows. */
export function DynamicIslandPreview() {
  const [activity, setActivity] = useState<IslandActivity>("music");
  const [expanded, setExpanded] = useState(false);
  return (
    <section className={styles.preview} aria-label="Dynamic island">
      <div className={styles.phone}>
        <div className={styles.statusBar} aria-hidden="true"><span>9:41</span><span className={styles.battery}><span /></span></div>
        <div className={styles.dock}><DynamicIsland activity={activity} onActivityChange={setActivity} expanded={expanded} onExpandedChange={setExpanded} /></div>
        <div className={styles.lock} aria-hidden="true"><span className={styles.date}>Wednesday, 11 November</span><span className={styles.clock}>9:41</span></div>
      </div>
      {/* An incoming call opens by itself; the other activities start compact. */}
      <SegmentedControl label="Activity" options={ACTIVITIES} value={activity} onValueChange={next => { setActivity(next as IslandActivity); setExpanded(next === "call"); }} />
      <p className={styles.hint}>Tap the island to expand it. Escape or a click outside folds it back.</p>
    </section>
  );
}

export default DynamicIslandPreview;
