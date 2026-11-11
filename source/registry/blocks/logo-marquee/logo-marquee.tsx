"use client";

import { useId, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/registry/components/button/button";
import styles from "./logo-marquee.module.css";

export interface LogoMarqueeBrand {
  name: string;
  /** Monochrome SVG, drawn as a mask in the text color. */
  icon: string;
  /** Single brand color for the mark in color tone. Leave out for brands whose mark is black or white. */
  color?: string;
  /** Full color SVG for multicolor marks, used in color tone instead of `icon`. */
  colorIcon?: string;
}

export type LogoMarqueeTone = "color" | "mono";

export interface LogoMarqueeProps {
  title?: string;
  description?: string;
  brands?: LogoMarqueeBrand[];
  /** `color` shows each mark in its official colors; `mono` draws every mark in the text color. */
  tone?: LogoMarqueeTone;
}

/** Abstract marks as data URIs: the public/block-logos files this example used to point at are not part of the project. */
const mark = (body: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`)}`;

const exampleBrands: LogoMarqueeBrand[] = [
  { name: "Figma", icon: mark('<circle cx="8" cy="8" r="5"/><circle cx="16" cy="8" r="5"/><circle cx="8" cy="16" r="5"/>'), color: "#F24E1E" },
  { name: "Linear", icon: mark('<circle cx="12" cy="12" r="10"/>'), color: "#5E6AD2" },
  { name: "Notion", icon: mark('<rect x="3" y="3" width="18" height="18" rx="4"/>') },
  { name: "Slack", icon: mark('<rect x="3" y="9" width="18" height="6" rx="3"/><rect x="9" y="3" width="6" height="18" rx="3"/>'), color: "#36C5F0" },
  { name: "GitHub", icon: mark('<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 5l5 9H7z"/>') },
  { name: "Stripe", icon: mark('<path d="M4 6h16v4H4zm0 8h16v4H4z"/>'), color: "#635BFF" },
  { name: "Vercel", icon: mark('<path d="M12 3l10 18H2z"/>') },
];

function BrandMark({ brand, tone }: { brand: LogoMarqueeBrand; tone: LogoMarqueeTone }) {
  if (tone === "color" && brand.colorIcon) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={styles.brandMark} src={brand.colorIcon} alt="" width={22} height={22} draggable={false} />;
  }
  return (
    <span
      className={styles.brandMark}
      style={{ maskImage: `url("${brand.icon}")`, WebkitMaskImage: `url("${brand.icon}")`, color: tone === "color" ? brand.color : undefined }}
      aria-hidden="true"
    />
  );
}

function BrandList({ brands, tone, duplicate = false }: { brands: LogoMarqueeBrand[]; tone: LogoMarqueeTone; duplicate?: boolean }) {
  return (
    <ul className={styles.brandList} aria-label={duplicate ? undefined : "Illustrative tool logos"} aria-hidden={duplicate || undefined}>
      {brands.map((brand, index) => (
        <li className={styles.brand} key={`${brand.name}-${index}`}>
          <BrandMark brand={brand} tone={tone} />
          <span className={styles.brandName}>{brand.name}</span>
        </li>
      ))}
    </ul>
  );
}

export function LogoMarquee({
  title = "Good work moves between tools",
  description = "From the first idea to the final handoff, a familiar set of tools stays close to the work.",
  brands = exampleBrands,
  tone = "color",
}: LogoMarqueeProps) {
  const titleId = useId();
  const [paused, setPaused] = useState(false);

  return (
    <section className={styles.section} data-tone={tone} aria-labelledby={titleId}>
      <div className={styles.intro}>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
      </div>

      <div className={styles.marquee} role="region" aria-label="Illustrative tool logos">
        <div className={`${styles.track}${paused ? ` ${styles.paused}` : ""}`}>
          <BrandList brands={brands} tone={tone} />
          <BrandList brands={brands} tone={tone} duplicate />
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          variant="ghost"
          size="sm"
          className={styles.motionButton}
          aria-label={paused ? "Play logo motion" : "Pause logo motion"}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <><Play size={16} strokeWidth={1.75} aria-hidden="true" />Play</> : <><Pause size={16} strokeWidth={1.75} aria-hidden="true" />Pause</>}
        </Button>
        <span className={styles.motionStatus} aria-live="polite">
          {paused ? "Motion paused" : ""}
        </span>
      </div>
    </section>
  );
}

export default LogoMarquee;
