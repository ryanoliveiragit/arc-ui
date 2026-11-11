# Feedback widget

> Botão flutuante de feedback que vira um formulário com humor e mensagem, passa pelo envio e termina num agradecimento.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/feedback-widget
- Descrição original (inglês): A floating feedback button that morphs into a small form with a mood picker and a message field, then walks through sending into a drawn check and a thank-you.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/feedback-widget.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/feedback-widget.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/feedback-widget.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/feedback-widget.json`. Caminho do registro, relativo ao endereço do site: `r/feedback-widget.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/feedback-widget/feedback-widget.tsx`
  - `components/ryan-ui/blocks/feedback-widget/feedback-widget.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/feedback-widget.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Coletar uma opinião rápida em qualquer página (central de ajuda, artigo, painel) com um botão fixo no canto que não tira a pessoa do que estava fazendo.
- Pesquisas de satisfação de um clique, com cinco rostos e uma mensagem opcional.

## Quando não usar

- Use [`contact-section`](contact-section.md) quando a mensagem precisa de nome, e-mail e assunto para receber resposta.
- Use [`rating`](rating.md) para uma nota dentro de um formulário.
- Evite com outro botão flutuante no mesmo canto, como um chat de suporte: o widget fica fixo no canto inferior, numa camada alta (`z-index: 50`), e os dois disputariam o lugar.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import FeedbackWidgetPreview from "@/components/ryan-ui/blocks/feedback-widget/feedback-widget";

export default function FeedbackWidgetDemo() {
  return <FeedbackWidgetPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `FeedbackWidget`

A floating feedback button that grows into a small form, from its own corner, on a layout spring. Pick a mood (the highlight glides between faces), add a note, and the button walks through sending into a drawn check and a thank-you. Escape or a click outside closes it and returns focus to the button.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | `"Feedback"` | Text on the floating button. |
| `title` | `string` | `"How is it going?"` | Heading of the form. |
| `placeholder` | `string` | `"Tell us what happened (optional)"` | Placeholder of the message field. |
| `thanksTitle` | `string` | `"Thank you"` | Heading of the thank-you state. |
| `thanksMessage` | `string` | `"Your feedback goes straight to the team."` | Line under the thank-you heading. |
| `onSubmit` | `(feedback: Feedback) => void \| Promise<void>` | — | Receives the feedback. Return a promise to hold the sending state until it settles; reject it to show an error and keep the form. |
| `open` | `boolean` | — | Whether the form is open (controlled). |
| `defaultOpen` | `boolean` | `false` | Whether the form starts open (uncontrolled). |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the form opens or closes. |
| `placement` | `"bottom-right" \| "bottom-left"` | `"bottom-right"` | Corner the widget sits in. |
| `contained` | `boolean` | `false` | Pins the widget inside the nearest positioned ancestor instead of the window, for panels and previews. |
| `className` | `string` | — | Extra class for the root. |

### `FeedbackWidgetPreview`

Ready preview: a help article with the widget in its corner.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `FeedbackMood` | `"terrible" \| "bad" \| "okay" \| "good" \| "great"` |

#### `Feedback`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `mood` (obrigatória) | `"terrible" \| "bad" \| "okay" \| "good" \| "great"` | The mood that was picked. |
| `message` (obrigatória) | `string` | The optional message, trimmed. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No botão “Feedback”, abrem o formulário e levam o foco ao primeiro rosto. |
| `↑` ou `↓` ou `←` ou `→` | No grupo de rostos, escolhem o anterior ou o próximo, dando a volta; sem escolha, `→` e `↓` começam no primeiro e `←` e `↑` no último. |
| `Ctrl + Enter` ou `⌘ + Enter` | No campo de mensagem, enviam o formulário, desde que um rosto tenha sido escolhido. |
| `Esc` | Fecha o formulário e devolve o foco ao botão, exceto durante o envio. |

## Acessibilidade

- O botão tem `aria-haspopup="dialog"`; o painel é um `role="dialog"` nomeado pelo título, mas não modal: o foco não fica preso, e Esc ou um clique fora fecham e devolvem o foco ao botão.
- Os rostos formam um `radiogroup` com foco itinerante e nomes (de “Terrible” a “Great”), e o nome do rosto escolhido é anunciado numa região `aria-live`.
- O envio expõe `aria-busy`, a falha aparece em `role="alert"` e o agradecimento em `role="status"`; o campo de mensagem tem o rótulo oculto “Your feedback”.

## Movimento

- O próprio botão se transforma no painel, a partir do seu canto, numa mola de layout sem ultrapassagem, e o conteúdo surge aos poucos logo depois.
- O destaque desliza até o rosto escolhido, que cresce e gira um pouco; ao concluir, o selo aparece com um quique, o visto se desenha e o painel fecha sozinho após 2,6 s.
- Com “reduzir movimento” ligado, o painel abre e fecha na hora, sem morph nem giro, e o indicador de envio fica parado.

## Comportamento responsivo

- Fica fixo na janela (`position: fixed`) no canto escolhido por `placement`; com `contained`, prende-se ao ancestral posicionado mais próximo, como num painel ou numa prévia.
- O painel tem 21rem de largura, limitado ao espaço disponível; em telas de até 30rem, a distância até as bordas diminui.

## Notas para IA

- Importe `FeedbackWidget` pelo nome (a exportação padrão é a prévia com um artigo de ajuda) e monte-o uma vez no layout da página: ele se fixa sozinho no canto.
- `onSubmit` recebe `{ mood, message }`, com a mensagem já aparada: devolva uma promessa para segurar o estado de envio e rejeite-a para mostrar o erro e manter o formulário.
- Os nomes dos rostos e os textos de falha, de envio e de “Close” estão fixos em inglês; `label`, `title`, `placeholder`, `thanksTitle` e `thanksMessage` vêm por props.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/feedback-widget · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
