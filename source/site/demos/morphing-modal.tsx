import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { MorphingModal } from "@/registry/components/morphing-modal/morphing-modal";
import { Button } from "@/registry/components/button/button";
import { Input } from "@/registry/components/input/input";
import Switch from "@/registry/components/switch/switch";
import { Avatar } from "@/registry/components/avatar/avatar";
import { avatar } from "@/lib/media";
import { Caption, Row, Stack } from "./_kit";
import styles from "./morphing-modal.module.css";

const members = [
  { id: "jasmine-brooks", name: "Jasmine Brooks", role: "Owner" },
  { id: "daniel-kim", name: "Daniel Kim", role: "Can edit" },
  { id: "hannah-walsh", name: "Hannah Walsh", role: "Can view" },
] as const;

export default function MorphingModalDemo() {
  const [name, setName] = useState("");
  const [isPrivate, setPrivate] = useState(true);
  const [created, setCreated] = useState<string | null>(null);

  return (
    <Stack gap={5} align="center">
      <Row justify="center" gap={4}>
        <MorphingModal
          trigger={<><Plus size={16} aria-hidden="true" />New project</>}
          title="New project"
          description="Projects keep tasks, files and people in one place."
          footer={({ close }) => (
            <>
              <Button variant="ghost" onClick={close}>Cancel</Button>
              <Button onClick={() => { setCreated(name.trim() || "Untitled project"); setName(""); close(); }}>Create project</Button>
            </>
          )}
        >
          <Stack gap={4}>
            <Input label="Project name" placeholder="Spring campaign" value={name} onChange={event => setName(event.target.value)} />
            <Switch label="Private: only invited people can see it" checked={isPrivate} onCheckedChange={setPrivate} />
          </Stack>
        </MorphingModal>

        <MorphingModal variant="neutral" width={380} trigger={<><UserPlus size={16} aria-hidden="true" />Share</>} title="Share “Q3 roadmap”" description="3 people have access.">
          <ul className={styles.members}>
            {members.map(member => (
              <li key={member.id} className={styles.member}>
                <Avatar name={member.name} src={avatar(member.id)} size="sm" />
                <span className={styles.memberName}>{member.name}</span>
                <span className={styles.memberRole}>{member.role}</span>
              </li>
            ))}
          </ul>
        </MorphingModal>
      </Row>
      <Caption>{created ? `Created “${created}”. ` : ""}Each button grows into its own modal and takes it back on close.</Caption>
    </Stack>
  );
}
