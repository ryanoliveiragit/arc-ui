var e=`import { Carousel } from "@/registry/components/carousel/carousel";
import { photo } from "@/lib/media";
import { Stack } from "./_kit";

const suites = [
  { id: "sunroom", name: "Garden suite", price: "$240 a night", img: photo("sunroom") },
  { id: "reading-chair", name: "Library suite", price: "$285 a night", img: photo("reading-chair") },
  { id: "pool-house", name: "Pool house", price: "$360 a night", img: photo("pool-house") },
  { id: "bedroom", name: "Loft suite", price: "$310 a night", img: photo("home-office") },
  { id: "curved-facade", name: "Courtyard room", price: "$195 a night", img: photo("curved-facade") },
];

export default function CarouselDemo() {
  return (
    <Stack width={720}>
      <Carousel label="Harbour suites" interval={4500}>
        {suites.map(s => (
          <figure key={s.id} style={{ margin: 0, overflow: "hidden", border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", background: "var(--surface)" }}>
            <img src={s.img.src} alt={s.img.alt} draggable={false} style={{ display: "block", width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }} />
            <figcaption style={{ padding: "var(--space-3) var(--space-4)", display: "grid" }}>
              <strong>{s.name}</strong>
              <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{s.price}</span>
            </figcaption>
          </figure>
        ))}
      </Carousel>
    </Stack>
  );
}
`;export{e as default};