var e=`import { useState } from "react";
import PhoneInput from "@/registry/components/phone-input/phone-input";
import { Caption, Stack } from "./_kit";

export default function PhoneInputDemo() {
  const [value, setValue] = useState("");
  return (
    <Stack width={360} gap={3}>
      <PhoneInput label="Mobile number" description="We only text delivery updates." value={value} onValueChange={setValue} defaultCountry="US" />
      <Caption>E.164 value: {value || "empty"}. Try pasting +44 7911 123456 or typing “+” to search calling codes.</Caption>
    </Stack>
  );
}
`;export{e as default};