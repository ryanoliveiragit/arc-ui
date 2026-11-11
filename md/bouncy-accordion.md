# Bouncy accordion

> Acordeão em que o item aberto se solta dos vizinhos: o espaço cresce e os cantos arredondam com um leve quique.

- Tipo: componente (categoria Revelação), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/bouncy-accordion
- Descrição original (inglês): An accordion whose open item detaches from its neighbors: the gaps widen and the facing corners round off with a small bounce.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bouncy-accordion.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bouncy-accordion.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bouncy-accordion.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bouncy-accordion.json`. Caminho do registro, relativo ao endereço do site: `r/bouncy-accordion.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/bouncy-accordion/bouncy-accordion.tsx`
  - `components/ryan-ui/bouncy-accordion/bouncy-accordion.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/bouncy-accordion.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Perguntas frequentes de uma landing page em que o item aberto deve se destacar do bloco, com um ícone antes de cada pergunta.
- Listas em que várias respostas podem ficar abertas ao mesmo tempo, com `multiple`.
- Acordeões cujo estado vem de fora, como da URL ou de um formulário, com `value` e `onValueChange`.

## Quando não usar

- Use [`accordion`](accordion.md) em páginas densas ou documentação, onde separadores finos e menos movimento combinam melhor.
- Use [`collapsible`](collapsible.md) para uma única região que abre e fecha.
- Use [`faq-section`](faq-section.md) quando precisar da seção de perguntas inteira, com tópicos ou busca.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { CreditCard, RefreshCcw, ShieldCheck, Users } from "lucide-react";
import { BouncyAccordion } from "@/components/ryan-ui/bouncy-accordion/bouncy-accordion";
import type { BouncyAccordionItem } from "@/components/ryan-ui/bouncy-accordion/bouncy-accordion";
import Switch from "@/components/ryan-ui/switch/switch";
import { Stack } from "./_kit";

const questions: BouncyAccordionItem[] = [
  { value: "seats", icon: <Users size={17} />, title: "Can I change the number of seats later?", content: "Yes. Add or remove seats at any time from Billing. New seats are charged for the days left in the cycle, and removed seats turn into credit on your next invoice." },
  { value: "billing", icon: <CreditCard size={17} />, title: "Which payment methods do you accept?", content: "All major credit and debit cards. Annual plans above 20 seats can also pay by bank transfer with a 30 day invoice." },
  { value: "refunds", icon: <RefreshCcw size={17} />, title: "What is your refund policy?", content: "Monthly plans can be cancelled whenever you like and stay active until the end of the period. Annual plans are refunded in full during the first 30 days." },
  { value: "security", icon: <ShieldCheck size={17} />, title: "Where is my data stored?", content: "In the region you choose when you create the workspace: Frankfurt, Virginia or São Paulo. Backups are encrypted and stay in the same region." },
];

export default function BouncyAccordionDemo() {
  const [open, setOpen] = useState<string[]>(["billing"]);
  const [multiple, setMultiple] = useState(false);
  return (
    <Stack gap={5} width={480}>
      <BouncyAccordion items={questions} value={open} onValueChange={setOpen} multiple={multiple} />
      <Switch label="Keep several answers open" checked={multiple} onCheckedChange={next => { setMultiple(next); if (!next) setOpen(current => current.slice(-1)); }} />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `BouncyAccordion`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` (obrigatória) | `BouncyAccordionItem[]` | — | The sections, in order. |
| `value` | `string[]` | — | Values of the open items (controlled). |
| `defaultValue` | `string[]` | — | Values of the items open at first when uncontrolled. |
| `onValueChange` | `(value: string[]) => void` | — | Called with the values of the open items after each change. |
| `multiple` | `boolean` | `false` | Lets several items stay open. By default opening one closes the others. |
| `gap` | `number` | `12` | Gap in px around an open item. Closed neighbors sit 3 px apart. |
| `radius` | `number` | `22` | Corner radius in px of the block's outer corners and of every corner that faces an open gap. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | Heading level that wraps each trigger, to fit the page outline. |
| `className` | `string` | — | Extra class for the root element. |

### Tipos exportados

#### `BouncyAccordionItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | Unique id of the item; this is what `value` and `onValueChange` carry. |
| `title` (obrigatória) | `ReactNode` | The question or section name shown on the trigger. |
| `content` (obrigatória) | `ReactNode` | The content revealed when the item opens. |
| `icon` | `ReactNode` | Optional leading icon. |
| `disabled` | `boolean` | Keeps the item closed and skips it during keyboard navigation. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Abre ou fecha o item em foco; sem `multiple`, abrir um fecha os outros. |
| `↓` ou `↑` | Move o foco para o título seguinte ou anterior, pulando os desativados e voltando ao primeiro depois do último. |
| `Home` ou `End` | Leva o foco ao primeiro ou ao último título ativo. |

## Acessibilidade

- Cada título é um `<button>` dentro de um cabeçalho de nível `headingLevel` (padrão 3), com `aria-expanded` e `aria-controls`; o painel é uma `region` ligada ao título.
- Ao terminar de fechar, o painel recebe `visibility: hidden` e sai da ordem de Tab e da árvore de acessibilidade; ícone e sinal de mais ficam ocultos para o leitor de tela.
- Itens com `disabled` usam o `disabled` nativo do botão e são pulados pelas setas.

## Movimento

- O item aberto se solta dos vizinhos: as margens crescem de 3 px até `gap` e os cantos voltados para o espaço arredondam até `radius`, numa mola com um pequeno quique.
- A altura abre com o mesmo quique e fecha numa mola sem ultrapassagem; o conteúdo desce 10 px enquanto aparece e o sinal de mais gira 135° até virar um x.
- Com “reduzir movimento” ligado, margens, cantos, altura e ícone mudam na hora, e o aumento do botão ao passar o mouse é desligado.

## Notas para IA

- `value` é sempre uma lista de strings, mesmo sem `multiple`, e `onValueChange` recebe a lista inteira; todos começam fechados (`defaultValue` é `[]`).
- Ao desligar `multiple` com estado controlado, corte a lista você mesmo, como o demo faz com `current.slice(-1)`; o componente não faz isso.
- Cada item precisa de `value` único; `title` aceita qualquer nó React e `icon` é opcional. Importe de `@/components/ryan-ui/bouncy-accordion/bouncy-accordion`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/bouncy-accordion · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
