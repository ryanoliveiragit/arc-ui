# Empty states

> Quatro estados vazios numa única ilustração, cujas formas se transformam ao trocar de aba.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/empty-states
- Descrição original (inglês): Four empty states in one illustration whose shapes morph between scenes as you switch tabs.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/empty-states.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/empty-states.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/empty-states.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/empty-states.json`. Caminho do registro, relativo ao endereço do site: `r/empty-states.json`.

- Pacotes npm: `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Button](button.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/empty-states/empty-states.tsx`
  - `components/ryan-ui/blocks/empty-states/empty-states.module.css`
  - `components/ryan-ui/blocks/empty-states/empty-states-art.ts`
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/empty-states.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Vitrine ou página de demonstração de estados vazios ilustrados (sem resultados, offline, caixa em dia, página não encontrada), em que trocar de aba transforma a ilustração.
- Ponto de partida para estados vazios próprios com formas que se transformam, adaptando textos, ações e cenas no código.

## Quando não usar

- Use [`empty-state`](empty-state.md) para um estado vazio de verdade dentro de uma tela, com título, texto e ação por props.
- Use [`not-found`](not-found.md) para uma página 404 completa, com busca e links de volta.
- Evite quando textos e ações precisam vir de props: o bloco não recebe nenhuma, e as ações só simulam o resultado na própria tela.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import EmptyStates from "@/components/ryan-ui/blocks/empty-states/empty-states";

export default function EmptyStatesDemo() {
  return <EmptyStates />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `EmptyStates`

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### `FRAMES`

Every frame is computed once at load, so the server and the first client render draw the same thing.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `SceneId`: Geometry for the empty states illustration. Every scene is drawn from the same ten primitives, in the same paint order: two back tiles, one morphing body, four front tiles, two line accents and one two-stroke mark. A scene only moves them. Tiles are rounded rectangles described by center, size, radius, rotation and skew, so a circle can become a panel. The body, lines and mark are equal-count point lists, sampled clockwise from the top left, so any outline can become any other. | `"search" \| "offline" \| "inbox" \| "map"` |
| `Phase` | `"idle" \| "loading" \| "done"` |
| `Kind` | `"tile" \| "body" \| "stroke" \| "mark"` |

#### `Prim`

`geo` springs as one vector; `fx` holds opacity and how much of a stroke is drawn.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `kind` (obrigatória) | `"tile" \| "body" \| "stroke" \| "mark"` | — |
| `geo` (obrigatória) | `number[]` | — |
| `fx` (obrigatória) | `[number, number]` | — |
| `tone` (obrigatória) | `string` | — |
| `redraw` (obrigatória) | `boolean` | — |

#### `Frame`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `prims` (obrigatória) | `Prim[]` | — |
| `label` (obrigatória) | `string` | — |

### Outras exportações

- `KINDS` (valor)
- `VIEW` (valor)
- `shapePath` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Selecionam a aba anterior ou a próxima, dando a volta, e levam o foco junto. |
| `Home` ou `End` | Selecionam a primeira ou a última aba. |
| `Enter` ou `Espaço` | No botão, executam a ação da cena: limpar filtros, tentar de novo, verificar o e-mail ou achar a página. |

## Acessibilidade

- As cenas seguem o padrão de abas (`tablist`, `tab` com `aria-selected`, `tabpanel`) com foco itinerante, e a ilustração é um `role="img"` com descrição própria de cada cena.
- O resultado de cada ação é anunciado numa região `aria-live="polite"` oculta, e o botão fica em estado de carregamento enquanto a ação simulada espera.

## Movimento

- Ao trocar de aba, cada uma das dez formas da ilustração viaja para nova posição, tamanho, raio e cor numa mola própria, e as linhas se redesenham um instante depois.
- Com mouse, as camadas da ilustração se deslocam levemente acompanhando o ponteiro; título e texto trocam subindo de um leve desfoque, e a altura do texto acompanha com uma mola.
- Com “reduzir movimento” ligado, a ilustração troca por esmaecimento cruzado, sem viagem das formas, a paralaxe é desligada e os textos só esmaecem.

## Comportamento responsivo

- A ilustração tem proporção fixa e no máximo 360px de largura, então trocar de cena não muda o layout; em contêineres de até 420px as abas ficam menores e rolam se faltar espaço.

## Desempenho

- Um único laço de `requestAnimationFrame` move todas as formas escrevendo direto nos atributos do SVG, sem renderizar o React a cada quadro, e dorme quando tudo assenta.

## Notas para IA

- O bloco não tem props: textos e ações estão em `COPY`, no componente, e as cenas em `empty-states-art.ts`; para um estado vazio configurável, use `empty-state`.
- As ações são locais e simuladas (limpar filtros, reconectar, checar o e-mail, achar a página); para ligá-las a dados reais, troque a função `act()` no arquivo instalado.
- Depende de `button`, instalado junto; o cartão ocupa a largura do pai, e o conteúdo se limita a 480px no centro.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/empty-states · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
