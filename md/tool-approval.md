# Tool approval

> Pedido compacto para rodar uma ferramenta: permita uma vez, sempre ou negue, e ele se recolhe em uma linha de resultado.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/tool-approval
- Descrição original (inglês): A compact inline request to run a tool, with its arguments and allow once, always allow or deny, that collapses into a one-line result once decided.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tool-approval.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tool-approval.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tool-approval.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tool-approval.json`. Caminho do registro, relativo ao endereço do site: `r/tool-approval.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/tool-approval/tool-approval.tsx`
  - `components/ryan-ui/tool-approval/tool-approval.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/tool-approval.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Pedir permissão dentro da conversa antes de um agente rodar uma ferramenta, mostrando o nome dela e os argumentos exatos da chamada.
- Quando a pessoa precisa de três saídas: permitir uma vez, permitir sempre ou negar.
- Transcrições longas: depois da decisão, o pedido encolhe para uma linha que registra a resposta e pode ser reaberta com “Change”.

## Quando não usar

- Use [`approval-card`](approval-card.md) para uma decisão de negócio com resumo, detalhes em pares de rótulo e valor e um “Undo”.
- Use [`tool-result`](tool-result.md) para registrar uma chamada que já rodou, com entrada, saída e duração.
- Use [`dialog`](dialog.md) quando a decisão deve bloquear o resto da tela até ser tomada.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { FilePen, Terminal } from "lucide-react";
import ToolApproval from "@/components/ryan-ui/tool-approval/tool-approval";
import type { ToolDecision } from "@/components/ryan-ui/tool-approval/tool-approval";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./tool-approval.module.css";

export const stage: DemoStage = { height: 520 };

const outcome: Record<ToolDecision, string> = {
  pending: "The agent is paused until you answer.",
  once: "The command ran. The agent will ask again next time.",
  always: "The command ran. The agent can run it again without asking.",
  denied: "The command did not run. The agent will look for another way.",
};

export default function ToolApprovalDemo() {
  const [command, setCommand] = useState<ToolDecision>("pending");
  return (
    <Stack width={460} gap={3}>
      <p className={styles.line}>Port 3000 is taken, so the dev server cannot start. I will find the process that holds it.</p>
      <ToolApproval tool="write_file" icon={<FilePen width={15} height={15} strokeWidth={1.9} />} args={{ path: "notes/port-conflict.md", bytes: 412 }} defaultDecision="always" />
      <ToolApproval
        tool="run_command"
        icon={<Terminal width={15} height={15} strokeWidth={1.9} />}
        description="It lists what is listening on the port."
        args={{ command: "lsof -nP -iTCP:3000 -sTCP:LISTEN", cwd: "~/projects/storefront", timeout: "10 s" }}
        decision={command}
        onDecisionChange={setCommand}
      />
      <Caption>{outcome[command]}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ToolApproval`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `tool` (obrigatória) | `string` | — | Name of the tool, as the agent calls it (for example "run_command"). |
| `args` | `Record<string, unknown> \| string` | — | Arguments of the call: an object shown as key and value lines, or a ready-made string. |
| `description` | `string` | — | Why the agent wants to run it, in a short sentence. |
| `icon` | `ReactNode` | — | Icon of the tool. |
| `decision` | `"pending" \| "once" \| "always" \| "denied"` | — | Controlled decision. |
| `defaultDecision` | `"pending" \| "once" \| "always" \| "denied"` | `"pending"` | Decision the request starts with when uncontrolled. |
| `onDecisionChange` | `(decision: ToolDecision) => void` | — | Called when the person decides, or reopens the request. |
| `allowChange` | `boolean` | `true` | Shows a "Change" button on the result line that reopens the request. |
| `labels` | `Partial<Record<"once" \| "always" \| "deny" \| "allowedOnce" \| "allowedAlways" \| "denied" \| "change", string>>` | — | Button and result texts, to translate or reword them. |
| `className` | `string` | — | Extra class for the root element. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ToolDecision` | `"pending" \| "once" \| "always" \| "denied"` |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Percorre “Deny”, “Always allow” e “Allow once”, nessa ordem. |
| `Enter` ou `Espaço` | Num botão de decisão, decide e leva o foco ao “Change” da linha de resultado, ou ao próprio pedido com `allowChange={false}`. |
| `Enter` ou `Espaço` | Em “Change”, reabre o pedido e leva o foco a “Allow once”. |

## Acessibilidade

- A raiz é um `role="group"` com o nome “Permission request for” mais o `tool`, e os argumentos ficam num grupo “Arguments”; um valor cortado mostra o texto inteiro no `title`.
- Quando a decisão sai de um botão do pedido, o foco vai para o botão que o substitui e não cai no `body`; o resultado fica numa região `role="status"`.
- “Wants to run”, “Permission request for” e “Arguments” estão fixos em inglês; os textos dos botões e do resultado se traduzem por `labels`.

## Movimento

- Ao decidir, o pedido sai subindo com um desfoque leve, a linha de resultado entra no lugar e a moldura acompanha a nova altura com uma mola.
- O ícone do resultado se desenha: um visto para permitir e um xis em dois traços para negar.
- Com “reduzir movimento” ligado, as trocas são só de opacidade, a altura muda na hora e os ícones já aparecem desenhados.

## Comportamento responsivo

- É um contêiner de largura: abaixo de 21rem os dois botões de permitir dividem uma linha e “Deny” desce para baixo deles, em largura total; na linha de resultado, o argumento some.

## Notas para IA

- Pause o agente até `onDecisionChange` trazer `once`, `always` ou `denied`; a regra de “Always allow” é sua, porque o componente só registra a escolha.
- `args` aceita um objeto (uma linha `chave: valor` por campo, valores que não são texto em JSON) ou uma string com quebras de linha; a linha de resultado mostra só o primeiro valor.
- Traduza com `labels` (`once`, `always`, `deny`, `allowedOnce`, `allowedAlways`, `denied`, `change`); para o histórico, renderize pedidos já decididos com `defaultDecision`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/tool-approval · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
