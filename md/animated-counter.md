# Animated counter

> Totais que mudam com movimento claro, dígito por dígito.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/animated-counter
- Descrição original (inglês): Give changing totals a clear sense of movement.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/animated-counter.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/animated-counter.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/animated-counter.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/animated-counter.json`. Caminho do registro, relativo ao endereço do site: `r/animated-counter.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/animated-counter/animated-counter.tsx`
  - `components/ryan-ui/animated-counter/animated-counter.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/animated-counter.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Totais de painel que mudam com o período ou o filtro: cada dígito gira como um odômetro na direção em que o número andou.
- Números de destaque que contam a partir do zero quando entram na tela, com `animateOnView`.
- Valores com moeda, percentual ou casas decimais, via `prefix`, `suffix` e `decimals`.

## Quando não usar

- Use [`metric-card`](metric-card.md) quando o número precisa de rótulo, contexto e variação num cartão pronto.
- Use [`slot-text`](slot-text.md) quando o valor mistura letras e números ou a troca deve parecer uma roleta de caça-níquel.
- Use [`countdown`](countdown.md) para contagem regressiva até uma data.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { AnimatedCounter } from "@/components/ryan-ui/animated-counter/animated-counter";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack } from "./_kit";

const steps = [
  { users: 12480, revenue: 48210.5, uptime: 99.94 },
  { users: 13912, revenue: 52874.25, uptime: 99.98 },
  { users: 9275, revenue: 39130.75, uptime: 99.71 },
  { users: 18340, revenue: 71906.0, uptime: 100 },
];

const big = { fontSize: "var(--text-2xl, 2rem)", fontWeight: 600 } as const;

export default function AnimatedCounterDemo() {
  const [i, setI] = useState(0);
  const s = steps[i] ?? steps[0]!;
  return (
    <Stack gap={8} align="center">
      <Row gap={10} justify="center" align="start">
        <div style={big}><AnimatedCounter label="Active users" value={s.users} /></div>
        <div style={big}><AnimatedCounter label="Monthly revenue" value={s.revenue} prefix="$" decimals={2} /></div>
        <div style={big}><AnimatedCounter label="Uptime" value={s.uptime} suffix="%" decimals={2} /></div>
      </Row>
      <Button variant="secondary" onClick={() => setI((i + 1) % steps.length)}>Load next period</Button>
      <Caption>Each digit rolls to its new place. Period {i + 1} of {steps.length}.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `AnimatedCounter`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` (obrigatória) | `number` | — | — |
| `label` | `string` | — | — |
| `prefix` | `string` | `""` | — |
| `suffix` | `string` | `""` | — |
| `decimals` | `number` | `0` | — |
| `animateOnView` | `boolean` | `false` | Roll every digit up from zero the first time the counter scrolls into view. |
| `locale` | `string` | `"en-US"` | Formatting locale. Fixed by default so server and client render the same digits. |

## Acessibilidade

- Os dígitos animados ficam em `aria-hidden`; o leitor de tela recebe um texto oculto com o número já formatado, incluindo `prefix` e `suffix`.
- Não há região viva: se a mudança de valor precisa ser anunciada, envolva o contador num elemento com `aria-live`.
- Os dígitos visíveis têm `user-select: none`, então o número não pode ser selecionado para copiar.

## Movimento

- Cada dígito é uma roda de 0 a 9 que gira com mola sem ultrapassagem no sentido da mudança (para cima quando o valor cresce), passando de 9 para 0 como um odômetro.
- Quando o número ganha ou perde casas, as colunas abrem ou fecham em largura; com `animateOnView`, os dígitos sobem do zero em cascata quando 60% do contador está visível.
- Com “reduzir movimento”, os dígitos trocam na hora e o rótulo só esmaece.

## Desempenho

- Cada dígito monta dez glifos animados (um número de sete dígitos são 70 elementos), então use em poucos destaques por tela, não em cada linha de uma tabela.

## Notas para IA

- `value` precisa ser `number`; a formatação usa `locale` (padrão `en-US`, fixo para servidor e cliente renderizarem igual), então passe `locale="pt-BR"` para ponto de milhar e vírgula decimal.
- Não aceita `className` nem `style`, e o tamanho vem de `--text-3xl` no próprio componente: um `font-size` no elemento pai não muda nada; redefina essa variável num elemento em volta.
- Basta trocar `value` para animar; não mude a `key` do componente, senão ele remonta já no valor novo, sem girar.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/animated-counter · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
