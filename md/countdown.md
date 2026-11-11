# Countdown

> Contagem regressiva com dígitos que rolam e se transformam em um estado ao vivo quando chega a zero.

- Tipo: componente (categoria Feedback)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/countdown
- Descrição original (inglês): A launch countdown with rolling digits that morphs into a live state at zero.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/countdown.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/countdown.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/countdown.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/countdown.json`. Caminho do registro, relativo ao endereço do site: `r/countdown.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/countdown/countdown.tsx`
  - `components/ryan-ui/countdown/countdown.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/countdown.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um momento fixo que as pessoas esperam, como lançamento, evento ao vivo ou fim de inscrição, com dígitos grandes no centro de uma seção (`variant="large"`).
- Um prazo dentro de um banner, cartão ou célula de tabela, numa linha só (`variant="compact"`).
- Telas que devem mudar sozinhas no zero: os dígitos viram `completeLabel` (padrão “Live now”) e `onComplete` dispara uma vez, na hora, mesmo com a aba oculta.

## Quando não usar

- Para tempo decorrido, como um cronômetro que sobe, ela não serve: só conta para baixo até `target`.
- Use [`announcement-bar`](announcement-bar.md) quando o prazo acompanha um recado no topo do site; ela tem uma contagem própria dentro da mensagem.
- Use [`slot-text`](slot-text.md) ou [`animated-counter`](animated-counter.md) para números que mudam por evento, como preço ou total, sem um relógio por trás.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Countdown } from "@/components/ryan-ui/countdown/countdown";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack } from "./_kit";

export default function CountdownDemo() {
  const [launch, setLaunch] = useState(() => Date.now() + 3 * 86_400_000 + 4 * 3_600_000 + 27 * 60_000 + 12_000);
  const [soon, setSoon] = useState(() => Date.now() + 8_000);
  return (
    <Stack gap={8} align="center">
      <Stack gap={3} align="center">
        <Countdown target={launch} label="Aurora 2.0 launches in" />
        <Caption>Aurora 2.0 launch</Caption>
      </Stack>
      <Row gap={4} justify="center">
        <Countdown target={soon} variant="compact" units={["minutes", "seconds"]} completeLabel="Doors are open" label="Doors open in" />
        <Button size="sm" variant="secondary" onClick={() => setSoon(Date.now() + 6_000)}>Restart 6 s timer</Button>
        <Button size="sm" variant="ghost" onClick={() => setLaunch(Date.now() + 5 * 86_400_000)}>Move launch</Button>
      </Row>
      <Caption>Wait for the small timer to hit zero to see the digits morph into the live state.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Countdown`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `target` (obrigatória) | `Date \| number \| string` | — | The moment to count down to. A number is epoch milliseconds, a Date is used as is, and an ISO string with `Z` or an offset such as `2026-10-06T10:00:00-07:00` is exact. A string without an offset is wall time in `timeZone`, or UTC when no zone is given, so the result never depends on the visitor's own time zone. |
| `timeZone` | `string` | — | IANA zone for a target string without an offset, such as "America/Los_Angeles". Daylight saving is resolved for the target date. |
| `units` | `CountdownUnit[]` | `DEFAULT_UNITS` | Units to show, largest first. The largest unit absorbs the rest, so hours can pass 24 when days are left out. |
| `variant` | `"large" \| "compact"` | `"large"` | Large digits with unit labels, or one compact line for banners and table cells. |
| `completeLabel` | `ReactNode` | `"Live now"` | Shown once the target passes. The digits morph into it. |
| `onComplete` | `() => void` | — | Fires once, the moment the countdown reaches zero while mounted. It fires on time even when the tab is hidden. |
| `label` | `string` | `"Time remaining"` | Accessible name, such as "Keynote starts in". |
| `clock` | `() => number` | `systemClock` | Clock source in epoch milliseconds. Pass a server-synced clock when the visitor's device time cannot be trusted. |
| `ref` | `Ref<HTMLDivElement>` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `CountdownUnit` | `"days" \| "hours" \| "minutes" \| "seconds"` |

### Outras exportações

- `toEpoch` (função)

## Acessibilidade

- A raiz é `role="timer"` com o nome de `label` (padrão “Time remaining”); os dígitos animados ficam ocultos e um texto oculto diz o tempo por extenso, sem os segundos enquanto falta mais de um minuto.
- `role="timer"` não anuncia mudanças; se o fim importa para quem usa leitor de tela, anuncie numa região viva sua a partir de `onComplete`.
- Os nomes das unidades, visíveis e lidos (“Days”, “3 days, 4 hours”), estão em inglês; passe `label` em português e traduza as unidades no arquivo copiado.

## Movimento

- Cada dígito é uma roda que gira pelo caminho mais curto, para baixo a cada segundo (00 → 59 é um passo só); na primeira exibição, as rodas entram em sequência, da esquerda para a direita.
- No zero, os dígitos se desfazem com escala e desfoque leves e dão lugar a `completeLabel`, e a caixa acompanha a nova largura e altura com uma mola; no `compact`, a pílula assume o tom de sucesso.
- Com “reduzir movimento”, os dígitos trocam sem girar, a troca final é um esmaecer curto e o ponto que pulsa ao lado do rótulo fica parado.

## Comportamento responsivo

- No `large`, o tamanho dos dígitos acompanha a largura do contêiner (unidade `cqi`), de 1,75 rem até o tamanho de display, e quatro grupos cabem em 320 px.

## Desempenho

- O relógio só avança com o componente na tela e a aba visível, e ao voltar relê a hora, sem acumular atraso; um temporizador separado garante o fim no horário.

## Notas para IA

- Importe de `@/components/ryan-ui/countdown/countdown`. Para um horário local, passe `target="2026-12-01T10:00"` e `timeZone="America/Sao_Paulo"`; uma string sem fuso e sem `timeZone` é lida como UTC.
- `units` define o que aparece, e a maior unidade absorve o resto: com `["hours", "minutes"]`, as horas passam de 24. Se o relógio do aparelho não for confiável, passe `clock` com a hora do servidor.
- `onComplete` só dispara se a contagem chega a zero com o componente montado; se `target` já passou ao montar, mostra `completeLabel` sem contar e sem chamar o callback.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/countdown · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
