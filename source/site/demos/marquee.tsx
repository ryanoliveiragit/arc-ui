import { useState } from "react";
import { Anchor, Aperture, Box, Feather, Hexagon, Leaf, Mountain, Pause, Play, Sun, Waves } from "lucide-react";
import { Marquee } from "@/registry/components/marquee/marquee";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack } from "./_kit";
import styles from "./marquee.module.css";

const customers = [
  { name: "Northwind", icon: Mountain },
  { name: "Harbor & Co", icon: Anchor },
  { name: "Lumen", icon: Sun },
  { name: "Tidewater", icon: Waves },
  { name: "Quill", icon: Feather },
  { name: "Hexa Labs", icon: Hexagon },
  { name: "Fernway", icon: Leaf },
  { name: "Parcel", icon: Box },
  { name: "Iris Optics", icon: Aperture },
];

const quotes = [
  { text: "Cut our release notes from a day to an hour.", by: "Emma, Northwind" },
  { text: "The first tool the whole team opened without being asked.", by: "Marcus, Lumen" },
  { text: "Setup took one coffee.", by: "Sofia, Parcel" },
  { text: "We retired three dashboards the week we switched.", by: "Daniel, Quill" },
  { text: "Support answers in minutes, not tickets.", by: "Ava, Fernway" },
];

const activity = [
  "Jasmine merged “Checkout redesign”",
  "Nathan deployed api v4.18",
  "Chloe shared the Q3 retention report",
  "Mateo fixed the Android login crash",
  "Hannah closed 12 support threads",
  "Tyler added 3 seats to the Sales team",
];

export default function MarqueeDemo() {
  const [paused, setPaused] = useState(false);

  return (
    <Stack width={680} gap={5}>
      <Marquee label="Customers" speed={56} gap={40} paused={paused}>
        {customers.map(({ name, icon: Icon }) => (
          <span key={name} className={styles.logo}><Icon size={20} aria-hidden="true" />{name}</span>
        ))}
      </Marquee>

      <Marquee label="What customers say" direction="right" speed={32} gap={12} paused={paused}>
        {quotes.map(quote => (
          <figure key={quote.by} className={styles.quote}>
            <blockquote>{quote.text}</blockquote>
            <figcaption>{quote.by}</figcaption>
          </figure>
        ))}
      </Marquee>

      <Row gap={6} align="center">
        <div className={styles.feed}>
          <Marquee label="Team activity" direction="up" speed={22} gap={10} fade="28%" paused={paused}>
            {activity.map(line => <span key={line} className={styles.line}><i aria-hidden="true" />{line}</span>)}
          </Marquee>
        </div>
        <Stack gap={2} align="flex-start">
          <Button variant="secondary" size="sm" onClick={() => setPaused(value => !value)} aria-pressed={paused}>
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            {paused ? "Play" : "Pause"}
          </Button>
          <Caption>Hover a row and it eases to a stop.</Caption>
        </Stack>
      </Row>
    </Stack>
  );
}
