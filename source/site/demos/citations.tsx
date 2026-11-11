import { Citation, Citations, CitationSources } from "@/registry/components/citations/citations";
import type { CitationSource } from "@/registry/components/citations/citations";
import { Caption, Stack, Surface } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 640 };

const sources: CitationSource[] = [
  {
    id: "mdn",
    title: "prefers-reduced-motion",
    site: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion",
    snippet: "A media feature that tells a page whether the person has asked their system to keep non-essential motion to a minimum.",
  },
  {
    id: "wcag",
    title: "Understanding SC 2.3.3: Animation from Interactions",
    site: "W3C WAI",
    url: "https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html",
    snippet: "Motion that an interaction triggers should be possible to turn off, unless the animation is essential to the function or to the information.",
  },
  {
    id: "webdev",
    title: "prefers-reduced-motion: Sometimes less movement is more",
    site: "web.dev",
    url: "https://web.dev/articles/prefers-reduced-motion",
    snippet: "Not everyone enjoys decorative animation, and for some people it causes real discomfort. The article shows how to adapt a page to the preference.",
  },
  {
    id: "webkit",
    title: "Responsive Design for Motion",
    site: "WebKit Blog",
    date: "2017",
    url: "https://webkit.org/blog/7551/responsive-design-for-motion/",
    snippet: "Introduces the media query and walks through the kinds of movement that tend to trigger vestibular symptoms, with ways to tone each one down.",
  },
];

export default function CitationsDemo() {
  return (
    <Stack width={560} gap={3}>
      <Surface padding={6}>
        <Citations sources={sources}>
          <p>
            Operating systems let people ask for less motion, and browsers pass that choice to your CSS through a media feature
            <Citation source="mdn" />. The accessibility guidelines treat it as more than taste: movement that an interaction starts should be
            possible to switch off unless it is essential
            <Citation source="wcag" />. In practice you rarely remove animation altogether. Swapping a long slide for a short fade keeps the
            feedback without the travel
            <Citation source="webdev" />
            <Citation source="webkit" />.
          </p>
          <CitationSources />
        </Citations>
      </Surface>
      <Caption>Hover a number to preview its source, or click to pin the card. Chips and list rows share one highlight.</Caption>
    </Stack>
  );
}
