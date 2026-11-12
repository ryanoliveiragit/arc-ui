# Center morph modal

> Um cartão da grade cresce até virar um modal no centro da tela, e o resumo dá lugar ao conteúdo completo.

- Tipo: componente (categoria Revelação), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/center-morph-modal
- Descrição original (inglês): A grid of cards in which the chosen card morphs into a centered modal: its box, icon and title travel while the summary crossfades to the expanded content.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/center-morph-modal.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/center-morph-modal.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/center-morph-modal.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/center-morph-modal.json`. Caminho do registro, relativo ao endereço do site: `r/center-morph-modal.json`.

- Pacotes npm: `@radix-ui/react-dialog`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/center-morph-modal/center-morph-modal.tsx`
  - `components/ryan-ui/center-morph-modal/center-morph-modal.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-dialog lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/center-morph-modal.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Galerias de modelos, receitas ou integrações em que cada cartão abre os próprios detalhes sem trocar de página.
- Catálogos em que o resumo do cartão (`summary`) basta para escolher e o conteúdo completo (`content`) só aparece no modal, com ações no rodapé.
- Grades em que a continuidade importa: ícone e título viajam do cartão até o cabeçalho do modal.

## Quando não usar

- Use [`dialog`](dialog.md) para uma confirmação ou formulário que não nasce de um cartão de uma grade.
- Use [`expandable-card`](expandable-card.md) quando os detalhes cabem no próprio cartão e a página não precisa ser bloqueada.
- Use [`image-viewer`](image-viewer.md) para galerias de fotos com zoom e navegação entre imagens.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { BellRing, CalendarCheck, MailPlus, ReceiptText } from "lucide-react";
import { CenterMorphModal } from "@/components/ryan-ui/center-morph-modal/center-morph-modal";
import type { CenterMorphItem } from "@/components/ryan-ui/center-morph-modal/center-morph-modal";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Stack, demoStage } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./center-morph-modal.module.css";

function Steps({ when, then }: { when: string; then: string[] }) {
  return (
    <>
      <dl className={styles.steps}>
        <div><dt>When</dt><dd>{when}</dd></div>
        {then.map((step, index) => <div key={step}><dt>{index === 0 ? "Then" : "And"}</dt><dd>{step}</dd></div>)}
      </dl>
    </>
  );
}

const recipes: CenterMorphItem[] = [
  {
    id: "digest", title: "Weekly digest", subtitle: "Every Monday at 9:00", meta: "Popular", media: <CalendarCheck size={20} />,
    summary: "Send the team a summary of what shipped last week.",
    content: <><p>Collects everything marked done in the last seven days and posts one tidy summary, grouped by project, to the channel you choose.</p><Steps when="It is Monday, 9:00 in the workspace time zone" then={["Gather tasks completed since last Monday", "Post the summary to #team-updates"]} /></>,
  },
  {
    id: "stale", title: "Stale task nudge", subtitle: "Checks once a day", meta: "2 steps", media: <BellRing size={20} />,
    summary: "Remind the owner when a task has not moved in 5 days.",
    content: <><p>Keeps work from going quiet. The owner gets a direct message with the task and a one-tap way to update its status or hand it over.</p><Steps when="A task in progress has no activity for 5 days" then={["Send the owner a reminder", "Add the label “Needs attention”"]} /></>,
  },
  {
    id: "lead", title: "New lead alert", subtitle: "Runs instantly", meta: "3 steps", media: <MailPlus size={20} />,
    summary: "Create a contact and tell sales when a form comes in.",
    content: <><p>Turns every form submission into a contact, assigns it by region and lets the right person know within seconds.</p><Steps when="Someone submits the contact form" then={["Create the contact with the form answers", "Assign it to the regional owner", "Notify them in #sales"]} /></>,
  },
  {
    id: "invoice", title: "Invoice follow-up", subtitle: "3 days after the due date", meta: "2 steps", media: <ReceiptText size={20} />,
    summary: "Send a polite reminder when an invoice is overdue.",
    content: <><p>Sends a friendly reminder with the payment link, then tells finance if the invoice is still open a week later.</p><Steps when="An invoice is 3 days past its due date" then={["Email the customer a reminder", "Alert finance after 7 more days"]} /></>,
  },
];

export const stage: DemoStage = { height: 560 };

export default function CenterMorphModalDemo() {
  // On the docs page the chosen card grows to the center of the preview, so the modal opens whole and the page keeps scrolling.
  const [container] = useState(demoStage);
  const [open, setOpen] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<string[]>([]);
  return (
    <Stack gap={4} width={560}>
      <CenterMorphModal
        container={container}
        items={recipes.map(recipe => enabled.includes(recipe.id) ? { ...recipe, meta: "On" } : recipe)}
        value={open}
        onValueChange={setOpen}
        renderFooter={(item, close) => {
          const on = enabled.includes(item.id);
          return (
            <>
              <Button variant="ghost" onClick={close}>Not now</Button>
              <Button onClick={() => { setEnabled(current => on ? current.filter(id => id !== item.id) : [...current, item.id]); close(); }}>{on ? "Turn off" : "Use this recipe"}</Button>
            </>
          );
        }}
      />
      <Caption>Pick a recipe: the card itself becomes the dialog. {enabled.length ? `${enabled.length} turned on.` : "None turned on yet."}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CenterMorphModal`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` (obrigatória) | `CenterMorphItem[]` | — | The cards, in order. |
| `value` | `string \| null` | — | Id of the open card, or null when none is open (controlled). |
| `defaultValue` | `string \| null` | `null` | Id of the card open at first when uncontrolled. |
| `onValueChange` | `(id: string \| null) => void` | — | Called with the id of the card that opened, or null when the modal closes. |
| `renderFooter` | `(item: CenterMorphItem, close: () => void) => ReactNode` | — | Actions shown under the expanded content. Receives the open item and a function that closes the modal. |
| `minColumnWidth` | `number` | `220` | Narrowest a card may get in px before the grid drops a column. |
| `width` | `number` | `480` | Maximum width of the modal in px. |
| `className` | `string` | — | Extra class for the grid. |
| `container` | `HTMLElement \| null` | — | Renders the modal inside this element instead of the page body: the scrim covers only the element and the card grows to its center. The element needs position: relative and overflow: hidden. The page around it stays usable while the modal is open: nothing is scroll-locked or hidden from assistive technology, and Escape, the scrim and the close button still close it. |

### Tipos exportados

#### `CenterMorphItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique id; this is what `value` and `onValueChange` carry. |
| `title` (obrigatória) | `string` | Title shown on the card and carried into the modal. |
| `subtitle` | `string` | One line under the title, on the card and in the modal. |
| `media` | `ReactNode` | Icon or small image. It travels from the card to the modal header and grows on the way. |
| `summary` | `ReactNode` | Short text shown only on the card. It fades out as the card opens. |
| `meta` | `ReactNode` | Small trailing label on the card, such as a status or a count. |
| `content` (obrigatória) | `ReactNode` | The expanded content, shown only in the modal. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No cartão em foco, abre o modal. |
| `Tab` ou `Shift + Tab` | Percorrem os controles do modal sem sair dele; ao abrir, o foco vai ao primeiro controle, o botão de fechar. |
| `Esc` | Fecha o modal; o foco volta ao cartão que o abriu. |

