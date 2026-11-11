"use client";

import { useId, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { Transition } from "motion/react";
import { Coffee, Eye, EyeOff, Landmark, Music, Nfc, Plane, RefreshCw, ShoppingBag } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./wallet-card.module.css";

export interface WalletTransaction {
  /** Stable key. */
  id: string;
  /** Who was paid, or who paid. */
  merchant: string;
  /** Second line: category, date or both. */
  detail: string;
  /** Signed amount: negative for money out, positive for money in. */
  amount: number;
  /** Icon in the row's badge. */
  icon?: ReactNode;
}

export interface WalletCardProps {
  /** Name printed on the card. */
  holder?: string;
  /** Bank or product name printed on the card. */
  issuer?: string;
  /** Last four digits of the card number. */
  last4?: string;
  /** Expiry date as printed, such as "08/29". */
  expiry?: string;
  /** Security code on the back. It follows the balance mask. */
  cvv?: string;
  /** Available balance. */
  balance?: number;
  /** ISO 4217 currency code used to format amounts. */
  currency?: string;
  /** Recent transactions, newest first. Pass an empty list to hide the section. */
  transactions?: WalletTransaction[];
  /** Whether amounts are hidden (controlled). */
  masked?: boolean;
  /** Whether amounts start hidden (uncontrolled). */
  defaultMasked?: boolean;
  /** Called when the mask is toggled. */
  onMaskedChange?: (masked: boolean) => void;
  /** Whether the back of the card is showing (controlled). */
  flipped?: boolean;
  /** Whether the card starts on its back (uncontrolled). */
  defaultFlipped?: boolean;
  /** Called when the card is flipped. */
  onFlippedChange?: (flipped: boolean) => void;
  /** Extra class for the root. */
  className?: string;
}

const ease = [...motionTokens.ease.enter] as [number, number, number, number];
const still: Transition = { duration: 0 };
/** Largest tilt toward the pointer, in degrees. */
const TILT = 11;
const tiltSpring = { stiffness: 260, damping: 24, mass: .6 };
/** The flip is the one place with a little bounce: the card lands and settles like a real one. */
const flipSpring: Transition = { type: "spring", visualDuration: .62, bounce: .2 };

const defaultTransactions: WalletTransaction[] = [
  { id: "t1", merchant: "Blue Bottle Coffee", detail: "Today · Food and drink", amount: -6.5, icon: <Coffee size={16} /> },
  { id: "t2", merchant: "Salary, Northwind Labs", detail: "Yesterday · Income", amount: 4250, icon: <Landmark size={16} /> },
  { id: "t3", merchant: "TAP Air Portugal", detail: "Nov 8 · Travel", amount: -318.4, icon: <Plane size={16} /> },
  { id: "t4", merchant: "Spotify", detail: "Nov 6 · Subscriptions", amount: -11.99, icon: <Music size={16} /> },
];

/** Text whose digits swap for dots one after another, each on its own small slide. */
function MaskedText({ text, masked, label }: { text: string; masked: boolean; label: string }) {
  const reduce = useReducedMotion() ?? false;
  const shown = masked ? text.replace(/\d/g, "•") : text;
  return (
    <span className={styles.masked}>
      <span className={styles.srOnly}>{masked ? `${label} hidden` : `${label} ${text}`}</span>
      {Array.from(shown).map((char, index) => (
        <span key={index} className={styles.slot} aria-hidden="true">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span key={char} className={styles.char} initial={{ opacity: 0, y: reduce ? 0 : "45%" }} animate={{ opacity: 1, y: "0%" }} exit={{ opacity: 0, y: reduce ? 0 : "-45%" }} transition={reduce ? still : { duration: motionTokens.duration.standard, ease, delay: Math.min(index, 12) * motionTokens.stagger.char }}>{char}</motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

/**
 * A payment card with its account around it. The card leans toward the pointer in 3D under a moving glare and flips
 * on a spring to show its back; the balance, the security code and the transaction amounts mask digit by digit.
 * Touch and reduced motion get a still card that still flips and masks.
 */
export function WalletCard({ holder = "Maya Okafor", issuer = "Northwind", last4 = "4821", expiry = "08/29", cvv = "317", balance = 12480.55, currency = "USD", transactions = defaultTransactions, masked, defaultMasked = false, onMaskedChange, flipped, defaultFlipped = false, onFlippedChange, className }: WalletCardProps) {
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const [internalMasked, setInternalMasked] = useState(defaultMasked);
  const [internalFlipped, setInternalFlipped] = useState(defaultFlipped);
  const hidden = masked ?? internalMasked;
  const back = flipped ?? internalFlipped;
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency });
  const rotateX = useSpring(0, tiltSpring);
  const rotateY = useSpring(0, tiltSpring);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(0);
  const glareOpacity = useSpring(0, { stiffness: 200, damping: 30 });
  // The glare is light itself, which has no token: plain white, kept faint.
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, oklch(100% 0 0 / .5), oklch(100% 0 0 / 0) 58%)`;

  const toggleMask = () => { if (masked === undefined) setInternalMasked(!hidden); onMaskedChange?.(!hidden); };
  const flip = () => { if (flipped === undefined) setInternalFlipped(!back); onFlippedChange?.(!back); };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - .5, y = (event.clientY - box.top) / box.height - .5;
    rotateY.set(x * TILT * 2);
    rotateX.set(-y * TILT * 2);
    // The back face is mirrored, so its glare follows the pointer from the other side.
    glareX.set((back ? .5 - x : x + .5) * 100);
    glareY.set((y + .5) * 100);
    glareOpacity.set(1);
  };
  const onPointerLeave = () => { rotateX.set(0); rotateY.set(0); glareOpacity.set(0); };

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.scene} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} onClick={flip}>
        <motion.div className={styles.tilt} style={{ rotateX, rotateY }}>
          <motion.div className={styles.flipper} initial={false} animate={{ rotateY: back ? 180 : 0 }} transition={reduce ? still : flipSpring}>
            <div className={`${styles.face} ${styles.front}`} aria-hidden={back || undefined} inert={back}>
              <div className={styles.faceRow}>
                <span className={styles.issuer}>{issuer}</span>
                <Nfc size={22} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div className={styles.balanceBlock}>
                <span className={styles.faceLabel}>Available balance</span>
                <span className={styles.balance}><MaskedText text={money.format(balance)} masked={hidden} label="Balance" /></span>
              </div>
              <div className={styles.faceRow}>
                <span className={styles.holderBlock}>
                  <span className={styles.number}><span aria-hidden="true">••••</span><span className={styles.srOnly}>Card ending in</span> {last4}</span>
                  <span className={styles.holder}>{holder}</span>
                </span>
                <span className={styles.expiryBlock}>
                  <span className={styles.faceLabel}>Valid thru</span>
                  <span className={styles.expiry}>{expiry}</span>
                </span>
              </div>
              <motion.span className={styles.glare} aria-hidden="true" style={{ background: glare, opacity: glareOpacity }} />
            </div>
            <div className={`${styles.face} ${styles.back}`} aria-hidden={!back || undefined} inert={!back}>
              <span className={styles.stripe} aria-hidden="true" />
              <div className={styles.signature}>
                <span className={styles.signatureLine} aria-hidden="true">{holder}</span>
                <span className={styles.cvv}><span className={styles.faceLabel}>CVV</span><MaskedText text={cvv} masked={hidden} label="Security code" /></span>
              </div>
              <p className={styles.fine}>Lost or stolen? Freeze this card in the app at any time. Issued by {issuer} Bank for {holder}.</p>
              <motion.span className={styles.glare} aria-hidden="true" style={{ background: glare, opacity: glareOpacity }} />
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.action} aria-pressed={hidden} onClick={toggleMask}>
          {hidden ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}
          {hidden ? "Show amounts" : "Hide amounts"}
        </button>
        <button type="button" className={styles.action} aria-pressed={back} onClick={flip}>
          <motion.span className={styles.actionIcon} aria-hidden="true" animate={{ rotate: back ? 180 : 0 }} transition={reduce ? still : motionTokens.spring.smooth}><RefreshCw size={16} /></motion.span>
          {back ? "Show front" : "Show back"}
        </button>
      </div>

      {transactions.length ? (
        <section className={styles.activity} aria-labelledby={`${uid}-activity`}>
          <h3 id={`${uid}-activity`} className={styles.activityTitle}>Recent activity</h3>
          <ul className={styles.list}>
            {transactions.map((entry, index) => (
              <motion.li key={entry.id} className={styles.row} initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? still : { duration: motionTokens.duration.standard, ease, delay: .12 + index * motionTokens.stagger.item * 1.6 }}>
                <span className={styles.rowIcon} aria-hidden="true">{entry.icon ?? <ShoppingBag size={16} />}</span>
                <span className={styles.rowText}><span className={styles.merchant}>{entry.merchant}</span><span className={styles.detail}>{entry.detail}</span></span>
                <span className={styles.amount} data-direction={entry.amount >= 0 ? "in" : "out"}>
                  <MaskedText text={`${entry.amount >= 0 ? "+" : "−"}${money.format(Math.abs(entry.amount))}`} masked={hidden} label={entry.amount >= 0 ? "Received" : "Paid"} />
                </span>
              </motion.li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/** Ready preview with sample account data. */
export default function WalletCardPreview() {
  return (
    <section className={styles.preview}>
      <WalletCard />
    </section>
  );
}
