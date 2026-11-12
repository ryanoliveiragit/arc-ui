# Multi-select

> Selecione vários valores mantendo o campo legível.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/multi-select
- Descrição original (inglês): Select several values while keeping the field readable.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/multi-select.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/multi-select.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/multi-select.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/multi-select.json`. Caminho do registro, relativo ao endereço do site: `r/multi-select.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/multi-select/multi-select.tsx`
  - `components/ryan-ui/multi-select/multi-select.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/multi-select.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Escolher vários valores de uma lista curta dentro de um formulário, como equipes, categorias ou permissões.
- Quando o campo precisa continuar baixo: só os primeiros `maxVisible` escolhidos aparecem como chips e o resto vira um contador `+N`.
- Quando limpar tudo de uma vez é comum: o botão de limpar aparece assim que há algo escolhido.

## Quando não usar

- Use [`chip-group`](chip-group.md) quando há poucas opções e todas devem ficar à vista, sem abrir um menu.
- Use [`tag-input`](tag-input.md) quando os valores são digitados pela pessoa, não escolhidos de uma lista.
- Para listas longas: o menu mostra todas as opções de uma vez, sem busca e sem rolagem própria.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { MultiSelect } from "@/components/ryan-ui/multi-select/multi-select";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 560 };

const options = ["Design", "Engineering", "Marketing", "Sales", "Support", "Finance", "Legal", "People"].map((l) => ({ value: l.toLowerCase(), label: l }));

export default function MultiSelectDemo() {
  // The preview opens the menu on load (focus stays on the page); the space below the field is reserved for it.
  const [value, setValue] = useState<string[]>(["design", "engineering", "support"]);
  return (
    <Stack gap={3} width={360}>
      <div style={{ paddingBottom: 324 }}>
        <MultiSelect label="Teams" options={options} value={value} onValueChange={setValue} placeholder="Select teams" defaultOpen />
      </div>
      <Caption>{value.length} of {options.length} teams can see this report. Arrow keys move, Enter or Space toggles.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `MultiSelect`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `options` (obrigatória) | `MultiSelectOption[]` | — | — |
| `value` | `string[]` | — | — |
| `defaultValue` | `string[]` | `[]` | — |
| `onValueChange` | `(value: string[]) => void` | — | — |
| `placeholder` | `string` | `"Select options"` | — |
| `description` | `string` | — | — |
| `maxVisible` | `number` | `2` | — |
| `disabled` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | Start with the menu open, without moving focus (for previews and onboarding). |
| `className` | `string` | — | — |

### Tipos exportados

#### `MultiSelectOption`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `disabled` | `boolean` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↓` ou `↑` | No gatilho, abrem a lista e movem o destaque pelas opções habilitadas, dando a volta nas pontas. |
| `Enter` | Com uma opção em destaque, marca ou desmarca sem fechar a lista; sem destaque, abre ou fecha a lista. |
| `Espaço` | No gatilho, abre ou fecha a lista. |
| `Esc` | Com o foco no gatilho, fecha a lista. |
| `Tab` | Passa pelo botão de limpar e por cada opção, que `Enter` ou `Espaço` marcam; sair com `Tab` não fecha a lista. |

## Acessibilidade

- O gatilho é um `<button>` com `aria-haspopup="listbox"` e `aria-expanded`, nomeado pelo `label` visível e pela lista do que foi escolhido, escrita por extenso só para o leitor de tela.
- A lista é um `role="listbox"` com `aria-multiselectable` e opções com `aria-selected`, mas o destaque movido pelas setas não é anunciado, porque o gatilho não usa `aria-activedescendant`.
- `description` aparece sob o campo sem ligação por `aria-describedby`, e o botão de limpar tem nome fixo em inglês (`Clear selections`).

## Movimento

- Cada chip escolhido abre o próprio espaço com uma mola e cresce de um leve desfoque, levando os vizinhos junto; ao sair, o espaço se fecha.
- O contador `+N` rola para cima quando aumenta e para baixo quando diminui, e o visto de cada opção se desenha ao marcar e se recolhe ao desmarcar.
- Com “reduzir movimento” ligado, chips, contador, vistos e menu só esmaecem.

## Comportamento responsivo

- Ocupa a largura do contêiner; cada chip é cortado em 9rem com reticências, e o menu abre abaixo com a largura do campo, sem portal e sem altura máxima.

## Notas para IA

- Controlado com `value` + `onValueChange` ou não controlado com `defaultValue`; o array guarda a ordem em que as opções foram marcadas, e os chips seguem essa ordem.
- Escolher não fecha o menu, feito para marcar várias opções seguidas: ele fecha com um clique fora ou no gatilho, com `Espaço` ou `Esc` no gatilho, ou ao limpar tudo.
- Não há prop `name`: num formulário nativo, gere os `<input type="hidden">` a partir de `value`; `maxVisible` (padrão 2) define quantos chips aparecem antes do `+N`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/multi-select · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
