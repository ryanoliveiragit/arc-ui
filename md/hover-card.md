# Hover card

> Pré-visualiza uma pessoa ou link ao passar o mouse ou focar, sem sair da página.

- Tipo: componente (categoria Revelação)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/hover-card
- Descrição original (inglês): Preview a person or link on hover or focus without leaving the page.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hover-card.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hover-card.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hover-card.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hover-card.json`. Caminho do registro, relativo ao endereço do site: `r/hover-card.json`.

- Pacotes npm: `@radix-ui/react-popover`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/hover-card/hover-card.tsx`
  - `components/ryan-ui/hover-card/hover-card.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-popover motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/hover-card.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Menções a pessoas num texto, como autores e revisores, com `HoverCardProfile` mostrando foto, cargo, bio e números.
- Avatares ou nomes numa lista em que o clique deve continuar livre para abrir o perfil.
- Prévias de links ou referências que ajudam a decidir antes de sair da página.

## Quando não usar

- Use [`tooltip`](tooltip.md) para um texto curto que nomeia ou explica um controle.
- Use [`popover`](popover.md) quando o conteúdo tem botões, links ou campos: o cartão não recebe foco, então nada dentro dele é alcançável pelo teclado.
- Use [`citations`](citations.md) para fontes numeradas dentro de uma resposta de IA.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import HoverCard, { HoverCardProfile } from "@/components/ryan-ui/hover-card/hover-card";
import { avatar } from "@/components/ryan-ui/lib/media";
import { Stack } from "./_kit";

const link: React.CSSProperties = { font: "inherit", color: "var(--text-primary)", fontWeight: 600, background: "none", border: 0, padding: 0, cursor: "pointer", textDecoration: "underline", textDecorationColor: "var(--border-strong)", textUnderlineOffset: 3 };

export default function HoverCardDemo() {
  return (
    <Stack width={460}>
      <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}>
        The new onboarding flow was designed by{" "}
        <HoverCard content={<HoverCardProfile name="Emma Collins" role="Product designer, Growth" avatar={avatar("emma-collins")} bio="Designs onboarding and activation. Previously at a fintech start-up." stats={[{ label: "Projects", value: 24 }, { label: "Reviews", value: 138 }]} meta="Lisbon, 4:12 PM" />}>
          <button type="button" style={link}>Emma Collins</button>
        </HoverCard>{" "}
        and built with{" "}
        <HoverCard content={<HoverCardProfile name="Marcus Johnson" role="Frontend engineer, Platform" avatar={avatar("marcus-johnson")} bio="Maintains the component library and the build pipeline." stats={[{ label: "Commits", value: "1.2k" }, { label: "Reviews", value: 412 }]} meta="Austin, 10:12 AM" />}>
          <button type="button" style={link}>Marcus Johnson</button>
        </HoverCard>
        . Hover or focus a name to preview the profile.
      </p>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `HoverCard`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactElement` | — | The trigger, such as a mention button or a link. It must accept a ref and be focusable. |
| `content` (obrigatória) | `ReactNode` | — | The preview. `HoverCardProfile` covers people; any read only content works. |
| `side` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | — |
| `align` | `"start" \| "center" \| "end"` | `"start"` | — |
| `openDelay` | `number` | `OPEN_DELAY` | Milliseconds of hover before the first card opens. |
| `closeDelay` | `number` | `CLOSE_DELAY` | Milliseconds of grace after the pointer leaves, so it can travel into the card. |
| `className` | `string` | — | — |

### `HoverCardProfile`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `name` (obrigatória) | `string` | — | — |
| `role` | `string` | — | Role and team, such as "Product designer, Payments". |
| `avatar` | `string \| ReactNode` | — | A portrait URL, or your own image element such as next/image. Initials show when it is missing. |
| `bio` | `string` | — | — |
| `stats` | `HoverCardStat[]` | `[]` | — |
| `meta` | `ReactNode` | — | A footer line, such as a location and local time. |

### Tipos exportados

#### `HoverCardStat`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `value` (obrigatória) | `string \| number` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Ao focar o gatilho pelo teclado, o cartão abre na hora; ao sair do gatilho, fecha. |
| `Esc` | Fecha o cartão; ele só reabre depois que o foco ou o ponteiro saírem do gatilho e voltarem. |

## Acessibilidade

- O cartão tem `role="tooltip"` e, aberto, o gatilho recebe `aria-describedby` apontando para ele: o leitor de tela lê o conteúdo como descrição do gatilho.
- O foco nunca entra no cartão; mantenha o conteúdo só de leitura e deixe qualquer ação no próprio gatilho.
- No toque, um toque no gatilho abre e fecha o cartão; a foto do perfil tem `alt` vazio, porque o nome já está no texto.

## Movimento

- O primeiro cartão espera `openDelay` (500 ms); com outro aberto há pouco, o próximo abre em 80 ms e só esmaece.
- O cartão cresce a partir da borda do gatilho: sai de 96% e 4 px na direção dele numa mola sem ultrapassagem, e volta de onde estiver se o ponteiro retornar durante a saída.
- Com “reduzir movimento” ligado, o cartão só esmaece, as linhas do perfil não entram em sequência e a foto não sai de um desfoque.

## Comportamento responsivo

- A largura é de 18,5rem, encolhendo até a largura disponível, e o cartão troca de lado quando não cabe, com 12 px de folga da borda.

## Notas para IA

- O filho é o gatilho e precisa aceitar `ref` e receber foco, como um `<button>` ou um link; a prévia vai em `content`.
- Só um cartão fica aberto por vez na página inteira; não é preciso coordenar as instâncias.
- `HoverCardProfile` aceita `avatar` como URL ou como elemento (por exemplo `next/image`) e mostra as iniciais sem foto. Importe de `@/components/ryan-ui/hover-card/hover-card`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/hover-card · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
