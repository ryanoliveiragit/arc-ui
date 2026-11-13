"use client";

/**
 * Lets an app swap the link and image elements ryan-ui components render.
 *
 * Without a provider, ryan-ui renders a plain `<a>` and `<img>`, so components work in any React app (Vite, Remix, Astro,
 * plain React). Wrap the app once to use your framework's or your own components instead:
 *
 *   import Link from "next/link";
 *   import Image from "next/image";
 *   import { RyanProvider } from "@/lib/ryan-provider";
 *
 *   <RyanProvider link={Link} image={Image}>{children}</RyanProvider>
 *
 * Any component that accepts these props works, such as a locale-aware Link from next-intl or a React Router Link
 * wrapped to map `href` to `to`.
 */
import { createContext, createElement, useContext, useMemo, type AnchorHTMLAttributes, type ComponentType, type ImgHTMLAttributes, type ReactNode, type Ref } from "react";

/** The props ryan-ui passes to a link: an href plus ordinary anchor attributes. */
export interface RyanLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  ref?: Ref<HTMLAnchorElement>;
}

/**
 * The props ryan-ui passes to an image. A subset of next/image's props, so next/image can be passed as is: either `fill`
 * (cover the positioned parent) or `width` and `height`, plus `sizes` and `priority` as hints.
 */
export interface RyanImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height" | "loading" | "srcSet"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Fills the nearest positioned parent, like next/image's `fill`. */
  fill?: boolean;
  /** Loads the image eagerly with high priority, like next/image's `priority`. */
  priority?: boolean;
  loading?: "eager" | "lazy";
  ref?: Ref<HTMLImageElement>;
}

export type RyanLinkComponent = ComponentType<RyanLinkProps>;
export type RyanImageComponent = ComponentType<RyanImageProps>;

/** The default link: a plain anchor. */
export function RyanAnchor(props: RyanLinkProps) {
  return <a {...props} />;
}

const fillStyle = { position: "absolute", inset: 0, width: "100%", height: "100%" } as const;

/** The default image: a plain, lazily decoded `<img>` that understands `fill` and `priority`. */
export function RyanImg({ alt, fill, priority, loading, style, ...props }: RyanImageProps) {
  // eslint-disable-next-line @next/next/no-img-element -- the framework-free default; pass next/image through RyanProvider instead.
  return <img alt={alt} decoding="async" {...props} loading={loading ?? (priority ? "eager" : "lazy")} fetchPriority={priority ? "high" : props.fetchPriority} style={fill ? { ...fillStyle, ...style } : style} />;
}

interface RyanComponents {
  link: RyanLinkComponent;
  image: RyanImageComponent;
}

const RyanContext = createContext<RyanComponents>({ link: RyanAnchor, image: RyanImg });

export interface RyanProviderProps {
  /** The link component ryan-ui renders for navigation, such as next/link or your own wrapped Link. Defaults to `<a>`. */
  link?: RyanLinkComponent;
  /** The image component ryan-ui renders for photos, such as next/image. Defaults to `<img>`. */
  image?: RyanImageComponent;
  children: ReactNode;
}

/** Sets the link and image components for every ryan-ui component inside it. Nested providers inherit what they do not set. */
export function RyanProvider({ link, image, children }: RyanProviderProps) {
  const parent = useContext(RyanContext);
  const value = useMemo(() => ({ link: link ?? parent.link, image: image ?? parent.image }), [link, image, parent]);
  return <RyanContext.Provider value={value}>{children}</RyanContext.Provider>;
}

/** The link component from the nearest RyanProvider, or a plain anchor. */
export const useArcLink = () => useContext(RyanContext).link;
/** The image component from the nearest RyanProvider, or a plain img. */
export const useArcImage = () => useContext(RyanContext).image;

/** What ryan-ui components render for a link: the provider's link component, or a plain anchor. */
export function RyanLink(props: RyanLinkProps) {
  return createElement(useArcLink(), props);
}

/** What ryan-ui components render for an image: the provider's image component, or a plain img. */
export function RyanImage(props: RyanImageProps) {
  return createElement(useArcImage(), props);
}
