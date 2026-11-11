# Prompt input

> Caixa de prompt que cresce com o texto, com anexos, menu de modelo e um botão de enviar que vira parar durante a resposta.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/prompt-input
- Descrição original (inglês): An auto-growing prompt box with attachment chips and a model menu whose send button morphs into stop while a response runs; Enter sends and Shift+Enter adds a line.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/prompt-input.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/prompt-input.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/prompt-input.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/prompt-input.json`. Caminho do registro, relativo ao endereço do site: `r/prompt-input.json`.

- Pacotes npm: `@radix-ui/react-dropdown-menu`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/prompt-input/prompt-input.tsx`
  - `components/ryan-ui/prompt-input/prompt-input.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-dropdown-menu lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/prompt-input.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- A caixa de prompt de um assistente: cresce com o texto, envia com Enter e quebra linha com Shift + Enter.
- Respostas que podem ser interrompidas: com `running`, o botão de enviar vira um botão de parar no mesmo lugar.
- Pedidos com anexos em chips e um menu para escolher o modelo, tudo dentro da mesma caixa.

## Quando não usar

- Use [`textarea`](textarea.md) para um campo de várias linhas num formulário, sem envio por Enter nem botão de parar.
- Use [`mention-input`](mention-input.md) quando o texto precisa de menções a pessoas com @ ou a canais com #.
- Use [`chat-app`](chat-app.md) quando quiser a tela de chat inteira, com conversa, respostas em streaming e caixa de prompt já ligadas.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useEffect, useRef, useState } from "react";
import PromptInput from "@/components/ryan-ui/prompt-input/prompt-input";
import type { PromptAttachment, PromptModel, PromptSubmission } from "@/components/ryan-ui/prompt-input/prompt-input";
import { Caption, Stack } from "./_kit";

const models: PromptModel[] = [
  { id: "atlas-pro", label: "Atlas Pro", description: "Slower, best for hard problems" },
  { id: "atlas-fast", label: "Atlas Fast", description: "Quick answers for everyday work" },
  { id: "atlas-mini", label: "Atlas Mini", description: "Lightest, for short tasks" },
];
const shelf: PromptAttachment[] = [
  { id: "report", name: "q3-revenue.csv", detail: "84 KB" },
  { id: "brief", name: "launch-brief.pdf", detail: "1.2 MB" },
  { id: "notes", name: "interview-notes.md", detail: "6 KB" },
  { id: "chart", name: "churn-by-plan.png", detail: "310 KB" },
];

export default function PromptInputDemo() {
  const [attachments, setAttachments] = useState<PromptAttachment[]>(shelf.slice(0, 2));
  const [model, setModel] = useState("atlas-pro");
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState("Enter sends, Shift+Enter adds a line. The plus button attaches a sample file.");
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function send({ value, attachments: files, model: used }: PromptSubmission) {
    const name = models.find(item => item.id === used)?.label ?? "the model";
    const extras = files.length ? ` with ${files.length} ${files.length === 1 ? "file" : "files"}` : "";
    setNote(`${name} is answering “${value || "your files"}”${extras}. Press stop to interrupt.`);
    setRunning(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setRunning(false); setNote(`${name} finished the answer.`); }, 3600);
  }

  function attach() {
    const next = shelf.find(file => !attachments.some(item => item.id === file.id));
    if (next) setAttachments([...attachments, next]); else setNote("All four sample files are attached.");
  }

  return (
    <Stack width={560} gap={4}>
      <PromptInput
        placeholder="Ask about your data"
        models={models}
        model={model}
        onModelChange={setModel}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        onAttach={attach}
        running={running}
        onSubmit={send}
        onStop={() => { window.clearTimeout(timer.current); setRunning(false); setNote("Stopped. The partial answer was kept."); }}
      />
      <Caption>{note}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `PromptInput`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` | `string` | — | Controlled text. |
