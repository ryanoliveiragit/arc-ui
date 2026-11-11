# Badge

> Etiqueta compacta para status, categorias e destaques, em tons e cores variados.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/badge
- Descrição original (inglês): A small label for status, category, or metadata.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/badge.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/badge.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/badge.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/badge.json`. Caminho do registro, relativo ao endereço do site: `r/badge.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/badge/badge.tsx`
  - `components/ryan-ui/badge/badge.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/badge.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Estado de um registro em tabela, lista ou cartão (Ativo, Vencido, Falhou), com `tone` e, se quiser, o ponto de `dot`.
- Categorias sem sentido de estado, como métodos HTTP ou rótulos, com as seis cores de `color`.
- Rótulo que muda no lugar (Rascunho → Publicado): o texto troca e a largura acompanha com uma mola.

## Quando não usar

- Use [`tag-input`](tag-input.md) para valores que a pessoa digita e remove.
- Use [`chip-group`](chip-group.md) para filtros que ligam e desligam: a etiqueta não é clicável nem recebe foco.
- Use [`alert`](alert.md) quando a mensagem precisa de explicação ou de uma ação.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ryan-ui/badge/badge";
import { Caption, Row, Stack } from "./_kit";

export default function BadgeDemo() {
  return (
    <Stack gap={6} align="center">
      <Row justify="center">
        <Badge dot>Draft</Badge>
        <Badge tone="success" dot>Active</Badge>
        <Badge tone="info" dot>In review</Badge>
        <Badge tone="warning" dot>Past due</Badge>
        <Badge tone="danger" dot>Failed</Badge>
      </Row>
      <Row justify="center">
        <Badge color="teal" size="sm">GET</Badge>
        <Badge color="sky" size="sm">POST</Badge>
        <Badge color="violet" size="sm">PUT</Badge>
        <Badge color="amber" size="sm">PATCH</Badge>
        <Badge color="rose" size="sm">DELETE</Badge>
        <Badge color="orchid" size="sm">HEAD</Badge>
      </Row>
      <Row justify="center">
        <Badge tone="success" icon={<CheckCircle2 size={14} aria-hidden="true" />} pill>Verified</Badge>
        <Badge tone="info" outline pill size="lg" icon={<Sparkles size={14} aria-hidden="true" />}>New</Badge>
        <Badge tone="warning" outline>Beta</Badge>
      </Row>
      <Caption>Tones for status, colors for categories.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Badge`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `tone` | `"neutral" \| "success" \| "info" \| "warning" \| "danger"` | `"neutral"` | — |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | — |
| `icon` | `ReactNode` | — | — |
| `dot` | `boolean` | `false` | A small status dot in the tone colour. Ignored when an icon is set. |
| `color` | `"teal" \| "sky" \| "orchid" \| "violet" \| "rose" \| "amber"` | — | Categorical colour from the shared tone family, for labels such as method tags. Overrides tone. |
| `outline` | `boolean` | `false` | Draws a hairline border in the tone colour. |
| `pill` | `boolean` | `false` | Fully rounded ends instead of the default soft corners. |
| `...props` | `HTMLAttributes<HTMLSpanElement>` | — | Também aceita as props deste tipo. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `BadgeTone` | `"neutral" \| "success" \| "info" \| "warning" \| "danger"` |
| `BadgeSize` | `"sm" \| "md" \| "lg"` |
| `BadgeColor` | `"teal" \| "sky" \| "orchid" \| "violet" \| "rose" \| "amber"` |

## Acessibilidade

- É um `span` sem papel: o leitor de tela lê só o texto, então a palavra tem de dizer o estado; a cor de `tone` e o ponto não são anunciados.
- Ícone e ponto ficam em `aria-hidden`, e durante a troca a cópia que sai também, para o texto não ser lido duas vezes.
- A mudança de texto não é anunciada sozinha; se precisar, passe `role="status"` (as props extras vão para o `span`).

## Movimento

- Quando o texto muda, o antigo sobe e some, o novo entra de baixo com um desfoque leve, e a largura vai do tamanho antigo ao novo com mola sem ultrapassagem.
- Um ícone de outro componente troca com escala e esmaecer; mudar `tone` ou `color` faz fundo, borda e texto mudarem de cor numa transição curta.
- Com “reduzir movimento”, texto e ícone só esmaecem rápido e a largura acompanha na hora.

## Comportamento responsivo

- A etiqueta não quebra linha nem encolhe (`white-space: nowrap`, `flex: none`): em colunas estreitas use rótulos curtos ou `size="sm"`.

## Desempenho

- Cada etiqueta mantém um observador de tamanho para a animação de largura; numa tabela com centenas de linhas isso soma, então pagine ou virtualize.

## Notas para IA

- Use `tone` para estado (`neutral`, `success`, `info`, `warning`, `danger`) e `color` para categoria; `color` vence `tone`, e `dot` é ignorado quando há `icon`.
- Passe o rótulo como texto puro (`<Badge>{status}</Badge>`): a troca animada só acontece quando o filho é string ou número, não JSX.
- O SVG de `icon` é redimensionado por CSS para 12, 14 ou 16 px conforme `size`; `outline` e `pill` só mudam a borda e os cantos.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/badge · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
