var e=`import { useState } from "react";
import { Input } from "@/registry/components/input/input";
import { Stack } from "./_kit";

export default function InputDemo() {
  const [email, setEmail] = useState("ryan@");
  const invalid = email.length > 0 && !/^\\S+@\\S+\\.\\S+$/.test(email);
  return (
    <Stack gap={5} width={360}>
      <Input label="Work email" type="email" description="We will send your receipts here." value={email} onChange={(e) => setEmail(e.target.value)} error={invalid ? "Enter a complete email address." : undefined} placeholder="you@company.com" />
      <Input label="Company" placeholder="Acme Inc." />
      <Input label="Workspace URL" value="acme-inc" readOnly disabled description="Contact support to change this." />
    </Stack>
  );
}
`;export{e as default};