# Newsletter signup

> Cadastro de newsletter em dois layouts, com confirmação e tratamento de erro.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/newsletter-signup
- Descrição original (inglês): An email signup framed by a stack of past issues; subscribing drops the next issue, addressed to you, onto the front.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/newsletter-signup.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/newsletter-signup.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/newsletter-signup.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/newsletter-signup.json`. Caminho do registro, relativo ao endereço do site: `r/newsletter-signup.json`.

- Pacotes npm: `@radix-ui/react-switch`, `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Animated counter](animated-counter.md), [Segmented control](segmented-control.md), [Switch](switch.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/newsletter-signup/newsletter-signup.tsx`
  - `components/ryan-ui/blocks/newsletter-signup/newsletter-signup-data.ts`
  - `components/ryan-ui/lib/media.ts`
  - `components/ryan-ui/blocks/newsletter-signup/newsletter-signup.module.css`
  - `components/ryan-ui/switch/switch.tsx`
  - `components/ryan-ui/switch/switch.module.css`
  - `components/ryan-ui/segmented-control/segmented-control.tsx`
  - `components/ryan-ui/segmented-control/segmented-control.module.css`
  - `components/ryan-ui/animated-counter/animated-counter.tsx`
  - `components/ryan-ui/animated-counter/animated-counter.module.css`
  - `components/ryan-ui/lib/ryan-provider.tsx`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-switch lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/newsletter-signup.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Seção de inscrição de newsletter numa landing page ou blog em que mostrar as edições anteriores ajuda a pessoa a decidir.
- Cartão independente de inscrição (`variant="card"`), por exemplo ao fim de um artigo.
- Formulário só de e-mail com validação e estados de envio, sem a pilha: passe `publication={null}` e `readers={null}`.

## Quando não usar

- Use [`site-footer`](site-footer.md) quando a inscrição é só um campo dentro do rodapé; a variante de colunas dele já traz um formulário de newsletter.
- Use [`contact-section`](contact-section.md) quando a pessoa precisa escrever uma mensagem, e [`signup-form`](signup-form.md) quando o objetivo é criar conta com senha.
- Sem edições reais para mostrar, a pilha vira enfeite com dados de exemplo; nesse caso esconda-a em vez de inventar conteúdo.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import NewsletterSignup from "@/components/ryan-ui/blocks/newsletter-signup/newsletter-signup";

export default function NewsletterSignupDemo() {
  return <NewsletterSignup />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `NewsletterSignup`

A newsletter signup framed by the newsletter itself: a stack of recent issues. Subscribing drops the next issue, addressed to the new reader, onto the front of the stack and ticks the reader count up by one. Comes as an inline page section or a self-contained card.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `"inline" \| "card"` | `"inline"` | `inline` puts the copy and form beside the issue stack; `card` is a self-contained card with the stack in a tray on top. |
| `title` | `string` | — | — |
| `description` | `string` | — | — |
| `placeholder` | `string` | `"you@company.com"` | — |
| `buttonLabel` | `string` | `"Subscribe"` | — |
| `privacyNote` | `ReactNode` | `newsletterCopy.privacy` | Short line under the form about frequency and privacy. |
| `privacyLink` | `{ label: string; href: string } \| null` | `newsletterCopy.privacyLink` | Link after the privacy note. Pass null to hide it. |
| `readers` | `{ count: number; faces: string[] } \| null` | `newsletterReaders` | Reader count and up to three faces. The count ticks up by one when someone subscribes. Pass null to hide it. |
| `publication` | `NewsletterPublication \| null` | `newsletterPublication` | The issue stack. On success the upcoming issue, addressed to the new reader, lands on top. Pass null for a form without the stack. |
| `onSubscribe` | `(email: string) => void \| Promise<void>` | — | Called with a valid, trimmed email. Reject to show an error and keep the email; resolve to show the success state. |
| `className` | `string` | — | — |

### `NewsletterSignupBlock`

Preview: both layouts. Subscribing is simulated and nothing is sent; the switch makes the next send fail.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `NewsletterVariant` | `"inline" \| "card"` |

#### `NewsletterStory`

One story teased in an issue. `image` is a small square-cropped thumbnail.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `title` (obrigatória) | `string` | — |
| `image` (obrigatória) | `string` | — |
| `minutes` (obrigatória) | `number` | — |

#### `NewsletterIssue`

One issue of the newsletter, as it appears on the stack.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `number` (obrigatória) | `number` | — |
| `date` (obrigatória) | `string` | Send date as it should read, such as "Friday, September 25". |
| `subject` (obrigatória) | `string` | — |
| `stories` (obrigatória) | `NewsletterStory[]` | Up to three stories. |

#### `NewsletterPublication`

The publication shown beside the form: the next issue lands on the stack of recent ones when someone subscribes.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` (obrigatória) | `string` | — |
| `upcoming` (obrigatória) | `NewsletterIssue` | The next issue. It is addressed to the new reader and joins the front of the stack on success. |
| `recent` (obrigatória) | `NewsletterIssue[]` | Recent issues, newest first. The first three make the stack. |

### Outras exportações

- `newsletterCopy` (valor)
- `newsletterPublication` (valor)
- `newsletterReaders` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` | No campo de e-mail, envia o formulário; com endereço inválido, o foco volta ao campo. |

## Acessibilidade

- O campo tem um `<label>` escondido visualmente (“Email address”), `aria-invalid` quando o endereço é inválido e `aria-describedby` apontando para a linha de mensagem.
- A linha de mensagem fica numa região `aria-live="polite"` e vira `role="alert"` em erro; ao concluir, o foco vai para “Use a different email” e, ao reiniciar, volta ao campo.
- Só a edição da frente da pilha é exposta ao leitor de tela, com `aria-label`; as de trás ficam com `aria-hidden` e as fotos dos leitores têm `alt` vazio.

## Movimento

- Ao inscrever, a próxima edição sobe de baixo, endereçada ao e-mail digitado, e pousa na frente da pilha; as anteriores recuam um degrau numa mola sem ultrapassagem e a mais antiga sai.
- O rótulo do botão troca no lugar entre enviar, enviando e inscrito (com um visto desenhado), a contagem de leitores sobe um e um erro sacode o campo de lado uma vez.
- Com “reduzir movimento” ligado, as edições assumem o lugar na hora e só esmaecem, não há sacudida nem desenho do visto, e o indicador de envio gira mais devagar.

## Comportamento responsivo

- Container queries do bloco: até 860 px a variante `inline` empilha texto e pilha; até 520 px e 400 px os espaçamentos encolhem e os minutos de leitura somem.
- O formulário tem contêiner próprio: até 300 px, campo e botão se separam e empilham em largura total; a linha de mensagem reserva a altura da frase mais longa, então nada abaixo se move.

## Desempenho

- As miniaturas e os rostos passam por `RyanImage`, que carrega sob demanda por padrão; uma cópia invisível da próxima edição fica no DOM só para reservar a altura da pilha.

## Notas para IA

- Importe o componente nomeado `NewsletterSignup`; o export padrão é `NewsletterSignupBlock`, o preview com troca de layout e um interruptor que simula falha.
- Passe `onSubscribe(email)` devolvendo uma Promise: rejeitar mostra o erro e mantém o e-mail, resolver mostra o sucesso; sem essa prop o bloco só espera 1,1 s e finge que deu certo.
- `publication` (nome, `upcoming` e `recent`) e `readers` vêm com dados de exemplo de `newsletter-signup-data.ts`; troque pelos seus ou passe `null`, e saiba que as mensagens de validação estão fixas em inglês.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/newsletter-signup · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
