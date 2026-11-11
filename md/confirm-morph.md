# Confirm morph

> Botão destrutivo que vira confirmação no próprio lugar, depois carregamento e resultado com desfazer.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/confirm-morph
- Descrição original (inglês): A destructive button that morphs into an inline confirmation, a spinner, and a result with undo.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/confirm-morph.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/confirm-morph.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/confirm-morph.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/confirm-morph.json`. Caminho do registro, relativo ao endereço do site: `r/confirm-morph.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/confirm-morph/confirm-morph.tsx`
  - `components/ryan-ui/confirm-morph/confirm-morph.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/confirm-morph.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Ações destrutivas em que um diálogo modal pesaria: excluir um projeto, revogar um acesso, descartar um rascunho.
- Quando a pergunta, o andamento e o resultado com Desfazer devem acontecer no lugar do próprio botão.
- Ações que pedem uma barreira a mais: `confirmMode="hold"` exige manter pressionado e `countdown` dá alguns segundos para cancelar.

## Quando não usar

- Use [`dialog`](dialog.md) quando a pessoa precisa ler consequências ou preencher algo antes de confirmar: a pergunta aqui é uma linha curta.
- Use [`hold-to-confirm`](hold-to-confirm.md) quando basta manter o botão pressionado, sem pergunta nem Cancelar.
- Use [`toast-action`](toast-action.md) quando a ação pode rodar direto e o Desfazer vem depois, num aviso.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmMorph from "@/components/ryan-ui/confirm-morph/confirm-morph";
import { Caption, Field, Stack } from "./_kit";

const wait = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));

