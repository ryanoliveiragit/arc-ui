# Window range

> Janela de tempo sobre um gráfico de área ao vivo: arraste as bordas para redimensionar, arraste ou dê um tapa para rolar com inércia, e as datas rolam para os novos valores.

- Tipo: componente (categoria Entradas), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/window-range
- Descrição original (inglês): A time window over a live area chart: drag its edges to resize, drag or flick it to pan with momentum, and the dates roll to their new values.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/window-range.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/window-range.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/window-range.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/window-range.json`. Caminho do registro, relativo ao endereço do site: `r/window-range.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/window-range/window-range.tsx`
  - `components/ryan-ui/window-range/window-range.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/window-range.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Escolher o intervalo de datas de um relatório de analytics enquanto a pessoa vê a forma da série por trás (visitas, receita, latência).
- Comparar períodos arrastando uma janela sobre um gráfico compacto, com total e variação recalculados ao vivo enquanto a janela se move.
- Um resumo compacto com janela móvel acima de um gráfico ou tabela detalhada, sem abrir um calendário.

## Quando não usar

- Use [`date-range-picker`](date-range-picker.md) quando as pessoas escolhem datas exatas em um calendário ou o intervalo atravessa anos.
- Use [`brush-chart`](brush-chart.md) quando a janela deve ampliar um gráfico grande e detalhado mostrando eventos no lugar.
- Use [`slider`](slider.md) para faixas numéricas sem série para mostrar, e [`sparkline`](sparkline.md) para apenas uma tendência compacta junto a um valor.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useMemo, useState, type CSSProperties } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { WindowRange, type WindowRangeTick } from "@/components/ryan-ui/window-range/window-range";
import { Stack, Surface } from "./_kit";
import styles from "./window-range.module.css";

const DAY = 86_400_000;
const FIRST = Date.UTC(2026, 3, 1); // Apr 1, 2026 — 182 daily points through Sep 29
const LAST = 181;
const dayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const numFmt = new Intl.NumberFormat("en-US");

/** Deterministic series: LCG noise with a late-August spike, then the two 30-day blocks are scaled so the
    headline reads exactly like the reference — 104,263 visits, +6.6% over the previous 30 days. */
function buildVisits(): number[] {
  let s = 20260401;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const raw = new Array<number>(LAST + 1);
  for (let i = 0; i <= LAST; i++) {
    const drift = 1 + (i / LAST) * 0.35;
    const wave = 1 + 0.16 * Math.sin(i / 2.7) + 0.1 * Math.sin(i / 11.3);
    let v = 3100 * drift * wave + (rand() - 0.5) * 2400;
    const d = Math.abs(i - 104);
    if (d < 10) v *= 1 + Math.exp(-d / 2.6) * 2.4;
    raw[i] = Math.max(450, v);
  }
  const sum = (lo: number, hi: number) => { let t = 0; for (let i = lo; i <= hi; i++) t += raw[i]!; return t; };
  const f0 = 97808 / sum(122, 151);
  const f1 = 104263 / sum(152, LAST);
  for (let i = 122; i <= LAST; i++) raw[i]! *= f0 + ((f1 - f0) * (i - 122)) / 59;
  const fix = (lo: number, hi: number, target: number) => {
    const delta = (target - sum(lo, hi)) / (hi - lo + 1);
    for (let i = lo; i <= hi; i++) raw[i]! += delta;
  };
  fix(122, 151, 97808);
  fix(152, LAST, 104263);
  return raw;
}

const PRESETS = [{ days: 7, label: "7d" }, { days: 30, label: "30d" }, { days: 90, label: "90d" }];
const TICKS: WindowRangeTick[] = [
  { value: 30, label: "May" },
  { value: 61, label: "Jun" },
  { value: 91, label: "Jul" },
  { value: 122, label: "Aug" },
  { value: 153, label: "Sep" },
];

