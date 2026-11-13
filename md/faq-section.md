# FAQ section

> Perguntas frequentes em acordeão, por categoria ou com busca, com um caminho para falar com alguém.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/faq-section
- Descrição original (inglês): FAQs as an accordion, a topic rail, or a searchable list that highlights matches.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/faq-section.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/faq-section.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/faq-section.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/faq-section.json`. Caminho do registro, relativo ao endereço do site: `r/faq-section.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Search field](search-field.md), [Segmented control](segmented-control.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/faq-section/faq-section.tsx`
  - `components/ryan-ui/blocks/faq-section/faq-section.module.css`
  - `components/ryan-ui/segmented-control/segmented-control.tsx`
  - `components/ryan-ui/segmented-control/segmented-control.module.css`
  - `components/ryan-ui/search-field/search-field.tsx`
  - `components/ryan-ui/search-field/search-field.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/faq-section.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Seção de perguntas frequentes numa página de produto ou de preços, com respostas que abrem no lugar, na variante `accordion`.
- Muitas perguntas agrupadas por tema, na variante `columns`, com um trilho de categorias que fica fixo ao lado durante a rolagem.
- Centrais de ajuda em que a pessoa procura por palavra: a variante `search` filtra perguntas e respostas, ignora acentos e destaca o trecho encontrado.

## Quando não usar

- Use [`accordion`](accordion.md) para revelar seções de qualquer conteúdo, e não só perguntas com respostas em texto.
- Evite quando as respostas precisam de links, listas ou formatação: `answer` é texto puro, porque também é o que a busca compara e destaca.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import FaqSectionBlock from "@/components/ryan-ui/blocks/faq-section/faq-section";
import type { DemoStage } from "./_kit";

// O canvas do site encolhe ao conteúdo e pinta ~12px a menos que o rect de layout (base cortada antes da borda):
// medido na ref de 11/12, a faixa pintada é 774×1085 com respiro de 14. O palco reproduz isso: iframe de 1083
// (= 1085 menos as duas bordas do painel), respiro 14 e cor de canvas; o excesso dos últimos px do respiro
// transborda a viewport do iframe e some, exatamente como a pintura do site corta.
export const stage: DemoStage = { height: 1083 };

export default function FaqSectionDemo() {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: 14, background: "var(--surface-muted)" }}>
      <FaqSectionBlock />
    </div>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `FaqSection`

A frequently asked questions section in three layouts: one centered accordion, a category rail beside its questions, and a searchable list that filters and highlights as you type. Answers open on a height spring with the icon turning to a close mark; arrow keys move between questions.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `"accordion" \| "columns" \| "search"` | `"accordion"` | `accordion` is one centered list, `columns` groups questions beside a category rail, `search` filters as you type. |
| `title` | `string` | `"Frequently asked questions"` | — |
| `description` | `string` | `"Everything you need to know before you insta…` | — |
| `items` | `FaqItem[]` | `faqExampleItems` | — |
| `multiple` | `boolean` | `false` | Allow several answers open at once. Defaults to false. |
| `value` | `string[]` | — | Open item ids (controlled). |
| `defaultValue` | `string[]` | — | Initially open item ids when uncontrolled. |
| `onValueChange` | `(value: string[]) => void` | — | — |
| `category` | `string` | — | Active category in the columns variant (controlled). |
| `onCategoryChange` | `(category: string) => void` | — | — |
| `query` | `string` | — | Search text in the search variant (controlled). |
| `onQueryChange` | `(query: string) => void` | — | — |
| `contact` | `{ label: string; description?: string; href?: string; onClick?: () => void } \| null` | `{ label: "Still have a question?", descriptio…` | A way to reach a person when the answer isn't here. Pass null to hide it. |
| `className` | `string` | — | — |

### `FaqSectionBlock`

Preview: the FAQ with a switch between its three layouts.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `FaqSectionVariant` | `"accordion" \| "columns" \| "search"` |

#### `FaqItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | `string` | Stable id used for open state. Defaults to the question. |
| `question` (obrigatória) | `string` | — |
| `answer` (obrigatória) | `string` | Plain text answer; it is also what search matches. |
| `category` | `string` | Groups questions in the columns variant. |

### Outras exportações

- `faqExampleItems` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Movem o foco para a pergunta anterior ou a próxima da mesma lista, dando a volta. |
| `Home` ou `End` | Focam a primeira ou a última pergunta da lista. |
| `Enter` ou `Espaço` | Abrem ou fecham a resposta da pergunta em foco; nas categorias de `columns`, trocam o tema. |

## Acessibilidade

- Cada pergunta é um botão dentro de um `h3`, com `aria-expanded` e `aria-controls`, e a resposta é uma `region` nomeada pela própria pergunta.
- Na busca, a contagem de respostas encontradas é anunciada numa região `aria-live`; nas categorias, o tema ativo usa `aria-pressed`.
- `title` vira o `h2` que nomeia a seção; o cartão de contato do fim é um link quando recebe `href` e um botão nos outros casos.

## Movimento

- A resposta abre com a altura numa mola sem ultrapassagem e o texto desce de um leve desfoque, enquanto o sinal de mais gira 45° e vira um x.
- Na busca, as perguntas que deixam de bater fecham a altura e as restantes deslizam; em `columns`, a lista do novo tema entra no sentido da troca e o realce desliza até ele.
- Com “reduzir movimento” ligado, respostas, filtros e temas trocam na hora e o ícone não anima.

## Comportamento responsivo

- Container query: abaixo de 760px o trilho de `columns` deixa de ficar fixo e as categorias viram uma fileira que rola na horizontal, acima das perguntas.

## Notas para IA

- Importe `FaqSection` pelo nome (a exportação padrão é a prévia com seletor) e escolha `variant`: `accordion`, `columns` ou `search`; `search-field` e `segmented-control` vêm junto.
- Por padrão a primeira pergunta abre e só uma fica aberta por vez: use `multiple` para várias e `defaultValue={[]}` para começar fechado; o id de cada item é `id` ou, sem ele, a pergunta.
- Em `columns`, dê `category` a cada item (sem ela, vira “General”); `contact={null}` remove o cartão “Still have a question?”, que sem `href` nem `onClick` não faz nada.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/faq-section · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
