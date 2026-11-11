var e=`import { useState } from "react";
import { CookieConsent, type CookieConsentValue } from "@/registry/components/cookie-consent/cookie-consent";
import { Caption, Stack } from "./_kit";

export default function CookieConsentDemo() {
  const [choice, setChoice] = useState<CookieConsentValue | null>(null);
  return (
    <Stack gap={3} width={640}>
      <div style={{ position: "relative", height: 340, overflow: "hidden", border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", background: "var(--surface)" }}>
        <div style={{ padding: "var(--space-5)", display: "grid", gap: "var(--space-3)" }}>
          <strong style={{ fontSize: "var(--text-lg)" }}>Harbour & Co. Journal</strong>
          <span style={{ color: "var(--text-muted)" }}>Notes on slow travel, small kitchens and well-made things.</span>
        </div>
        <CookieConsent
          strategy="absolute"
          position="bottom"
          policy={{ label: "Cookie policy", href: "#policy" }}
          onChange={value => setChoice(value)}
        />
      </div>
      <Caption>
        {choice ? \`Saved: \${Object.entries(choice).filter(([, on]) => on).map(([id]) => id).join(", ") || "nothing"}. Use the small button to change it.\` : "Choose “Customize” to open the preferences panel."}
      </Caption>
    </Stack>
  );
}
`;export{e as default};