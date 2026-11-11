# Toast stack

> Pilha de notificações que se empilha, se abre ao passar o mouse e transforma um aviso em seu resultado.

- Tipo: componente (categoria Feedback)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/toast-stack
- Descrição original (inglês): Stack short results at the edge until you reach for them.
- Versões: Padrão ([`toast`](toast.md)), Pilha (este item), Com ação ([`toast-action`](toast-action.md)), Progresso ([`toast-progress`](toast-progress.md))

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast-stack.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast-stack.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast-stack.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast-stack.json`. Caminho do registro, relativo ao endereço do site: `r/toast-stack.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/toast-stack/toast-stack.tsx`
  - `components/ryan-ui/toast-stack/toast-stack.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/toast-stack.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Resultados curtos de várias ações em sequência, como salvar, excluir e sincronizar, empilhados num canto sem cobrir a tela.
- Avisos que mudam no lugar: um `loading` que vira `success` com `update(id, …)`, ou um “Desfazer” que vira “Restaurado”.
- Avisos de tipos diferentes no mesmo lugar (`success`, `info`, `warning`, `error`, `loading`), com tempo maior para alertas e erros.

## Quando não usar

- Use [`toast`](toast.md) ou [`toast-action`](toast-action.md) quando só aparece um aviso por vez e você quer controlar `open` direto no componente.
- Use [`notification-center`](notification-center.md) para um histórico que a pessoa consulta depois, com lido e não lido.
- Use [`alert`](alert.md) para erros que precisam ficar visíveis até serem resolvidos.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import ToastStack, { ToastStackProvider, useToastStack } from "@/components/ryan-ui/toast-stack/toast-stack";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "fill", height: 440 };

function Controls() {
  const { toast, update, dismiss } = useToastStack();
  const upload = () => {
    const id = toast({ type: "loading", title: "Uploading brand-kit.zip", description: "42 MB, almost there" });
    window.setTimeout(() => update(id, { type: "success", title: "Upload complete", description: "brand-kit.zip is ready to share." }), 2000);
  };
  const remove = () => {
    toast({ type: "info", title: "Invoice deleted", description: "INV-2041 was moved to the trash.", action: { label: "Undo", onClick: id => update(id, { type: "success", title: "Invoice restored", description: "INV-2041 is back.", action: undefined }) } });
  };
  return (
    <Stack gap={4} align="center" style={{ padding: "var(--space-6)" }}>
      <Row justify="center">
        <Button onClick={upload}>Upload file</Button>
        <Button variant="secondary" onClick={remove}>Delete invoice</Button>
        <Button variant="secondary" onClick={() => toast({ type: "error", title: "Sync failed", description: "We lost the connection to the server." })}>Trigger error</Button>
        <Button variant="ghost" onClick={() => dismiss()}>Clear all</Button>
      </Row>
      <Caption>Fire several to see them stack; hover the stack to fan it out.</Caption>
    </Stack>
  );
}

