# Combobox

> Pesquise e escolha em uma lista sem sair do campo.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/combobox
- Descrição original (inglês): Search and select from a list without leaving the field.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/combobox.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/combobox.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/combobox.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/combobox.json`. Caminho do registro, relativo ao endereço do site: `r/combobox.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/combobox/combobox.tsx`
  - `components/ryan-ui/combobox/combobox.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/combobox.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Escolher um valor numa lista longa demais para percorrer sem busca: país, fuso horário, responsável.
- Quando as pessoas procuram por termos que não estão no rótulo: as `keywords` de cada opção entram no filtro.
- Campos de formulário que precisam de rótulo visível e texto de ajuda: `label` e `description` já vêm ligados ao campo.

## Quando não usar

- Use [`select`](select.md) para listas curtas, em que digitar não ajuda.
- Use [`multi-select`](multi-select.md) quando a pessoa pode escolher vários valores.
- Use [`command-palette`](command-palette.md) quando os resultados são ações ou destinos, não o valor de um campo.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Combobox } from "@/components/ryan-ui/combobox/combobox";
import { Caption, Stack } from "./_kit";

const countries = ["Argentina", "Australia", "Brazil", "Canada", "Chile", "Denmark", "France", "Germany", "India", "Ireland", "Japan", "Mexico", "Netherlands", "Portugal", "Spain", "Sweden", "United Kingdom", "United States"].map((c) => ({ value: c.toLowerCase().replace(/ /g, "-"), label: c }));

export default function ComboboxDemo() {
  const [value, setValue] = useState("");
  const label = countries.find((c) => c.value === value)?.label;
  return (
    <Stack gap={3} width={360}>
      <Combobox label="Country" description="Where should we ship your order?" options={countries} value={value} onValueChange={setValue} placeholder="Search countries…" />
      <Caption>{label ? `Shipping to ${label}.` : "Type to filter, then pick with the keyboard or mouse."}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Combobox`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `options` (obrigatória) | `ComboboxOption[]` | — | — |
| `value` | `string` | — | — |
| `defaultValue` | `string` | `""` | — |
| `onValueChange` | `(value: string) => void` | — | — |
| `description` | `string` | — | — |
| `placeholder` | `string` | `"Search or select…"` | — |
| `emptyMessage` | `string` | `"No matches found"` | — |
| `className` | `string` | — | — |
| `...props` | `InputHTMLAttributes<HTMLInputElement>` | — | Também aceita as props deste tipo, menos `value`, `defaultValue`, `onChange` e `placeholder`. |

### Tipos exportados

#### `ComboboxOption`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `disabled` | `boolean` | — |
| `keywords` | `string[]` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↓` ou `↑` | Abrem a lista se estiver fechada; aberta, movem o destaque pelas opções habilitadas, dando a volta nas pontas. |
| `Enter` | Escolhe a opção em destaque, fecha a lista e mantém o foco no campo. |
| `Esc` | Fecha a lista e descarta o texto digitado, mantendo a seleção anterior. |

## Acessibilidade

- O campo é um `role="combobox"` com `aria-expanded`, `aria-controls`, `aria-autocomplete="list"` e `aria-activedescendant`; o foco permanece no campo enquanto as setas percorrem as opções.
- `label` é obrigatório e vira um `<label>` visível, `description` entra por `aria-describedby` e a mensagem de lista vazia é um `role="status"`; o botão de limpar tem nome fixo em inglês (`Clear selection`).
- A lista abre assim que o campo recebe foco e não fecha ao sair com `Tab`: só com `Esc`, uma escolha ou um clique fora.

## Movimento

- A lista entra com um esmaecer e um leve crescimento a partir do topo, e sua altura acompanha o filtro com uma mola sem ultrapassagem.
- O rótulo escolhido assenta no campo subindo de um leve desfoque, o botão de limpar cresce ao aparecer e a seta gira 180° com a lista aberta.
- Com “reduzir movimento” ligado, sobram só esmaecimentos curtos e a altura muda na hora.

## Comportamento responsivo

- A lista tem a largura do campo, abre sempre para baixo e rola por dentro acima de `min(300px, 40vh)`; rótulos longos são cortados com reticências.
- Ela é posicionada dentro do próprio componente, sem portal: um ancestral com `overflow: hidden` a corta.

## Desempenho

- Todas as opções que passam no filtro são renderizadas, sem virtualização, e a altura da lista é medida por um `ResizeObserver` a cada mudança do filtro.

## Notas para IA

- Controlado com `value` + `onValueChange` ou não controlado com `defaultValue`; limpar a seleção chama `onValueChange("")`.
- O filtro é local, por trecho de `label` e `keywords`; ignora maiúsculas mas não acentos (`sao` não acha “São Paulo”) e o texto digitado não é exposto, então não serve para busca no servidor.
- Dê a cada opção um `value` sem espaços, porque ele entra no `id` usado por `aria-activedescendant`; as demais props e o `ref` vão para o `<input>`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/combobox · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
