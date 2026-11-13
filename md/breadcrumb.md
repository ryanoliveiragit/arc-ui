# Breadcrumb

> Mostra onde a página está dentro da hierarquia do produto.

- Tipo: componente (categoria Revelação)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/breadcrumb
- Descrição original (inglês): Show where a page sits in a hierarchy.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/breadcrumb.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/breadcrumb.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/breadcrumb.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/breadcrumb.json`. Caminho do registro, relativo ao endereço do site: `r/breadcrumb.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/breadcrumb/breadcrumb.tsx`
  - `components/ryan-ui/breadcrumb/breadcrumb.module.css`
  - `components/ryan-ui/lib/ryan-provider.tsx`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/breadcrumb.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Páginas fundas numa hierarquia, como Workspace › Projetos › App móvel › Versões, para a pessoa voltar a qualquer nível.
- Navegadores de pastas ou categorias em que o caminho vive em estado local: itens com `onClick` e sem `href` viram botões.
- Caminhos que crescem enquanto a pessoa desce na árvore: os níveis novos entram deslizando no fim.

## Quando não usar

- Use [`stepper`](stepper.md) para mostrar o progresso de um fluxo em etapas; a trilha mostra lugar, não progresso.
- Use [`tabs`](tabs.md) para alternar entre vistas irmãs do mesmo nível.
- Use [`pagination`](pagination.md) para percorrer as páginas de uma coleção.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { ChevronRight, File } from "lucide-react";
import { Breadcrumb } from "@/components/ryan-ui/breadcrumb/breadcrumb";
import { Stack, Surface } from "./_kit";

const startTrail = ["Projects", "Arc launch", "Design review"];
const files = ["Motion pass", "Final copy"];

export default function BreadcrumbDemo() {
  const [trail, setTrail] = useState<string[]>(startTrail);
  return (
    <Surface width={460} padding={3}>
      <Stack gap={3}>
        <Breadcrumb
          items={trail.map((label, index) => ({
            label,
            onClick: index < trail.length - 1 ? () => setTrail(trail.slice(0, index + 1)) : undefined,
          }))}
        />
        <div>
          {files.map((file) => (
            <button
              key={file}
              type="button"
              onClick={() => setTrail((t) => [...t, file])}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                width: "100%",
                padding: "8px 10px",
                border: "none",
                borderRadius: 8,
                background: "transparent",
                color: "var(--muted-foreground)",
                fontSize: 14,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <File size={15} aria-hidden="true" />
                {file}
              </span>
              <ChevronRight size={15} aria-hidden="true" />
            </button>
          ))}
        </div>
      </Stack>
    </Surface>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Breadcrumb`

Crumbs present on first render stay still; crumbs added later slide in from the path before them.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` (obrigatória) | `BreadcrumbItem[]` | — | — |
| `ariaLabel` | `string` | `"Breadcrumb"` | — |

### Tipos exportados

#### `BreadcrumbItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `href` | `string` | — |
| `onClick` | `(event: MouseEvent<HTMLElement>) => void` | Runs when the crumb is chosen. Without an href the crumb renders as a button, for paths that live in local state. |

## Acessibilidade

- Renderiza um `<nav>` com `aria-label` (padrão “Breadcrumb”, em inglês) e uma lista ordenada; as setas entre os níveis ficam ocultas para o leitor de tela.
- O último item é sempre a página atual: vira texto com `aria-current="page"`, mesmo que tenha `href`.

## Movimento

- Os itens do primeiro render ficam parados; níveis adicionados depois entram deslizando 8 px da esquerda, saindo de um leve desfoque, e os removidos somem num esmaecer curto.
- Os itens que ficam se reposicionam numa mola sem ultrapassagem, e cada um reserva a largura do rótulo em peso médio, então virar a página atual não desloca o caminho.
- Com “reduzir movimento” ligado, entradas, saídas e reposicionamento acontecem na hora.

## Comportamento responsivo

- A lista quebra em várias linhas quando não cabe (`flex-wrap`), mas cada rótulo fica numa linha só; não há reticências nem recolhimento dos níveis do meio.

## Notas para IA

- Passe o caminho inteiro em `items`, com a página atual por último; use `href` para rotas reais e `onClick` sem `href` para caminhos em estado local.
- Os links passam pelo `RyanProvider`: com ele, o `next/link` ou o Link do seu roteador é usado no lugar do `<a>`.
- Troque `ariaLabel` para português, por exemplo “Trilha de navegação”, já que o padrão é “Breadcrumb”. Importe de `@/components/ryan-ui/breadcrumb/breadcrumb`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/breadcrumb · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
