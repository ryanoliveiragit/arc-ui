# Skeleton

> Reserva o espaço enquanto o conteúdo carrega e some em transição suave quando ele chega.

- Tipo: componente (categoria Feedback)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/skeleton
- Descrição original (inglês): Reserve space while content is still loading.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/skeleton.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/skeleton.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/skeleton.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/skeleton.json`. Caminho do registro, relativo ao endereço do site: `r/skeleton.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/skeleton/skeleton.tsx`
  - `components/ryan-ui/skeleton/skeleton.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/skeleton.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Reservar o espaço de um comentário, cartão ou bloco de texto enquanto os dados chegam, para a página não pular quando eles aparecem.
- Trocar o espaço reservado pelo conteúdo real no mesmo lugar: com filhos e `loading`, o esqueleto esmaece no conteúdo e a altura acompanha com uma mola.
- Itens de lista com foto e texto, como comentários ou contatos (`avatar` e `lines`).

## Quando não usar

- Use [`loader`](loader.md) para uma ação curta, como salvar, em que não há um bloco de conteúdo para reservar.
- Use [`progress`](progress.md) quando a espera tem fim conhecido e vale mostrar quanto falta.
- Para tabelas, gráficos ou layouts que não se parecem com linhas de texto, desenhe um esqueleto próprio: este só faz um avatar e até seis linhas.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Skeleton } from "@/components/ryan-ui/skeleton/skeleton";
import { Avatar } from "@/components/ryan-ui/avatar/avatar";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Stack, Surface } from "./_kit";
import { avatar } from "@/components/ryan-ui/lib/media";

export default function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <Stack gap={5} width={420}>
      <Surface>
        <Skeleton avatar lines={3} loading={loading} label="Loading comment">
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <Avatar name="Emma Collins" src={avatar("emma-collins")} />
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <strong>Emma Collins</strong>
              <span style={{ color: "var(--text-secondary)" }}>The new onboarding flow cut our setup time in half. Support was quick, and the migration took one afternoon.</span>
            </div>
          </div>
        </Skeleton>
      </Surface>
      <Button variant="secondary" onClick={() => setLoading(l => !l)}>{loading ? "Finish loading" : "Load again"}</Button>
      <Caption>The placeholder crossfades into the real content.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Skeleton`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | `"Loading content"` | — |
| `lines` | `number` | `3` | — |
| `avatar` | `boolean` | `false` | — |
| `className` | `string` | — | — |
| `children` | `ReactNode` | — | Content to reveal once loading finishes. With children, the placeholder crossfades into them. |
| `loading` | `boolean` | `true` | Keeps the placeholder visible while true. Only used together with children. |

## Acessibilidade

- O espaço reservado é `role="status"` com `aria-busy` e o nome de `label` (padrão “Loading content”, em inglês); os blocos são `aria-hidden`. Diga em `label` o que carrega.
- Com filhos, o contêiner tem `aria-busy` enquanto `loading` é `true`, e o conteúdo só entra no DOM quando a espera termina.

## Movimento

- Os blocos pulsam a opacidade em onda, cada um um pouco depois do de cima, e param depois de cerca de 20 s para não pulsar para sempre.
- Quando `loading` vira `false`, o esqueleto esmaece, o conteúdo entra subindo 4 px e a altura vai do tamanho do esqueleto ao do conteúdo com uma mola sem ultrapassagem.
- Com “reduzir movimento”, o pulso é desligado e a troca vira um esmaecer curto, sem animar a altura.

## Notas para IA

- Importe de `@/components/ryan-ui/skeleton/skeleton`. Dois usos: sozinho, como espaço reservado, ou envolvendo o conteúdo real com `loading={isLoading}`, que cuida da troca e da altura.
- `lines` vai de 1 a 6 e `avatar` põe um círculo à esquerda; escolha um número de linhas parecido com o conteúdo final para a altura mudar pouco.
- `loading` só tem efeito com filhos; sem filhos, o componente sempre mostra o esqueleto, então renderize-o só durante a espera.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/skeleton · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
