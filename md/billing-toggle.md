# Billing toggle

> Alternância entre cobrança mensal e anual, com selo de economia e preços que rolam até o novo valor.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/billing-toggle
- Descrição original (inglês): A monthly and yearly switch with a savings badge and prices that roll to the new amount.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/billing-toggle.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/billing-toggle.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/billing-toggle.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/billing-toggle.json`. Caminho do registro, relativo ao endereço do site: `r/billing-toggle.json`.

- Pacotes npm: `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Animated counter](animated-counter.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/billing-toggle/billing-toggle.tsx`
  - `components/ryan-ui/billing-toggle/billing-toggle.module.css`
  - `components/ryan-ui/animated-counter/animated-counter.tsx`
  - `components/ryan-ui/animated-counter/animated-counter.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/billing-toggle.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Página de preços em que o período de cobrança (mensal ou anual) muda os valores exibidos nos planos.
- Quando a opção mais barata leva um selo de economia que muda de texto ao ser escolhida (`badge` → `activeBadge`).
- Preços que devem girar até o novo valor sem empurrar o que está ao lado: use `BillingPrice`, exportado pelo mesmo arquivo.

## Quando não usar

- Use [`segmented-control`](segmented-control.md) para alternar visões ou filtros que não são período de cobrança e não levam selo.
- Use [`switch`](switch.md) para uma configuração de ligar e desligar com efeito imediato.
- Use [`plan-comparison`](plan-comparison.md) quando precisa da comparação de planos inteira, não só do seletor de período.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { BillingPrice, BillingToggle } from "@/components/ryan-ui/billing-toggle/billing-toggle";
import { Caption, Stack, Surface } from "./_kit";

const options = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly", badge: "Save 20%", activeBadge: "You save $48" },
];

export default function BillingToggleDemo() {
  const [period, setPeriod] = useState("monthly");
  const yearly = period === "yearly";
  return (
    <Stack gap={5} align="center">
      <BillingToggle value={period} onValueChange={setPeriod} options={options} label="Billing period" />
      <Surface width={320} padding={6}>
        <Stack gap={2}>
          <Caption>Team plan</Caption>
          <div style={{ fontSize: "var(--text-3xl, 2rem)", fontWeight: 600 }}>
            <BillingPrice amount={yearly ? 19 : 24} was={yearly ? 24 : undefined} period={yearly ? "per month, billed yearly" : "per month"} />
          </div>
        </Stack>
      </Surface>
      <Caption>Switch the period and watch the price roll.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `BillingToggle`

A billing period switch. One thumb glides between the options on a critically damped spring, and the savings note on the cheaper period tints and rewrites itself in place once it is chosen.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` (obrigatória) | `string` | — | — |
| `onValueChange` (obrigatória) | `(value: string) => void` | — | — |
| `options` | `BillingToggleOption[]` | `DEFAULT_OPTIONS` | — |
| `label` | `string` | `"Billing period"` | Accessible name of the group. |
| `size` | `"md" \| "lg"` | `"md"` | — |
| `className` | `string` | — | — |

### `BillingPrice`

A price that rolls to its new amount. The old price and the period ease their width, so nothing beside them jumps.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `amount` (obrigatória) | `number` | — | — |
| `currency` | `string` | `"$"` | — |
| `period` | `string` | — | Period after the price, e.g. "per month". Swaps in place when it changes. |
| `was` | `number` | — | Previous price, shown struck through when it is higher than `amount`. |
| `decimals` | `number` | `0` | — |
| `className` | `string` | — | — |

### Tipos exportados

#### `BillingToggleOption`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `badge` | `string` | Short savings note, e.g. "Save 20%". |
| `activeBadge` | `string` | Badge text once this option is selected, e.g. "You save $48". Defaults to `badge`. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `↓` | Seleciona a próxima opção e leva o foco a ela; da última volta à primeira. |
| `←` ou `↑` | Seleciona a opção anterior; da primeira vai à última. |
| `Home` ou `End` | Seleciona a primeira ou a última opção. |
| `Tab` | Entra no grupo pela opção selecionada e sai dele; as outras opções ficam fora da ordem de tabulação. |

## Acessibilidade

- O grupo é um `role="radiogroup"` e cada opção um `<button role="radio">` com `aria-checked` e tabindex móvel.
- `label` nomeia o grupo e tem padrão em inglês (`Billing period`): passe o texto no idioma da página.
- O selo faz parte do nome da opção, então o leitor de tela anuncia rótulo e selo juntos; em `BillingPrice` o preço antigo sai num `<del>` e o valor atual tem uma cópia em texto para leitor de tela.

## Movimento

- Um único polegar desliza entre as opções com uma mola sem ultrapassagem, assumindo a posição e a largura da opção escolhida.
- O selo troca de texto no lugar, numa caixa que já tem a largura do texto mais longo; em `BillingPrice` os dígitos giram até o novo valor e o preço antigo (`was`) abre em largura.
- Com “reduzir movimento” ligado, o polegar e os dígitos saltam para o lugar e os textos só esmaecem.

## Comportamento responsivo

- Rótulos e selos não quebram linha (`white-space: nowrap`): em telas estreitas, mantenha os textos curtos.
- `BillingPrice` joga o período para a linha de baixo quando falta largura (`flex-wrap`).

## Notas para IA

- É sempre controlado: `value` e `onValueChange` são obrigatórios; sem `options` ele mostra `Monthly` e `Yearly` com o selo `Save 20%`, em inglês.
- O arquivo exporta também `BillingPrice` (`amount`, `currency`, `period`, `was`, `decimals`); `was` só aparece riscado quando é maior que `amount`.
- Depende de `animated-counter`; a cor do selo ativo vem de `--billing-accent` (padrão `--success`), que pode ser definida em qualquer ancestral.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/billing-toggle · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
