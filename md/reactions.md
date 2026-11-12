# Reactions

> Reage a uma publicação com um toque, com contadores que rolam.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/reactions
- Descrição original (inglês): Acknowledge a post in one tap, with counts that roll.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/reactions.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/reactions.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/reactions.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/reactions.json`. Caminho do registro, relativo ao endereço do site: `r/reactions.json`.

- Pacotes npm: `@radix-ui/react-popover`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/reactions/reactions.tsx`
  - `components/ryan-ui/reactions/reactions.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-popover lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/reactions.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Reconhecimento rápido de um post, comentário ou nota de versão, com a contagem de cada reação e as suas em destaque.
- Quando o conjunto de reações possíveis é fixo e curto (`options`) e só as que já têm votos devem aparecer na barra.

## Quando não usar

- Use [`comment-thread`](comment-thread.md) quando a pessoa precisa responder com texto, não só reagir.
- Use [`icon-morph`](icon-morph.md) com `name="heart"` dentro de um botão seu quando há uma única reação de curtir, sem contagem por tipo.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { Flame, Heart, PartyPopper, Rocket, ThumbsUp, Laugh } from "lucide-react";
import Reactions from "@/components/ryan-ui/reactions/reactions";
import { Caption, Room, Surface, demoStage, useQuietFirstOpen } from "./_kit";

const options = [
  { id: "like", label: "Like", icon: ThumbsUp },
  { id: "love", label: "Love", icon: Heart },
  { id: "celebrate", label: "Celebrate", icon: PartyPopper },
  { id: "funny", label: "Funny", icon: Laugh },
  { id: "fire", label: "Fire", icon: Flame },
  { id: "launch", label: "Launch", icon: Rocket },
];

export default function ReactionsDemo() {
  // The picker is already open over the bar, inside the stage, so the full set of reactions shows.
  const quiet = useQuietFirstOpen();
  return (
    <Room above={64} width={440}>
      <Surface padding={5} style={{ display: "grid", gap: "var(--space-4)" }}>
        <div>
          <strong style={{ display: "block" }}>v2.0 is live</strong>
          <span style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>Dark mode, faster builds, and 40 new components. Thanks to everyone who tested the beta.</span>
        </div>
        <Reactions
          label="Reactions to the v2.0 announcement"
          defaultOpen
          onOpenAutoFocus={quiet}
          container={demoStage()}
          options={options}
          defaultValue={[
            { id: "celebrate", count: 24, reacted: false },
            { id: "love", count: 11, reacted: true },
            { id: "launch", count: 7, reacted: false },
          ]}
        />
      </Surface>
      <Caption>Tap a pill to add or remove your reaction, or open the picker for more.</Caption>
    </Room>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Reactions`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `options` (obrigatória) | `ReactionOption[]` | — | Every reaction the picker offers, in picker order. |
| `value` | `Reaction[]` | — | Controlled reactions. Pills keep this order, and a reaction whose count reaches zero leaves the bar. |
| `defaultValue` | `Reaction[]` | `[]` | — |
| `onValueChange` | `(next: Reaction[], change: { id: string; reacted: boolean }) => void` | — | Called with the next reactions and the change that produced them. |
| `label` | `string` | `"Reactions"` | Accessible name for the bar. |
| `open` | `boolean` | — | Picker open state; omit it to let the bar manage its own open/closed state. |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `defaultOpen` | `boolean` | `false` | Starts with the picker open (uncontrolled). |
| `container` | `HTMLElement \| null` | — | Render the picker inside this element and limit collisions to it (used by the demo stages). |
| `onOpenAutoFocus` | `(event: Event) => void` | — | Called before the picker moves focus in on open; call event.preventDefault() to keep focus where it is (for a picker that starts open). |
| `className` | `string` | — | — |

### Tipos exportados

#### `ReactionOption`

A reaction bar for comments, posts, and release notes. Each pill shows one reaction and how many people chose it; the viewer's own reactions carry the accent. Tapping a pill adds or removes the viewer's reaction, and the add button opens a compact picker that grows from it. Use it for quick acknowledgement; when people need to say something specific, give them a reply field instead.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `icon` (obrigatória) | `LucideIcon` | — |

#### `Reaction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `count` (obrigatória) | `number` | — |
| `reacted` (obrigatória) | `boolean` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Numa pílula, adicionam ou removem a sua reação; no botão de adicionar, abrem o seletor com o foco na primeira opção. |
| `→` ou `←` | No seletor, movem o foco entre as opções e dão a volta nas pontas; `↓` e `↑` fazem o mesmo. |
| `Home` ou `End` | No seletor, vão para a primeira e a última opção. |
| `Esc` | Fecha o seletor e devolve o foco ao botão de adicionar; escolher uma opção com `Enter` ou `Espaço` faz o mesmo e aplica a reação. |

## Acessibilidade

- A barra é `role="group"` com `label` como nome; cada pílula é um botão com `aria-pressed` e um nome com a reação e a contagem, como “Love, 11 reactions, including yours”.
- O botão de adicionar abre um diálogo do Radix com uma barra `role="toolbar"` de opções em tabindex móvel; cada mudança é anunciada num `role="status"`, e se a pílula em foco some, o foco passa à vizinha.
- Nomes e anúncios são montados em inglês no código (“reactions”, “including yours”, “Add reaction”, “Added …”); numa interface em português, traduza essas strings no arquivo instalado e passe `label`.

## Movimento

- Os dígitos da contagem rolam na direção da mudança, para cima quando sobe e para baixo quando desce, e só os que mudam se movem; ao reagir, o ícone recebe um impulso de mola em escala e giro.
- Pílulas novas surgem de meia escala saindo de um desfoque, as outras deslizam para abrir espaço e a altura da barra acompanha numa mola ao quebrar linha; o seletor cresce a partir do botão, com as opções em sequência.
- Com “reduzir movimento”, os números trocam sem rolar, o ícone não pula, as pílulas só esmaecem e o seletor aparece sem crescer.

## Comportamento responsivo

- As pílulas quebram linha conforme a largura, e a altura da barra muda numa mola em vez de empurrar o conteúdo de baixo de uma vez; o seletor abre acima do botão e fica a 12 px das bordas da janela.

## Notas para IA

- Em `options`, `icon` é o componente da Lucide (`ThumbsUp`), não um elemento (`<ThumbsUp />`); cada reação em `value` ou `defaultValue` é `{ id, count, reacted }`.
- Controlado, guarde a lista que chega em `onValueChange(next, change)` e devolva em `value`; as pílulas seguem a ordem da lista, e uma reação com `count` 0 sai da barra.
- A barra só conta: não sabe quem reagiu nem fala com o servidor; envie `change` (`id` e `reacted`) à sua API.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/reactions · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
