# Gauge

> Mostra um valor dentro de um intervalo conhecido, com faixas de estado.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/gauge
- Descrição original (inglês): Show a value against a known range.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/gauge.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/gauge.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/gauge.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/gauge.json`. Caminho do registro, relativo ao endereço do site: `r/gauge.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/gauge/gauge.tsx`
  - `components/ryan-ui/gauge/gauge.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/gauge.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um único valor contra uma faixa conhecida num painel: carga do servidor, nota de atendimento, uso de uma cota.
- Quando o valor tem estados nomeados (saudável, ocupado, crítico): com `thresholds`, cor e rótulo mudam no instante em que o número cruza cada limite.

## Quando não usar

- Use [`progress`](progress.md) para o andamento de uma tarefa com fim conhecido, como um envio de arquivo.
- Use [`usage-meter`](usage-meter.md) quando importa ver o que ocupa uma cota e quanto falta para o limite.
- Use [`slider`](slider.md) quando a pessoa precisa ajustar o valor; o medidor é só leitura.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Gauge } from "@/components/ryan-ui/gauge/gauge";
import { Slider } from "@/components/ryan-ui/slider/slider";
import { Caption, Row, Stack } from "./_kit";

export default function GaugeDemo() {
  const [load, setLoad] = useState(42);
  return (
    <Stack gap={8} align="center" width={640}>
      <Row gap={8} justify="center" align="start">
        <div style={{ width: 220 }}>
          <Gauge
            value={load}
            label="Server load"
            detail="12 of 16 cores busy"
            thresholds={[
              { from: 0, tone: "success", label: "Healthy" },
              { from: 60, tone: "warning", label: "Busy" },
              { from: 85, tone: "danger", label: "Critical" },
            ]}
          />
        </div>
        <div style={{ width: 220 }}>
          <Gauge value={7.4} min={0} max={10} label="Support score" detail="Average of 312 ratings" />
        </div>
      </Row>
      <Stack gap={2} width={320}>
        <Slider label="Server load" value={load} onValueChange={setLoad} min={0} max={100} />
        <Caption>Drag the slider: the ring, the number and the state label follow the thresholds.</Caption>
      </Stack>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Gauge`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` (obrigatória) | `number` | — | — |
| `min` | `number` | `0` | — |
| `max` | `number` | `100` | — |
| `label` (obrigatória) | `string` | — | — |
| `detail` | `string` | — | — |
| `tone` | `GaugeTone` | `"accent"` | — |
| `thresholds` | `GaugeThreshold[]` | — | — |

### Tipos exportados

#### `GaugeThreshold`

A band that starts at `from`: the highest band the value reaches sets the tone and names the state, so it never rests on color alone.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `from` (obrigatória) | `number` | — |
| `tone` (obrigatória) | `GaugeTone` | — |
| `label` (obrigatória) | `string` | — |

## Acessibilidade

- O anel é um `role="meter"` com `aria-valuemin`, `aria-valuemax`, `aria-valuenow` e um `aria-valuetext` com a porcentagem e o nome da faixa; o desenho e o número animado ficam em `aria-hidden`.
- Cada faixa de `thresholds` tem um `label` de texto, então o estado não depende só da cor.
- `label` é obrigatório; o `aria-label` da figura junta rótulo, valor e máximo com um “of” fixo em inglês.

## Movimento

- O primeiro preenchimento espera metade do medidor entrar na tela: o arco fecha devagar, sem ultrapassar o valor, enquanto o número conta.
- A cada novo valor, arco e número vão até lá numa mola; cor e rótulo da faixa mudam quando o número em tela cruza o limite, e o texto entra de baixo se o valor subiu ou de cima se caiu.
- Com “reduzir movimento”, arco e número saltam para o valor e os textos trocam com um esmaecer rápido.

## Comportamento responsivo

- O anel ocupa `min(100%, 176px)` de largura e a espessura do traço escala junto; não há prop de tamanho, então quem manda é a largura do pai.

## Notas para IA

- O centro sempre mostra a porcentagem da faixa (`7.4` entre 0 e 10 aparece como 74%), não o valor bruto; use `detail` para dizer o valor com a unidade.
- Em `thresholds`, vale a faixa de maior `from` que o valor alcança: inclua uma com `from` igual a `min` para sempre haver estado; sem `thresholds`, a cor vem de `tone`.
- Não aceita `className` nem tamanho: envolva num contêiner com a largura desejada, lembrando que o anel não passa de 176 px.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/gauge · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
