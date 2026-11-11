# Metric card

> Um resumo compacto para um número que precisa de contexto.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/metric-card
- Descrição original (inglês): A compact summary for a number that needs context.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/metric-card.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/metric-card.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/metric-card.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/metric-card.json`. Caminho do registro, relativo ao endereço do site: `r/metric-card.json`.

- Pacotes npm: `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Animated counter](animated-counter.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/metric-card/metric-card.tsx`
  - `components/ryan-ui/metric-card/metric-card.module.css`
  - `components/ryan-ui/animated-counter/animated-counter.tsx`
  - `components/ryan-ui/animated-counter/animated-counter.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/metric-card.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Resumo de indicadores no topo de um painel: um número com rótulo, contexto de comparação e variação.
- Números que mudam com um filtro ou período: os dígitos giram até o novo valor e os textos entram do lado para onde o número foi.

## Quando não usar

- Use [`animated-counter`](animated-counter.md) quando só o número animado basta, sem cartão, rótulo e contexto.
- Use [`stats-band`](stats-band.md) para números de destaque numa página de divulgação.
- Use [`gauge`](gauge.md) ou [`usage-meter`](usage-meter.md) quando o valor só faz sentido contra uma faixa ou um limite.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { MetricCard } from "@/components/ryan-ui/metric-card/metric-card";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack } from "./_kit";

const weeks = [
  { revenue: 48210, orders: 1284, sat: 94, rc: "+12.4%", oc: "+8.1%", cc: "+3 pts" },
  { revenue: 41930, orders: 1176, sat: 91, rc: "-13.0%", oc: "-8.4%", cc: "-3 pts" },
  { revenue: 55780, orders: 1391, sat: 97, rc: "+33.0%", oc: "+18.3%", cc: "+6 pts" },
];

export default function MetricCardDemo() {
  const [i, setI] = useState(0);
  const w = weeks[i] ?? weeks[0]!;
  return (
    <Stack gap={6} align="center" width={820}>
      <Row gap={4} justify="center" align="stretch">
        <div style={{ width: 240 }}><MetricCard label="Revenue (USD)" value={w.revenue} context="vs. previous week" change={w.rc} /></div>
        <div style={{ width: 240 }}><MetricCard label="Orders" value={w.orders} context="vs. previous week" change={w.oc} /></div>
        <div style={{ width: 240 }}><MetricCard label="Satisfaction" value={w.sat} suffix="%" context="vs. previous week" change={w.cc} /></div>
      </Row>
      <Button variant="secondary" onClick={() => setI((i + 1) % weeks.length)}>Show next week</Button>
      <Caption>Numbers roll and the change text slides in the direction the value moved.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `MetricCard`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `value` (obrigatória) | `number` | — | — |
| `suffix` | `string` | — | — |
| `context` (obrigatória) | `string` | — | — |
| `change` | `string` | — | — |

## Acessibilidade

- O número animado fica em `aria-hidden` e o valor final formatado vai num texto oculto, então o leitor de tela lê o número certo de uma vez.
- O cartão é um `<article>` sem título próprio (o rótulo é texto comum): dê um título à seção que agrupa os cartões se a página precisar dessa estrutura.
- A variação ganha cor pelo sinal, mas o próprio `+` ou `-` no texto já diz a direção, sem depender só da cor.

## Movimento

- Os dígitos giram a partir de zero na primeira vez que o número entra na tela; depois, cada coluna gira no sentido em que o valor mudou.
- Quando `label`, `context` ou `change` mudam, o texto novo entra de baixo se o número dele subiu ou de cima se caiu, e a pílula da variação ajusta a largura numa mola.
- Com “reduzir movimento”, os dígitos saltam para o valor e os textos trocam com um esmaecer rápido.

## Comportamento responsivo

- O cartão ocupa a largura do pai; em telas de até 380 px o respiro interno diminui e a pílula de variação pode passar para a linha de baixo.

## Notas para IA

- `value` é numérico e aparece como inteiro com separador de milhar no formato `en-US`: o cartão não repassa `decimals`, `prefix` nem `locale` ao contador, então ponha a moeda no `label` e a unidade em `suffix`.
- `label`, `value` e `context` são obrigatórios; `change` é texto livre: se começa com `+` fica verde e com `-` vermelho, sem como inverter para métricas em que cair é bom.
- Precisa do item `animated-counter` instalado (o cartão o importa de `../animated-counter/animated-counter`); para uma fileira de indicadores, ponha os cartões numa grade, pois cada um preenche a própria célula.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/metric-card · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
