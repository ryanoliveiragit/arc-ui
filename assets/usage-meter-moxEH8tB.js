var e=`import { useState } from "react";
import { UsageMeter } from "@/registry/components/usage-meter/usage-meter";
import { Button } from "@/registry/components/button/button";
import { Row, Stack, Surface } from "./_kit";

export default function UsageMeterDemo() {
  const [media, setMedia] = useState(18.4);
  const [docs, setDocs] = useState(9.2);
  const [backups, setBackups] = useState(12.1);
  return (
    <Stack gap={4} width={480}>
      <Surface>
        <UsageMeter
          label="Workspace storage"
          unit="GB"
          limit={50}
          segments={[
            { id: "media", label: "Media", value: media },
            { id: "docs", label: "Documents", value: docs },
            { id: "backups", label: "Backups", value: backups },
          ]}
        />
      </Surface>
      <Row>
        <Button size="sm" variant="secondary" onClick={() => setMedia(m => m + 4)}>Upload 4 GB of media</Button>
        <Button size="sm" variant="secondary" onClick={() => setBackups(b => b + 3)}>Add a backup</Button>
        <Button size="sm" variant="ghost" onClick={() => { setMedia(18.4); setDocs(9.2); setBackups(12.1); }}>Reset</Button>
      </Row>
    </Stack>
  );
}
`;export{e as default};