# Site footer

> Rodapé de site em três layouts, com colunas de links, redes sociais, newsletter e status.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/site-footer
- Descrição original (inglês): A website footer with link columns and newsletter, a minimal layout, and a large fading logo mark.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/site-footer.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/site-footer.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/site-footer.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/site-footer.json`. Caminho do registro, relativo ao endereço do site: `r/site-footer.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Button](button.md), [Segmented control](segmented-control.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/site-footer/site-footer.tsx`
  - `components/ryan-ui/blocks/site-footer/site-footer.module.css`
  - `components/ryan-ui/segmented-control/segmented-control.tsx`
  - `components/ryan-ui/segmented-control/segmented-control.module.css`
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/site-footer.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Rodapé de site de produto ou documentação com colunas de links, inscrição de newsletter, links legais, redes sociais e um link de status do sistema.
- Rodapé discreto de duas linhas (`variant="minimal"`) para páginas em que as colunas seriam excesso.
- Fechar uma landing do próprio ryan-ui com a marca grande em degradê (`variant="logo"`).

## Quando não usar

- Use [`newsletter-signup`](newsletter-signup.md) quando a inscrição é a chamada principal da seção, com a pilha de edições e a contagem de leitores.
- Use [`cta-section`](cta-section.md) para fechar a página com uma chamada para ação em vez de navegação.
- A variante `variant="logo"` só serve para a marca do ryan-ui: o arco grande está desenhado no arquivo e `brand.mark` troca apenas o ícone pequeno.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import SiteFooter from "@/components/ryan-ui/blocks/site-footer/site-footer";
import type { DemoStage } from "./_kit";

// Mesma regra do faq-section: a faixa pintada do canvas do site mede 774×612 com respiro de 14;
// o iframe fica em 610 (= 612 − 2 bordas) e o excesso do respiro inferior corta na viewport.
export const stage: DemoStage = { height: 610 };

export default function SiteFooterDemo() {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: 14, background: "var(--surface-muted)" }}>
      <SiteFooter />
    </div>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SiteFooter`

A website footer in three layouts: link columns with a newsletter signup, a single quiet row, and a closing variant where the ryan-ui arch rises in, oversized and cropped by the bottom edge, fading into the page.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `"columns" \| "minimal" \| "logo"` | `"columns"` | `columns` pairs a newsletter with link columns, `minimal` is one quiet row, `logo` ends in a large fading ryan-ui mark. |
| `brand` | `{ name: string; href?: string; mark?: ReactNode }` | `{ name: "ryan-ui" }` | — |
| `tagline` | `string` | `"Interface components that move with intent."` | One short line under the brand. |
| `columns` | `SiteFooterColumn[]` | `siteFooterExampleColumns` | — |
| `links` | `SiteFooterLink[]` | — | Links for the minimal variant. Defaults to the first link of each column. |
| `legal` | `SiteFooterLink[]` | `exampleLegal` | Small links beside the copyright, such as Privacy and Terms. |
| `socials` | `SiteFooterLink[]` | `exampleSocials` | — |
| `newsletter` | `SiteFooterNewsletter \| null` | `{ title: "Get the monthly release notes", des…` | Newsletter signup. Pass null to hide it. |
| `status` | `{ label: string; tone?: "success" \| "warning" \| "danger"; href?: string } \| null` | `{ label: "All systems normal", tone: "success" }` | A system status link. Pass null to hide it. |
| `year` | `number` | `new Date().getFullYear()` | Year in the copyright line. |
| `onNavigate` | `(link: SiteFooterLink) => void` | — | Called for every link that is pressed. Links without an href render as buttons and only call this. |
| `className` | `string` | — | — |

### `SiteFooterBlock`

Preview: the footer with a switch between its three layouts and a note of the last link pressed.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `SiteFooterVariant` | `"columns" \| "minimal" \| "logo"` |

#### `SiteFooterLink`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `href` | `string` | — |
| `external` | `boolean` | Opens in a new tab and shows an outward arrow. |

#### `SiteFooterColumn`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `title` (obrigatória) | `string` | — |
| `links` (obrigatória) | `SiteFooterLink[]` | — |

#### `SiteFooterNewsletter`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `title` | `string` | — |
| `description` | `string` | — |
| `placeholder` | `string` | — |
| `onSubscribe` | `(email: string) => void \| Promise<void>` | Called with a valid address. Throw or reject to show an error; resolve to show the subscribed state. |

### Outras exportações

- `siteFooterExampleColumns` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` | No campo da newsletter, envia a inscrição; vazio ou inválido, o erro aparece ali mesmo. |

## Acessibilidade

- As colunas ficam num `<nav aria-label="Footer">` com cada título em `<h2>`, as listas legal e social têm `aria-label` e links sem `href` viram `<button>`.
- O campo da newsletter tem rótulo escondido, `aria-invalid` e `aria-describedby` para a linha de mensagem, que é `aria-live="polite"` e vira `role="alert"` em erro.
- Links `external` abrem em nova aba com `rel="noopener noreferrer"`, mas o aviso é só a seta com `aria-hidden`; se importar, inclua “nova aba” no `label`.

## Movimento

- Na variante `logo`, o arco grande sobe 40 px e aparece em 0,9 s na primeira vez que 30% dele entra na tela, cortado pela borda de baixo e esmaecendo no degradê da marca.
- A linha da newsletter troca no lugar entre dica, erro e confirmação, subindo de um leve desfoque, e a seta dos links externos se desloca no hover.
- Com “reduzir movimento” ligado, o arco aparece pronto, as mensagens trocam na hora e as transições dos links e do campo são removidas.

## Comportamento responsivo

- Container queries do rodapé: até 760 px a marca e a newsletter empilham sobre as colunas; até 520 px as colunas passam para duas, a newsletter ocupa a largura toda e a linha de baixo empilha.

## Notas para IA

- Importe o componente nomeado `SiteFooter`; o export padrão é `SiteFooterBlock`, o preview com troca de layout, e todas as props têm valores de exemplo do ryan-ui para você substituir.
- Passe `columns`, `legal` e `socials` com `href`, porque sem ele os links viram botões que só chamam `onNavigate`; `newsletter={null}` e `status={null}` escondem essas partes.
- `newsletter.onSubscribe(email)` pode devolver uma Promise: rejeitar mostra o erro e resolver mostra “Subscribed”; sem a função, o bloco espera 0,9 s e finge sucesso.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/site-footer · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
