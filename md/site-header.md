# Site header

> Cabeçalho de site com menu mega, que ganha fundo ao rolar a página, em três layouts.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/site-header
- Descrição original (inglês): A sticky website header that turns solid on scroll, with a gliding active link, mega menu panels, and a mobile sheet.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/site-header.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/site-header.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/site-header.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/site-header.json`. Caminho do registro, relativo ao endereço do site: `r/site-header.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Segmented control](segmented-control.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/site-header/site-header.tsx`
  - `components/ryan-ui/blocks/site-header/site-header.module.css`
  - `components/ryan-ui/lib/media.ts`
  - `components/ryan-ui/segmented-control/segmented-control.tsx`
  - `components/ryan-ui/segmented-control/segmented-control.module.css`
  - `components/ryan-ui/lib/ryan-provider.tsx`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/site-header.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Navegação do topo de um site de produto ou documentação: marca, poucas seções, “Sign in” e uma ação principal, fixa no topo e opaca ao rolar.
- Seções com muitos destinos que pedem painéis de mega menu com descrição por link e um cartão em destaque (`variant="mega"`).
- Sites que precisam funcionar no celular: abaixo de 760 px de largura do cabeçalho, os links dobram numa folha de menu.

## Quando não usar

- Use [`page-header`](page-header.md) para o cabeçalho de uma página dentro do app, com título do projeto, abas e ações.
- Use [`animated-sidebar`](animated-sidebar.md) quando a navegação do app é um menu lateral com grupos e muitas seções.
- Use [`drawer`](drawer.md) quando o menu do celular precisa ser um diálogo modal: a folha daqui não prende o foco.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import SiteHeader from "@/components/ryan-ui/blocks/site-header/site-header";

export default function SiteHeaderDemo() {
  return <SiteHeader />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `RyanMark`

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### `SiteHeader`

A website header in three layouts. It sticks to the top and turns solid once the page scrolls, marks the current section with an indicator that glides between links, opens springy mega menu panels whose content slides in from the side you moved toward, and folds into a menu sheet on narrow containers.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `"simple" \| "centered" \| "mega"` | `"mega"` | `simple` puts links beside the brand, `centered` centers them in a quiet capsule, `mega` opens panels for items with links. |
| `brand` | `{ name: string; href?: string; mark?: ReactNode }` | `{ name: "ryan-ui" }` | — |
| `items` | `SiteHeaderItem[]` | `siteHeaderExampleItems` | — |
| `current` | `string` | — | Value of the item that holds the current page (controlled). |
| `defaultCurrent` | `string` | — | Initial current item when uncontrolled. |
| `onCurrentChange` | `(value: string) => void` | — | Called when a destination inside an item is chosen, with that item's value. |
| `onNavigate` | `(destination: SiteHeaderDestination) => void` | — | Called for every destination: items, panel links, the brand, and actions with an href. |
| `secondaryAction` | `SiteHeaderAction \| null` | `{ label: "Sign in" }` | A quiet action before the primary one, such as Sign in. Pass null to hide it. |
| `primaryAction` | `SiteHeaderAction \| null` | `{ label: "Get ryan-ui" }` | The one primary action at the end of the bar. Pass null to hide it. |
| `sticky` | `boolean` | `true` | Sticks to the top of its scroll container. Defaults to true. |
| `scrollContainer` | `RefObject<HTMLElement \| null>` | — | The element that scrolls, when it is not the window. The header turns solid once it scrolls. |
| `scrollThreshold` | `number` | `8` | Pixels of scroll before the background turns solid. Defaults to 8. |
| `label` | `string` | `"Main"` | Accessible name of the navigation landmark. |
| `defaultOpenItem` | `string` | — | Mega variant: the item whose panel starts open, as a preview would show it. It closes like any panel (outside press, Escape) and never moves focus on its own. |
| `className` | `string` | — | — |

### `SiteHeaderBlock`

Preview: the header inside a small scrolling page, with a switch between its three layouts.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `SiteHeaderVariant` | `"simple" \| "centered" \| "mega"` |

#### `SiteHeaderLink`

One destination inside a mega menu panel.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `description` | `string` | One short line under the label. |
| `icon` | `ReactNode` | A plain decorative icon beside the label. |
| `href` | `string` | — |

#### `SiteHeaderFeature`

A card beside the links in a mega menu panel.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `title` (obrigatória) | `string` | — |
| `description` | `string` | — |
| `href` | `string` | — |
| `image` | `{ src: string; alt: string }` | — |

#### `SiteHeaderItem`

A top level destination. With `links` and the mega variant it opens a panel; otherwise it is a plain link.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | Stable value, also used for `current`. |
| `label` (obrigatória) | `string` | — |
| `href` | `string` | — |
| `links` | `SiteHeaderLink[]` | — |
| `feature` | `SiteHeaderFeature` | — |

#### `SiteHeaderAction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `href` | `string` | — |
| `onClick` | `() => void` | — |

#### `SiteHeaderDestination`

What `onNavigate` receives.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `href` | `string` | — |
| `section` | `string` | The top level item the destination belongs to. |

### Outras exportações

- `siteHeaderExampleItems` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Movem o foco entre os itens do topo, dando a volta; com um painel aberto, o painel acompanha o item. |
| `↓` | Num item com painel, abre o painel e leva o foco ao primeiro link. |
| `↑` ou `↓` | Dentro do painel, movem entre os links; `↑` no primeiro link fecha o painel e devolve o foco ao item. |
| `Home` ou `End` | Dentro do painel, vão ao primeiro ou ao último link. |
| `Esc` | Fecha o painel e devolve o foco ao item; com a folha do celular aberta, fecha a folha e devolve o foco ao botão de menu. |
| `Enter` ou `Espaço` | Num item com painel, abrem ou fecham o painel; no botão de menu, abrem ou fecham a folha. |

## Acessibilidade

- Os links do topo ficam num `<nav>` nomeado por `label` (“Main”); itens simples recebem `aria-current="page"`, mas num item com painel o estado atual é só visual.
- Gatilhos de painel têm `aria-expanded` e `aria-controls`, o painel é uma `role="region"` com o nome do item e a face que sai fica `inert` durante a troca.
- O botão de menu tem `aria-expanded`, `aria-controls` e rótulo que alterna; a folha não move nem prende o foco ao abrir, e `Esc` a fecha devolvendo o foco ao botão.

## Movimento

- Passado `scrollThreshold` (8 px), o fundo fica opaco com borda e sombra e só clareia de novo perto do topo; o realce de hover (fora do `centered`) e o indicador da seção atual deslizam entre os links.
- O painel abre após 70 ms de intenção do mouse, a altura segue o conteúdo numa mola sem ultrapassagem e, ao passar para outro item, o conteúdo entra pelo lado para onde você se moveu.
- A folha do celular desce da barra abrindo a altura numa mola, com as linhas em sequência; com “reduzir movimento” ligado, painel e folha só esmaecem e o ícone de menu não gira.

## Comportamento responsivo

- O cabeçalho é o próprio contêiner: abaixo de 760 px somem os links, a ação secundária e o painel, aparece o botão de menu e alargar de novo fecha a folha.
- A folha rola por dentro até `--site-header-sheet-max` (padrão `100dvh - 65px`); defina essa variável quando o cabeçalho mora num contêiner de altura fixa.

## Desempenho

- Ouve `scroll` de forma passiva na janela ou em `scrollContainer` e usa um `ResizeObserver` no cabeçalho; os temporizadores de intenção do hover são limpos ao desmontar.

## Notas para IA

- Importe o componente nomeado `SiteHeader`; o export padrão é `SiteHeaderBlock`, o preview com troca de layout dentro de uma página que rola.
- Se a página rola dentro de um elemento, passe-o em `scrollContainer`: ele decide quando o fundo fica opaco e recebe `overflow: hidden` enquanto a folha do celular está aberta.
- Itens com `links` só viram painel no `mega`; como o evento do clique não chega a `onNavigate`, para roteamento no cliente deixe os destinos sem `href` (viram botões) e navegue no callback.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/site-header · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
