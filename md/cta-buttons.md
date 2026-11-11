# CTA buttons

> Três botões de chamada: seta que se expande e preenche o botão, deslize para confirmar e botão magnético que segue o cursor.

- Tipo: componente (categoria Ações), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/cta-buttons
- Descrição original (inglês): Three call-to-action buttons: an arrow disc that expands to fill the button on hover, a slide-to-confirm thumb, and a magnetic button that leans toward the cursor.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cta-buttons.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cta-buttons.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cta-buttons.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cta-buttons.json`. Caminho do registro, relativo ao endereço do site: `r/cta-buttons.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/cta-buttons/cta-buttons.tsx`
  - `components/ryan-ui/cta-buttons/cta-buttons.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/cta-buttons.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- A chamada principal de uma página de marketing ou do fim de uma seção, com `ArrowButton` (“Começar teste grátis”) ou `MagneticButton` (“Agendar demonstração”).
- Confirmar algo que não deve acontecer por um toque acidental, como um pagamento, com `SlideToConfirm`.

## Quando não usar

- Use [`button`](button.md) para ações comuns de interface, como formulários, diálogos e barras de ferramentas; estes três são botões de destaque.
- Use [`hold-to-confirm`](hold-to-confirm.md) ou [`confirm-morph`](confirm-morph.md) quando a confirmação precisa caber num controle do tamanho de um botão: o `SlideToConfirm` é um trilho de 52 px de altura que ocupa a largura do pai.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { ArrowButton, MagneticButton, SlideToConfirm } from "@/components/ryan-ui/cta-buttons/cta-buttons";
import { Caption, Row, Stack } from "./_kit";

