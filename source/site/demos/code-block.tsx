import { CodeBlock } from "@/registry/components/code-block/code-block";
import { Stack } from "./_kit";

const hook = `import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Usage
const query = useDebouncedValue(search, 300);
const results = useSearch(query);
`;

const shell = `npm install ryan-ui motion lucide-react
npx ryan-ui add button dialog`;

export default function CodeBlockDemo() {
  return (
    <Stack width={560} gap={5}>
      <CodeBlock filename="use-debounced-value.ts" language="tsx" code={hook} maxLines={9} />
      <CodeBlock language="bash" code={shell} />
    </Stack>
  );
}
