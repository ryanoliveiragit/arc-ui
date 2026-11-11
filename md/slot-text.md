# Slot text

> Textos e números que giram até o novo valor, como rolos de caça-níqueis.

- Tipo: componente (categoria Especial)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/slot-text
- Descrição original (inglês): Text and numbers that spin into their new value on staggered slot machine reels.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slot-text.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slot-text.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slot-text.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/slot-text.json`. Caminho do registro, relativo ao endereço do site: `r/slot-text.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/slot-text/slot-text.tsx`
  - `components/ryan-ui/slot-text/slot-text.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/slot-text.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Números que merecem um momento quando mudam: preço novo, total de visitas, placar, a revelação de um número num lançamento.
- Palavras curtas que trocam como num painel de aeroporto, como o nome de uma cidade em maiúsculas, com as letras embaralhando antes de parar.

## Quando não usar

- Use [`animated-counter`](animated-counter.md) para totais de painel que mudam com frequência, com dígitos que rolam como um odômetro.
- Use [`text-morph`](text-morph.md) para rótulos de estado, como “Seguir” e “Seguindo”, em que as letras em comum devem ficar paradas.
- Use [`countdown`](countdown.md) para contagem regressiva até um horário: ela cuida do relógio, do fuso e do fim.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import SlotText from "@/components/ryan-ui/slot-text/slot-text";
import { Button } from "@/components/ryan-ui/button/button";
import { Row, Stack } from "./_kit";

export default function SlotTextDemo() {
  const [visits, setVisits] = useState(12480);
  const [city, setCity] = useState(0);
  const cities = ["LISBON", "TOKYO", "AUSTIN", "BERLIN"];
  return (
    <Stack align="center" gap={6}>
      <div style={{ fontSize: "var(--text-4xl, 48px)", fontWeight: 600, color: "var(--text-primary)" }}><SlotText value={visits} /></div>
      <Row justify="center">
        <Button variant="secondary" onClick={() => setVisits(Math.floor(Math.random() * 90000) + 1000)}>Randomize visits</Button>
        <Button variant="ghost" onClick={() => setVisits(v => v + 999)}>Add 999</Button>
      </Row>
      <div style={{ fontSize: "var(--text-xl)", letterSpacing: "0.1em", color: "var(--text-secondary)" }}><SlotText value={cities[city]!} /></div>
      <Button size="sm" variant="secondary" onClick={() => setCity((city + 1) % cities.length)}>Next city</Button>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SlotText`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` (obrigatória) | `string \| number` | — | The value to show. Numbers pass through format; strings render as they are. |
| `format` | `(value: number) => string` | — | Formats a number value. Defaults to en-US grouping, so 12480 reads 12,480. |
| `duration` | `number` | `.9` | Seconds the first reel spins. Later reels add stagger. |
| `stagger` | `number` | `.07` | Seconds between reels stopping, left to right. |
| `spins` | `number` | `1` | Extra full turns a digit makes before it lands. 0 rolls straight to the new digit. |
| `align` | `"start" \| "end"` | — | Which end reels are matched from when the length changes. Numbers default to end, so 999 to 1,000 grows on the left. |
| `announce` | `boolean` | `false` | Announce new values politely to screen readers. |
| `className` | `string` | — | — |
| `style` | `CSSProperties` | — | — |

## Acessibilidade

- As rodas são `aria-hidden` e o texto final fica num `span` oculto, então o leitor de tela lê o valor certo, nunca os caracteres girando.
- Com `announce`, cada valor novo é anunciado com `aria-live="polite"`; sem ele, a mudança é silenciosa.

## Movimento

- Cada caractere é uma roda: dígitos contam na direção em que o número mudou, letras passam por letras sorteadas, e as rodas param uma depois da outra, da esquerda para a direita, sem passar do alvo.
- Quanto mais rápido a roda gira, mais ela desfoca; a largura de cada caractere acompanha com uma mola, e caracteres novos crescem a partir do zero.
- Com “reduzir movimento”, o valor novo aparece na hora, sem giro.

## Desempenho

- Cada caractere monta uma tira com todas as etapas do giro (até 20 células por dígito com `spins={1}`); use em valores curtos, não em textos longos.

## Notas para IA

- Importe `SlotText` de `@/components/ryan-ui/slot-text/slot-text`. Para números, passe `value` numérico e um `format`, como `v => v.toLocaleString("pt-BR")`; o padrão agrupa no estilo en-US (12,480).
- Deixe símbolos de moeda que começam com letra, como “R$”, fora do componente: com a letra no início, quando o número ganha um dígito o prefixo muda de roda e gira.
- O tamanho vem da fonte do pai; para mudanças frequentes, `spins={0}` e um `duration` menor deixam o giro curto.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/slot-text · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
