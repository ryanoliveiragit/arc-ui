import { useState } from "react";
import { PasswordField } from "@/registry/components/password-field/password-field";
import { Caption, Stack } from "./_kit";

export default function PasswordFieldDemo() {
  const [pw, setPw] = useState("correct-horse-battery");
  return (
    <Stack gap={3} width={360}>
      <PasswordField label="Password" description="Use the eye to check what you typed." value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
      <Caption>{pw.length} characters.</Caption>
    </Stack>
  );
}
