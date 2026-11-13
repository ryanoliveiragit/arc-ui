import { CodeBlock } from "@/registry/components/code-block/code-block";
import { Stack } from "./_kit";

export default function CodeBlockDemo() {
  return (
    <Stack width={564}>
      <CodeBlock filename="button.tsx" language="tsx" code={'<Button variant="secondary">Review changes</Button>'} />
    </Stack>
  );
}
