# Text shimmer

> Indica trabalho em andamento com uma luz calma passando pelo texto.

- Tipo: componente (categoria Texto)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/text-shimmer
- Descrição original (inglês): Show ongoing work with a calm light across the words.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/text-shimmer.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/text-shimmer.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/text-shimmer.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/text-shimmer.json`. Caminho do registro, relativo ao endereço do site: `r/text-shimmer.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/text-shimmer/text-shimmer.tsx`
  - `components/ryan-ui/text-shimmer/text-shimmer.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/text-shimmer.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Uma linha curta de status enquanto algo trabalha: “Pensando”, “Gerando resumo”, “Analisando 1.284 transações…”.
- Status que termina no mesmo lugar: com `active={false}`, a luz sai, o texto fica sólido e um rótulo novo, como “Análise concluída”, sobe no lugar.

## Quando não usar

- Use [`loading-states`](loading-states.md) para um indicador de IA mais completo, com pontos, frases que se revezam ou contador de passos.
- Use [`skeleton`](skeleton.md) para reservar o espaço de um conteúdo que ainda não chegou.
- Use [`progress`](progress.md) quando dá para mostrar quanto falta.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import TextShimmer from "@/components/ryan-ui/text-shimmer/text-shimmer";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Stack } from "./_kit";

export default function TextShimmerDemo() {
  const [working, setWorking] = useState(true);
  return (
    <Stack align="center" gap={5}>
      <TextShimmer as="p" active={working}>{working ? "Analyzing 1,284 transactions…" : "Analysis complete"}</TextShimmer>
      <Button variant="secondary" onClick={() => setWorking(w => !w)}>{working ? "Finish" : "Start again"}</Button>
      <Caption>The light sweeps only while work is ongoing.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `TextShimmer`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `string` | — | The status text. Keep it to one short line. |
| `active` | `boolean` | `true` | Sweep while work is ongoing. Defaults to true. |
| `duration` | `number` | `1.8` | Seconds for one sweep across the text. Defaults to 1.8. |
| `as` | `"span" \| "p" \| "div" \| "h2" \| "h3" \| "h4"` | `"span"` | — |
| `className` | `string` | — | — |
| `id` | `string` | — | — |

## Acessibilidade

- Com `active`, o elemento recebe `aria-busy`; o fim do trabalho não é anunciado, então avise numa região viva sua.
- Em alto contraste (`forced-colors`) ou sem suporte a `color-mix`, o efeito some e o texto aparece na cor normal.

## Movimento

- Uma faixa de luz na cor do texto atravessa as palavras em ritmo linear a cada `duration` (padrão 1,8 s), com uma pausa curta entre as passagens.
- Ao desligar `active`, a faixa termina de passar e o texto assenta na cor sólida; um rótulo novo sobe com leve desfoque e a largura acompanha com uma mola.
- Com “reduzir movimento”, não há faixa: o texto fica na cor base, mais apagada, enquanto `active`, e sólido no fim; a troca de rótulo vira um esmaecer.

## Desempenho

- A faixa só anda com o texto na tela (com 64 px de margem) e a aba visível, e retoma de onde parou; fora da tela, nenhuma animação roda.

## Notas para IA

- Importe `TextShimmer` de `@/components/ryan-ui/text-shimmer/text-shimmer`; o texto vai como filho (string) e `active` liga e desliga a luz.
- Mantenha numa linha curta; a cor da faixa vem da cor do texto, e dá para ajustar com `--text-shimmer-highlight` e `--text-shimmer-base`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/text-shimmer · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