export default function ConfirmMorphDemo() {
  const [deleted, setDeleted] = useState(0);
  return (
    <Stack gap={6} align="center">
      <Field label="Press to confirm, with undo">
        <ConfirmMorph
          label="Delete project"
          icon={<Trash2 size={15} aria-hidden="true" />}
          prompt="Delete Northwind redesign?"
          onConfirm={async () => { await wait(1100); setDeleted(count => count + 1); }}
          onUndo={async () => { await wait(800); setDeleted(count => Math.max(0, count - 1)); }}
        />
      </Field>
      <Field label="Countdown you can still stop">
        <ConfirmMorph
          label="Remove 3 files"
          prompt="Remove 3 files?"
          confirmMode="countdown"
          countdown={3}
          countdownLabel="Removing in"
          confirmLabel="Remove"
          pendingLabel="Removing"
          doneLabel="Removed"
          onConfirm={() => wait(900)}
        />
      </Field>
      <Caption>Projects deleted this session: {deleted}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ConfirmMorph`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `ReactNode` | — | The resting label, such as "Delete project". |
| `icon` | `ReactNode` | — | A plain icon before the resting label. |
| `prompt` | `ReactNode` | — | The question shown while confirming, such as "Delete 3 files?". Defaults to the label with a question mark. |
| `confirmLabel` | `string` | `"Delete"` | — |
| `cancelLabel` | `string` | `"Cancel"` | — |
| `pendingLabel` | `string` | `"Deleting"` | Shown beside the spinner while `onConfirm` resolves. |
| `doneLabel` | `string` | `"Deleted"` | — |
| `errorLabel` | `string` | `"Couldn’t finish"` | — |
| `retryLabel` | `string` | `"Retry"` | — |
| `undoLabel` | `string` | `"Undo"` | — |
| `undoingLabel` | `string` | `"Restoring"` | Shown beside the spinner while `onUndo` resolves. |
| `tone` | `"danger" \| "neutral"` | `"danger"` | `danger` (default) gives the confirm button the danger colour, for actions that destroy something. `neutral` gives it the accent, for important actions that can be reversed. The resting button is neutral either way. |
| `confirmMode` | `"press" \| "hold" \| "countdown"` | `"press"` | `press` confirms on a press. `hold` asks for a press held for `holdDuration`. `countdown` confirms, then counts down `countdown` seconds that Cancel or Escape can still stop. |
| `holdDuration` | `number` | `1000` | Milliseconds the confirm button must be held in `hold` mode. |
| `countdown` | `number` | `3` | Seconds counted down before the action runs in `countdown` mode. |
| `countdownLabel` | `string` | — | Text before the seconds in `countdown` mode, such as "Deleting in". Defaults to the pending label followed by "in". |
| `onConfirm` | `() => void \| Promise<unknown>` | — | Runs on confirm. Return a promise to show the pending face; a rejection shows the error face with Retry. |
| `onUndo` | `() => void \| Promise<unknown>` | — | Offering it adds Undo to the result. Return a promise to show a pending face while it runs. |
| `onCancel` | `() => void` | — | — |
| `state` | `"idle" \| "confirming" \| "pending" \| "done" \| "error"` | — | Controlled state. Pair it with `onStateChange`. |
| `defaultState` | `"idle" \| "confirming" \| "pending" \| "done" \| "error"` | `"idle"` | Starting state when uncontrolled. |
| `onStateChange` | `(state: ConfirmMorphState) => void` | — | — |
| `confirmTimeout` | `number` | `6000` | Milliseconds before an unanswered question returns to rest. Resting the pointer on the control pauses it. 0 turns it off. |
| `resultTimeout` | `number` | `5000` | Milliseconds a result stays before returning to rest. Resting the pointer on the control pauses it. 0 turns it off. |
| `cancelOnOutsidePress` | `boolean` | `true` | A press outside the control cancels an open question. Defaults to true. |
| `disabled` | `boolean` | `false` | — |
| `className` | `string` | — | — |
| `ref` | `Ref<HTMLDivElement>` | — | Receives the root element, which also takes focus while the action is pending. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ConfirmMorphState`: Where the control is in its life: resting, asking, working, finished, or failed. | `"idle" \| "confirming" \| "pending" \| "done" \| "error"` |
| `ConfirmMorphMode`: How the question is answered: a press, a press held until the fill completes, or a press followed by a short countdown. | `"press" \| "hold" \| "countdown"` |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No botão em repouso, abrem a pergunta e levam o foco ao botão de confirmar, onde as mesmas teclas confirmam (no modo `countdown`, iniciam a contagem). |
| `Tab` ou `Shift + Tab` | Alternam entre Cancelar e Confirmar. |
| `Esc` | Cancela a pergunta ou a contagem regressiva; num resultado ou erro, volta ao repouso. |
| `Enter` | Durante a contagem regressiva, com o foco no controle, executa a ação sem esperar o fim. |
| `Espaço` ou `Enter` | No modo `hold`, precisam ficar pressionadas no botão de confirmar até o preenchimento completar; soltar antes desfaz. |

## Acessibilidade

- O foco acompanha as faces se já estava no controle: vai para Confirmar na pergunta, para a raiz durante a contagem e a espera, para Desfazer ou Tentar de novo no resultado e de volta ao botão no repouso.
- A pergunta é um `role="group"` rotulado pelo `prompt`, a raiz recebe `aria-busy` na espera e um `role="status"` anuncia andamento, resultado e erro, e também a pergunta quando `prompt` é texto.
- O tempo limite só pausa com o ponteiro sobre o controle ou com a aba oculta, não com o foco do teclado; aumente ou zere `confirmTimeout` e `resultTimeout` para quem usa teclado ou leitor de tela.

## Movimento

- Uma única pílula muda de largura com uma mola sem ultrapassagem a cada face; as faces trocam por esmaecer, na largura natural, e as partes da nova entram em sequência saindo de um leve desfoque.
- No modo `hold` o botão de confirmar se preenche da esquerda enquanto é pressionado e esvazia numa mola se solto antes; no `countdown` um anel se esgota e os segundos trocam no lugar; o sucesso desenha um visto.
- Com “reduzir movimento”, a largura salta, as faces só esmaecem, o visto aparece pronto e o indicador de espera gira mais devagar (1,6 s por volta).

## Comportamento responsivo

- Nada quebra linha: a pergunta ocupa até `16rem` (o excesso vira reticências) e é seguida de Cancelar e Confirmar, numa única fileira.
- A pílula não passa de 100% do contêiner e corta o que sobra; como Confirmar é o último, num espaço estreito ele fica fora da área visível: reserve largura ou encurte `prompt`.

## Notas para IA

- `onConfirm` pode devolver uma Promise: enquanto roda aparece a face de espera, uma rejeição mostra o erro com Tentar de novo, e passar `onUndo` acrescenta Desfazer ao resultado.
- Os rótulos têm padrão em inglês e de exclusão (`confirmLabel` “Delete”, `pendingLabel` “Deleting”, `doneLabel` “Deleted”): passe `prompt` e todos os rótulos; anúncios como “Cancelled” e “Undone” são fixos no código.
- Funciona sem controle externo; use `state` com `onStateChange` só se o pai precisar comandar as faces, e `tone="neutral"` para ações importantes mas reversíveis.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/confirm-morph · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
