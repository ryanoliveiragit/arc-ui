var e=`import { useState } from "react";
import { TagInput } from "@/registry/components/tag-input/tag-input";
import { Caption, Stack } from "./_kit";

export default function TagInputDemo() {
  const [tags, setTags] = useState(["design systems", "react", "accessibility"]);
  return (
    <Stack width={420} gap={3}>
      <TagInput label="Topics" description="Press Enter or comma to add. Backspace selects, then removes." placeholder="Add a topic" value={tags} onValueChange={setTags} />
      <Caption>{tags.length} topic{tags.length === 1 ? "" : "s"}</Caption>
    </Stack>
  );
}
`;export{e as default};