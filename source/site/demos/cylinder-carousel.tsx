import { useState } from "react";
import { MapPin, Users } from "lucide-react";
import { CylinderCarousel } from "@/registry/components/cylinder-carousel/cylinder-carousel";
import { photo } from "@/lib/media";
import type { PhotoId } from "@/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./cylinder-carousel.module.css";

export const stage: DemoStage = { height: 520 };

const rooms: { id: PhotoId; name: string; place: string; seats: number; price: string; open: boolean }[] = [
  { id: "sunroom", name: "The Sunroom", place: "Floor 4, east wing", seats: 8, price: "$42 / hour", open: true },
  { id: "home-office", name: "Quiet Corner", place: "Floor 2, library side", seats: 2, price: "$18 / hour", open: true },
  { id: "living-room", name: "The Lounge", place: "Ground floor", seats: 12, price: "$55 / hour", open: false },
  { id: "concert-hall", name: "Town Hall", place: "Floor 1, atrium", seats: 60, price: "$180 / hour", open: true },
  { id: "reading-chair", name: "Reading Nook", place: "Floor 3, north wing", seats: 1, price: "$9 / hour", open: true },
  { id: "wine-bar", name: "The Cellar", place: "Basement", seats: 16, price: "$70 / hour", open: false },
  { id: "pool-house", name: "Pool House", place: "Garden level", seats: 10, price: "$64 / hour", open: true },
  { id: "curved-facade", name: "Skyline Deck", place: "Roof terrace", seats: 24, price: "$95 / hour", open: true },
];

export default function CylinderCarouselDemo() {
  const [front, setFront] = useState(0);
  const room = rooms[front] ?? rooms[0]!;
  return (
    <Stack gap={3} width={640} align="center">
      <CylinderCarousel label="Rooms to book" value={front} onValueChange={setFront}>
        {rooms.map(item => (
          <article key={item.id} className={styles.room}>
            <img className={styles.photo} src={photo(item.id).src} alt="" draggable={false} />
            <div className={styles.info}>
              <span className={styles.status} data-open={item.open}>{item.open ? "Free now" : "Booked until 3:00"}</span>
              <h3 className={styles.name}>{item.name}</h3>
              <p className={styles.place}><MapPin size={13} aria-hidden="true" />{item.place}</p>
              <p className={styles.meta}><span><Users size={13} aria-hidden="true" />{item.seats}</span><strong>{item.price}</strong></p>
            </div>
          </article>
        ))}
      </CylinderCarousel>
      <Caption>Drag the cylinder, click a side card, or focus it and press the arrow keys. Facing you: {room.name}.</Caption>
    </Stack>
  );
}
