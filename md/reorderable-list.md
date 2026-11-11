# Reorderable list

> Lista que se reorganiza arrastando, com alternativa pelo teclado para mover cada item.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/reorderable-list
- Descrição original (inglês): Organize items with direct drag and drop.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/reorderable-list.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/reorderable-list.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/reorderable-list.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/reorderable-list.json`. Caminho do registro, relativo ao endereço do site: `r/reorderable-list.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/reorderable-list/reorderable-list.tsx`
  - `components/ryan-ui/reorderable-list/reorderable-list.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/reorderable-list.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Lista curta em que a ordem é o próprio dado: prioridades do dia, etapas de um fluxo, campos de um formulário.
- Quando a pessoa deve reorganizar arrastando pela alça, com mouse ou dedo, e também pelo teclado com as setas.

## Quando não usar

- Use [`sortable-data-table`](sortable-data-table.md) quando a ordem vem do valor de uma coluna, e não de uma escolha manual.
- Linhas com conteúdo próprio (controles, imagens, várias colunas) não cabem: cada item mostra só `title` e `detail`.
- Mover itens entre listas ou colunas, como num quadro kanban, fica de fora: aqui existe uma única lista vertical.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { ReorderableList, type ReorderableItem } from "@/components/ryan-ui/reorderable-list/reorderable-list";
import { Caption, Stack } from "./_kit";

const initial: ReorderableItem[] = [
  { id: "design", title: "Finish checkout redesign", detail: "Due Monday" },
  { id: "review", title: "Review pull request #482", detail: "Marcus is waiting" },
  { id: "research", title: "Summarize interview notes", detail: "8 interviews" },
  { id: "release", title: "Publish release notes", detail: "Version 2.4" },
  { id: "backlog", title: "Groom the backlog", detail: "Friday" },
];

export default function ReorderableListDemo() {
  const [items, setItems] = useState(initial);
  return (
    <Stack width={420} gap={3}>
      <ReorderableList items={items} onReorder={setItems} label="Today's priorities" />
      <Caption>Drag by the handle, or focus it and use the arrow keys. Top priority: {items[0]?.title}.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ReorderableList`

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

#### `ReorderableItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `title` (obrigatória) | `string` | — |
| `detail` | `string` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Com o foco na alça, move o item uma posição para cima ou para baixo; o foco continua na mesma alça. |
| `Tab` ou `Shift + Tab` | Passa de uma alça para a outra. |

## Acessibilidade

- A lista é um `<ul>` com `aria-label` vindo de `label`; cada alça é um `<button>` cujo nome traz o título, a posição atual e a instrução de usar as setas.
- Depois de mover pelo teclado, o foco é devolvido à alça do item movido, porque a reordenação troca os nós de lugar no DOM.
- O nome da alça é fixo em inglês (“Reorder [título]. Position 2 of 5. Use arrow keys.”) e não há região `aria-live` anunciando a nova posição; como o código fica no seu projeto, traduza ali.

## Movimento

- Ao pressionar a alça, a linha se eleva: cresce para 1,02 e ganha uma sombra que entra por opacidade; ao soltar, assenta no lugar com uma mola curta.
- As outras linhas deslizam para abrir espaço, e o número da posição rola na direção em que a linha andou.
- Com “reduzir movimento” ligado, a linha ainda segue o ponteiro, mas cai direto no lugar, sem escala, e o número troca sem rolar.

## Comportamento responsivo

- A lista ocupa toda a largura do pai; título e detalhe são cortados com reticências em vez de quebrar linha.
- A alça tem 40 px de lado e `touch-action: none`: arrastar por ela no celular não rola a página, e o resto da linha continua rolando normalmente.

## Desempenho

- Todas as linhas ficam no DOM, cada uma com animação de layout, e não há virtualização; mantenha a lista curta.

## Notas para IA

- É controlado e só tem export nomeado: `import { ReorderableList } from "@/components/ryan-ui/reorderable-list/reorderable-list"`, com `items` no estado do pai e `onReorder={setItems}`.
- Cada item precisa de `id` único e estável e de `title`; `detail` é opcional, e `label` dá o nome da lista para leitor de tela.
- `onReorder` recebe o array já na nova ordem a cada troca de posição, inclusive no meio do arrasto, e não só ao soltar: guarde no estado e adie a gravação no servidor.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/reorderable-list · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
