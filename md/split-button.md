# Split button

> Ação principal com um menu de alternativas ao lado.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/split-button
- Descrição original (inglês): A primary action with a menu of nearby alternatives.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/split-button.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/split-button.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/split-button.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/split-button.json`. Caminho do registro, relativo ao endereço do site: `r/split-button.json`.

- Pacotes npm: `@radix-ui/react-dropdown-menu`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/split-button/split-button.tsx`
  - `components/ryan-ui/split-button/split-button.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-dropdown-menu lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/split-button.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Uma ação principal com algumas alternativas próximas no menu, como Enviar, com Agendar e Salvar rascunho ao lado.
- Quando a última alternativa escolhida deve virar a ação principal: troque `label` e `icon` no `onSelect` e o botão se transforma no lugar.
- Exportações com um formato padrão e outros no menu, na variante `secondary`.

## Quando não usar

- Use [`dropdown-menu`](dropdown-menu.md) quando não existe uma ação claramente principal.
- Use [`button-group`](button-group.md) quando as ações são independentes e todas merecem ficar à vista.
- Use [`action-swap`](action-swap.md) quando a ação muda de estado sozinha a cada clique, sem a pessoa escolher num menu.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Calendar, Clock, Save, Send, Trash2 } from "lucide-react";
import SplitButton from "@/components/ryan-ui/split-button/split-button";
import { Caption, Row, Stack } from "./_kit";

export default function SplitButtonDemo() {
  const [mode, setMode] = useState<"Send" | "Schedule" | "Save draft">("Send");
  const [last, setLast] = useState("Nothing yet");
  const icons = { Send: <Send size={15} aria-hidden="true" />, Schedule: <Calendar size={15} aria-hidden="true" />, "Save draft": <Save size={15} aria-hidden="true" /> };
  return (
    <Stack gap={6} align="center">
      <Row justify="center">
        <SplitButton
          label={mode}
          icon={icons[mode]}
          onClick={() => setLast(`${mode} pressed`)}
          actions={[
            { label: "Send now", icon: <Send size={15} aria-hidden="true" />, onSelect: () => setMode("Send") },
            { label: "Schedule for later", icon: <Clock size={15} aria-hidden="true" />, onSelect: () => setMode("Schedule") },
            { label: "Save as draft", icon: <Save size={15} aria-hidden="true" />, onSelect: () => setMode("Save draft") },
            { label: "Discard", icon: <Trash2 size={15} aria-hidden="true" />, destructive: true, onSelect: () => setLast("Discarded") },
          ]}
        />
        <SplitButton
          variant="secondary"
          label="Export"
          onClick={() => setLast("Exported as CSV")}
          actions={[
            { label: "Export as PDF", onSelect: () => setLast("Exported as PDF") },
            { label: "Export as JSON", onSelect: () => setLast("Exported as JSON") },
          ]}
        />
      </Row>
      <Caption>Pick an alternative from the menu and the main action morphs. Last: {last}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SplitButton`

The main action morphs its icon and label in place while its width follows on a spring; the menu half never scales, so the menu opens from a still anchor.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `actions` (obrigatória) | `SplitButtonAction[]` | — | — |
| `onClick` | `() => void` | — | — |
| `disabled` | `boolean` | — | — |
| `icon` | `ReactNode` | — | — |
| `variant` | `"primary" \| "secondary"` | `"primary"` | — |

### Tipos exportados

#### `SplitButtonAction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `onSelect` | `() => void` | — |
| `disabled` | `boolean` | — |
| `destructive` | `boolean` | — |
| `icon` | `ReactNode` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No botão principal, executam `onClick`; na seta, abrem o menu com o foco na primeira alternativa (`↓` também abre). |
| `↓` ou `↑` | No menu, percorrem as alternativas habilitadas e dão a volta nas pontas. |
| `Home` ou `End` | No menu, vão para a primeira e a última alternativa. |
| `A–Z` | No menu, digitar o começo de um rótulo leva o foco a essa alternativa. |
| `Esc` | Fecha o menu e devolve o foco à seta; escolher uma alternativa com `Enter` ou `Espaço` também fecha. |

## Acessibilidade

- São dois botões: o principal, cujo nome é `label` (o texto animado fica em `aria-hidden` e uma cópia oculta em `aria-live="polite"` anuncia a troca), e a seta, com `aria-label` montado em inglês (“Send more actions”).
- O menu é o `DropdownMenu` do Radix em modo modal: enquanto aberto, o foco fica preso nele e a página não rola; ao fechar, o foco volta à seta.
- `disabled` desliga as duas metades juntas; alternativas `disabled` ficam esmaecidas e são puladas pelas setas.

## Movimento

- Quando `label` muda, as letras em comum ficam paradas e só as novas sobem de um leve desfoque, em sequência; o ícone troca com escala, e a largura acompanha numa mola sem ultrapassagem.
- Pressionar a ação principal encolhe a pílula inteira para 0,97; a seta responde só com cor, para o Radix medir a âncora sem escala, e gira 180° com o menu aberto.
- O menu cresce a partir da seta, com as alternativas em sequência; com “reduzir movimento”, letras e largura trocam na hora, a pílula não encolhe e o menu só esmaece.

## Notas para IA

- `label` e `onClick` são a ação principal; `actions` lista as alternativas (`label`, `onSelect`, `icon`, `disabled`, `destructive`), e o `label` de cada uma é a chave React, então não repita rótulos.
- O componente não troca a ação principal sozinho: para lembrar a última escolha, guarde-a no estado do pai e passe o novo `label` e `icon`, como faz o demo.
- O `aria-label` da seta é montado em inglês (“… more actions”): numa interface em português, ajuste essa string no arquivo instalado; `variant="secondary"` é a versão clara e menor.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/split-button · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
