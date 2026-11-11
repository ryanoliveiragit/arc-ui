var e=`import { useState } from "react";
import MoneyInput from "@/registry/components/money-input/money-input";
import { Caption, Stack } from "./_kit";

export default function MoneyInputDemo() {
  const [cents, setCents] = useState<number | null>(12500);
  return (
    <Stack gap={3} width={380}>
      <MoneyInput label="Invoice amount" description="Use the arrow keys or the quick add chips." value={cents} onValueChange={(v) => setCents(v)} max={100_000_000} />
      <Caption>Stored value: {cents === null ? "empty" : \`\${cents} minor units\`}.</Caption>
    </Stack>
  );
}
`;export{e as default};