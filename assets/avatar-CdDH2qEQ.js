var e=`import { Avatar } from "@/registry/components/avatar/avatar";
import { Caption, Row, Stack } from "./_kit";
import { avatar } from "@/lib/media";

const people = [
  { id: "emma-collins" as const, name: "Emma Collins", size: "sm" as const, label: "Small" },
  { id: "marcus-johnson" as const, name: "Marcus Johnson", size: "md" as const, label: "Medium" },
  { id: "ava-mitchell" as const, name: "Ava Mitchell", size: "lg" as const, label: "Large" },
];

export default function AvatarDemo() {
  return (
    <Row justify="space-evenly" width={405}>
      {people.map((p) => (
        <Stack key={p.id} gap={1} align="center">
          <span style={{ display: "inline-block", marginBottom: 8 }}>
            <Avatar name={p.name} src={avatar(p.id)} size={p.size} />
          </span>
          <strong style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</strong>
          <Caption>{p.label}</Caption>
        </Stack>
      ))}
    </Row>
  );
}
`;export{e as default};