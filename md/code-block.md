# Code block

> Bloco de código com realce leve, nome do arquivo, botão de copiar e opção de expandir trechos longos.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/code-block
- Descrição original (inglês): Present code with legible hierarchy and copy access.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/code-block.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/code-block.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/code-block.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/code-block.json`. Caminho do registro, relativo ao endereço do site: `r/code-block.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Copy button](copy-button.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/code-block/code-block.tsx`
  - `components/ryan-ui/code-block/code-block.module.css`
  - `components/ryan-ui/copy-button/copy-button.tsx`
  - `components/ryan-ui/copy-button/copy-button.module.css`
  - `components/ryan-ui/lib/use-copy-feedback.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/code-block.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar um trecho de código em documentação ou tutorial, com nome do arquivo, linguagem e botão de copiar.
- Fontes longas que devem começar recolhidas: `maxLines` corta a altura e um botão abre o resto no lugar.
- Código que muda no mesmo bloco (variações por gerenciador de pacotes ou framework): o novo entra suave e a altura acompanha.

## Quando não usar

- Use [`file-diff`](file-diff.md) para mostrar o que mudou entre duas versões de um arquivo.
- Use [`json-viewer`](json-viewer.md) para explorar dados JSON com nós que abrem e fecham e com busca.
- Use [`copy-button`](copy-button.md) sozinho para copiar um valor curto, como um token ou um comando de uma linha.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { CodeBlock } from "@/components/ryan-ui/code-block/code-block";
import { Stack } from "./_kit";

const hook = `import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Usage
const query = useDebouncedValue(search, 300);
const results = useSearch(query);
`;

const shell = `npm install ryan-ui motion lucide-react
npx ryan-ui add button dialog`;

export default function CodeBlockDemo() {
  return (
    <Stack width={560} gap={5}>
      <CodeBlock filename="use-debounced-value.ts" language="tsx" code={hook} maxLines={9} />
      <CodeBlock language="bash" code={shell} />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CodeBlock`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `code` (obrigatória) | `string` | — | Source shown in the block and copied by the action. |
| `filename` | `string` | — | File name displayed in the header. |
| `language` | `string` | `"tsx"` | Used for the header label and lightweight syntax highlighting. |
| `maxLines` | `number` | — | Collapse longer sources to this many lines, with a toggle that expands the rest in place. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Passa pelo botão de copiar, pelo bloco de código (que é focável) e, se houver, pelo botão de expandir. |
| `Enter` ou `Espaço` | Acionam o botão em foco: copiar, ou mostrar todas as linhas e recolher. |
| `←` ou `→` | Com o foco no código, rolam as linhas longas para os lados; é a rolagem nativa do `pre`, que recebe `tabIndex` para isso. |

## Acessibilidade

- O bloco é uma `section` rotulada com o nome do arquivo ou a linguagem; o `pre` é focável para rolar pelo teclado, e o botão de expandir informa `aria-expanded`.
- Recolhido, o código só é cortado na altura: o leitor de tela e o botão de copiar continuam com o texto inteiro.
- A cópia é confirmada numa região `role="status"` do `copy-button`; os rótulos (“Copy code”, “Show all N lines”) estão em inglês no código.

## Movimento

- Expandir e recolher anima a altura com mola sem ultrapassagem, gira a seta e troca o rótulo do botão.
- Um `code` novo entra subindo 4 px enquanto a altura acompanha o conteúdo, e um `filename` novo troca com a largura seguindo em mola.
- Com “reduzir movimento”, altura, textos e seta mudam na hora.

## Comportamento responsivo

- Linhas longas não quebram: rolam para os lados dentro do bloco, que ocupa 100% da largura do pai.
- Em telas de até 420 px a fonte e o espaçamento diminuem e o botão de copiar fica só com o ícone.

## Desempenho

- O realce roda a cada render sobre o código inteiro e cria um `span` por token, mesmo recolhido: para arquivos de milhares de linhas, mostre um trecho.

## Notas para IA

- `language` (padrão `tsx`) define o rótulo e as heurísticas do realce, um tokenizador simples voltado a JS/TS, JSON, HTML e CSS; em `bash` ou `python`, comentários com `#` não são reconhecidos.
- Passe `code` sem quebra de linha no fim: ela conta como uma linha a mais no botão “Show all N lines”.
- Depende de `copy-button`, o export é nomeado (`CodeBlock`) e o estado expandido é interno; não há `className`, números de linha nem destaque de linhas.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/code-block · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