## Acessibilidade

- Cada cartão é um `<button>` com `aria-haspopup="dialog"` e `aria-expanded`; o modal é um diálogo do Radix com o título como nome e o `subtitle` como descrição.
- Com o modal aberto, o foco fica preso nele e o resto da página sai da árvore de acessibilidade; ao fechar, o foco volta ao cartão de origem.
- O botão de fechar se chama “Close”, fixo em inglês no código; a mídia do cartão fica oculta para o leitor de tela.

## Movimento

- Caixa, mídia e título do cartão são os mesmos elementos do modal e viajam até o centro numa mola com um quique leve; ao fechar, voltam numa mola sem quique.
- O resumo some enquanto subtítulo, corpo e rodapé chegam um depois do outro, subindo 12 px de um leve desfoque, e saem todos de uma vez.
- Com “reduzir movimento” ligado, não há viagem compartilhada: o modal só esmaece ao entrar e sair.

## Comportamento responsivo

- A grade usa `auto-fill` com colunas de no mínimo `minColumnWidth` (padrão 220 px) e perde colunas conforme a largura diminui.
- O modal ocupa a largura da tela menos 2rem até `width` (padrão 480 px), com altura máxima de `100dvh` menos 2rem e rolagem interna.

## Notas para IA

- Cada item tem `id`, `title` e `content`; `summary` e `meta` só aparecem no cartão, e `subtitle` e `media` aparecem nos dois.
- Use `renderFooter(item, close)` para as ações e chame `close()` depois de agir; para controlar o cartão aberto, use `value` (um `id` ou `null`) com `onValueChange`.
- Importe `CenterMorphModal` de `@/components/ryan-ui/center-morph-modal/center-morph-modal`; ele desenha a grade inteira, então passe todos os cartões de uma vez.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/center-morph-modal · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
