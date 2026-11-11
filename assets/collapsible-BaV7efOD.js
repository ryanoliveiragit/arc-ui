var e=`import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/registry/components/collapsible/collapsible";
import Switch from "@/registry/components/switch/switch";
import { Caption, Stack } from "./_kit";
import styles from "./collapsible.module.css";

const settings = [
  { name: "Framework", value: "Vite 8" },
  { name: "Node version", value: "22.x" },
  { name: "Build command", value: "pnpm build" },
  { name: "Output folder", value: "dist" },
];

const earlier = ["Fix avatar upload on slow networks", "Raise the export limit to 50,000 rows", "Remember the last used workspace"];

export default function CollapsibleDemo() {
  const [open, setOpen] = useState(true);
  const [cache, setCache] = useState(true);
  const [more, setMore] = useState(false);

  return (
    <Stack gap={5} width={440}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger icon={<SlidersHorizontal size={16} />} hint={open ? "Applies to every new deployment" : "Vite 8, Node 22, cache " + (cache ? "on" : "off")}>Build settings</CollapsibleTrigger>
        <CollapsibleContent>
          <dl className={styles.settings}>
            {settings.map(row => <div key={row.name} className={styles.row}><dt>{row.name}</dt><dd>{row.value}</dd></div>)}
          </dl>
          <Switch label="Reuse the dependency cache" checked={cache} onCheckedChange={setCache} />
        </CollapsibleContent>
      </Collapsible>

      <Collapsible variant="plain" open={more} onOpenChange={setMore}>
        <div className={styles.release}>
          <span className={styles.version}>v4.2</span>
          <span>Add scheduled exports for reports</span>
        </div>
        <CollapsibleContent className={styles.more}>
          <ul className={styles.changes}>{earlier.map(change => <li key={change}>{change}</li>)}</ul>
        </CollapsibleContent>
        <CollapsibleTrigger>{more ? "Hide earlier changes" : "Show 3 more changes"}</CollapsibleTrigger>
      </Collapsible>
      <Caption>Both are controlled: the hint and the label follow the open state.</Caption>
    </Stack>
  );
}
`;export{e as default};