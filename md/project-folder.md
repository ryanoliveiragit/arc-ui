# Project folder

> Pasta que entreabre ao passar o mouse e, no clique, deixa os documentos subirem e se abrirem em leque.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/project-folder
- Descrição original (inglês): A folder whose flap leans open on hover while its documents peek out, then rise and fan out with a springy stagger on click.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/project-folder.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/project-folder.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/project-folder.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/project-folder.json`. Caminho do registro, relativo ao endereço do site: `r/project-folder.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/project-folder/project-folder.tsx`
  - `components/ryan-ui/blocks/project-folder/project-folder.module.css`
  - `components/ryan-ui/lib/media.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/project-folder.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Grade ou prateleira de projetos em portfólios, painéis e telas iniciais de arquivos, em que espiar os primeiros documentos ao passar o mouse dá contexto.
- Para mostrar de relance o tipo de conteúdo de uma pasta (texto, gráfico ou imagem) antes de abri-la.

## Quando não usar

- Use [`file-tree`](file-tree.md) para navegar por arquivos e subpastas de verdade, com seleção e teclado.
- Use [`card-folder`](card-folder.md) quando o conteúdo é um conjunto de fichas com abas para ler uma de cada vez.
- Se abrir a pasta deve listar ou abrir arquivos, o bloco sozinho não basta: aberto, ele só desenha três folhas, sem links.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import ProjectFolderPreview from "@/components/ryan-ui/blocks/project-folder/project-folder";

export default function ProjectFolderDemo() {
  return <ProjectFolderPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ProjectFolder`

A folder whose flap leans open on hover and whose sheets rise and fan out on click.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `name` (obrigatória) | `string` | — | Folder name, shown under it. |
| `meta` | `string` | — | Short line under the name while the folder is closed, such as "12 files, edited 2h ago". |
| `files` | `ProjectFile[]` | `[]` | Files in the folder. The first three peek out; the rest are counted. |
| `tone` | `"accent" \| "neutral"` | `"neutral"` | `accent` fills the folder with the accent color; `neutral` keeps it quiet. |
| `open` | `boolean` | — | Whether the folder is open. Pass it with `onOpenChange` to control it. |
| `defaultOpen` | `boolean` | `false` | Whether the folder starts open when uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when a click or key press opens or closes the folder. |
| `className` | `string` | — | Extra class for the folder button. |

### `ProjectFolderPreview`

Ready preview: three project folders; opening one closes the others.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

#### `ProjectFile`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` (obrigatória) | `string` | File name, printed at the top of its sheet. |
| `kind` | `"text" \| "chart" \| "image"` | What the little sheet shows: lines of text, a bar chart, or a picture. |
| `image` | `string` | Picture for `image` sheets. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Abrem ou fecham a pasta, espalhando ou recolhendo as folhas. |
| `Tab` | Com foco vindo do teclado, a pasta entreabre como no hover do mouse. |

## Acessibilidade

- A pasta inteira é um `<button>` nativo com `aria-expanded`; o desenho (aba, folhas e contador) fica com `aria-hidden`, então o nome acessível vem do nome e da linha abaixo dele.
- Aberta, a linha abaixo troca a descrição pelos nomes das três primeiras folhas mais “and N more”, em inglês fixo, e é isso que o leitor de tela passa a ouvir.
- As imagens das folhas têm `alt` vazio, porque são decorativas.

## Movimento

- Com o mouse por cima ou foco de teclado, a aba inclina 24° para trás em 3D e as folhas espiam; ao clicar, a aba abre a 42° e as folhas sobem em leque numa mola com pequeno quique, 45 ms uma após a outra.
- A aba usa uma mola mais pesada, praticamente sem quique; ao fechar, as folhas voltam na ordem inversa e a linha sob o nome troca com um deslize curto.
- Com “reduzir movimento” ligado, a aba não gira, as folhas saltam para o lugar e a linha só esmaece.

## Comportamento responsivo

- Tudo escala a partir de `--folder-size` (padrão 13rem), definido na pasta ou num pai; a pasta reserva espaço acima de si para as folhas subirem, mas abertas elas passam um pouco das laterais.

## Notas para IA

- Importe o componente nomeado `ProjectFolder`; o export padrão é uma prateleira de três pastas em que abrir uma fecha as outras, feita com `open` e `onOpenChange`.
- `files` desenha só as três primeiras folhas (`kind` `text`, `chart` ou `image`, com `image` para a URL) e conta o resto; para mostrar o conteúdo de verdade, reaja a `onOpenChange`.
- Deixe espaço lateral entre pastas vizinhas para o leque aberto; `tone="accent"` pinta a pasta na cor de destaque e o papel das folhas fica claro nos dois temas.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/project-folder · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
