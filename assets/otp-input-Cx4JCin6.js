var e=`import { useState } from "react";
import { OtpInput } from "@/registry/components/otp-input/otp-input";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "center", height: 360 };

export default function OtpInputDemo() {
  const [code, setCode] = useState("");
  const done = code.length === 6;
  const wrong = done && code !== "482913";
  return (
    <Stack width={380} gap={3} align="center" style={{ textAlign: "center" }}>
      <OtpInput
        label="Verification code"
        description="Enter the 6-digit code we sent to maya@northwind.studio."
        value={code}
        onChange={setCode}
        error={wrong ? "That code is not right. Try 482913." : undefined}
      />
      <Caption>{done ? (wrong ? "Rejected" : "Verified") : \`\${code.length} of 6 digits. Paste works too.\`}</Caption>
    </Stack>
  );
}
`;export{e as default};