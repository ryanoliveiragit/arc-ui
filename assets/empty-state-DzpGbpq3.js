var e=`import { useState } from "react";
import { FolderOpen, Plus } from "lucide-react";
import { EmptyState } from "@/registry/components/empty-state/empty-state";
import { Button } from "@/registry/components/button/button";
import { Stack } from "./_kit";

export default function EmptyStateDemo() {
  const [count, setCount] = useState(0);
  return (
    <Stack width={460}>
      {count === 0 ? (
        <EmptyState
          icon={<FolderOpen size={24} aria-hidden="true" />}
          title="No projects yet"
          description="Projects keep your files, tasks and teammates in one place. Create your first to get started."
          action={<Button onClick={() => setCount(1)}><Plus size={16} aria-hidden="true" />New project</Button>}
        />
      ) : (
        <EmptyState
          title={\`\${count} project created\`}
          description="Nice start. Invite a teammate or add your first task."
          action={<Button variant="secondary" onClick={() => setCount(0)}>Clear projects</Button>}
        />
      )}
    </Stack>
  );
}
`;export{e as default};