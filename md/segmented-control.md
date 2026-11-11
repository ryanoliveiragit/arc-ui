# Segmented control

> Alterne entre poucas visões relacionadas com um seletor segmentado de destaque deslizante.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/segmented-control
- Descrição original (inglês): Switch between a small set of related views.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/segmented-control.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/segmented-control.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/segmented-control.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/segmented-control.json`. Caminho do registro, relativo ao endereço do site: `r/segmented-control.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/segmented-control/segmented-control.tsx`
  - `components/ryan-ui/segmented-control/segmented-control.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/segmented-control.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Alternar entre poucas visões da mesma informação, como Dia, Semana, Mês e Ano, ou Gráfico e Tabela.
- Filtros de um valor só em barras de ferramentas, onde a opção ativa precisa ficar visível o tempo todo.

## Quando não usar

- Use [`tabs`](tabs.md) quando cada opção mostra um painel de conteúdo próprio e precisa dos papéis de aba e painel.
- Use [`toggle-group`](toggle-group.md) quando a barra é de ícones ou permite várias opções ligadas ao mesmo tempo.
- Use [`select`](select.md) quando há muitas opções ou os rótulos são longos.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack } from "./_kit";

export default function SegmentedControlDemo() {
  const [range, setRange] = useState("week");
  const [view, setView] = useState("chart");
  const revenue: Record<string, string> = { day: "$1,240", week: "$8,915", month: "$37,402", year: "$441,870" };
  return (
    <Stack width={380} gap={6} align="center">
      <Stack gap={2} align="center">
        <SegmentedControl label="Time range" value={range} onValueChange={setRange} options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "year", label: "Year" }]} />
        <Caption>Revenue this {range}: {revenue[range]}</Caption>
      </Stack>
      <SegmentedControl label="View" value={view} onValueChange={setView} options={[{ value: "chart", label: "Chart" }, { value: "table", label: "Table" }]} />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SegmentedControl`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `options` (obrigatória) | `Segment[]` | — | — |
| `value` (obrigatória) | `string` | — | — |
| `onValueChange` (obrigatória) | `(value: string) => void` | — | — |
| `label` | `string` | — | — |
| `onOptionIntent` | `(value: string) => void` | — | Called when the pointer or focus reaches an option, before it is chosen. Use it to start loading what that option shows. |
| `className` | `string` | — | — |

### Tipos exportados

#### `Segment`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `accessory` | `ReactNode` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `↓` | Selecionam o próximo segmento e levam o foco a ele, voltando ao primeiro depois do último. |
| `←` ou `↑` | Selecionam o anterior, também em ciclo. |
| `Home` ou `End` | Selecionam o primeiro ou o último segmento. |
| `Tab` | Entra direto no segmento selecionado; os outros ficam fora da ordem de tabulação. |

## Acessibilidade

- É um `role="group"` de botões com `aria-pressed` e uma só parada de Tab; passe `label`, que vira o `aria-label` do grupo.
- Os segmentos são botões de alternância, não abas: não há `tabpanel` ligado a eles, então o conteúdo que muda é responsabilidade da página.

## Movimento

- Uma única pílula desliza até o segmento escolhido numa mola sem ultrapassagem; os rótulos nunca mudam de tamanho nem de peso, só a cor acompanha.
- Com “reduzir movimento” ligado, a pílula muda de lugar na hora e a rolagem até o segmento escolhido deixa de ser animada.

## Comportamento responsivo

- Quando os segmentos não cabem, a trilha rola na horizontal dentro do controle, esmaece só o lado que tem mais conteúdo e rola o segmento escolhido para a vista.
- Em telas com menos de 380px de largura, o espaçamento interno de cada segmento diminui.

## Notas para IA

- Export padrão e sempre controlado: `import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control"`, com `options`, `value` e `onValueChange`.
- `onOptionIntent` dispara quando o ponteiro ou o foco chega a um segmento, antes da escolha; use para pré-carregar o que ele vai mostrar.
- `accessory` põe um badge ou contador depois do rótulo; as setas já selecionam, então cada passo do teclado chama `onValueChange`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/segmented-control · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