export default function WindowRangeDemo(_props?: { variant?: string }) {
  const visits = useMemo(buildVisits, []);
  const [range, setRange] = useState<[number, number]>([LAST - 29, LAST]);
  const [s, e] = range;
  const days = e - s + 1;

  const total = useMemo(() => { let t = 0; for (let i = s; i <= e; i++) t += visits[i]!; return Math.round(t); }, [visits, s, e]);
  const prevTotal = useMemo(() => {
    const lo = s - days;
    if (lo < 0) return null;
    let t = 0; for (let i = lo; i < s; i++) t += visits[i]!;
    return Math.round(t);
  }, [visits, s, days]);
  const delta = prevTotal ? ((total - prevTotal) / prevTotal) * 100 : null;

  return (
    <Stack gap={4} width={480}>
      <Surface padding={5} style={{ "--series-1": "var(--tone-sky)" } as CSSProperties}>
        <div className={styles.head}>
          <div>
            <span className={styles.label}>Visitors</span>
            <strong className={styles.total}>{numFmt.format(total)}</strong>
            <span className={styles.deltaRow}>
              {delta !== null && (delta >= 0 ? <TrendingUp size={14} strokeWidth={2.5} /> : <TrendingDown size={14} strokeWidth={2.5} />)}
              <b className={`${styles.pct}${delta !== null && delta < 0 ? ` ${styles.down}` : ""}`}>
                {delta === null ? "—" : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`}
              </b>
              <span className={styles.vs}>vs previous {days} days</span>
            </span>
          </div>
          <div className={styles.presets} role="group" aria-label="Report window">
            {PRESETS.map(preset => {
              const on = e === LAST && s === LAST - preset.days + 1;
              return (
                <button key={preset.days} type="button" className={`${styles.preset}${on ? ` ${styles.presetOn}` : ""}`} aria-pressed={on} onClick={() => setRange([LAST - preset.days + 1, LAST])}>
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.chartGap}>
          <WindowRange
            label="Report dates"
            data={visits}
            value={range}
            onValueChange={setRange}
            minSpan={6}
            height={168}
            live
            format={index => dayFmt.format(FIRST + index * DAY)}
            formatSpan={span => `${span + 1} days`}
            ticks={TICKS}
          />
        </div>
      </Surface>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `WindowRange`

A time window over a live area chart. Drag either edge of the frame to resize it, drag inside to pan and flick to let it coast, or press outside to glide it there. The chart outside the window fades back; inside, a floating lens with a thick bezel replays the selected slice at full color, cropped 1:1 out of the plot. The start, end and length readouts roll to their new values. New data morphs the chart in place, and with `live` a dot pulses on the latest point.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `readonly number[]` | — | The series behind the window, one number per point, spread evenly from min to max. Pass a new array to morph the chart to it. |
| `value` | `[number, number]` | — | Controlled window as [start, end] in domain units. Pair with onValueChange. A new value from outside glides the frame there. |
| `defaultValue` | `[number, number]` | — | Starting window when uncontrolled. Defaults to the last quarter of the domain. |
| `onValueChange` | `(value: [number, number]) => void` | — | Runs on every change while dragging, coasting after a flick or pressing keys. |
| `onValueCommit` | `(value: [number, number]) => void` | — | Runs once the window has settled after a drag, a flick or a key. |
| `min` | `number` | `0` | Start of the domain, for example day 0. |
| `max` | `number` | — | End of the domain. Defaults to data.length - 1. |
| `step` | `number` | `1` | Both ends snap to this step, counted from min. |
| `largeStep` | `number` | — | How far Page Up, Page Down and Shift with an arrow move an edge or the window. Defaults to a tenth of the domain. |
| `minSpan` | `number` | — | The narrowest window as end minus start, in domain units. |
| `maxSpan` | `number` | — | The widest window as end minus start, in domain units. Defaults to the whole domain. |
| `format` | `(value: number) => string` | — | Formats the start and end readouts and the spoken values. |
| `formatSpan` | `((span: number) => string) \| null` | — | Formats the middle readout from end minus start. Pass null to hide it. |
| `ticks` | `readonly WindowRangeTick[]` | — | Labels under the chart, such as the first day of each month. |
| `label` | `string` | `"Date range"` | Names the group and prefixes the names of the start, window and end sliders. |
| `live` | `boolean` | — | Pulses a dot on the latest point to show that the series is still arriving. |
| `accent` | `string` | — | Any CSS color for the frame and the line. Defaults to the theme ink color for the frame and the first chart series for the line. |
| `height` | `number` | `112` | Height of the chart in px, from 64 to 240. |
| `disabled` | `boolean` | — | Dims the control and ignores pointer and keys. |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | — | Também aceita as props deste tipo, menos `value`, `onChange` e `defaultValue`. |

### Tipos exportados

#### `WindowRangeTick`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `number` | Domain value the tick points at. |
| `label` (obrigatória) | `string` | Short label, such as a month name. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Move o foco da borda inicial para a janela e depois para a borda final. O anel só aparece com teclado; a parte pressionada pelo ponteiro assume o foco para as teclas continuarem onde o ponteiro parou. |
| `→` ou `←` ou `↑` ou `↓` | Numa borda, move essa borda um passo; na janela, desloca a janela inteira um passo. |
| `Shift + seta` ou `PageUp` ou `PageDown` | Move a borda ou a janela um passo grande (um décimo do domínio por padrão). |
| `Home` ou `End` | Na janela, leva-a ao início ou ao fim do domínio; numa borda, leva a borda até onde os limites de amplitude permitem. |

## Acessibilidade

- O componente é um grupo nomeado pela prop label com três elementos role=slider focáveis: borda inicial, janela e borda final.
- Cada borda fala sua data formatada; a janela fala as duas pontas ("Aug 31 to Sep 29") e seu range é o conjunto de posições iniciais possíveis.
- O gráfico, o quadro e os readouts rolantes são decorativos e ficam fora do leitor de tela; os sliders carregam todos os valores.

## Movimento

- Arrastar acompanha o dedo um a um (eventos coalesced); além dos limites do domínio ou da amplitude, o quadro estica como elástico e volta com mola.
- Soltar um arraste rápido conserva a velocidade medida: o ponto de parada é projetado do tapa, alinhado ao passo e atingido por uma mola criticamente amortecida que começa na velocidade do tapa.
- Pressionar fora da janela faz ela deslizar até se centralizar sob o dedo numa mola mais macia; teclas, presets e novos valores por props usam o mesmo deslize.
- Os readouts rolam cada dígito (nomes de mês rolam como palavra inteira) na direção da mudança; durante o arraste e a inércia atualizam no lugar, sem atrasar em relação ao quadro.
- Dados novos deformam linha e área a partir da forma antiga; o ponto ao vivo pulsa com animação de compositor. Com movimento reduzido tudo salta direto, sem inércia, elástico, rolagem nem pulso.

## Comportamento responsivo

- Gráfico e quadro preenchem o contêiner a partir de 320px; os readouts dividem uma linha com a duração no meio — oculte-a passando formatSpan nulo em espaços muito apertados.
- O plot usa touch-action pan-y, então a rolagem vertical da página continua funcionando sobre o gráfico; as bordas têm área de toque que chega a 14px para fora.
- Rótulos de tick ficam sob seus valores; passe menos ticks em larguras estreitas.

## Desempenho

- Mover a janela só escreve transforms no quadro, nas bordas e no clip; o path do gráfico é reescrito apenas quando os dados mudam.
- O gráfico é um par de paths SVG desenhado duas vezes com traço não escalável; redimensionar o contêiner custa uma única medição.

## Notas para IA

- Mapeie o domínio para índices: um ponto por dia, min 0, e um format que converte o índice em data; formatSpan recebe fim menos início, então some um para contar dias inclusos.
- Recalcule totais no onValueChange para feedback ao vivo e busque no onValueCommit, que dispara quando a janela assenta; combine com botões rápidos que definem value — o quadro desliza até eles e os readouts rolam.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/window-range · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
