# Bloom menu

> Botão flutuante cujas ações se abrem em arco, uma após a outra; Esc ou um clique fora fecha o menu.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/bloom-menu
- Descrição original (inglês): A floating button whose actions bloom outward along an arc with a staggered, slightly bouncy spring; Escape or a click outside folds them back.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bloom-menu.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bloom-menu.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bloom-menu.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bloom-menu.json`. Caminho do registro, relativo ao endereço do site: `r/bloom-menu.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/bloom-menu/bloom-menu.tsx`
  - `components/ryan-ui/blocks/bloom-menu/bloom-menu.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/bloom-menu.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Botão flutuante de criação com três a seis ações rápidas, como nova nota, tarefa, foto ou áudio, num canto da tela.
- Telas em que uma barra de ferramentas fixa roubaria espaço do conteúdo, como quadros, mapas e listas de captura no celular.

## Quando não usar

- Use [`dropdown-menu`](dropdown-menu.md) quando há mais de seis ações ou quando cada uma precisa de texto sempre visível: aqui os nomes só aparecem ao passar o mouse ou ao focar pelo teclado.
- Use [`expandable-action-bar`](expandable-action-bar.md) para ações sobre uma seleção, com rótulos e uma fileira secundária.
- Use [`button`](button.md) quando só existe uma ação principal.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import BloomMenuPreview from "@/components/ryan-ui/blocks/bloom-menu/bloom-menu";

export default function BloomMenuDemo() {
  return <BloomMenuPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `BloomMenu`

A floating button whose actions bloom outward along an arc, one after another, and fold back in reverse. It is a real menu: arrow keys move between actions, Escape or a click outside closes it and focus returns to the button.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `actions` (obrigatória) | `BloomAction[]` | — | The actions, placed along the arc in order. Three to six read best. |
| `direction` | `"up" \| "up-left" \| "up-right" \| "left" \| "right" \| "down" \| "down-left" \| "down-right"` | `"up-left"` | Where the arc opens, seen from the button. Use a diagonal for a button in a corner. |
| `sweep` | `number` | — | Angle the actions spread over, in degrees. Defaults to 90 for diagonals and 150 for the four sides. |
| `radius` | `number` | `96` | Distance from the button to the actions, in px. It grows by itself when the actions would overlap. |
| `open` | `boolean` | — | Whether the menu is open (controlled). |
| `defaultOpen` | `boolean` | `false` | Whether the menu starts open (uncontrolled). |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the menu opens or closes. |
| `onAction` | `(id: string) => void` | — | Called with the action id when an action is chosen. The menu closes afterwards. |
| `label` | `string` | `"Quick actions"` | Accessible name of the floating button and of the menu. |
| `icon` | `ReactNode` | — | Icon of the floating button. It turns 135 degrees while the menu is open, so a plus becomes a close mark. |
| `className` | `string` | — | Extra class for the root. |

### `BloomMenuPreview`

Ready preview: a capture board. Each action adds a card.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `BloomDirection` | `"up" \| "up-left" \| "up-right" \| "left" \| "right" \| "down" \| "down-left" \| "down-right"` |

#### `BloomAction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable key; also passed to `onAction`. |
| `label` (obrigatória) | `string` | Name of the action: the button's accessible name and the label shown on hover and focus. |
| `icon` (obrigatória) | `ReactNode` | Icon inside the round button. |
| `disabled` | `boolean` | A disabled action stays in the arc but cannot be used. |
| `onSelect` | `() => void` | Runs when the action is chosen. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No botão flutuante, abrem ou fecham o menu (aberto pelo teclado, o foco vai para a primeira ação); numa ação, executam, fecham e devolvem o foco ao botão. |
| `↓` ou `→` | Com o menu aberto, focam a próxima ação e dão a volta no fim; com ele fechado, `↓` ou `↑` no botão abre o menu e foca a primeira ação. |
| `↑` ou `←` | Com o menu aberto, focam a ação anterior; ações desabilitadas são puladas. |
| `Home` ou `End` | Focam a primeira ou a última ação. |
| `Esc` | Fecha o menu e devolve o foco ao botão. |
| `Tab` | Fecha o menu e deixa o foco seguir a ordem normal de tabulação. |

## Acessibilidade

- O botão expõe `aria-haspopup="menu"`, `aria-expanded` e `aria-controls`; as ações ficam num `role="menu"` como `menuitem`, fora da ordem do Tab, com o foco movido pelas setas.
- `label` nomeia o botão e o menu para o leitor de tela, e o `label` de cada ação é o nome acessível dela: escreva os dois dizendo o que a ação faz.
- Esc e a escolha de uma ação devolvem o foco ao botão; o clique fora fecha o menu sem mexer no foco.

## Movimento

- As ações saem do centro do botão para seus lugares no arco, uma após a outra, com uma mola levemente elástica que passa um pouco do ponto; ao fechar, voltam ao centro na ordem inversa.
- O ícone do botão gira 135° (o mais vira um x) e um anel se expande a partir dele quando o menu abre.
- Com “reduzir movimento” ligado, as ações ainda saem do centro, mas num deslocamento curto (0,16 s) sem mola nem escala; ao fechar só esmaecem no lugar, o ícone gira na hora e o anel não aparece.

## Comportamento responsivo

- Não há detecção de colisão: o arco abre sempre em `direction` e é posicionado por transform, então pode sair da tela ou ser cortado por um pai com `overflow: hidden`.
- O raio cresce sozinho para manter 58px entre ações vizinhas: com muitas ações num arco de 90°, o menu ocupa bem mais que os 96px de `radius`.

## Notas para IA

- Importe `BloomMenu` pelo nome: a exportação padrão do arquivo é a prévia (um quadro de captura), não o componente.
- O componente não se fixa na tela: posicione-o com um contêiner (por exemplo, `position: fixed` no canto) e aponte `direction` para dentro da tela, usando as diagonais nos cantos.
- Cada ação tem `id`, `label` e `icon`; trate a escolha em `onAction(id)` ou no `onSelect` da ação, e use `open` com `onOpenChange` só se precisar controlar a abertura.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/bloom-menu · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
