# Sparkline

> Uma tendência compacta ao lado de um valor, com leitura ponto a ponto.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/sparkline
- Descrição original (inglês): Show a compact trend beside a value.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sparkline.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sparkline.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sparkline.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sparkline.json`. Caminho do registro, relativo ao endereço do site: `r/sparkline.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/sparkline/sparkline.tsx`
  - `components/ryan-ui/sparkline/sparkline.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/sparkline.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Uma tendência compacta com rótulo, valor atual e variação num bloco só, em painéis com vários indicadores lado a lado.
- Quando basta a forma da série, mas a pessoa ainda pode querer ler um ponto: o ponteiro ou as setas mostram o valor e o rótulo daquele ponto.
- Indicadores que se atualizam: dados novos fazem a linha se transformar a partir do desenho atual, mesmo com outro número de pontos.

## Quando não usar

- Use [`line-chart`](line-chart.md) quando o leitor precisa de eixos, de várias séries ou de legenda.
- Use [`metric-card`](metric-card.md) quando bastam o número, uma frase de contexto e a variação, sem a série.
- Dentro de uma célula de tabela ou no meio de um texto ele não serve: o `label` sempre aparece acima da linha e não há prop para escondê-lo.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { Sparkline } from "@/components/ryan-ui/sparkline/sparkline";
import { Caption, Row, Stack, Surface } from "./_kit";

const days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 8, 8 + i));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
});

const rows = [
  { label: "Revenue", data: [18, 21, 19, 24, 27, 26, 31, 29, 34, 38, 36, 41, 44, 47], value: "$47.2K", change: "+18.6%", tone: "success" as const, fmt: (v: number) => `$${v}.0K` },
  { label: "Churn", data: [2.1, 2.3, 2.2, 2.6, 2.5, 2.9, 3.1, 3.0, 3.4, 3.3, 3.6, 3.9, 3.8, 4.1], value: "4.1%", change: "+2.0 pts", tone: "danger" as const, fmt: (v: number) => `${v}%` },
  { label: "Latency p95", data: [310, 305, 320, 298, 290, 301, 288, 292, 280, 276, 284, 270, 266, 262], value: "262 ms", change: "-15.5%", tone: "accent" as const, fmt: (v: number) => `${v} ms` },
  { label: "Open tickets", data: [42, 40, 45, 51, 49, 55, 58, 54, 60, 57, 52, 49, 53, 56], value: "56", change: "+33%", tone: "warning" as const, fmt: (v: number) => `${v}` },
];

export default function SparklineDemo() {
  return (
    <Stack gap={4} align="center">
      <Surface width={520}>
        <Row gap={8} justify="center" align="start" style={{ rowGap: "var(--space-8)" }}>
          {rows.map((r) => (
            <Sparkline key={r.label} data={r.data} label={r.label} value={r.value} change={r.change} tone={r.tone} labels={days} formatValue={(v) => r.fmt(v)} width={170} height={56} />
          ))}
        </Row>
      </Surface>
      <Caption>Move the pointer or use the arrow keys along a line to scrub its points.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Sparkline`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `number[]` | — | — |
| `label` (obrigatória) | `string` | — | — |
| `value` | `string` | — | — |
| `change` | `string` | — | — |
| `tone` | `"accent" \| "success" \| "warning" \| "danger"` | `"accent"` | — |
| `width` | `number` | `160` | — |
| `height` | `number` | `52` | — |
| `labels` | `string[]` | — | One label per point, such as a date. It replaces the change while that point is scrubbed. |
| `formatValue` | `(value: number, index: number) => string` | — | Formats a scrubbed point for the headline. Defaults to a grouped number. |
| `area` | `boolean` | `true` | A quiet neutral fill under the line. |
| `interactive` | `boolean` | `true` | Pointer and keyboard scrubbing through the points. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `↓` | Com o foco no gráfico, vai ao ponto anterior e mostra seu valor no cabeçalho. |
| `→` ou `↑` | Vai ao ponto seguinte. |
| `Page Up` ou `Page Down` | Avança ou recua cerca de um sexto da série. |
| `Home` ou `End` | Vai ao primeiro ou ao último ponto. |
| `Esc` | Encerra a leitura e volta ao valor mais recente. |

## Acessibilidade

- A `<figure>` tem um `aria-label` montado com `label`, `value` e `change`, e o SVG é decorativo.
- Com `interactive` (padrão), a área do gráfico é um `role="slider"` focável cujo `aria-valuetext` lê o rótulo do ponto e o valor formatado; com `interactive={false}` não há parada de `Tab`.
- `tone` só muda a cor: escreva sinal e unidade em `change` e passe `labels`, para cada ponto ser lido com sua data, e não como `Point 3 of 14`.

## Movimento

- Quando metade do componente entra na tela, a linha se desenha da esquerda para a direita, o preenchimento acompanha a ponta e o ponto final pousa no último valor.
- Na leitura, o cursor vai com mola até o ponto e corre sobre a linha, o trecho depois dele esmaece e os textos do cabeçalho rolam dígito a dígito.
- Com “reduzir movimento” ligado, a linha aparece pronta, a troca de dados e o cursor saltam e os textos apenas alternam.

## Comportamento responsivo

- `width` e `height` definem só a proporção e o primeiro desenho: o gráfico ocupa a largura do contêiner, e numa linha flex sem largura definida fica com 300 px, o padrão do navegador para um SVG sem tamanho.
- No toque, arrastar na horizontal percorre os pontos e soltar encerra a leitura; o gesto vertical continua rolando a página.

## Desempenho

- Cada instância cria até três `ResizeObserver` (o gráfico e os dois textos que rolam) e reescreve os atributos do SVG a cada quadro enquanto desenha, se transforma ou segue o cursor.

## Notas para IA

- Passe `data` (números) e `label`; `value` e `change` são textos que você já entrega formatados, e `formatValue` formata o ponto mostrado durante a leitura.
- Dê a largura pelo pai (coluna de grid ou um wrapper com largura): a prop `width` não fixa o tamanho na tela, só a proporção junto com `height`.
- Quando o gráfico é só ilustração, `interactive={false}` tira a parada de `Tab` e a leitura por ponteiro, e `area={false}` remove o preenchimento sob a linha.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/sparkline · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
