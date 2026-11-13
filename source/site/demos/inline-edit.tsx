import { useRef, useState } from "react";
import InlineEdit from "@/registry/components/inline-edit/inline-edit";
import { Switch } from "@/registry/components/switch/switch";
import { Caption, Field, Stack, Surface } from "./_kit";

export default function InlineEditDemo() {
  const [name, setName] = useState("Atlas web app");
  const [description, setDescription] = useState("Offline-first field notes for the Atlas survey team. Drafts sync the moment a connection returns.");
  const [failNext, setFailNext] = useState(false);
  const failRef = useRef(failNext);
  failRef.current = failNext;

  // Salva com uma pequena demora para mostrar o estado; com o toggle ligado, o próximo save falha e o texto volta ao valor salvo.
  const save = (setter: (value: string) => void) => (next: string) =>
    new Promise<void>((resolve, reject) => {
      window.setTimeout(() => {
        if (failRef.current) {
          failRef.current = false;
          setFailNext(false);
          reject(new Error("Simulated failure"));
          return;
        }
        setter(next);
        resolve();
      }, 700);
    });

  return (
    <Surface width={440} padding={6}>
      <Stack gap={4}>
        <Field label="Project name">
          <InlineEdit label="Project name" value={name} onSave={save(setName)} validate={value => (value.trim() ? null : "A project needs a name.")} />
        </Field>
        <Field label="Description">
          <InlineEdit variant="body" multiline label="Description" value={description} onSave={save(setDescription)} placeholder="Add a description" />
        </Field>
        {/* O divisor separa os campos do rodapé do demo (igual ao demo ao vivo do site). */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <Switch label="Fail the next save" checked={failNext} onCheckedChange={setFailNext} />
        </div>
        <Caption>Last edited by Emma Collins on Mon 15 Sep</Caption>
      </Stack>
    </Surface>
  );
}
