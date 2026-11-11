# Accordion

> Revela informações de apoio no próprio lugar, uma seção por vez.

- Tipo: componente (categoria Revelação)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/accordion
- Descrição original (inglês): Progressively reveal supporting information in place.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/accordion.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/accordion.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/accordion.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/accordion.json`. Caminho do registro, relativo ao endereço do site: `r/accordion.json`.

- Pacotes npm: `@radix-ui/react-accordion`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/accordion/accordion.tsx`
  - `components/ryan-ui/accordion/accordion.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-accordion lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/accordion.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Perguntas frequentes numa página de preço ou de ajuda, com `size="lg"` para perguntas em texto grande e respostas em corpo de leitura.
- Informação de apoio que só interessa a parte das pessoas, como detalhes de cobrança ou de privacidade, sem tirar ninguém da página.
- Listas em que só uma resposta precisa ficar aberta: abrir um item fecha o anterior, e clicar no item aberto o fecha.

## Quando não usar

- Use [`bouncy-accordion`](bouncy-accordion.md) quando precisar de vários itens abertos ao mesmo tempo ou de estado controlado; este acordeão só tem `defaultOpen`.
- Use [`collapsible`](collapsible.md) para uma única região que abre e fecha ao lado do próprio título.
- Use [`faq-section`](faq-section.md) quando a página precisa de uma seção inteira de perguntas, com tópicos ou busca.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import Accordion from "@/components/ryan-ui/accordion/accordion";
import { Stack } from "./_kit";

const faqs = [
  { title: "Can I change my plan later?", content: "Yes. Upgrade or downgrade at any time from Billing. Changes apply immediately and we prorate the difference on your next invoice." },
  { title: "How does the free trial work?", content: "You get 14 days of every feature with no card required. If you do not subscribe, your workspace becomes read-only until you do." },
  { title: "Who can see my data?", content: "Only the members you invite. Data is encrypted at rest and in transit, and our staff access it only with your written permission." },
  { title: "Do you offer refunds?", content: "Annual plans are refundable within 30 days of purchase. Monthly plans can be cancelled at any time without a further charge." },
];

export default function AccordionDemo() {
  return <Stack width={520}><Accordion items={faqs} defaultOpen={0} /></Stack>;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Accordion`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` (obrigatória) | `AccordionItem[]` | — | — |
| `defaultOpen` | `number` | `0` | — |
| `size` | `"md" \| "lg"` | `"md"` | "lg" suits page-level FAQs: questions at the large text size, answers at body size. |

### Tipos exportados

#### `AccordionItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `title` (obrigatória) | `string` | — |
| `content` (obrigatória) | `ReactNode` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Abre o item em foco e fecha o que estava aberto; no item já aberto, fecha. |
| `↓` ou `↑` | Move o foco para o título seguinte ou anterior, voltando ao primeiro depois do último. |
| `Home` ou `End` | Leva o foco ao primeiro ou ao último título. |

## Acessibilidade

- Construído sobre o Accordion do Radix: cada título é um `<button>` dentro de um `<h3>`, com `aria-expanded` e `aria-controls`, e cada painel é uma `region` ligada ao seu título.
- Ao terminar de recolher, o painel recebe `visibility: hidden` e sai da ordem de Tab e da árvore de acessibilidade; o leitor de tela só encontra a resposta aberta.
- O nível do título é fixo em `<h3>`; se a hierarquia da página pede outro nível, use `bouncy-accordion`, que aceita `headingLevel`.

## Movimento

- A altura do painel acompanha o conteúdo numa mola sem ultrapassagem, e a resposta desce 6 px saindo de um leve desfoque enquanto aparece.
- A seta gira 180° numa mola curta; trocar de item no meio da animação redireciona a altura em vez de recomeçar.
- Com “reduzir movimento” ligado, painéis e seta vão direto ao estado final, sem animação.

## Comportamento responsivo

- No tamanho `lg`, abaixo de 520 px a altura mínima do título cai de 76 para 68 px e as fontes descem um degrau.

## Notas para IA

- O primeiro item já começa aberto (`defaultOpen` vale 0); passe `defaultOpen={-1}` para começar com tudo fechado.
- Os itens são `{ title, content }`: `title` é texto simples e `content` aceita qualquer nó React; não há `value` nem `onValueChange`.
- Importe de `@/components/ryan-ui/accordion/accordion`; ele ocupa 100% da largura, então limite a largura no pai (o demo usa 520 px).

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/accordion · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