export default function CtaButtonsDemo() {
  const [trials, setTrials] = useState(0);
  const [paid, setPaid] = useState(false);

  return (
    <Stack gap={8} align="center" width={520}>
      <Stack gap={3} align="center">
        <Row gap={3} justify="center">
          <ArrowButton onClick={() => setTrials(count => count + 1)}>Start free trial</ArrowButton>
          <ArrowButton size="md">See pricing</ArrowButton>
        </Row>
        <Caption>{trials === 0 ? "Hover or focus: the arrow disc grows to fill the button." : `Trial started ${trials} ${trials === 1 ? "time" : "times"}. No card needed.`}</Caption>
      </Stack>

      <Stack gap={3} align="center">
        <Row gap={4} justify="center">
          <MagneticButton>Book a demo</MagneticButton>
          <MagneticButton variant="outline" strength={0.22}>Talk to sales</MagneticButton>
        </Row>
        <Caption>Bring the cursor close: the buttons lean toward it.</Caption>
      </Stack>

      <Stack gap={3} align="center" style={{ width: "100%" }}>
        <SlideToConfirm label="Slide to pay $48.00" confirmedLabel="Payment sent" confirmed={paid} onConfirmedChange={setPaid} resetAfter={2600} />
        <Caption>{paid ? "Paid to Fernway Studio. Resetting for the demo." : "Drag the thumb to the end, or focus it and press Enter."}</Caption>
      </Stack>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ArrowButton`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactNode` | — | The label. |
| `href` | `string` | — | Renders a link instead of a button. |
| `target` | `string` | — | Link target, used with `href`. |
| `rel` | `string` | — | Link relationship, used with `href`. |
| `onClick` | `(event: MouseEvent<HTMLElement>) => void` | — | Runs when the button is pressed. |
| `icon` | `ReactNode` | — | Replaces the arrow. |
| `size` | `"md" \| "lg"` | `"lg"` | Height: 44 or 50 px. |
| `type` | `"button" \| "submit"` | `"button"` | Button type, used without `href`. |
| `disabled` | `boolean` | `false` | Turns the control off: it is dimmed and ignores pointer and keyboard input. |
| `className` | `string` | — | Extra class names for the root element. |

### `MagneticButton`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactNode` | — | The label. |
| `href` | `string` | — | Renders a link instead of a button. |
| `onClick` | `(event: MouseEvent<HTMLElement>) => void` | — | Runs when the button is pressed. |
| `strength` | `number` | `0.32` | How far the button follows the cursor, as a share of the cursor's distance from its center. 0 turns the pull off. |
| `reach` | `number` | `36` | How far outside its edges, in px, the button starts to feel the cursor. |
| `variant` | `"accent" \| "outline"` | `"accent"` | `accent` is the filled call to action; `outline` is the quiet one beside it. |
| `type` | `"button" \| "submit"` | `"button"` | Button type, used without `href`. |
| `disabled` | `boolean` | `false` | Turns the control off: it is dimmed and ignores pointer and keyboard input. |
| `className` | `string` | — | Extra class names for the root element. |

### `SlideToConfirm`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | `"Slide to confirm"` | The prompt on the track, and the thumb's accessible name. |
| `confirmedLabel` | `string` | `"Confirmed"` | Shown once the action is confirmed. |
| `onConfirm` | `() => void` | — | Runs once, when the thumb is released at the end of the track or confirmed from the keyboard. |
| `confirmed` | `boolean` | — | Confirmed state (controlled). Set it back to false to return the thumb to the start. |
| `defaultConfirmed` | `boolean` | `false` | Confirmed at first (uncontrolled). |
| `onConfirmedChange` | `(confirmed: boolean) => void` | — | Runs when the confirmed state changes. |
| `resetAfter` | `number` | — | Milliseconds after which a confirmed slider resets itself. Leave out to stay confirmed. |
| `threshold` | `number` | `0.9` | Share of the track, from 0 to 1, the thumb must cover for a release to count. |
| `disabled` | `boolean` | `false` | Turns the control off: it is dimmed and ignores pointer and keyboard input. |
| `className` | `string` | — | Extra class names for the root element. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No `ArrowButton` e no `MagneticButton`, acionam o botão; com `href` eles são links e respondem só a `Enter`. |
| `Enter` ou `Espaço` | No `SlideToConfirm`, com o foco no polegar, confirmam direto, sem arrastar. |

## Acessibilidade

- `ArrowButton` e `MagneticButton` são `<button>` nativos, ou `<a>` quando recebem `href`; no `ArrowButton`, a cópia colorida do rótulo fica em `aria-hidden`, e o nome é o texto dos filhos.
- No `SlideToConfirm`, o polegar é um botão com `aria-label` igual a `label` (depois, `confirmedLabel`); a ativação por teclado confirma sem arrastar, e um `role="status"` anuncia a confirmação.
- O texto do trilho é `aria-hidden` e os padrões estão em inglês (“Slide to confirm”, “Confirmed”): escreva em `label` a ação inteira, como “Deslize para pagar R$ 48”.

## Movimento

- `ArrowButton`: no hover, no foco por teclado ou na pressão, o disco da seta cresce até cobrir o botão (0,48 s), o rótulo muda de cor na borda do preenchimento e uma seta nova entra pela esquerda.
- `MagneticButton`: com o mouse a até `reach` px, o botão segue o cursor numa mola solta, com um leve balanço ao voltar, e o rótulo vai um pouco além; toque e caneta não movem nada.
- `SlideToConfirm`: as setas do polegar dão um empurrão a cada 1,8 s e soltar antes de `threshold` (90%) o devolve numa mola; com “reduzir movimento”, nada disso anima, o ímã para e o `ArrowButton` preenche sem transição.

## Comportamento responsivo

- O `SlideToConfirm` ocupa a largura do pai até `20rem` e mede o trilho com um observador, então o curso do polegar se ajusta; com `touch-action: pan-y`, a rolagem vertical continua funcionando sobre ele.
- No `ArrowButton`, o rótulo não quebra linha e termina em reticências quando falta espaço.

## Desempenho

- Cada `MagneticButton` escuta `pointermove` na janela inteira e mede a própria posição a cada movimento do mouse; use poucos por página.

## Notas para IA

- São três exportações do mesmo arquivo: `import ArrowButton, { MagneticButton, SlideToConfirm } from "@/components/ryan-ui/cta-buttons/cta-buttons"` (a padrão é o `ArrowButton`).
- No `SlideToConfirm`, a ação vai em `onConfirm`, que roda uma vez (um toque simples só balança o polegar); para controlar, use `confirmed` com `onConfirmedChange`, e `resetAfter` para voltar sozinho ao início.
- `ArrowButton` e `MagneticButton` viram links com `href`; o `ArrowButton` aceita `icon` no lugar da seta e `size` `md` ou `lg`, e o `MagneticButton` aceita `strength` (0 desliga o ímã) e `reach`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/cta-buttons · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
