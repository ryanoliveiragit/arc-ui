"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, MotionConfig, animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { Activity, ArrowDownRight, ArrowUpRight, Bell, ChartNoAxesColumn, Check, CreditCard, LayoutDashboard, Lock, MousePointerClick, Settings, Star, Users, Wallet } from "lucide-react";
import { AnimatedCounter } from "@/registry/components/animated-counter/animated-counter";
import { Avatar } from "@/registry/components/avatar/avatar";
import { Badge } from "@/registry/components/badge/badge";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { motionTokens } from "@/lib/motion-tokens";
import { ActionLink } from "./hero-content";
import type { HeroAction } from "./hero-content";
import { HeroBackdrop, HeroMark, HeroNav } from "./hero-parts";
import { ease, heroGroup, heroRise, useAfter, useHeroReducedMotion, useOnScreen } from "./hero-motion";
import { lumenCustomers, lumenFaces, lumenGoal, lumenPayments, lumenPeriods, lumenRanges, lumenTransactions } from "./hero-lumen-data";
import type { LumenKpi, LumenPeriod, LumenRange } from "./hero-lumen-data";
import shell from "./hero-section.module.css";
import styles from "./hero-lumen.module.css";

const LINKS = [{ label: "Product" }, { label: "Customers" }, { label: "Pricing" }, { label: "Changelog" }];
const SIDEBAR = [LayoutDashboard, ChartNoAxesColumn, Users, CreditCard, Bell];
const KPI_ICONS = { revenue: Wallet, conversion: MousePointerClick, sessions: Activity };
const STATUS_TONE = { Paid: "success", Pending: "warning", Refunded: "neutral" } as const;

export interface HeroLumenProps {
  /** The main call to action. With `doneLabel` and no `href`, the button confirms in place. */
  primaryAction?: HeroAction;
  /** The second call to action. */
  secondaryAction?: HeroAction;
  /** Plays the entrance once on mount. Defaults to true. */
  animateIn?: boolean;
  className?: string;
}

/**
 * Product hero: a navigation bar, a headline with one phrase under a solid accent marker, two actions, social proof, and a live
 * product window on a solid page with a faint dot grid. In the window the figures roll up, the chart draws itself and its range
 * control changes every number; two small cards float over its edges. Everything enters in a stagger, and nothing moves under
 * reduced motion.
 */
export function HeroLumen({ primaryAction = { label: "Start free trial", doneLabel: "Trial started" }, secondaryAction = { label: "Book a demo", doneLabel: "Demo requested" }, animateIn = true, className }: HeroLumenProps) {
  const item = heroRise;
  const root = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(root);

  // Reduced motion: Motion skips every transform (rise, slide); opacity still fades briefly.
  return <MotionConfig reducedMotion="user"><section ref={root} className={[shell.hero, shell.screen, styles.hero, className].filter(Boolean).join(" ")}>
    <HeroBackdrop className={styles.dots} />
    <HeroNav brand="Lumen" mark={<LumenMark />} links={LINKS} animateIn={animateIn} />

    <motion.div className={styles.copy} variants={heroGroup} initial={animateIn ? "hidden" : false} animate="shown">
      <motion.p variants={item} className={styles.eyebrow}><span className={styles.tag}>New</span>Real-time reports</motion.p>
      <motion.h1 variants={item} className={[shell.title, styles.title].join(" ")}>See your revenue move <br className={styles.break} /><HeroMark animateIn={animateIn}>in real time</HeroMark></motion.h1>
      <motion.p variants={item} className={[shell.description, styles.description].join(" ")}>Lumen joins billing, product and CRM data, then shows every change in revenue the moment it happens. No SQL, no stale spreadsheets.</motion.p>
      <motion.div variants={item} className={styles.actions}>
        <ActionLink action={primaryAction} kind="primary" />
        <ActionLink action={secondaryAction} kind="secondary" />
      </motion.div>
      <motion.div variants={item} className={styles.proof}>
        <span className={styles.faces} role="group" aria-label="Some of the people who use Lumen">
          {lumenFaces.map(face => <Avatar key={face.name} name={face.name} size="sm" className={styles.face} style={{ "--face": `var(${face.tone})` } as CSSProperties} />)}
        </span>
        <span className={styles.rating}>
          <span className={styles.stars} role="img" aria-label="Rated 4.9 out of 5">{[0, 1, 2, 3, 4].map(star => <Star key={star} size={14} strokeWidth={0} fill="currentColor" aria-hidden="true" />)}</span>
          <strong>4.9</strong>
        </span>
        <span className={styles.proofText}>Used by 2,400 teams</span>
      </motion.div>
    </motion.div>

    <motion.div
      className={styles.stage}
      initial={animateIn ? { opacity: 0, y: 40 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .8, ease: ease.enter, delay: .16 }}
    >
      <div className={styles.frame}>
        <LumenWindow animateIn={animateIn} />
        <LumenFloats animateIn={animateIn} active={onScreen} />
      </div>
    </motion.div>

    <motion.div className={styles.customers} initial={animateIn ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: motionTokens.duration.considered, delay: .4 }}>
      <p>Trusted by finance and growth teams at</p>
      <ul aria-label="Sample customers">
        {lumenCustomers.map(customer => <li key={customer.name}><Wordmark shape={customer.shape} />{customer.name}</li>)}
      </ul>
    </motion.div>
  </section></MotionConfig>;
}

