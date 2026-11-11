# CTA section

> Chamada para ação como fecho centralizado, dividida ao lado de um cartão de configuração ou em faixa dispensável.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/cta-section
- Descrição original (inglês): A call to action as a centered closing section, a split beside a setup card that completes itself, or a dismissible banner.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cta-section.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cta-section.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cta-section.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cta-section.json`. Caminho do registro, relativo ao endereço do site: `r/cta-section.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Button](button.md), [Segmented control](segmented-control.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/cta-section/cta-section.tsx`
  - `components/ryan-ui/blocks/cta-section/cta-section-data.ts`
  - `components/ryan-ui/lib/media.ts`
  - `components/ryan-ui/blocks/cta-section/cta-section.module.css`
  - `components/ryan-ui/segmented-control/segmented-control.tsx`
  - `components/ryan-ui/segmented-control/segmented-control.module.css`
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/cta-section.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Fechamento de uma landing page com título, texto e duas ações, na variante `centered`, com rostos e uma nota curta como prova social.
- Chamada ao lado de uma demonstração do produto, na variante `split`, com lista de benefícios e um cartão de configuração que se completa ao entrar na tela (ou o seu `visual`).
- Aviso de lançamento numa linha só, na variante `banner`, que pode ser dispensado e fecha o espaço que ocupava.

## Quando não usar

- Use [`announcement-bar`](announcement-bar.md) para uma faixa no topo que alterna mensagens ou faz contagem regressiva.
- Use [`newsletter-signup`](newsletter-signup.md) quando a ação é deixar o e-mail.
- Use [`hero-section`](hero-section.md) para a abertura da página; esta seção é pensada para o meio ou o fim dela.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import CtaSectionBlock from "@/components/ryan-ui/blocks/cta-section/cta-section";

export default function CtaSectionDemo() {
  return <CtaSectionBlock />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CtaSection`

A call to action in three shapes: a centered closing section, a split layout beside a setup card that completes itself in view, and a compact banner that closes its gap when dismissed.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `"centered" \| "split" \| "banner"` | `"centered"` | `centered` is a closing section, `split` sits beside a product visual, `banner` is one dismissible line. |
| `title` | `string` | — | — |
| `description` | `string` | — | — |
| `primaryAction` | `CtaAction` | — | — |
| `secondaryAction` | `CtaAction \| null` | — | Not shown in the banner variant. Pass null to hide it. |
| `note` | `string` | — | Small print under the actions in the centered variant, such as "No credit card required". |
| `faces` | `string[]` | `ctaFaces` | Faces beside the note in the centered variant. Pass an empty array to hide them. |
| `points` | `string[]` | — | Short benefit lines in the split variant. |
| `visual` | `ReactNode` | — | Replaces the split variant's setup card. |
| `onDismiss` | `() => void` | — | Banner only: shows a dismiss button and calls this after it closes. |
| `className` | `string` | — | — |

### `CtaSectionBlock`

Preview: all three shapes. Buttons confirm in place; nothing is sent.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `CtaVariant` | `"centered" \| "split" \| "banner"` |

#### `CtaAction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `href` | `string` | Renders a link. |
| `onClick` | `() => void` | — |
| `confirmedLabel` | `string` | With no href or onClick, the button confirms in place with this label, which suits previews. |

### Outras exportações

- `ctaCopy` (valor)
- `ctaFaces` (função)
- `ctaSetup` (valor)

## Acessibilidade

- Cada variante é uma `section` nomeada pelo título (`h2` em `centered` e `split`, texto em negrito no `banner`); o botão de dispensar se chama “Dismiss” e só aparece com `onDismiss`.
- O cartão de configuração e os rostos são decorativos (`aria-hidden`); ações sem `href` nem `onClick` trocam o rótulo numa região `aria-live` quando clicadas.

## Movimento

- Em `split`, o palco sobe ao entrar na tela e o cartão marca as etapas uma a uma, a cada 0,6 s, enchendo a barra de progresso até “Ready”.
- No `banner`, dispensar fecha a altura com uma mola sem ultrapassagem e só então chama `onDismiss`; a seta das ações avança um pouco ao passar o mouse.
- Com “reduzir movimento” ligado, o cartão já aparece completo, o palco não sobe, o banner some sem fechar a altura aos poucos e as transições CSS são desligadas.

## Comportamento responsivo

- Container query: abaixo de 860px o `split` empilha o texto sobre o palco; abaixo de 560px as ações ocupam a largura, uma sobre a outra, e o `banner` vira um bloco com as ações embaixo.

## Notas para IA

- Importe `CtaSection` pelo nome (a exportação padrão é a prévia com seletor de variantes); todos os textos têm padrão de exemplo, então passe sempre `title`, `description` e `primaryAction`.
- Cada ação é `{ label, href?, onClick?, confirmedLabel? }`: com `href` vira link, com `onClick` chama a função e, sem os dois, só alterna o rótulo, o que serve para prévias e não para produção.
- No `banner`, o botão de fechar só existe se você passar `onDismiss`; `secondaryAction={null}` esconde a segunda ação e `faces={[]}` tira os rostos de `centered`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/cta-section · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
