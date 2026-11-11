# Chip group

> Filtre por poucas facetas com chips que se transformam ao serem escolhidos.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/chip-group
- Descrição original (inglês): Filter by a few facets with chips that morph as you pick them.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/chip-group.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/chip-group.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/chip-group.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/chip-group.json`. Caminho do registro, relativo ao endereço do site: `r/chip-group.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/chip-group/chip-group.tsx`
  - `components/ryan-ui/chip-group/chip-group.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/chip-group.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Filtrar uma lista por poucas facetas que as pessoas ligam e desligam com frequência: tópicos, status, etiquetas.
- Conjuntos mais longos em que só os primeiros precisam aparecer: `maxVisible` recolhe o resto atrás de um chip “+N more” e mantém à vista os selecionados.
- Escolha única que pode ficar vazia: com `multiple={false}`, clicar no chip marcado limpa a seleção.

## Quando não usar

- Use [`segmented-control`](segmented-control.md) quando exatamente uma opção precisa estar sempre selecionada.
- Use [`multi-select`](multi-select.md) quando as opções devem ficar recolhidas dentro de um campo de formulário, com rótulo e descrição.
- Use [`tag-input`](tag-input.md) quando os valores são digitados pela pessoa, não escolhidos de um conjunto fixo.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import ChipGroup from "@/components/ryan-ui/chip-group/chip-group";
import { Caption, Stack } from "./_kit";

const topics = ["Design systems", "Accessibility", "Motion", "Typography", "Performance", "Testing", "Tooling", "Research"].map((label) => ({ value: label.toLowerCase().replace(/ /g, "-"), label }));
const sizes = [{ value: "s", label: "Small" }, { value: "m", label: "Medium" }, { value: "l", label: "Large" }];

export default function ChipGroupDemo() {
  const [value, setValue] = useState<string[]>(["motion"]);
  const [size, setSize] = useState<string[]>(["m"]);
  return (
    <Stack gap={6} width={420}>
      <Stack gap={2}>
        <ChipGroup label="Topics" options={topics} value={value} onValueChange={setValue} maxVisible={5} />
        <Caption>{value.length ? `${value.length} selected` : "Nothing selected"}. Extra chips fold behind “more”.</Caption>
      </Stack>
      <Stack gap={2}>
        <Caption>Single choice</Caption>
        <ChipGroup label="Size" options={sizes} value={size} onValueChange={setSize} multiple={false} />
      </Stack>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ChipGroup`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `options` (obrigatória) | `ChipOption[]` | — | — |
| `value` (obrigatória) | `string[]` | — | — |
| `onValueChange` (obrigatória) | `(value: string[]) => void` | — | — |
| `label` (obrigatória) | `string` | — | Accessible name of the group, such as “Topics”. |
| `multiple` | `boolean` | `true` | Allow several chips at once. In single mode the selected chip can still be cleared. |
| `maxVisible` | `number` | `Infinity` | Chips shown before the rest fold behind a “+N more” chip. Chips selected when it folds stay in view. |
| `className` | `string` | — | — |

### Tipos exportados

#### `ChipOption`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `↓` | Leva o foco ao próximo chip; do último volta ao primeiro. |
| `←` ou `↑` | Leva o foco ao chip anterior; do primeiro vai ao último. |
| `Home` ou `End` | Leva o foco ao primeiro ou ao último chip. |
| `Enter` ou `Espaço` | Marca ou desmarca o chip em foco; no chip de excedente, mostra ou recolhe os demais. |
| `Tab` | Entra e sai do grupo por um único chip: o último focado, o primeiro selecionado ou o primeiro da lista. |

## Acessibilidade

- O grupo é um `role="group"` nomeado por `label` (obrigatório) e cada chip é um `<button>` com `aria-pressed`; as setas só movem o foco, não mudam a seleção.
- O chip de excedente expõe `aria-expanded`, mas seus textos `+N more` e `Show less` são fixos em inglês.
- O estado marcado não depende só da cor: além do tom, um sinal de visto entra antes do rótulo.

## Movimento

- Ao marcar, o visto cresce e se desenha no espaço que o rótulo abre ao deslizar, e a borda do chip acompanha com uma mola.
- Os chips vizinhos deslizam para o novo lugar, mesmo trocando de linha, e a altura do grupo segue com uma mola quando o número de linhas muda.
- Com “reduzir movimento” ligado, larguras e posições trocam na hora e os chips revelados só esmaecem.

## Comportamento responsivo

- Os chips quebram linha (`flex-wrap`) e um rótulo mais largo que o contêiner é cortado com reticências.

## Desempenho

- Cada chip mantém um `ResizeObserver` e uma animação de layout, e o grupo outro observador para a altura: serve a poucas facetas, e `maxVisible` evita montar dezenas de chips de uma vez.

## Notas para IA

- É sempre controlado e `value` é sempre um array, mesmo com `multiple={false}` (um item ou vazio); `label` é obrigatório.
- `options` é `{ value, label }[]` com `value` único; no modo múltiplo o array devolvido segue a ordem de `options`, não a ordem dos cliques.
- Com `maxVisible`, os chips selecionados continuam à vista ao recolher, então o “+N” conta só os que ficaram escondidos.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/chip-group · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
