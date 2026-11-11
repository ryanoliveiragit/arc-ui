# Text morph

> Transforma um rótulo no próximo estado, letra por letra.

- Tipo: componente (categoria Texto)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/text-morph
- Descrição original (inglês): Morph a label into its next state, letter by letter.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/text-morph.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/text-morph.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/text-morph.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/text-morph.json`. Caminho do registro, relativo ao endereço do site: `r/text-morph.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/text-morph/text-morph.tsx`
  - `components/ryan-ui/text-morph/text-morph.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/text-morph.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Rótulos de estado que mudam poucas letras, como “Publicar”, “Publicando” e “Publicado”, ou “Seguir” e “Seguindo”.
- Status curtos em botões, selos ou títulos, em que a largura nova deve deslizar em vez de pular e empurrar o que está ao lado.

## Quando não usar

- Use [`slot-text`](slot-text.md) para números e valores que devem girar como roletas, como preços e contadores.
- Use [`action-swap`](action-swap.md) para um botão compacto que passa por estados como ocioso, trabalhando e concluído, com ícone e largura mudando juntos.
- Para frases longas ou texto de várias linhas ele não serve: fica numa linha só e anima letra por letra.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import TextMorph from "@/components/ryan-ui/text-morph/text-morph";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Stack } from "./_kit";

const states = ["Draft", "In review", "Approved", "Published"];

export default function TextMorphDemo() {
  const [i, setI] = useState(0);
  return (
    <Stack align="center" gap={5}>
      <TextMorph as="h2">{states[i]!}</TextMorph>
      <Button variant="secondary" onClick={() => setI((i + 1) % states.length)}>Advance status</Button>
      <Caption>Shared letters stay put while the rest morph.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `TextMorph`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `string` | — | — |
| `as` | `"span" \| "div" \| "p" \| "strong" \| "h1" \| "h2" \| "h3"` | `"span"` | — |
| `className` | `string` | — | — |
| `id` | `string` | — | — |

## Acessibilidade

- O texto atual fica num `span` visualmente oculto e as letras animadas são `aria-hidden`, então o leitor de tela lê a palavra inteira, nunca letras soltas.
- A troca não é anunciada; se a mudança precisa ser ouvida, ponha o componente dentro de uma região `aria-live` sua.

## Movimento

- Letras em comum deslizam até a nova posição com uma mola sem ultrapassagem; as novas surgem de um leve desfoque, em ordem de leitura, e as removidas se desfazem.
- A largura acompanha o texto novo com a mesma mola e uma borda suave revela as letras que chegam, então o layout em volta desliza em vez de pular.
- Com “reduzir movimento”, o texto troca na hora.

## Notas para IA

- Importe `TextMorph` de `@/components/ryan-ui/text-morph/text-morph` e passe uma string como filho: `<TextMorph>{status}</TextMorph>`; elementos como filhos não funcionam.
- Rende mais quando os rótulos compartilham letras, que ficam no lugar; com palavras sem nada em comum, todas as letras saem e entram de novo. Use `as` para o elemento certo (`h2`, `strong`).
- Fica numa linha só (`nowrap`): reserve espaço para o rótulo mais longo ou deixe a largura variar com o texto.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/text-morph · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
