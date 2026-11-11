import { useState } from "react";
import { Rating } from "@/registry/components/rating/rating";
import { Caption, Stack } from "./_kit";

export default function RatingDemo() {
  const [score, setScore] = useState(4);
  return (
    <Stack gap={6} width={360}>
      <Rating label="How was your stay?" description="Tap a star, or click it again to clear." value={score} onChange={setScore} size="lg" />
      <Rating label="Cleanliness (half stars)" defaultValue={3.5} allowHalf />
      <Rating label="Average from 212 reviews" defaultValue={4.5} allowHalf readOnly size="sm" />
      <Caption>Your score: {score || "none"}</Caption>
    </Stack>
  );
}