/** The brand glyph: a small sun, drawn in the accent's text color. */
function LumenMark() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
    <circle cx="8" cy="8" r="2.6" fill="currentColor" stroke="none" />
    <path d="M8 1.2v1.9M8 12.9v1.9M1.2 8h1.9M12.9 8h1.9M3.2 3.2l1.3 1.3M11.5 11.5l1.3 1.3M12.8 3.2l-1.3 1.3M4.5 11.5l-1.3 1.3" />
  </svg>;
}

/** The Lumen app window. Everything is sample content; the range control changes the figures, the badges and the chart. */
function LumenWindow({ animateIn }: { animateIn: boolean }) {
  const [range, setRange] = useState<LumenRange>("30d");
  const period = lumenPeriods[range];
  // The figures and the chart start once the window has risen into place, so their motion is seen.
  const live = useAfter(animateIn ? 360 : 0);
  return <div className={styles.window} role="group" aria-label="Lumen revenue dashboard, sample data">
    <div className={styles.chrome} aria-hidden="true">
      <span className={styles.lights}><i /><i /><i /></span>
      <span className={styles.url}><Lock size={11} strokeWidth={2} />app.lumen.so/overview</span>
    </div>
    <div className={styles.app}>
      <div className={styles.side} aria-hidden="true">
        {SIDEBAR.map((Icon, index) => <span key={index} className={styles.sideItem} data-active={index === 0 || undefined}><Icon size={17} strokeWidth={1.75} /></span>)}
        <span className={[styles.sideItem, styles.sideEnd].join(" ")}><Settings size={17} strokeWidth={1.75} /></span>
      </div>
      <div className={styles.main}>
        <header className={styles.head}>
          <div>
            <h2 className={styles.h2}>Overview</h2>
            <p className={styles.sub}><i className={styles.liveDot} aria-hidden="true" />Live, updated just now</p>
          </div>
          <SegmentedControl label="Date range" options={lumenRanges} value={range} onValueChange={value => setRange(value as LumenRange)} className={styles.range} />
        </header>

        <div className={styles.kpis}>
          {period.kpis.map(kpi => <Kpi key={kpi.id} kpi={kpi} against={period.against} live={live} />)}
        </div>

        <div className={styles.grid}>
          <div className={[styles.card, styles.chartCard].join(" ")}>
            <div className={styles.cardHead}>
              <div>
                <h3 className={styles.cardTitle}>Revenue</h3>
                <p className={styles.cardNote}>{period.caption}</p>
              </div>
              <div className={styles.legend} aria-hidden="true"><span><i className={styles.swatch} />This period</span><span><i className={styles.swatch} data-previous="" />Previous</span></div>
            </div>
            <RevenueChart period={period} start={live} />
          </div>

          <div className={[styles.card, styles.tableCard].join(" ")}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Recent transactions</h3>
              <span className={styles.cardNote}>Today</span>
            </div>
            <table className={styles.table}>
              <thead className={shell.srOnly}><tr><th scope="col">Customer</th><th scope="col">Amount</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {lumenTransactions.map(row => <tr key={row.customer}>
                  <th scope="row">
                    <span className={styles.who}>
                      <span className={styles.whoMark} style={{ "--face": `var(${row.tone})` } as CSSProperties} aria-hidden="true">{row.customer[0]}</span>
                      <span className={styles.whoText}><strong>{row.customer}</strong><small>{row.plan}</small></span>
                    </span>
                  </th>
                  <td className={styles.amount}>{row.amount}</td>
                  <td className={styles.status}><Badge tone={STATUS_TONE[row.status]} size="sm" dot>{row.status}</Badge></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

/** One figure: its name, the number rolling up, and how it changed. */
function Kpi({ kpi, against, live }: { kpi: LumenKpi; against: string; live: boolean }) {
  const Icon = KPI_ICONS[kpi.id];
  const digits = kpi.decimals ?? 0;
  const text = `${kpi.prefix ?? ""}${kpi.value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}${kpi.suffix ?? ""}`;
  return <div className={[styles.card, styles.kpi].join(" ")}>
    <div className={styles.kpiTop}><span>{kpi.label}</span><Icon size={15} strokeWidth={1.75} aria-hidden="true" /></div>
    {/* Until the counter starts, the finished figure holds its place unseen, so the card never changes size. */}
    <div className={styles.kpiValue}>{live
      ? <AnimatedCounter value={kpi.value} prefix={kpi.prefix ?? ""} suffix={kpi.suffix ?? ""} decimals={digits} animateOnView />
      : <span className={styles.kpiGhost}>{text}</span>}</div>
    <div className={styles.kpiFoot}>
      <Badge tone={kpi.up ? "success" : "danger"} size="sm" icon={kpi.up ? <ArrowUpRight /> : <ArrowDownRight />}>{kpi.change}</Badge>
      <span className={styles.against}>{against}</span>
    </div>
  </div>;
}

type Shape = { line: number[]; previous: number[] };
const round = (value: number) => +value.toFixed(2);
const mix = (from: number[], to: number[], progress: number) => to.map((value, index) => { const start = from[index] ?? value; return start + (value - start) * progress; });

/** A smooth line through evenly spaced values (0 to 100, up) in a 100 by 100 box. Monotone tangents keep it from swinging past the data. */
function curve(values: number[]) {
  const count = values.length, step = 100 / (count - 1);
  const ys = values.map(value => 100 - value);
  const slopes = ys.slice(1).map((y, index) => (y - ys[index]!) / step);
  const tangent = (index: number) => {
    if (index === 0) return slopes[0]!;
    if (index === count - 1) return slopes[count - 2]!;
    const before = slopes[index - 1]!, after = slopes[index]!;
    return before * after <= 0 ? 0 : Math.sign(before) * Math.min(Math.abs(before + after) / 2, 3 * Math.abs(before), 3 * Math.abs(after));
  };
  let d = `M0 ${round(ys[0]!)}`;
  for (let index = 0; index < count - 1; index++) {
    const x = index * step, third = step / 3;
    d += `C${round(x + third)} ${round(ys[index]! + tangent(index) * third)} ${round(x + step - third)} ${round(ys[index + 1]! - tangent(index + 1) * third)} ${round(x + step)} ${round(ys[index + 1]!)}`;
  }
  return d;
}

/**
 * The revenue chart: the line draws itself from left to right with a faint area under it, then a point lands on the latest
 * value and pulses. A new period morphs the line in place. Reduced motion shows the finished chart at once.
 */
function RevenueChart({ period, start }: { period: LumenPeriod; start: boolean }) {
  const reduced = useHeroReducedMotion();
  const uid = `lumen${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const plot = useRef<HTMLDivElement>(null);
  const inView = useInView(plot, { once: true, amount: .3 });
  const morph = useRef<{ from: Shape; to: Shape }>({ from: period, to: period });
  const progress = useMotionValue(1);
  const reveal = useMotionValue(0);
  const [landed, setLanded] = useState(false);

  const shapeAt = (at: number): Shape => ({ line: mix(morph.current.from.line, morph.current.to.line, at), previous: mix(morph.current.from.previous, morph.current.to.previous, at) });
  const line = useTransform(progress, at => curve(shapeAt(at).line));
  const area = useTransform(progress, at => `${curve(shapeAt(at).line)}L100 100L0 100Z`);
  const previous = useTransform(progress, at => curve(shapeAt(at).previous));
  const endTop = useTransform(progress, at => { const values = shapeAt(at).line; return `${round(100 - values[values.length - 1]!)}%`; });

  // The first draw, once the chart is on screen.
  useEffect(() => {
    if (reduced) { reveal.jump(104); setLanded(true); return; }
    if (!start || !inView) return;
    const controls = animate(reveal, 104, { duration: 1, ease: ease.inOut, onComplete: () => setLanded(true) });
    return () => controls.stop();
  }, [inView, reduced, reveal, start]);

  // A new period morphs from the shape on screen.
  useEffect(() => {
    if (morph.current.to === period) return;
    morph.current = { from: shapeAt(progress.get()), to: period };
    progress.jump(0);
    if (reduced) { progress.jump(1); return; }
    const controls = animate(progress, 1, motionTokens.spring.smooth);
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shapeAt only reads the ref
  }, [period, progress, reduced]);

  return <div ref={plot} className={styles.plot} role="img" aria-label={`Revenue, ${period.caption.toLowerCase()}: it rises through the period and ends above the period before`}>
    <div className={styles.yAxis} aria-hidden="true">{period.yTicks.map((tick, index) => <span key={index} style={{ top: `${index * 25}%` }}>{tick}</span>)}</div>
    <div className={styles.canvas}>
      {[0, 25, 50, 75, 100].map(top => <i key={top} className={styles.gridline} data-base={top === 100 || undefined} style={{ top: `${top}%` }} />)}
      <svg className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs><clipPath id={uid}><motion.rect x={-2} y={-20} width={reveal} height={140} /></clipPath></defs>
        <g clipPath={`url(#${uid})`}>
          <motion.path className={styles.area} d={area} />
          <motion.path className={styles.previous} d={previous} />
          <motion.path className={styles.line} d={line} />
        </g>
      </svg>
      <motion.span className={styles.end} data-on={landed || undefined} style={{ top: endTop }} />
    </div>
    <div className={styles.xAxis} aria-hidden="true">{period.xTicks.map(tick => <span key={tick}>{tick}</span>)}</div>
  </div>;
}

/**
 * Two cards over the window's edges: a payment toast that slides in and then announces the next payment every few seconds,
 * and the month's goal with a ring that fills. Both bob slowly. They are illustration, so assistive technology skips them.
 */
function LumenFloats({ animateIn, active }: { animateIn: boolean; active: boolean }) {
  const reduced = useHeroReducedMotion();
  const [turn, setTurn] = useState(0);
  useEffect(() => {
    if (reduced || !active) return;
    const timer = window.setInterval(() => setTurn(current => current + 1), 4200);
    return () => window.clearInterval(timer);
  }, [active, reduced]);
  const payment = lumenPayments[turn % lumenPayments.length]!;
  const still = reduced || !animateIn;

  return <>
    <motion.div className={[styles.float, styles.toastSlot].join(" ")} aria-hidden="true" initial={animateIn ? { opacity: 0, x: 40 } : false} animate={{ opacity: 1, x: 0 }} transition={{ ...motionTokens.spring.smooth, delay: .7 }}>
      <div className={styles.bob}>
        <div className={styles.toast}>
          <span className={styles.toastIcon}><Check size={16} strokeWidth={2.25} /></span>
          <span className={styles.floatText}>
            <strong>Payment received</strong>
            <span className={styles.toastLine}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={turn} className={styles.toastSwap} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: motionTokens.duration.standard, ease: ease.standard }}>{payment.amount} from {payment.from}</motion.span>
              </AnimatePresence>
            </span>
          </span>
        </div>
      </div>
    </motion.div>

    <motion.div className={[styles.float, styles.goalSlot].join(" ")} aria-hidden="true" initial={animateIn ? { opacity: 0, x: -32 } : false} animate={{ opacity: 1, x: 0 }} transition={{ ...motionTokens.spring.smooth, delay: .82 }}>
      <div className={styles.bob}>
        <div className={styles.goal}>
          <span className={styles.ring}>
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle className={styles.ringTrack} cx="22" cy="22" r="18" />
              {/* The key remounts the ring already filled when reduced motion is on. */}
              <motion.circle key={still ? "still" : "draw"} className={styles.ringValue} cx="22" cy="22" r="18" initial={still ? false : { pathLength: 0 }} animate={{ pathLength: lumenGoal.share }} transition={{ duration: .9, ease: ease.inOut, delay: .95 }} />
            </svg>
            <span className={styles.ringLabel}>{Math.round(lumenGoal.share * 100)}%</span>
          </span>
          <span className={styles.floatText}><strong>Monthly goal</strong><small>{lumenGoal.reached} of {lumenGoal.target}</small></span>
        </div>
      </div>
    </motion.div>
  </>;
}

/** A plain geometric mark beside an invented customer name. */
function Wordmark({ shape }: { shape: (typeof lumenCustomers)[number]["shape"] }) {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true" focusable="false">
    {shape === "circle" && <circle cx="9" cy="9" r="7" />}
    {shape === "square" && <rect x="2.5" y="2.5" width="13" height="13" rx="3.5" />}
    {shape === "triangle" && <path d="M9 2.4 16.4 15.4H1.6z" />}
    {shape === "diamond" && <path d="M9 1.4 16.6 9 9 16.6 1.4 9z" />}
    {shape === "rings" && <><circle cx="6.4" cy="9" r="4.4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="11.6" cy="9" r="4.4" fill="none" stroke="currentColor" strokeWidth="2" /></>}
    {shape === "bars" && <><rect x="2" y="9" width="3.6" height="7" rx="1.2" /><rect x="7.2" y="5.5" width="3.6" height="10.5" rx="1.2" /><rect x="12.4" y="2" width="3.6" height="14" rx="1.2" /></>}
  </svg>;
}

export { HeroLumen as HeroProduct };
export type { HeroLumenProps as HeroProductProps };
export default HeroLumen;
