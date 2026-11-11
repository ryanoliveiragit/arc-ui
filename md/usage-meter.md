# Usage meter

> Medidor de consumo dividido em partes, com alerta quando o uso se aproxima ou passa do limite do plano.

- Tipo: componente (categoria Feedback)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/usage-meter
- Descrição original (inglês): Show what fills an allowance and how close it is to the limit.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/usage-meter.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/usage-meter.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/usage-meter.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/usage-meter.json`. Caminho do registro, relativo ao endereço do site: `r/usage-meter.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/usage-meter/usage-meter.tsx`
  - `components/ryan-ui/usage-meter/usage-meter.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/usage-meter.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Uma cota fixa do plano, como armazenamento, assentos ou créditos, quando importa ver o que ocupa o espaço e quanto falta para o limite.
- Avisar antes do limite: a partir de `warnAt` (padrão 90%) o selo mostra “Almost full”, e acima do limite a parte excedente aparece hachurada, com um marcador no limite.
- Telas de plano e cobrança em que a pessoa explora as categorias passando o mouse, tocando ou usando as setas na legenda.

## Quando não usar

- Use [`progress`](progress.md) para uma única medida de andamento, sem categorias nem limite de plano.
- Use [`composition-chart`](composition-chart.md) ou [`donut-chart`](donut-chart.md) para a divisão de um todo sem limite, ou com mais de quatro partes.
- Use [`gauge`](gauge.md) para um valor único dentro de uma faixa conhecida.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { UsageMeter } from "@/components/ryan-ui/usage-meter/usage-meter";
import { Button } from "@/components/ryan-ui/button/button";
import { Row, Stack, Surface } from "./_kit";

export default function UsageMeterDemo() {
  const [media, setMedia] = useState(18.4);
  const [docs, setDocs] = useState(9.2);
  const [backups, setBackups] = useState(12.1);
  return (
    <Stack gap={4} width={480}>
      <Surface>
        <UsageMeter
          label="Workspace storage"
          unit="GB"
          limit={50}
          segments={[
            { id: "media", label: "Media", value: media },
            { id: "docs", label: "Documents", value: docs },
            { id: "backups", label: "Backups", value: backups },
          ]}
        />
      </Surface>
      <Row>
        <Button size="sm" variant="secondary" onClick={() => setMedia(m => m + 4)}>Upload 4 GB of media</Button>
        <Button size="sm" variant="secondary" onClick={() => setBackups(b => b + 3)}>Add a backup</Button>
        <Button size="sm" variant="ghost" onClick={() => { setMedia(18.4); setDocs(9.2); setBackups(12.1); }}>Reset</Button>
      </Row>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `UsageMeter`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | What is measured, such as "Workspace storage". |
| `segments` (obrigatória) | `UsageMeterSegment[]` | — | Used amounts in display order. Up to four read clearly. |
| `limit` (obrigatória) | `number` | — | The plan limit, in the same unit as the segments. |
| `unit` | `string` | `""` | — |
| `decimals` | `number` | `1` | Digits after the decimal point. |
| `freeLabel` | `string` | `"Free"` | — |
| `overLabel` | `string` | `"Over limit"` | — |
| `warnAt` | `number` | `.9` | Share of the limit at which the meter warns that it is almost full. |

### Tipos exportados

#### `UsageMeterSegment`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable identity. Keep it the same while the value changes, so the segment re-flows instead of being replaced. |
| `label` (obrigatória) | `string` | — |
| `value` (obrigatória) | `number` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | A legenda é uma única parada de `Tab` (tabindex móvel); o foco já destaca a categoria na barra e no número grande. |
| `←` ou `→` ou `↑` ou `↓` | Movem o foco entre as categorias e o item de espaço livre, dando a volta. |
| `Home` ou `End` | Vai para a primeira categoria ou para o item de espaço livre (ou de excedente). |
| `Enter` ou `Espaço` | Fixa o destaque da categoria em foco (`aria-pressed`); de novo, solta. |
| `Esc` | Solta a categoria fixada. |

## Acessibilidade

- A barra é `role="img"` com um resumo completo em `aria-label` (total, cada categoria e espaço livre); os números que giram são `aria-hidden` e há um texto oculto com o total.
- A legenda é um grupo de botões com tabindex móvel e `aria-pressed`; uma região viva só fala quando o estado muda (normal, quase cheio, acima do limite) ou o excedente muda.
- Acima do limite, o excedente é hachurado além de colorido e o selo ganha um ícone, então o estado não depende só da cor.

## Movimento

- Na primeira vez que aparece na tela, os segmentos crescem da esquerda para a direita, um após o outro; depois, cada mudança faz todos deslizarem com uma mola sem ultrapassagem.
- Os números giram como um odômetro na direção da mudança, o selo ajusta a largura com uma mola e destacar uma categoria apaga as outras.
- Com “reduzir movimento”, valores e larguras mudam na hora e os textos só esmaecem.

## Comportamento responsivo

- A legenda é uma grade `auto-fit` com colunas de pelo menos 108 px, que vira mais linhas num cartão estreito; um título longo quebra ao lado do selo.

## Desempenho

- Espera 40% do medidor entrar na tela para animar e observa a largura da barra com um `ResizeObserver`; as posições dos segmentos vêm de valores de movimento, sem re-render por quadro.

## Notas para IA

- Importe de `@/components/ryan-ui/usage-meter/usage-meter`. Passe `segments` com `id` estável (mudar o valor mantém o segmento e anima), `limit` na mesma unidade e `unit`, como `"GB"`.
- Use no máximo quatro segmentos: o CSS só define cores para quatro, e um quinto fica sem cor na barra e na legenda.
- Os números saem no formato en-US (ponto decimal) e os textos (“of 50 GB used”, “Almost full”) estão em inglês; `freeLabel` e `overLabel` traduzem só parte, o resto se ajusta no arquivo copiado.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/usage-meter · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
