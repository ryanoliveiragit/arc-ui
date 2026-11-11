# Card dealer

> Um baralho que distribui cartas pelas posições da mesa em arco, virando cada uma; dá para embaralhar e recomeçar.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/card-dealer
- Descrição original (inglês): A deck that deals playing cards to table positions along an arc while they lift and flip face up, with a riffle shuffle, a reset and a named poker hand.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card-dealer.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card-dealer.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card-dealer.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/card-dealer.json`. Caminho do registro, relativo ao endereço do site: `r/card-dealer.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/card-dealer/card-dealer.tsx`
  - `components/ryan-ui/blocks/card-dealer/card-dealer.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/card-dealer.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Demonstrações e protótipos de jogos de cartas: distribui de uma a sete cartas do baralho para a mesa e, com cinco posições, dá nome à mão de pôquer.
- Seções lúdicas de uma página, como um sorteio ou uma “mão do dia”, em que a animação de dar as cartas é o próprio conteúdo.
- Exemplo de referência de movimento em sequência: trajetória em arco, virada em 3D e embaralhamento.

## Quando não usar

- Use [`card-stack`](card-stack.md) para percorrer cartões de conteúdo um a um, com arremesso e desfazer.
- Evite em jogos com dinheiro ou resultado auditável: o embaralhamento usa `Math.random` no navegador e o baralho vive no estado do componente.
- Evite quando as cartas precisam de conteúdo próprio: as faces só desenham valor e naipe.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import CardDealerPreview from "@/components/ryan-ui/blocks/card-dealer/card-dealer";

export default function CardDealerDemo() {
  return <CardDealerPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CardDealer`

A deck and a table. Dealing sends each card from the deck to its position along an arc, lifting and turning face up on the way, one after another. Shuffle riffles the deck into a new random order and Reset restores the factory order. With five positions the finished hand is named like a poker hand.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `positions` | `number` | `5` | How many positions the table has, from 1 to 7. Five makes a poker hand, and the hand gets named. |
| `onDeal` | `(hand: PlayingCard[]) => void` | — | Called after every deal with the cards now on the table, in position order. |
| `label` | `string` | `"Card table"` | Accessible name of the table. |
| `className` | `string` | — | Extra class for the root. |

### `CardDealerPreview`

Ready preview: a five card table.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `CardSuit` | `"spades" \| "hearts" \| "diamonds" \| "clubs"` |

#### `PlayingCard`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique key, such as "K-spades". |
| `rank` (obrigatória) | `string` | Printed rank: "2" to "10", "J", "Q", "K" or "A". |
| `suit` (obrigatória) | `"spades" \| "hearts" \| "diamonds" \| "clubs"` | The suit. |
| `value` (obrigatória) | `number` | Rank order from 0 (two) to 12 (ace). |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No baralho, dão uma carta para a próxima posição livre; nos botões, distribuem a mão (“Deal hand”), embaralham (“Shuffle”) ou recomeçam (“Reset”). |

## Acessibilidade

- A mesa é um `role="group"` nomeado por `label`, e o baralho é um botão cujo nome informa quantas cartas restam.
- As cartas desenhadas ficam em `aria-hidden`; quem conta o que há na mesa é um parágrafo oculto com `aria-live="polite"`, que lista as cartas e o nome da mão, em inglês.

## Movimento

- Cada carta sai do baralho para a sua posição em arco (corre de lado primeiro e desce depois), levanta um pouco e vira de frente no caminho, com 0,13 s entre uma carta e a seguinte.
- “Shuffle” recolhe a mesa e faz as cartas do topo abrirem para os lados duas vezes; com a mesa cheia, as cartas voltam para o baralho antes da próxima mão.
- Com “reduzir movimento” ligado, as cartas mudam de lugar na hora, sem trajetória, virada nem espera entre as etapas.

## Comportamento responsivo

- A largura das cartas é calculada em unidades de container para caber na fileira (até 5,25rem), e as posições são medidas por `ResizeObserver`, então a mesa encolhe sem quebrar a linha.

## Desempenho

- Só as cinco cartas do topo do baralho são desenhadas, além das que estão na mesa (no máximo doze elementos animados); o resto do baralho é só um número.

## Notas para IA

- Importe `CardDealer` pelo nome; a exportação padrão é a prévia com cinco posições.
- O baralho e a mesa são estado interno, sem props para controlar as cartas: a única saída é `onDeal(hand)`, chamado no clique (antes de a animação terminar) com as cartas da mesa na ordem das posições.
- `positions` aceita de 1 a 7; a mão só recebe nome com a mesa cheia e ao menos duas posições, e sequências e flushes exigem exatamente cinco cartas.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/card-dealer · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
