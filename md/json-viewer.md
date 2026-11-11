# JSON viewer

> Árvore de JSON recolhível, com busca, paginação de listas longas e cópia de valor ou caminho.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/json-viewer
- Descrição original (inglês): A collapsible JSON tree with search, paging for long arrays, and copy value or path.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/json-viewer.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/json-viewer.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/json-viewer.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/json-viewer.json`. Caminho do registro, relativo ao endereço do site: `r/json-viewer.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/json-viewer/json-viewer.tsx`
  - `components/ryan-ui/json-viewer/json-viewer.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/json-viewer.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Inspecionar respostas de API, eventos de webhook ou registros de log em ferramentas internas e painéis de depuração.
- Quando a pessoa precisa achar uma chave ou um valor num objeto grande: a busca destaca as ocorrências e abre os ramos que as contêm.
- Quando o caminho de um campo importa: a linha atual mostra o seu (`order.items[0].sku`) e traz ações para copiar o valor ou o caminho.

## Quando não usar

- Use [`code-block`](code-block.md) para mostrar um trecho curto de JSON como código estático.
- Use [`tree-view`](tree-view.md) para navegar por uma hierarquia de itens com rótulos próprios; aqui cada linha é sempre chave e valor.
- Use [`sortable-data-table`](sortable-data-table.md) quando o JSON é uma lista de registros com os mesmos campos, que se comparam melhor em colunas.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { JsonViewer } from "@/components/ryan-ui/json-viewer/json-viewer";
import { Stack } from "./_kit";

const order = {
  id: "ord_8f3k2m",
  status: "paid",
  createdAt: "2026-11-04T14:22:09Z",
  total: { amount: 12480, currency: "USD" },
  customer: { id: "cus_91ab", name: "Hannah Walsh", email: "hannah.walsh@example.com", vip: true },
  items: [
    { sku: "CH-204", name: "Lounge chair", quantity: 2, price: 4200 },
    { sku: "LP-118", name: "Table lamp", quantity: 1, price: 1890 },
    { sku: "LT-032", name: "Linen throw", quantity: 3, price: 730 },
  ],
  shipping: { method: "express", address: { city: "Lisbon", country: "PT", postalCode: "1200-195" }, tracking: null },
  tags: ["gift", "priority"],
};

export default function JsonViewerDemo() {
  return (
    <Stack width={560}>
      <JsonViewer data={order} rootName="order" defaultExpandDepth={2} maxHeight={360} label="Order payload" />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `JsonViewer`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` (obrigatória) | `unknown` | — | — |
| `rootName` | `string` | `"root"` | Name of the root in paths, as in `root.users[0].name`. Defaults to "root". |
| `defaultExpandDepth` | `number` | `1` | Levels open on first render when `defaultExpanded` is not set. Defaults to 1, which opens the root. |
| `expanded` | `string[]` | — | Paths of open branches. |
| `defaultExpanded` | `string[]` | — | — |
| `onExpandedChange` | `(paths: string[]) => void` | — | — |
| `searchable` | `boolean` | `true` | Show the search field. Defaults to true. |
| `query` | `string` | — | — |
| `defaultQuery` | `string` | `""` | — |
| `onQueryChange` | `(query: string) => void` | — | — |
| `pageSize` | `number` | `50` | Children shown per page in a long array or object. Defaults to 50. |
| `copyable` | `boolean` | `true` | Show copy value and copy path actions. Defaults to true. |
| `onCopy` | `(detail: JsonViewerCopyDetail) => void` | — | — |
| `onSelect` | `(detail: { path: string; value: unknown; type: JsonValueType }) => void` | — | Called when a row becomes the current one. |
| `showPath` | `boolean` | `true` | Show the path of the current row under the tree. Defaults to true. |
| `maxHeight` | `number \| string` | `420` | Height of the scrolling tree area. Defaults to 420px. |
| `label` | `string` | `"JSON"` | Accessible name of the tree. |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `JsonValueType` | `"object" \| "array" \| "string" \| "number" \| "boolean" \| "null" \| "other"` |

#### `JsonViewerCopyDetail`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `kind` (obrigatória) | `"value" \| "path"` | — |
| `path` (obrigatória) | `string` | — |
| `text` (obrigatória) | `string` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Movem a linha atual; `Home` e `End` vão à primeira e à última. |
| `→` ou `←` | `→` abre o ramo ou, se já aberto, vai ao primeiro filho; `←` fecha o ramo ou volta ao pai. |
| `Enter` ou `Espaço` | Abrem ou fecham o ramo; na linha “Show N more”, carregam a próxima página. |
| `/` | Leva o foco ao campo de busca. |
| `Enter` ou `Shift + Enter` | No campo de busca, vão à próxima ocorrência e à anterior; `Esc` limpa a busca e `↓` volta à árvore. |
| `Ctrl + C` ou `Cmd + C` | Acionam a cópia do valor da linha em foco; com `Shift`, a do caminho. |

## Acessibilidade

- Segue o padrão de árvore do WAI-ARIA: `role="tree"` nomeado por `label` e linhas `treeitem` com nível, posição, `aria-expanded` e um `aria-label` que resume chave, tipo e valor; só a linha atual fica na ordem de `Tab`.
- A contagem de ocorrências da busca é `aria-live`, e o resultado de cada cópia (sucesso ou falha) é anunciado numa região `role="status"`.
- Os botões de copiar das linhas ficam fora da ordem de `Tab` (pelo teclado, use o atalho) e o da barra de caminho é focável; os textos da interface estão fixos em inglês.

## Movimento

- Ao abrir ou fechar um ramo, carregar uma página ou expandir tudo, cada linha desdobra a própria altura numa mola sem ultrapassagem, com um esmaecer.
- O destaque da linha atual desliza de uma linha para outra, e a rolagem que mantém essa linha à vista (ou centraliza uma ocorrência da busca) usa a mesma mola.
- Com “reduzir movimento”, linhas, destaque e rolagem mudam na hora; acima de 400 linhas visíveis, a animação das linhas é desligada para todos.

## Comportamento responsivo

- A árvore rola por dentro, limitada por `maxHeight` (420 px por padrão); as linhas não quebram, valores longos são cortados com reticências e strings com mais de 40 caracteres mostram o texto inteiro no `title`.
- Em telas de até 420 px o recuo por nível cai de 16 px para 12 px, as chaves ocupam no máximo 40% da linha e o tipo some da barra de caminho.

## Desempenho

- Arrays e objetos longos entram em páginas de `pageSize` (50 por padrão) com uma linha “Show N more”; não há virtualização, então cada linha visível é um elemento.
- A busca percorre o JSON inteiro a cada tecla e para em 2.000 ocorrências; em cargas muito grandes, a digitação pode pesar.

## Notas para IA

- Passe em `data` o valor já convertido (objeto ou array), não o texto JSON: uma string apareceria como um único valor.
- Os caminhos partem de `rootName` (padrão `root`), como `root.users[0].name`: é esse formato que `expanded`, `defaultExpanded`, `onSelect` e `onCopy` usam, e `defaultExpandDepth` abre os primeiros níveis.
- Já vem com borda, fundo e rolagem própria (`maxHeight`), então não precisa de outro cartão em volta; `searchable`, `copyable` e `showPath` desligam a busca, a cópia e a barra de caminho.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/json-viewer · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
