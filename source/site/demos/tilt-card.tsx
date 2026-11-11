import { Plane, Star } from "lucide-react";
import { TiltCard, TiltCardLayer } from "@/registry/components/tilt-card/tilt-card";
import { photo } from "@/lib/media";
import { Caption, Row, Stack } from "./_kit";
import styles from "./tilt-card.module.css";

export default function TiltCardDemo() {
  const cover = photo("alpine-lake");
  return (
    <Stack gap={5} align="center" width={620}>
      <Row gap={6} justify="center" align="stretch">
        <TiltCard className={styles.trip} maxTilt={12}>
          <img className={styles.cover} src={cover.src} alt={cover.alt} draggable={false} />
          <TiltCardLayer depth={36} className={styles.tripBody}>
            <span className={styles.tag}><Star size={12} aria-hidden="true" />Editor's pick</span>
            <div>
              <h3 className={styles.title}>Lake Bled, Slovenia</h3>
              <p className={styles.meta}>4 nights · from $640 per person</p>
            </div>
          </TiltCardLayer>
        </TiltCard>

        <TiltCard className={styles.pass} maxTilt={8}>
          <div className={styles.passBody}>
            <TiltCardLayer depth={18} className={styles.passHead}>
              <span className={styles.airline}><Plane size={16} aria-hidden="true" />Northwind Air</span>
              <span className={styles.gate}>Gate B14</span>
            </TiltCardLayer>
            <TiltCardLayer depth={40} className={styles.route}>
              <span><strong>LIS</strong>Lisbon</span>
              <span className={styles.line} aria-hidden="true" />
              <span><strong>LJU</strong>Ljubljana</span>
            </TiltCardLayer>
            <TiltCardLayer depth={18} className={styles.passFoot}>
              <span><small>Boarding</small>07:45</span>
              <span><small>Seat</small>14A</span>
              <span><small>Group</small>2</span>
            </TiltCardLayer>
          </div>
        </TiltCard>
      </Row>
      <Caption>Move the cursor across a card. It stays flat on touch screens and with reduced motion.</Caption>
    </Stack>
  );
}