| `defaultValue` | `string` | `""` | Text the box starts with when uncontrolled. |
| `onValueChange` | `(value: string) => void` | — | Called on every edit, and with an empty string after a send. |
| `onSubmit` | `(submission: PromptSubmission) => void` | — | Called when the person sends (Enter or the send button) with text or attachments present. |
| `running` | `boolean` | `false` | True while a response is being generated: the send button becomes a stop button. |
| `onStop` | `() => void` | — | Called when the stop button is pressed. |
| `attachments` | `PromptAttachment[]` | — | Controlled attachment list. |
| `defaultAttachments` | `PromptAttachment[]` | `noAttachments` | Attachments the box starts with when uncontrolled. |
| `onAttachmentsChange` | `(attachments: PromptAttachment[]) => void` | — | Called when a chip is removed, files are picked, or the list is cleared after a send. |
| `onAttach` | `() => void` | — | Called when the attach button is pressed. Without it the button opens the system file picker and adds the chosen files as chips. |
| `models` | `PromptModel[]` | `noModels` | Models offered in the menu. The menu is hidden when the list is empty. |
| `model` | `string` | — | Controlled model id. |
| `defaultModel` | `string` | — | Model selected at first when uncontrolled. Defaults to the first one. |
| `onModelChange` | `(model: string) => void` | — | Called when another model is picked. |
| `placeholder` | `string` | `"Ask anything"` | Placeholder text of the empty box. |
| `label` | `string` | `"Prompt"` | Accessible name of the text box. |
| `maxRows` | `number` | `8` | Lines the box grows to before it scrolls. |
| `clearOnSubmit` | `boolean` | `true` | Empties the text and the attachments after a send. |
| `disabled` | `boolean` | `false` | Blocks typing, attaching and sending. |
| `className` | `string` | — | Extra class for the root element. |

### Tipos exportados

#### `PromptAttachment`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable id, used as the key and passed back on removal. |
| `name` (obrigatória) | `string` | File or item name shown on the chip. |
| `detail` | `string` | Short note after the name, such as a size or a type. |

#### `PromptModel`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Value reported by `onModelChange` and `onSubmit`. |
| `label` (obrigatória) | `string` | Name shown on the trigger and in the menu. |
| `description` | `string` | One line under the name in the menu. |

#### `PromptSubmission`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | The trimmed prompt text. |
| `attachments` (obrigatória) | `PromptAttachment[]` | Attachments on the prompt when it was sent. |
| `model` | `string` | Selected model id, when models are given. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` | Na caixa de texto, envia quando há texto ou anexo; durante a composição de um IME não envia. |
| `Shift + Enter` | Quebra a linha sem enviar; a caixa cresce até `maxRows` linhas e depois rola por dentro. |
| `Enter` ou `Espaço` ou `↓` | No seletor de modelo, abre o menu com o foco no primeiro modelo. |
| `↑` ou `↓` ou `Home` ou `End` | No menu, move entre os modelos; as setas dão a volta do último ao primeiro. |
| `Enter` ou `Espaço` | No menu, escolhe o modelo em foco, fecha o menu e devolve o foco ao seletor. |
| `Esc` | Fecha o menu sem trocar o modelo e devolve o foco ao seletor. |

## Acessibilidade

- A caixa de texto tem o nome de `label` (padrão “Prompt”) e a descrição oculta “Press Enter to send, Shift and Enter for a new line.” por `aria-describedby`; a dica visível fica `aria-hidden`.
- Os botões só de ícone têm `aria-label` fixo em inglês (“Attach files”, “Remove …”, “Send prompt”, “Stop response”), o seletor se anuncia como “Model: …” e o menu é um grupo de rádio do Radix.
- Depois de enviar, o foco volta para a caixa de texto; enviar e parar são o mesmo `<button>`, que só troca o `aria-label`, e o parar fica desativado sem `onStop`.

## Movimento

- A caixa acompanha a altura do texto com uma mola curta; a bandeja de anexos abre a própria altura, cada chip entra crescendo e os outros deslizam quando um sai.
- Quando `running` vira `true`, a seta sai para cima, um quadrado de parar cresce no lugar e um arco gira em volta do botão; o nome do modelo troca deslizando na vertical.
- Com “reduzir movimento” ligado, a altura troca na hora, chips e ícones só esmaecem, o arco para e o menu aparece com um esmaecer rápido.

## Comportamento responsivo

- É um contêiner de largura: abaixo de 22rem a dica “Enter to send” some; o nome do modelo corta com reticências, e o nome de cada anexo também, a partir de 11rem.
- O menu de modelos abre acima do seletor, com pelo menos 15rem de largura, e o Radix o reposiciona para caber na tela, com 12 px de folga.

## Notas para IA

- Ligue `onSubmit`, que recebe `value` já aparado, `attachments` e `model`, e controle `running` com `onStop`; sem `onStop`, o botão de parar fica desativado durante a resposta.
- Sem `onAttach`, o botão abre o seletor do sistema e cria chips só com nome e tamanho, sem guardar o `File`; para enviar arquivos de verdade, passe `onAttach` e controle `attachments`.
- Por padrão, texto e anexos são limpos após o envio (`clearOnSubmit`); com `models` vazio o menu some, e `model` com `onModelChange` deixa a escolha controlada.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/prompt-input · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
