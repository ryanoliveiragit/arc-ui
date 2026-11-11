# Morphing tabs

> Abas com uma pílula ativa que estica e muda de forma ao viajar, enquanto o painel troca na mesma direção.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/morphing-tabs
- Descrição original (inglês): Tabs whose active pill stretches, thins and squares off as it travels to the next tab, while the panel crossfades in the direction of travel.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morphing-tabs.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morphing-tabs.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morphing-tabs.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/morphing-tabs.json`. Caminho do registro, relativo ao endereço do site: `r/morphing-tabs.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/morphing-tabs/morphing-tabs.tsx`
  - `components/ryan-ui/blocks/morphing-tabs/morphing-tabs.module.css`
  - `components/ryan-ui/lib/media.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/morphing-tabs.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Troca de seção dentro de um cartão ou página em que a própria troca merece atenção: a pílula ativa viaja esticando até a nova aba.
- Poucas abas de rótulo curto cujos painéis têm alturas diferentes: a área de conteúdo anima a altura de um painel para o outro.

## Quando não usar

- Use [`tabs`](tabs.md) quando precisa compor gatilhos e painéis livremente ou manter painéis montados; aqui só o painel ativo existe no DOM.
- Use [`segmented-control`](segmented-control.md) quando a escolha só muda um modo ou filtro e não há painel associado.
- Use [`expandable-tabs`](expandable-tabs.md) quando as abas são ícones e o espaço só comporta o rótulo da aba ativa.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import MorphingTabsPreview from "@/components/ryan-ui/blocks/morphing-tabs/morphing-tabs";

export default function MorphingTabsDemo() {
  return <MorphingTabsPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `MorphingTabs`

Tabs with a liquid active pill. The pill is a clipped copy of the tab row in the accent color, so the label under it inverts exactly at its edge. When the selection moves, the leading edge springs ahead and the trailing edge follows: the pill stretches, thins and squares off on the way, then settles back into a pill at the new width. The panel leaves and enters along the same direction.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `tabs` (obrigatória) | `MorphingTab[]` | — | The tabs, in order. |
| `value` | `string` | — | Active tab id (controlled). |
| `defaultValue` | `string` | — | Active tab id on first render (uncontrolled). Defaults to the first tab. |
| `onValueChange` | `(value: string) => void` | — | Called with the id of the tab that was picked. |
| `label` | `string` | `"Sections"` | Accessible name of the tab list. |
| `className` | `string` | — | Extra class for the root. |

### `MorphingTabsPreview`

Ready preview: a workspace card with four sections of different heights.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

#### `MorphingTab`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable value of the tab. |
| `label` (obrigatória) | `string` | Tab text. |
| `icon` | `ReactNode` | Optional icon before the label. |
| `content` (obrigatória) | `ReactNode` | Panel shown while the tab is active. |
| `disabled` | `boolean` | A disabled tab cannot be picked and is skipped by the arrow keys. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `←` | Selecionam a aba seguinte ou anterior, dando a volta nas pontas e pulando as desativadas; a seleção acompanha o foco. |
| `Home` ou `End` | Selecionam a primeira ou a última aba habilitada. |
| `Tab` | Entra na lista pela aba ativa e, em seguida, vai para o painel, que é focável. |

## Acessibilidade

- Segue o padrão de abas: `role="tablist"` com `aria-label` vindo de `label`, abas com `aria-selected` e `aria-controls`, e painel `role="tabpanel"` ligado por `aria-labelledby`.
- Usa roving tabindex (só a aba ativa entra na ordem de Tab), e a cópia colorida da fileira que forma a pílula fica com `aria-hidden`.
- O `label` padrão é “Sections”, em inglês; passe o nome real do conjunto de abas.

## Movimento

- A pílula é um recorte (`clip-path`) de uma cópia da fileira na cor de destaque: a borda da frente chega primeiro com uma mola rápida e a de trás segue com outra mais lenta, o que estica a pílula.
- Enquanto está esticada ela afina (até 5 px a menos em cima e embaixo) e fica com os cantos mais retos, e volta ao formato de pílula ao chegar; o painel sai e entra deslizando 36 px no sentido da viagem, com a altura numa mola.
- Com “reduzir movimento” ligado, a pílula salta para a nova aba e o painel e a altura trocam na hora.

## Comportamento responsivo

- Se a fileira de abas for mais larga que o espaço, ela rola na horizontal com a barra de rolagem escondida; abaixo de 26rem de viewport o respiro lateral das abas diminui.

## Desempenho

- A pílula anima só `clip-path` a partir de dois valores de movimento, sem layout por quadro; rótulos e ícones são renderizados duas vezes por causa da cópia colorida.

## Notas para IA

- Importe o componente nomeado `MorphingTabs`; o export padrão do arquivo é o preview com um cartão de exemplo.
- A API é um array: `tabs` com `id`, `label`, `icon`, `content` e `disabled`; controle com `value` e `onValueChange` ou use `defaultValue`.
- Como só o painel ativo fica montado, estado local dentro de `content` se perde ao trocar de aba; e o respiro de 4 px da lista no CSS precisa bater com a constante `INSET` do componente.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/morphing-tabs · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
