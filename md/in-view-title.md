# In-view title

> Título que entra com animação ao aparecer na rolagem.

- Tipo: componente (categoria Texto)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/in-view-title
- Descrição original (inglês): Bring a section title in as it scrolls into view.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/in-view-title.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/in-view-title.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/in-view-title.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/in-view-title.json`. Caminho do registro, relativo ao endereço do site: `r/in-view-title.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/in-view-title/in-view-title.tsx`
  - `components/ryan-ui/in-view-title/in-view-title.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/in-view-title.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Títulos de seção em páginas longas, como landing pages e páginas de produto, que entram quando a seção chega à tela.
- Tons diferentes de entrada: `blur` serve para quase todo título, `word` e `line` para páginas editoriais, `tracking` para títulos curtos de destaque e `wipe` para revelar da esquerda para a direita.
- Títulos com quebras de linha escolhidas a dedo, passando `lines` na variante `line`.

## Quando não usar

- Use [`text-reveal`](text-reveal.md) para um título que deve animar logo ao montar, como no topo da página, sem esperar a rolagem.
- Use [`scroll-reveal`](scroll-reveal.md) para revelar blocos inteiros ao rolar, como cartões, listas e parágrafos, e não só o título.
- Em telas de trabalho que a pessoa usa todo dia, como painéis e formulários, título animado só atrasa a leitura; use um título comum.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import InViewTitle from "@/components/ryan-ui/in-view-title/in-view-title";
import type { InViewTitleVariant } from "@/components/ryan-ui/in-view-title/in-view-title";
import { Button } from "@/components/ryan-ui/button/button";
import { Row, Stack } from "./_kit";

const variants: InViewTitleVariant[] = ["blur", "word", "line", "tracking", "wipe"];

export default function InViewTitleDemo() {
  const [variant, setVariant] = useState<InViewTitleVariant>("blur");
  return (
    <Stack gap={6} align="center" width={560}>
      <div style={{ minHeight: 96, display: "grid", placeItems: "center", textAlign: "center" }}>
        <InViewTitle key={variant} variant={variant} text="Ship interfaces people remember" lines={["Ship interfaces", "people remember"]} />
      </div>
      <Row justify="center" gap={2}>
        {variants.map(v => <Button key={v} size="sm" variant={v === variant ? "primary" : "secondary"} onClick={() => setVariant(v)}>{v}</Button>)}
      </Row>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `InViewTitle`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `text` (obrigatória) | `string` | — | — |
| `variant` | `"word" \| "line" \| "blur" \| "tracking" \| "wipe"` | `"blur"` | — |
| `as` | `"h1" \| "h2" \| "h3"` | `"h2"` | — |
| `lines` | `string[]` | — | — |
| `className` | `string` | — | — |
| `id` | `string` | — | — |
| `once` | `boolean` | `true` | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `InViewTitleVariant` | `"word" \| "line" \| "blur" \| "tracking" \| "wipe"` |

## Acessibilidade

- O título é um `h2` de verdade (ou `h1` e `h3` via `as`) com `aria-label` igual a `text`; palavras e letras animadas são `aria-hidden`, então o leitor de tela lê a frase inteira uma vez.
- Títulos que já ficaram acima da tela são revelados mesmo sem passar por ela, e no servidor um fallback em CSS mostra o título após 2,4 s se o JavaScript atrasar, então o texto não fica escondido.

## Movimento

- `blur` sobe cada palavra enquanto ela sai de um desfoque; `word` e `line` sobem palavras ou linhas de dentro de um recorte; `tracking` aproxima as letras até o espaçamento normal; `wipe` descobre o título por uma borda suave.
- Nas variantes por palavra, a sequência inteira dura no máximo cerca de 0,4 s; a opacidade chega primeiro, o desfoque depois e o deslocamento por último, para dar para ler antes de assentar.
- Dispara quando 45% do título está visível; com `once={false}`, volta a se esconder rápido ao sair e anima de novo na volta. Com “reduzir movimento”, aparece pronto, sem animação.

## Desempenho

- A variante `tracking` cria um elemento por letra; em títulos longos, prefira `blur` ou `line`.

## Notas para IA

- Importe `InViewTitle` de `@/components/ryan-ui/in-view-title/in-view-title`; o texto vai em `text` (não em filhos) e o nível do título em `as`.
- Na variante `line`, passe `lines` com as quebras; sem ela, o título inteiro vira uma linha só. As outras variantes quebram entre as palavras.
- A animação roda uma vez por padrão; `once={false}` repete a cada entrada na tela, e trocar a `key` remonta o título e anima de novo, como no demo.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/in-view-title · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