export default function ToastStackDemo() {
  return (
    <ToastStackProvider>
      <div style={{ position: "relative", minHeight: 440, overflow: "hidden" }}>
        <Controls />
        <ToastStack contained />
      </div>
    </ToastStackProvider>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ToastStackProvider`

Scopes a toast queue to its subtree, so two stacks on one page never share toasts.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactNode` | — | — |
| `duration` | `number` | `5000` | Base lifetime in milliseconds. Warnings and errors stay 1.6 times longer. |
| `limit` | `number` | `12` | Oldest toasts beyond this count are dropped from the queue. |

### `ToastStack`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | `"Notifications"` | Accessible name of the notification region. |
| `position` | `"bottom-right" \| "bottom-center" \| "bottom-left"` | `"bottom-right"` | — |
| `contained` | `boolean` | `false` | Pins the stack inside the nearest positioned ancestor instead of the window, for panels and previews. |
| `visibleToasts` | `number` | `3` | How many toasts show at once. Older ones wait behind and return as the front ones close. |
| `hotkey` | `boolean` | `true` | Alt+T moves focus into the stack. |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ToastType` | `"success" \| "info" \| "warning" \| "error" \| "loading"` |

#### `ToastAction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `onClick` (obrigatória) | `(id: string) => void` | Runs the action. The toast closes afterwards unless the handler updates it, so an Undo can morph the toast into its result. |

#### `ToastOptions`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | `string` | Reuse an id to update a toast in place instead of stacking a new one. |
| `type` | `"success" \| "info" \| "warning" \| "error" \| "loading"` | — |
| `title` (obrigatória) | `string` | — |
| `description` | `string` | — |
| `action` | `ToastAction` | — |
| `duration` | `number` | Milliseconds before the toast closes itself. Defaults by type; loading toasts wait for an update. Pass Infinity to keep it until closed. |

#### `ToastStackApi`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `toast` (obrigatória) | `(options: ToastOptions) => string` | Shows a toast and returns its id. |
| `update` (obrigatória) | `(id: string, patch: Partial<Omit<ToastOptions, "id">>) => void` | Morphs a toast in place: icon, copy, and height animate to the new content and its timer restarts. Pass `action: undefined` to remove the action. |
| `dismiss` (obrigatória) | `(id?: string) => void` | Dismisses one toast, or every toast when called without an id. |

### Outras exportações

- `useToastStack` (hook)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Alt + T` | Leva o foco ao primeiro botão do aviso da frente e abre a pilha em lista; desligue com `hotkey={false}`. |
| `Tab` ou `Shift + Tab` | Percorre ações e botões de fechar; com foco de teclado dentro, a pilha fica aberta e os tempos pausam. |
| `Esc` | Fecha o aviso que tem o foco; o foco passa para o próximo aviso ou volta para onde estava antes. |
| `Enter` ou `Espaço` | Na ação, executa `onClick`; o aviso fecha, a menos que o handler o atualize. |

## Acessibilidade

- A pilha é uma `<section>` com `aria-live="polite"` que anuncia avisos novos e mudanças de texto; cada aviso começa com o tipo em texto oculto (“Success:”, “Error:”), em inglês.
- O nome da região inclui o atalho (“Notifications (Alt+T)”), e os avisos além de `visibleToasts` ficam `inert` até chegarem à frente.
- Quando uma ação atualiza o aviso e some, o foco de teclado vai para o botão de fechar; ao fechar, ele segue para o próximo aviso ou volta para onde estava.

## Movimento

- Avisos novos sobem da borda e os anteriores ficam atrás, 14 px acima e um pouco menores; passar o mouse ou focar abre a pilha numa lista, com uma mola sem ultrapassagem.
- Arrastado para a direita, o aviso segue o dedo e sai voando quando passa de 40% da largura, contando o impulso; para a esquerda, resiste como no fim de uma rolagem.
- `update` troca ícone, texto e altura no lugar e reinicia o tempo. Com “reduzir movimento”, posições e tamanhos mudam na hora e só a opacidade anima.

## Comportamento responsivo

- A pilha tem até 22,5 rem e fica fixa no canto escolhido; em telas abaixo de 30 rem centraliza no rodapé. No toque, que não tem hover, tocar num aviso abre ou fecha a pilha.
- Num aviso com menos de 21 rem, a ação desce para baixo do texto.

## Desempenho

- A geometria da pilha vive em valores de movimento, então seguir o dedo, o mouse ou um timer não re-renderiza o React a cada quadro; a fila guarda no máximo `limit` avisos (padrão 12).

## Notas para IA

- Importe `ToastStackProvider`, `useToastStack` e o padrão `ToastStack` de `@/components/ryan-ui/toast-stack/toast-stack`; envolva o app no provider, renderize `<ToastStack />` uma vez e chame `toast()` abaixo dele.
- `toast()` devolve o id: guarde-o para `update(id, { type: "success", … })` ou `dismiss(id)`. Repetir um `id` em `toast()` atualiza em vez de empilhar.
- Avisos `loading` não fecham sozinhos, então sempre atualize ou dispense depois. Numa prévia, use `contained` dentro de um pai com `position: relative`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/toast-stack · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
