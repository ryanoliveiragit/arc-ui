var e=`import { useState } from "react";
import Message from "@/registry/components/message/message";
import type { MessageRating } from "@/registry/components/message/message";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

const answers = [
  \`The deploy failed because the build ran out of memory while bundling the dashboard. Nothing is wrong with your code.

Here is what I would do:

1. Raise the limit with \\\`NODE_OPTIONS=--max-old-space-size=4096\\\` in the build settings.
2. Split the charts page with \\\`import()\\\` so it stops loading in the main bundle.
3. Run the build again and compare the **bundle report** with last week's.

The second step also cuts about 180 kB from the first load, so it is worth doing even if the first one fixes the build.\`,
  \`Short version: the bundler hit the 2 GB memory ceiling. Two changes fix it.

- Set \\\`NODE_OPTIONS=--max-old-space-size=4096\\\` for the build step.
- Load the charts page lazily with \\\`import()\\\`.

After that, the **bundle report** should show the dashboard chunk under 400 kB.\`,
];
const feedback: Record<string, string> = { up: "Thanks, marked as a good answer.", down: "Noted, marked as a bad answer." };

export default function MessageDemo() {
  const [version, setVersion] = useState(0);
  const [rating, setRating] = useState<MessageRating>(null);
  const [note, setNote] = useState("Hover the message, or tab into it, to reach the actions.");
  return (
    <Stack width={560} gap={5}>
      <Message
        key={version}
        name="Atlas"
        meta={version === 0 ? "Answered in 4 s" : \`Version \${version + 1}\`}
        content={answers[version % answers.length]}
        rating={rating}
        onRatingChange={next => { setRating(next); setNote(next ? feedback[next]! : "Rating cleared."); }}
        onCopy={text => setNote(\`Copied \${text.length} characters to the clipboard.\`)}
        onRetry={() => { setVersion(current => current + 1); setRating(null); setNote("Wrote another version of the answer."); }}
      />
      <Caption>{note}</Caption>
    </Stack>
  );
}
`;export{e as default};