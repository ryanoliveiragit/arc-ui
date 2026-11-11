# Card folder

> Fichário de cartões com abas: ao escolher uma aba, o cartão sobe, vem para a frente e os outros se acomodam atrás.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/card-folder
- Descrição original (inglês): A tabbed pile of index cards: picking a tab pulls that card up, drops it in front with a small bounce, and lets the others settle behind it.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card-folder.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card-folder.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card-folder.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card-folder.json`. Caminho do registro, relativo ao endereço do site: `r/card-folder.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/card-folder/card-folder.tsx`
  - `components/ryan-ui/blocks/card-folder/card-folder.module.css`
  - `components/ryan-ui/lib/media.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/card-folder.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- De três a cinco visões curtas do mesmo assunto, como resumo, tarefas, arquivos e equipe de um projeto, em que a metáfora de fichas empilhadas ajuda.
- Seções de apresentação em que trocar de aba deve ser um gesto visível: a ficha escolhida sobe, cai na frente e as outras se acomodam atrás.

## Quando não usar

- Use [`tabs`](tabs.md) para abas comuns de aplicativo, com conteúdo de altura variável ou muitas seções.
- Use [`card-stack`](card-stack.md) quando a pessoa percorre os cartões um a um e descarta, em vez de escolher por aba.
- Evite com conteúdo longo: todas as fichas têm a mesma altura (`height`) e o corpo corta o que passar dela, sem rolagem.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import CardFolderPreview from "@/components/ryan-ui/blocks/card-folder/card-folder";

export default function CardFolderDemo() {
  return <CardFolderPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CardFolder`

A folder of index cards: picking a tab pulls that card up out of the pile and drops it in front, while the others settle behind it.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `cards` | `FolderCard[]` | `sampleCards` | The cards, in tab order. Defaults to a sample project folder. |
| `value` | `string` | — | Id of the card in front. Pass it with `onValueChange` to control it. |
| `defaultValue` | `string` | — | Id of the card that starts in front when uncontrolled. Defaults to the first card. |
| `onValueChange` | `(id: string) => void` | — | Called with the id of the card whose tab was picked. |
| `height` | `number` | `296` | Height of a card body in px. Every card shares it, so the folder never changes size. |
| `label` | `string` | `"Project folder"` | Accessible name of the tab list. |
| `className` | `string` | — | Extra class for the folder. |

### `CardFolderPreview`

Ready preview: the sample project folder on a quiet stage.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

#### `FolderCard`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique id, used as the value. |
| `label` (obrigatória) | `string` | Text on the card's tab. |
| `icon` | `ReactNode` | Small icon before the label. |
| `content` (obrigatória) | `ReactNode` | What the card shows when it is in front. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Selecionam a aba anterior ou a próxima e levam o foco junto, dando a volta nas pontas. |
| `Home` ou `End` | Selecionam a primeira ou a última aba. |
| `Tab` | Entra na aba selecionada (a única na ordem do Tab) e depois segue para os controles da ficha da frente, se houver; os das fichas de trás ficam fora do alcance. |

## Acessibilidade

- Segue o padrão de abas: um `tablist` nomeado por `label` (ligado às abas por `aria-owns`), cada aba com `aria-selected` e `aria-controls`, e um `tabpanel` por ficha.
- As fichas de trás recebem `inert` e `aria-hidden`, então nem o foco nem o leitor de tela entram no conteúdo coberto.

## Movimento

- Ao escolher uma aba, a ficha é puxada 58px para cima num movimento curto e depois cai na frente com uma mola de leve quique, enquanto as que estavam na frente dela recuam um degrau, menores e mais apagadas.
- O conteúdo da ficha que sai da frente fica visível até a nova pousar, e um marcador de destaque cresce no topo da aba ativa.
- Com “reduzir movimento” ligado, a ordem da pilha troca na hora, sem subida, quique nem transições.

## Comportamento responsivo

- A pasta ocupa `min(30rem, 100%)` e as abas dividem a largura por igual, cortando rótulos longos com reticências; abaixo de 26rem (container query) os ícones das abas somem e o texto diminui.

## Desempenho

- Todas as fichas ficam montadas o tempo todo (as de trás só escondidas), então o conteúdo de cada uma é renderizado mesmo sem estar à frente.

## Notas para IA

- Importe `CardFolder` pelo nome (a exportação padrão é a prévia) e passe `cards` com `id`, `label`, `icon` opcional e `content`: sem `cards`, aparece uma pasta de projeto de exemplo.
- Controle a ficha da frente com `value` e `onValueChange`, ou defina só a inicial com `defaultValue`.
- `height` (296 por padrão) é a altura em px do corpo de todas as fichas; dimensione pelo conteúdo mais alto, porque o excesso é cortado.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/card-folder · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
