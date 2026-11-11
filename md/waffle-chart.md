# Waffle chart

> Gráfico de unidades 10 por 10 em que cada célula vale um por cento e voa para o novo grupo quando os dados mudam.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/waffle-chart
- Descrição original (inglês): A ten by ten unit chart where every cell is one percent, and cells fly to their new group when the data changes.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/waffle-chart.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/waffle-chart.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/waffle-chart.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/waffle-chart.json`. Caminho do registro, relativo ao endereço do site: `r/waffle-chart.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/waffle-chart/waffle-chart.tsx`
  - `components/ryan-ui/waffle-chart/waffle-chart.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/waffle-chart.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar partes de um todo como quadradinhos contáveis, em que cada célula vale um por cento: matriz de energia, respostas de uma pesquisa, orçamento por área.
- Comparar dois momentos com as mesmas categorias: ao trocar `data`, as células que mudam de grupo voam para o lugar novo e a legenda rola as porcentagens.
- Quando a cor não pode ser o único canal: além da cor, as categorias alternam entre células quadradas, redondas e com moldura.

## Quando não usar

- Use [`donut-chart`](donut-chart.md) ou [`composition-chart`](composition-chart.md) quando há muitas categorias pequenas: abaixo de meio por cento, uma categoria pode ficar sem nenhuma célula.
- Use [`bar-chart`](bar-chart.md) para comparar valores que não somam um todo.
- Use [`progress`](progress.md) ou [`usage-meter`](usage-meter.md) para uma única fração, como o uso de uma cota.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import WaffleChart, { type WaffleCategory } from "@/components/ryan-ui/waffle-chart/waffle-chart";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack, Surface } from "./_kit";

const years: Record<string, WaffleCategory[]> = {
  "2015": [
    { key: "wind", label: "Wind", value: 64 },
    { key: "solar", label: "Solar", value: 18 },
    { key: "hydro", label: "Hydro", value: 120 },
    { key: "nuclear", label: "Nuclear", value: 210 },
    { key: "gas", label: "Gas", value: 380 },
    { key: "coal", label: "Coal", value: 408 },
  ],
  "2023": [
    { key: "wind", label: "Wind", value: 215 },
    { key: "solar", label: "Solar", value: 190 },
    { key: "hydro", label: "Hydro", value: 132 },
    { key: "nuclear", label: "Nuclear", value: 205 },
    { key: "gas", label: "Gas", value: 340 },
    { key: "coal", label: "Coal", value: 118 },
  ],
};

export default function WaffleChartDemo() {
  const [year, setYear] = useState("2015");
  return (
    <Stack gap={4} width={520}>
      <SegmentedControl label="Year" value={year} onValueChange={setYear} options={[{ value: "2015", label: "2015" }, { value: "2023", label: "2023" }]} />
      <Surface>
        <WaffleChart data={years[year] ?? []} label={`Electricity generation, ${year}`} unit="TWh" />
      </Surface>
      <Caption>One cell is one percent. Switch years and cells fly to their new group; hover a legend row to focus a source.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `WaffleChart`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `WaffleCategory[]` | — | Categories in fill order. The first fills from the bottom-left corner, column by column. |
| `label` (obrigatória) | `string` | — | What the whole is, such as "Electricity generation, 2023". Names the chart for assistive technology. |
| `unit` | `string` | `""` | Unit after each raw value in the tooltip and table, such as "TWh". |
| `formatValue` | `(value: number, category: WaffleCategory) => string` | — | — |
| `rows` | `number` | `10` | Grid rows. rows × columns cells make the whole; 10 × 10 means one cell per percent. |
| `columns` | `number` | `10` | — |
| `accentKey` | `string \| null` | — | The category painted in the accent. Pass null to keep every category neutral. Defaults to the first category. |
| `activeKey` | `string \| null` | — | Controlled focused category. Others dim while one is focused. |
| `defaultActiveKey` | `string \| null` | `null` | — |
| `onActiveChange` | `(key: string \| null) => void` | — | — |
| `legend` | `boolean` | `true` | Category list with shares that roll to their new value. |
| `decimals` | `number` | `0` | Decimal places for shares. |
| `emptyLabel` | `string` | `"No data"` | — |
| `ref` | `Ref<HTMLElement>` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

#### `WaffleCategory`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | Stable identity. Cells keep following their category when the data changes, so a new dataset flows instead of repainting. |
| `label` (obrigatória) | `string` | Name in the legend, the tooltip, and the data table. |
| `value` (obrigatória) | `number` | Raw amount. Shares are computed from the total; negatives count as zero. |
| `color` | `string` | Any CSS color. Defaults to the first series for accentKey, the supporting series for the next three, then neutral steps. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Com o foco na grade, sobe ou desce uma célula na coluna e lê a categoria dela. |
| `←` ou `→` | Passa para a célula ao lado, na coluna anterior ou na seguinte. |
| `Page Up` ou `Page Down` | Page Down salta para o início da categoria seguinte; Page Up volta ao início da atual ou, se já está nele, da anterior. |
| `Home` ou `End` | Vai à primeira ou à última célula preenchida. |
| `Esc` | Encerra a leitura e esconde a dica. |
| `Enter` ou `Espaço` | Na legenda, fixa ou solta o destaque da categoria. |

## Acessibilidade

- A grade é um grupo focável com `aria-roledescription="waffle chart"` e as instruções no nome, em inglês; uma região `aria-live="polite"` lê a categoria da célula atual com fatia e valor.
- A legenda é uma lista de botões com `aria-pressed`; um resumo e uma tabela ocultos trazem valor, fatia e número de células de cada categoria.
- A forma da célula é um segundo canal além da cor: fora a categoria de destaque, as categorias alternam entre quadrada, redonda e com moldura, e a legenda repete a forma.

## Movimento

- Ao entrar na tela, as células crescem e aparecem em onda curta, na ordem de preenchimento: de baixo para cima, coluna a coluna.
- Quando os dados mudam, as células que trocam de grupo ou de posição voam até o novo lugar, encolhendo no meio do voo, e mudam de cor e forma no caminho; as porcentagens da legenda rolam.
- Com “reduzir movimento” ligado, as células vão direto ao lugar e à cor finais e as porcentagens trocam sem rolar.

## Comportamento responsivo

- Em contêiner de 420 px ou mais, a legenda fica ao lado da grade; abaixo disso, desce para uma lista de uma coluna.
- A grade tem no máximo 300 px de largura (232 px com a legenda ao lado) e as células acompanham essa medida; no toque, arrastar na horizontal percorre as células e o gesto vertical rola a página.

## Desempenho

- Cada célula é um elemento animado com `will-change: transform`: a grade padrão tem 100, e `rows` × `columns` maiores multiplicam esse número.

## Notas para IA

- Passe `data` como `{ key, label, value }` na ordem de preenchimento, com valores brutos: as fatias são calculadas e arredondadas para células inteiras que sempre somam a grade (10 × 10, uma por cento).
- Mantenha `key` estável entre conjuntos para as células voarem em vez de repintar; `unit` e `formatValue` formatam a dica e a tabela, e `decimals` as porcentagens.
- A cor de destaque vai para `accentKey` (a primeira categoria, por padrão) e as três seguintes usam as outras cores de série; `activeKey` com `onActiveChange` controla a categoria fixada.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/waffle-chart · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
