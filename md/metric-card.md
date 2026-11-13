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
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Stack } from "./_kit";

const ranges = {
  "7D": { label: "Weekly active users", value: 2486, change: "+18.4%", context: "Compared with the last 7 days" },
  "30D": { label: "Monthly active users", value: 9312, change: "+6.2%", context: "Compared with the last 30 days" },
  "90D": { label: "Quarterly active users", value: 21870, change: "\u22122.1%", context: "Compared with the last 90 days" },
};

export default function MetricCardDemo() {
  const [range, setRange] = useState<"7D" | "30D" | "90D">("7D");
  const metric = ranges[range];
  return (
    <Stack gap={5} align="center">
      <div style={{ width: 300 }}>
        <MetricCard label={metric.label} value={metric.value} change={metric.change} context={metric.context} />
      </div>
      <SegmentedControl
        label="Metric range"
        value={range}
        onValueChange={(next) => setRange(next === "30D" || next === "90D" ? next : "7D")}
        options={[
          { value: "7D", label: "7D" },
          { value: "30D", label: "30D" },
          { value: "90D", label: "90D" },
        ]}
      />
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
