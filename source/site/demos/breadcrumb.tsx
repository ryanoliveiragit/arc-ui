import { useState } from "react";
import { ChevronRight, File } from "lucide-react";
import { Breadcrumb } from "@/registry/components/breadcrumb/breadcrumb";
import { Stack, Surface } from "./_kit";

const startTrail = ["Projects", "Arc launch", "Design review"];
const files = ["Motion pass", "Final copy"];

export default function BreadcrumbDemo() {
  const [trail, setTrail] = useState<string[]>(startTrail);
  return (
    <Surface width={460} padding={3}>
      <Stack gap={3}>
        <Breadcrumb
          items={trail.map((label, index) => ({
            label,
            onClick: index < trail.length - 1 ? () => setTrail(trail.slice(0, index + 1)) : undefined,
          }))}
        />
        <div>
          {files.map((file) => (
            <button
              key={file}
              type="button"
              onClick={() => setTrail((t) => [...t, file])}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                width: "100%",
                padding: "8px 10px",
                border: "none",
                borderRadius: 8,
                background: "transparent",
                color: "var(--muted-foreground)",
                fontSize: 14,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <File size={15} aria-hidden="true" />
                {file}
              </span>
              <ChevronRight size={15} aria-hidden="true" />
            </button>
          ))}
        </div>
      </Stack>
    </Surface>
  );
}
