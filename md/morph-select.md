# Morph select

> Um select cujo gatilho cresce até virar a lista, com destaque deslizante e busca por digitação.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/morph-select
- Descrição original (inglês): A select whose trigger grows into the list, with a gliding highlight and type-ahead.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morph-select.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morph-select.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morph-select.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morph-select.json`. Caminho do registro, relativo ao endereço do site: `r/morph-select.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/morph-select/morph-select.tsx`
  - `components/ryan-ui/morph-select/morph-select.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/morph-select.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Seletores compactos de propriedade em barras e painéis, como responsável, status ou prioridade, em que o gatilho ocupa só a largura do rótulo escolhido.
- Opções que pedem ícone ou avatar e um detalhe à direita (`icon`, `meta`), separadas em grupos com título.
- Listas de até algumas centenas de opções: acima de oito, um campo de busca toma o lugar do gatilho ao abrir (`searchable="auto"`), e nas menores há busca por letra.

## Quando não usar

- Use [`select`](select.md) em formulários com campos alinhados: aqui o gatilho muda de largura com o rótulo escolhido, e não há `description` nem estado de erro.
- Use [`multi-select`](multi-select.md) quando a pessoa pode escolher vários valores.
- Use [`combobox`](combobox.md) quando digitar é o caminho principal e o campo deve parecer um campo de texto desde o início.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import MorphSelect from "@/components/ryan-ui/morph-select/morph-select";
import { avatar } from "@/components/ryan-ui/lib/media";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const img = (id: Parameters<typeof avatar>[0]) => <img src={avatar(id)} alt="" width={20} height={20} style={{ borderRadius: "50%" }} />;

const items = [
  { label: "Design", options: [
    { value: "emma", label: "Emma Collins", meta: "Designer", icon: img("emma-collins") },
    { value: "jasmine", label: "Jasmine Brooks", meta: "Lead", icon: img("jasmine-brooks") },
  ] },
  { label: "Engineering", options: [
    { value: "marcus", label: "Marcus Johnson", meta: "Frontend", icon: img("marcus-johnson") },
    { value: "olivia", label: "Olivia Bennett", meta: "Platform", icon: img("olivia-bennett") },
    { value: "daniel", label: "Daniel Kim", meta: "Backend", icon: img("daniel-kim") },
  ] },
];

export default function MorphSelectDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Stack gap={3} width={300}>
      <MorphSelect label="Assignee" items={items} value={value} onValueChange={(v) => setValue(v)} placeholder="Choose a teammate" />
      <Caption>Open it, glide with the arrows, or type a name to jump.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `MorphSelect`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | Visible label, also the accessible name of the trigger and the list. |
| `hideLabel` | `boolean` | `false` | Keeps the label for assistive technology only. |
| `items` (obrigatória) | `MorphSelectItem[]` | — | — |
| `value` | `string \| null` | — | — |
| `defaultValue` | `string \| null` | `null` | — |
| `onValueChange` | `(value: string, option: MorphSelectOption) => void` | — | — |
| `placeholder` | `string` | `"Select"` | — |
| `searchable` | `boolean \| "auto"` | `"auto"` | Shows a search field in place of the trigger when open. "auto" turns it on above eight options. |
| `searchPlaceholder` | `string` | — | — |
| `panelWidth` | `number` | `272` | Width of the open surface in px. It never gets narrower than the trigger. Defaults to 272. |
| `maxListHeight` | `number` | `296` | Tallest the option list gets before it scrolls, in px. Defaults to 296. |
| `align` | `"start" \| "end"` | `"start"` | Which edge of the trigger stays put while the surface grows. |
| `name` | `string` | — | Adds a hidden input for native form submission. |
| `disabled` | `boolean` | `false` | — |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `MorphSelectItem` | `MorphSelectOption \| MorphSelectGroup` |

#### `MorphSelectOption`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `icon` | `ReactNode` | A 20px mark shown before the label, in the list and in the trigger. An avatar or a plain icon. |
| `meta` | `string` | Short trailing detail such as an offset or a count. Rendered with tabular numerals. |
| `keywords` | `string` | Extra words that match this option when searching. |
| `disabled` | `boolean` | — |

#### `MorphSelectGroup`

A labelled run of options.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `options` (obrigatória) | `MorphSelectOption[]` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` ou `↓` ou `↑` | Com a lista fechada, abrem-na com o destaque na opção escolhida, ou na primeira; uma letra também abre, já filtrando a busca por ela ou, sem busca, na opção que começa por ela. |
| `↓` ou `↑` | Com a lista aberta, movem o destaque uma opção, parando nas pontas; sem campo de busca, letras levam à próxima opção com aquela inicial. |
| `Page Down` ou `Page Up` | Movem o destaque oito opções. |
| `Home` ou `End` | Levam o destaque à primeira ou à última opção habilitada, abrindo a lista se preciso; no campo de busca com texto, movem o cursor. |
| `Enter` ou `Espaço` | Com a lista aberta, escolhem a opção em destaque e devolvem o foco ao gatilho; no campo de busca só `Enter` escolhe, e `Alt + ↑` também serve. |
| `Esc` | Fecha sem mudar a escolha e devolve o foco ao gatilho; `Tab` também fecha e segue para o próximo controle. |

## Acessibilidade

- O gatilho é um `<button role="combobox">` ligado ao `label` visível, com `aria-expanded`, `aria-controls` e `aria-activedescendant`: sem busca, o foco fica nele enquanto o destaque percorre a lista.
- Com busca, o foco vai para o campo, que assume o papel de `combobox`, e uma região `role="status"` anuncia quantas opções combinam; os grupos são `role="group"` e as opções têm `aria-selected` e `aria-disabled`.
- `placeholder` e `searchPlaceholder` trocam os textos de vazio, mas o nome da busca (`Search …`), o do botão de fechar (`Close …`), a contagem e o aviso sem resultados são fixos em inglês.

## Movimento

- O próprio gatilho cresce até virar a lista: largura, altura e cantos seguem uma mola, e as opções aparecem logo atrás da borda; ao fechar, a superfície encolhe de volta.
- Um destaque desliza entre as opções e, ao escolher, o rótulo sai da lista e voa até o gatilho, que ajusta a largura ao texto novo com uma mola.
- Com “reduzir movimento” ligado, tamanhos e destaque mudam na hora e o valor só esmaece, sem o voo do rótulo.

## Comportamento responsivo

- Fechado, o gatilho tem a largura do rótulo escolhido, até `min(20rem, 100vw - 2rem)`; aberto, a superfície usa `panelWidth` (padrão 272 px), nunca menos que o gatilho nem mais que `100vw - 2rem`.
- A lista rola acima de `maxListHeight` (padrão 296 px) e a superfície cresce sobre a página a partir da borda de `align`, sem portal: um ancestral com `overflow: hidden` a corta.

## Desempenho

- Todas as opções ficam montadas mesmo com a lista fechada (oculta e `inert`) e não há virtualização: o próprio componente se indica para até algumas centenas de opções.

## Notas para IA

- `items` mistura opções `{ value, label, icon?, meta?, keywords?, disabled? }` e grupos `{ label, options }`; use `value` + `onValueChange(value, option)` ou `defaultValue`, com `null` para nada escolhido.
- `searchable` vem como `"auto"` e liga a busca acima de oito opções; passe `true` ou `false` para fixar. A busca olha `label`, `meta` e `keywords`.
- `icon` aceita um nó de 20 px, como um avatar `<img>` ou um ícone, e aparece também no gatilho; `hideLabel` esconde o rótulo visível e `name` envia o valor num campo oculto.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/morph-select · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
