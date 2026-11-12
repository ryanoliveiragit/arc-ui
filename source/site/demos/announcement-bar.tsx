import { useState } from "react";
import { AnnouncementBar } from "@/registry/components/announcement-bar/announcement-bar";
import { Button } from "@/registry/components/button/button";
import { Caption } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./announcement-bar.module.css";

export const stage: DemoStage = { layout: "fill", frame: true, height: 520 };

export default function AnnouncementBarDemo() {
  const [open, setOpen] = useState(true);
  const [sale] = useState(() => Date.now() + 2 * 86_400_000 + 5 * 3_600_000);
  return (
    <div className={styles.page}>
      <AnnouncementBar
        controls
        interval={5000}
        open={open}
        onOpenChange={setOpen}
        messages={[
          { id: "sale", message: "Spring sale: 30% off annual plans.", countdown: { to: sale, label: "Ends in" }, action: { label: "Shop the sale", href: "#sale" } },
          { id: "release", message: "Version 4.2 is here with shared workspaces.", action: { label: "See what's new", href: "#release" } },
          { id: "event", message: "Join our live product tour on Thursday at 10 am PT.", action: { label: "Save your seat", href: "#event" } },
        ]}
      />
      <nav className={styles.nav} aria-label="Example site">
        <span className={styles.brand}><span className={styles.mark} aria-hidden="true" />Northwind</span>
        <span className={styles.links}><span>Product</span><span>Pricing</span><span>Customers</span></span>
        <Button size="sm" variant="secondary" className={styles.cta}>Sign in</Button>
      </nav>
      <section className={styles.hero}>
        <h2 className={styles.title}>Plan, ship and measure every launch</h2>
        <p className={styles.lede}>The bar above sits on top of the page: messages rotate on their own, hover to pause, use the arrows or close it.</p>
        {!open ? <Button variant="secondary" onClick={() => setOpen(true)}>Bring the bar back</Button> : <Caption>Closing it gives the page its space back.</Caption>}
      </section>
    </div>
  );
}
