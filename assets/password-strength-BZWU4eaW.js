var e=`import { useState } from "react";
import PasswordStrength from "@/registry/components/password-strength/password-strength";
import { Caption, Stack } from "./_kit";

export default function PasswordStrengthDemo() {
  const [label, setLabel] = useState("Too short");
  return (
    <Stack gap={3} width={380}>
      <PasswordStrength label="New password" defaultValue="sunrise" autoComplete="new-password" onValueChange={(_, s) => setLabel(s.label)} />
      <Caption>Strength: {label}. Try adding capitals, numbers and symbols.</Caption>
    </Stack>
  );
}
`;export{e as default};