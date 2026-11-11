# Radio cards

> Cartões selecionáveis com anel deslizante, preço e descrição, com o teclado de um grupo de rádio.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/radio-cards
- Descrição original (inglês): Selectable option cards with a sliding selection ring, price and description slots, and radio keyboard behavior.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/radio-cards.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/radio-cards.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/radio-cards.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/radio-cards.json`. Caminho do registro, relativo ao endereço do site: `r/radio-cards.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/radio-cards/radio-cards.tsx`
  - `components/ryan-ui/radio-cards/radio-cards.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/radio-cards.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Escolha de plano, frete ou região em que cada opção precisa de descrição e preço à vista.
- Seleção única entre poucas opções que merecem peso visual, como num checkout ou num onboarding.
- Quando uma opção indisponível deve continuar visível com o motivo, via `disabledReason`.

## Quando não usar

- Use [`radio-group`](radio-group.md) quando cada opção cabe num rótulo curto e uma linha de apoio.
- Use [`select`](select.md) quando há muitas opções ou pouco espaço na tela.
- Use [`chip-group`](chip-group.md) quando a pessoa pode marcar mais de uma opção.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Package, Truck, Zap } from "lucide-react";
import RadioCards from "@/components/ryan-ui/radio-cards/radio-cards";
import { Caption, Stack } from "./_kit";

const options = [
  { value: "standard", label: "Standard", description: "Arrives in 5 to 7 business days", meta: "Free", icon: <Package size={16} aria-hidden="true" /> },
  { value: "express", label: "Express", description: "Arrives in 2 business days", meta: "$9.00", icon: <Truck size={16} aria-hidden="true" /> },
  { value: "overnight", label: "Overnight", description: "Order by 2 pm, delivered tomorrow", meta: "$24.00", icon: <Zap size={16} aria-hidden="true" /> },
  { value: "pickup", label: "Store pickup", description: "Not available for this address", icon: <Package size={16} aria-hidden="true" />, disabled: true, disabledReason: "Unavailable for this address" },
];

export default function RadioCardsDemo() {
  const [value, setValue] = useState<string | null>("express");
  return (
    <Stack width={560} gap={4}>
      <RadioCards aria-label="Delivery method" options={options} value={value} onValueChange={setValue} minColumnWidth={200} />
      <Caption>Selected: {value}. Use the arrow keys to move the ring.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `RadioCards`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `options` (obrigatória) | `RadioCardOption[]` | — | — |
| `value` | `string \| null` | — | — |
| `defaultValue` | `string \| null` | `null` | — |
| `onValueChange` | `(value: string) => void` | — | — |
| `layout` | `"grid" \| "list"` | `"grid"` | "grid" places cards in responsive columns; "list" stacks full width rows. |
| `minColumnWidth` | `number` | `180` | Narrowest a grid column may get before the grid drops a column, in px. |
| `name` | `string` | — | Form field name. Renders a hidden input with the selected value. |
| `required` | `boolean` | — | — |
| `disabled` | `boolean` | `false` | — |
| `...props` | `HTMLAttributes<HTMLDivElement>` | — | Também aceita as props deste tipo, menos `onChange` e `defaultValue`. |

### Tipos exportados

#### `RadioCardOption`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | — |
| `label` (obrigatória) | `ReactNode` | — |
| `description` | `ReactNode` | One or two short lines under the label. |
| `meta` | `ReactNode` | A price, estimate, or other value. Sits at the end of a list row, or under the text in a grid card. |
| `icon` | `ReactNode` | Plain decorative icon beside the label. |
| `disabled` | `boolean` | — |
| `disabledReason` | `ReactNode` | Short reason shown in place of the description when the option is disabled. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `↓` | Movem o foco para o próximo cartão e já o selecionam, pulando os desabilitados e voltando ao primeiro depois do último. |
| `←` ou `↑` | Fazem o mesmo para o cartão anterior; em layout da direita para a esquerda, ← e → se invertem. |
| `Home` ou `End` | Selecionam o primeiro ou o último cartão disponível. |
| `Espaço` ou `Enter` | Selecionam o cartão em foco. |
| `Tab` | Entra no grupo pelo cartão selecionado, ou pelo primeiro disponível, e sai dele numa tecla só. |

## Acessibilidade

- O grupo tem `role="radiogroup"` e cada cartão `role="radio"` com `aria-checked`, nomeado pelo rótulo e descrito pela descrição.
- Não há prop de rótulo: passe `aria-label` ou `aria-labelledby` ao `RadioCards`, senão o grupo fica sem nome para leitores de tela.
- Opções desabilitadas recebem `aria-disabled` e mostram `disabledReason` no lugar da descrição, então o motivo também é lido.

## Movimento

- Um anel único desliza de cartão em cartão numa mola sem ultrapassagem e o ponto do indicador cresce no cartão novo; o cartão em si nunca muda de tamanho.
- Quando o grupo muda de tamanho, o anel acompanha o novo layout na hora, sem repetir o deslize.
- Com “reduzir movimento” ligado, anel e ponto mudam de lugar na hora e as transições de cor são desligadas.

## Comportamento responsivo

- No `layout="grid"` as colunas se ajustam à largura e caem uma a uma quando ficariam menores que `minColumnWidth` (180px por padrão); em `list` cada opção ocupa a linha inteira.
- O rótulo não quebra linha e corta com reticências; o texto longo vai em `description`, que quebra normalmente.

## Notas para IA

- Cada opção aceita `label`, `description`, `meta` (preço ou prazo) e `icon`; `meta` fica no fim da linha em `list` e embaixo do texto em `grid`.
- Controlado com `value` e `onValueChange`, ou não controlado com `defaultValue`; com `name`, um campo oculto leva o valor no formulário.
- Não esqueça o `aria-label` no grupo; para opções só de texto, `radio-group` é mais simples e usa rádios nativos.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/radio-cards · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
