# Approval card

> Cartão que pede sua aprovação antes de o agente agir, com resumo, detalhes que se abrem e o resultado da decisão.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/approval-card
- Descrição original (inglês): A card that asks a person to approve or reject an agent's proposed action, with a summary, details that expand, and a resolved state the buttons morph into.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/approval-card.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/approval-card.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/approval-card.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/approval-card.json`. Caminho do registro, relativo ao endereço do site: `r/approval-card.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/approval-card/approval-card.tsx`
  - `components/ryan-ui/approval-card/approval-card.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/approval-card.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um agente propõe uma ação com efeito real (reembolso, envio, exclusão) e uma pessoa precisa aprovar ou rejeitar antes de ela acontecer.
- Pedidos que precisam de contexto: um resumo, fatos em pares de rótulo e valor e, se quiser, uma prévia da mudança atrás do botão de detalhes.
- Filas de revisão em que o cartão continua na tela depois da decisão, mostrando o que foi decidido e um “Undo”.

## Quando não usar

- Use [`tool-approval`](tool-approval.md) para um pedido compacto dentro da conversa, com permitir uma vez, permitir sempre ou negar.
- Use [`confirm-morph`](confirm-morph.md) ou [`hold-to-confirm`](hold-to-confirm.md) quando é a própria pessoa que dispara uma ação destrutiva e só falta confirmá-la.
- Use [`dialog`](dialog.md) quando a decisão deve bloquear o resto da tela até ser tomada.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import ApprovalCard from "@/components/ryan-ui/approval-card/approval-card";
import type { ApprovalStatus } from "@/components/ryan-ui/approval-card/approval-card";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

const notes: Record<ApprovalStatus, string> = {
  pending: "The agent is waiting. Nothing is sent until you decide.",
  approved: "The agent sent the refund and replied to the customer.",
  rejected: "The agent dropped the refund and will ask the customer for photos.",
};

export default function ApprovalCardDemo() {
  const [status, setStatus] = useState<ApprovalStatus>("pending");
  return (
    <Stack width={440} gap={4}>
      <ApprovalCard
        source="Billing agent"
        title="Refund $240.00 to Maya Torres"
        summary="Order 48213 arrived with a cracked lid. The agent wants to refund the full amount to the original card and close the ticket."
        details={[
          { label: "Customer", value: "Maya Torres" },
          { label: "Order", value: "48213, delivered May 2" },
          { label: "Amount", value: "$240.00" },
          { label: "Refund to", value: "Visa ending 4421" },
          { label: "Policy", value: "Inside the 30-day window" },
        ]}
        approveLabel="Approve refund"
        resolvedLabels={{ approved: "Refund approved", rejected: "Refund rejected" }}
        status={status}
        onStatusChange={setStatus}
      />
      <Caption>{notes[status]}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ApprovalCard`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` (obrigatória) | `string` | — | The action waiting for a decision, in one line. |
| `summary` | `ReactNode` | — | A sentence or two on what will happen and why. |
| `source` | `string` | — | Who is asking, shown above the title (an agent or a workflow name). |
| `icon` | `ReactNode` | — | Icon of the request while it is pending. |
| `details` | `ApprovalDetail[]` | — | Facts shown when the details are open, as label and value rows. |
| `children` | `ReactNode` | — | Extra content under the detail rows, such as a preview of the change. |
| `status` | `"pending" \| "approved" \| "rejected"` | — | Controlled decision. |
| `defaultStatus` | `"pending" \| "approved" \| "rejected"` | `"pending"` | Decision the card starts with when uncontrolled. |
| `onStatusChange` | `(status: ApprovalStatus) => void` | — | Called when the person approves, rejects or undoes. |
| `detailsOpen` | `boolean` | — | Controlled open state of the details. |
| `defaultDetailsOpen` | `boolean` | `false` | Whether the details start open when uncontrolled. |
| `onDetailsOpenChange` | `(open: boolean) => void` | — | Called when the details toggle is pressed. |
| `approveLabel` | `string` | `"Approve"` | Text of the approve button. |
| `rejectLabel` | `string` | `"Reject"` | Text of the reject button. |
| `resolvedLabels` | `Partial<Record<Exclude<ApprovalStatus, "pending">, string>>` | — | Outcome text per decision, shown in the resolved state. |
| `allowUndo` | `boolean` | `true` | Offers an undo in the resolved state that returns the card to pending. |
| `className` | `string` | — | Extra class for the root element. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ApprovalStatus` | `"pending" \| "approved" \| "rejected"` |

#### `ApprovalDetail`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | Name of the fact, such as "Amount". |
| `value` (obrigatória) | `ReactNode` | Its value. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Aciona o botão em foco: detalhes, rejeitar, aprovar ou desfazer. |
| `Tab` | Percorre os controles na ordem do DOM: botão de detalhes, rejeitar e aprovar. |

## Acessibilidade

- A raiz é uma `<section>` rotulada pelo `title`; o botão de detalhes expõe `aria-expanded` e `aria-controls`, e o resultado aparece numa região `role="status"`.
- Ao decidir, o botão pressionado sai do DOM e o código não move o foco, que fica no `body`; se a fila é usada pelo teclado, mova o foco você mesmo em `onStatusChange`.
- “Show details”, “Hide details”, “Undo” e “needs your approval” estão fixos em inglês; só `approveLabel`, `rejectLabel` e `resolvedLabels` podem ser traduzidos.

## Movimento

- Ao decidir, o ícone vira um visto ou um xis que se desenha, uma onda sai do emblema e os botões dão lugar ao resultado com um esmaecer curto.
- Os detalhes abrem com uma mola de altura e as linhas de fatos entram em sequência.
- Com “reduzir movimento” ligado, sobram só trocas de opacidade: sem onda, sem traço se desenhando e sem transições de cor ou escala.

## Comportamento responsivo

- Quando a janela tem até 26rem de largura (media query, não do contêiner), os dois botões dividem a linha inteira; o cartão sempre ocupa 100% do pai.

## Notas para IA

- O cartão só registra a decisão: execute a ação em `onStatusChange` e, para refletir o que o servidor respondeu, controle `status` (`pending`, `approved`, `rejected`).
- “Undo” devolve o cartão a `pending` e chama `onStatusChange("pending")`; se a ação não pode ser desfeita depois de executada, passe `allowUndo={false}`.
- O botão de detalhes só aparece quando há `details` ou `children`; cada `label` de `details` serve de `key`, então não repita rótulos.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/approval-card · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
