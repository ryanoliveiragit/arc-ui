# Morphing modal

> O botão se transforma no modal a partir do próprio lugar e volta a ser botão ao fechar.

- Tipo: componente (categoria Revelação), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/morphing-modal
- Descrição original (inglês): A trigger button that morphs into the modal panel from its own position, size and color, and back on close, with a focus trap, Escape and a scrim.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morphing-modal.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morphing-modal.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morphing-modal.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morphing-modal.json`. Caminho do registro, relativo ao endereço do site: `r/morphing-modal.json`.

- Pacotes npm: `@radix-ui/react-dialog`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/morphing-modal/morphing-modal.tsx`
  - `components/ryan-ui/morphing-modal/morphing-modal.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-dialog lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/morphing-modal.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um botão de criação, como “Novo projeto”, que abre um formulário curto saindo do próprio botão.
- Compartilhar ou convidar a partir de um botão da barra, com a lista de pessoas no corpo do modal.
- Ações principais em que a origem do modal precisa ficar clara: o painel nasce da posição, do tamanho e da cor do botão.

## Quando não usar

- Use [`dialog`](dialog.md) quando o modal é aberto por código, por um item de menu ou por mais de um gatilho; aqui o gatilho é sempre o botão do próprio componente.
- Use [`center-morph-modal`](center-morph-modal.md) quando os modais nascem de cartões de uma grade.
- Use [`popover`](popover.md) para um conteúdo pequeno que não precisa bloquear a página.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { MorphingModal } from "@/components/ryan-ui/morphing-modal/morphing-modal";
import { Button } from "@/components/ryan-ui/button/button";
import { Input } from "@/components/ryan-ui/input/input";
import Switch from "@/components/ryan-ui/switch/switch";
import { Avatar } from "@/components/ryan-ui/avatar/avatar";
import { avatar } from "@/components/ryan-ui/lib/media";
import { Caption, Row, Stack, demoStage } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./morphing-modal.module.css";

const members = [
  { id: "jasmine-brooks", name: "Jasmine Brooks", role: "Owner" },
  { id: "daniel-kim", name: "Daniel Kim", role: "Can edit" },
  { id: "hannah-walsh", name: "Hannah Walsh", role: "Can view" },
] as const;

export const stage: DemoStage = { height: 520 };

export default function MorphingModalDemo() {
  // On the docs page each modal grows inside the preview, so it opens whole and the page around it keeps scrolling.
  const [container] = useState(demoStage);
  const [name, setName] = useState("");
  const [isPrivate, setPrivate] = useState(true);
  const [created, setCreated] = useState<string | null>(null);

  return (
    <Stack gap={5} align="center">
      <Row justify="center" gap={4}>
        <MorphingModal
          container={container}
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

        <MorphingModal container={container} variant="neutral" width={380} trigger={<><UserPlus size={16} aria-hidden="true" />Share</>} title="Share “Q3 roadmap”" description="3 people have access.">
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
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `MorphingModal`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `trigger` (obrigatória) | `ReactNode` | — | Content of the trigger button: a label, optionally with an icon. |
| `title` (obrigatória) | `string` | — | Title of the modal, also its accessible name. |
| `description` | `string` | — | Supporting line under the title. |
| `children` (obrigatória) | `Slot` | — | The body. Pass a function to receive `close`. |
| `footer` | `Slot` | — | Actions pinned under the body. Pass a function to receive `close`. |
| `open` | `boolean` | — | Whether the modal is open (controlled). |
| `defaultOpen` | `boolean` | `false` | Initial state when uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | — | Called with the next state when the trigger, Escape, the scrim or the close button is used. |
| `variant` | `"accent" \| "neutral"` | `"accent"` | Look of the trigger. The panel starts in the same color and settles into the surface color. |
| `width` | `number` | `420` | Maximum width of the panel in px. |
| `disabled` | `boolean` | `false` | Disables the trigger. |
| `className` | `string` | — | Extra class for the panel. |
| `triggerClassName` | `string` | — | Extra class for the trigger button. |
| `container` | `HTMLElement \| null` | — | Renders the modal inside this element instead of the page body: the scrim covers only the element and the panel centers in it. The element needs position: relative and overflow: hidden. The page around it stays usable while the modal is open: nothing is scroll-locked or hidden from assistive technology, and Escape, the scrim and the close button still close it. |

### Tipos exportados

#### `MorphingModalApi`

What the body and the footer receive when they are written as functions.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `close` (obrigatória) | `() => void` | Closes the modal; it morphs back into the trigger. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No botão, abre o modal. |
| `Tab` ou `Shift + Tab` | Percorrem os controles do modal sem sair dele; ao abrir, o foco vai ao primeiro campo do formulário ou, sem campos, ao botão de fechar. |
| `Esc` | Fecha o modal, que volta a ser o botão, e devolve o foco a ele. |

## Acessibilidade

- O botão recebe `aria-haspopup="dialog"` e `aria-expanded`; o painel é um diálogo modal do Radix com `title` como nome e `description` como descrição.
- Para escolher o foco inicial, marque o elemento com `data-autofocus`; o botão de fechar se chama “Close”, fixo em inglês no código.

## Movimento

- O painel cresce a partir da caixa do botão numa mola com um quique leve e volta a ela numa mola exata, sem oscilar; começa na cor do botão e clareia até a cor da superfície.
- Título, corpo e rodapé chegam um depois do outro, subindo 10 px de um leve desfoque, e saem de uma vez para não acompanhar o encolhimento.
- Com “reduzir movimento” ligado, não há transformação: o painel só esmaece ao abrir e fechar.

## Comportamento responsivo

- O painel ocupa a largura da tela menos 2rem até `width` (padrão 420 px), com altura máxima de `100dvh` menos 2rem e rolagem interna.

## Notas para IA

- `trigger` é o conteúdo do botão (rótulo e ícone), não um botão: o componente desenha o próprio `<button>`; estilize-o com `variant` e `triggerClassName`.
- `children` e `footer` aceitam uma função que recebe `{ close }`, útil para fechar depois de salvar.
- Controle com `open` e `onOpenChange` quando precisar; importe `MorphingModal` de `@/components/ryan-ui/morphing-modal/morphing-modal`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/morphing-modal · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
