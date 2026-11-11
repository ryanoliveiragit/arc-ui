# Ridgeline

> Distribuições sobrepostas, uma crista por grupo: passe o mouse para destacar e ver os quartis.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/ridgeline
- Descrição original (inglês): Overlapping distributions, one ridge per group: hover to lift a ridge and read its quartiles, switch datasets and every curve morphs.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ridgeline.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ridgeline.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ridgeline.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ridgeline.json`. Caminho do registro, relativo ao endereço do site: `r/ridgeline.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/ridgeline/ridgeline.tsx`
  - `components/ryan-ui/ridgeline/ridgeline.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/ridgeline.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Comparar a forma de várias distribuições de uma vez: temperaturas diárias por mês, tempos de resposta por região.
- Quando a pergunta é sobre deslocamento e espalhamento: onde está a mediana de cada grupo e quão larga é a metade central.
- Mostrar como as distribuições mudam entre dois conjuntos de dados: com os mesmos `id`, cada curva se transforma na nova.

## Quando não usar

- Use [`bar-chart`](bar-chart.md) quando cada grupo tem um único valor, e não uma coleção de observações.
- Use [`line-chart`](line-chart.md) ou [`streamgraph`](streamgraph.md) quando o eixo horizontal é o tempo e você quer ver evolução, não distribuição.
- Com poucas observações por grupo, a curva suavizada sugere uma forma que os dados não sustentam; prefira mostrar os valores.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useMemo, useState } from "react";
import Ridgeline, { type RidgelineSeries } from "@/components/ryan-ui/ridgeline/ridgeline";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// mean high in Zurich per month, and a shift for a warmer scenario
const base = [3, 5, 10, 14, 19, 23, 25, 24, 20, 14, 7, 4];

function make(shift: number): RidgelineSeries[] {
  let s = 17;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());
  return months.map((m, i) => ({
    id: m,
    label: m,
    values: Array.from({ length: 31 }, () => Math.round(((base[i] ?? 0) + shift + gauss() * (2.6 + (i % 3 === 0 ? 0.8 : 0))) * 10) / 10),
  }));
}

export default function RidgelineDemo() {
  const sets = useMemo(() => ({ y1995: make(0), y2025: make(1.8) }), []);
  const [key, setKey] = useState<"y1995" | "y2025">("y1995");
  return (
    <Stack gap={4} width={600}>
      <SegmentedControl label="Decade" value={key} onValueChange={(v) => setKey(v as "y1995" | "y2025")} options={[{ value: "y1995", label: "1990s" }, { value: "y2025", label: "2020s" }]} />
      <Surface>
        <Ridgeline series={sets[key]} label="Daily highs in Zurich" unit="°C" domain={[-6, 36]} rowHeight={26} />
      </Surface>
      <Caption>Hover a ridge to lift it and read its quartiles. Switch decades and every curve morphs.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Ridgeline`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `series` (obrigatória) | `RidgelineSeries[]` | — | One ridge per series, drawn top to bottom. |
| `label` (obrigatória) | `string` | — | What is measured, such as "Daily highs in Zurich". Names the chart for assistive technology. |
| `unit` | `string` | `""` | Unit after each value, such as "°C". |
| `formatValue` | `(value: number) => string` | — | — |
| `domain` | `[number, number]` | — | Value range of the axis. Defaults to the data with a little room on each side. |
| `overlap` | `number` | `2.4` | How far a ridge may rise into the rows above, in row heights. |
| `rowHeight` | `number` | `30` | Height of one row in pixels. |
| `bandwidth` | `number` | — | Smoothing in value units. Defaults to Silverman's rule per series. |
| `tint` | `boolean` | `true` | Shades each ridge by its median, from a light tint to the full first series color, and shows the scale under the axis. |
| `active` | `string \| null` | — | Controlled id of the lifted ridge. |
| `defaultActive` | `string \| null` | `null` | — |
| `onActiveChange` | `(id: string \| null) => void` | — | — |
| `emptyLabel` | `string` | `"No data yet"` | — |
| `ref` | `Ref<HTMLElement>` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

#### `RidgelineSeries`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable identity. A ridge that survives a data change morphs into its new shape. |
| `label` (obrigatória) | `string` | — |
| `values` (obrigatória) | `number[]` | Raw observations. The ridge is a smoothed density of these values. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Com o foco no gráfico, escolhe a crista anterior ou a seguinte e a levanta. |
| `←` ou `→` | Move o cursor de leitura ao longo dos valores, um passo do eixo por vez. |
| `Home` ou `End` | Vai à primeira ou à última crista. |
| `Esc` | Solta a crista levantada e esconde a dica. |

## Acessibilidade

- A `<figure>` leva o `label`; a área do gráfico é um grupo focável com `aria-roledescription="ridgeline chart"` e as instruções de teclado no nome, em inglês.
- Uma região `aria-live="polite"` lê a série ativa (mediana, metade central, faixa e contagem) e, com o cursor, a fração de valores até aquele ponto.
- Uma tabela oculta lista mediana, quartis, mínimo, máximo e contagem de cada série, de modo que leitor de tela não depende do desenho.

## Movimento

- Ao entrar na tela, as cristas crescem da linha de base em onda, de cima para baixo; ao trocar os dados, cada curva e o eixo se transformam com mola até a nova forma.
- A crista sob o ponteiro sobe 6 px numa cópia desenhada por cima, com a faixa entre os quartis realçada, enquanto as outras esmaecem; a dica segue o ponteiro com mola.
- Com “reduzir movimento” ligado, as formas são pintadas direto no estado final e a dica acompanha o ponteiro sem mola.

## Comportamento responsivo

- A largura segue o contêiner e a altura vem do conteúdo: `rowHeight` por série mais o espaço da sobreposição e do eixo; não há prop de altura total.
- Abaixo de 420 px de largura a coluna de nomes encolhe de 52 para 36 px, com reticências, e o eixo mostra menos marcas (cerca de uma a cada 72 px).

## Desempenho

- A densidade é calculada no navegador (96 amostras por série, cada uma contra todas as observações) e `series` é serializado a cada render, inclusive ao mover o ponteiro; com muitos milhares de valores, amostre antes.

## Notas para IA

- Passe observações brutas em `values`, não densidades prontas: o componente estima a curva com a regra de Silverman por série, ou com `bandwidth` em unidades do valor.
- Use `id` estável por série para as curvas se transformarem na troca de dados, e fixe `domain` quando dois conjuntos precisam do mesmo eixo.
- `active` com `onActiveChange` controla a crista levantada; `tint` (ligado por padrão) colore cada crista pela mediana e mostra a escala abaixo do gráfico.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/ridgeline · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
