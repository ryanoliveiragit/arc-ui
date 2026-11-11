# Text reveal

> Revela um trecho curto de conteúdo com movimento discreto.

- Tipo: componente (categoria Texto)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/text-reveal
- Descrição original (inglês): Reveal a short piece of content with restrained motion.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/text-reveal.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/text-reveal.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/text-reveal.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/text-reveal.json`. Caminho do registro, relativo ao endereço do site: `r/text-reveal.json`.

- Pacotes npm: nenhum além do React
- Arquivos, depois de instalados:
  - `components/ryan-ui/text-reveal/text-reveal.tsx`
  - `components/ryan-ui/text-reveal/text-reveal.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: não há pacotes para instalar.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/text-reveal.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um título ou uma frase curta no topo de uma página ou seção, que deve animar logo ao aparecer, sem esperar rolagem.
- Páginas renderizadas no servidor: a entrada é só CSS, começa na primeira pintura e nunca deixa o texto escondido se o JavaScript atrasar.
- Repetir a entrada depois de uma ação, trocando a `key` do componente.

## Quando não usar

- Use [`in-view-title`](in-view-title.md) quando o título fica mais abaixo na página e deve animar ao entrar na tela.
- Use [`streaming-response`](streaming-response.md) para texto que chega aos poucos, palavra por palavra, como a resposta de um assistente.
- Para parágrafos longos ele não serve: cada palavra vira um elemento e a largura máxima é de 24 caracteres.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import TextReveal from "@/components/ryan-ui/text-reveal/text-reveal";
import { Button } from "@/components/ryan-ui/button/button";
import { Stack } from "./_kit";

export default function TextRevealDemo() {
  const [run, setRun] = useState(0);
  return (
    <Stack align="center" gap={5} width={520}>
      <div key={run} style={{ textAlign: "center" }}>
        <TextReveal text="Everything your team needs, in one calm place." />
      </div>
      <Button variant="secondary" size="sm" onClick={() => setRun(r => r + 1)}>Replay</Button>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `TextReveal`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `text` (obrigatória) | `string` | — | — |
| `as` | `"h1" \| "h2" \| "h3" \| "p"` | `"h2"` | — |
| `className` | `string` | — | — |
| `id` | `string` | — | — |
| `delay` | `number` | `0` | — |

## Acessibilidade

- Em títulos (`h1` a `h3`), o nome acessível vem de `aria-label` com a frase inteira; num `p`, que não aceita nome, há uma cópia oculta. As palavras animadas são `aria-hidden`.

## Movimento

- Cada palavra sobe de dentro de um recorte de borda suave enquanto sai de um desfoque (8 px em títulos, 4 px em parágrafos); o esmaecer termina primeiro e a subida por último.
- As palavras entram em sequência, com cerca de 0,5 s no total por mais longo que seja o texto, e `delay` atrasa o começo; no fim, nenhuma palavra fica com transform ou filtro.
- Com “reduzir movimento”, sobra só um esmaecer curto, sem subida nem desfoque.

## Comportamento responsivo

- A largura máxima é `24ch` e as linhas são equilibradas (`text-wrap: balance`); para um texto mais largo, mude a largura com `className`.

## Notas para IA

- Importe `TextReveal` de `@/components/ryan-ui/text-reveal/text-reveal`; o texto vai em `text`, com `\n` para uma quebra de linha escolhida. Não há prop de visibilidade: anima ao montar.
- Para repetir, mude a `key` do componente ou de um pai; para animar só quando a pessoa rolar até ele, use `in-view-title`.
- Ele não se centraliza sozinho (`margin: 0` e largura máxima de `24ch`): para centralizar, use `margin-inline: auto` via `className` ou um pai flex centralizado, como no demo.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/text-reveal · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
