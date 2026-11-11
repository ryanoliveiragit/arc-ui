# Expandable card

> Dá mais espaço a um cartão denso quando a pessoa pede.

- Tipo: componente (categoria Revelação)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/expandable-card
- Descrição original (inglês): Give a dense card more room when requested.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-card.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-card.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-card.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-card.json`. Caminho do registro, relativo ao endereço do site: `r/expandable-card.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/expandable-card/expandable-card.tsx`
  - `components/ryan-ui/expandable-card/expandable-card.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/expandable-card.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Cartões de eventos ou reuniões que mostram título e horário e revelam pauta e participantes quando pedidos.
- Resumos densos num painel que podem crescer também para os lados ao abrir, com `width` e `expandedWidth`.
- Cartões cuja linha de apoio muda com o tempo: só as palavras novas de `description` animam.

## Quando não usar

- Use [`collapsible`](collapsible.md) quando o estado aberto precisa ser controlado de fora; este cartão só aceita `defaultExpanded`.
- Use [`center-morph-modal`](center-morph-modal.md) quando os detalhes são longos e merecem uma janela focada.
- Use [`accordion`](accordion.md) para uma lista de seções em que só uma fica aberta por vez.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import ExpandableCard from "@/components/ryan-ui/expandable-card/expandable-card";
import { Caption, Stack } from "./_kit";

export default function ExpandableCardDemo() {
  return (
    <Stack gap={4} width={460} align="center">
      <ExpandableCard title="Q3 roadmap review" description="Thursday, 2:00 PM, Room 4B" width={360} expandedWidth={460}>
        <Stack gap={3}>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" }}>We will walk through shipped work, the revised launch date for the mobile app, and staffing for the payments migration.</p>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" }}>Attendees: Emma Collins, Marcus Johnson, Jasmine Brooks, Olivia Bennett.</p>
        </Stack>
      </ExpandableCard>
      <Caption>Open the card to see it grow in height and width.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ExpandableCard`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` (obrigatória) | `string` | — | — |
| `description` | `string` | — | — |
| `children` (obrigatória) | `ReactNode` | — | — |
| `defaultExpanded` | `boolean` | `false` | — |
| `width` | `number` | — | Collapsed width cap in px. The card is centered and never wider than its container. Fills the container when omitted. |
| `expandedWidth` | `number` | — | Expanded width cap in px, so the card can grow sideways into more room. Defaults to `width`. |
| `...props` | `ComponentPropsWithoutRef<"article">` | — | Também aceita as props deste tipo, menos `title`, `children`, `onAnimationStart`, `onAnimationEnd`, `onAnimationIteration`, `onDrag`, `onDragStart`, `onDragEnd`, `onDragOver`, `onDragLeave`, `onDragEnter`, `onDragExit` e `onDrop`. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No cabeçalho, abre ou fecha o cartão. |
| `Esc` | Com o cartão aberto e o foco dentro dele, fecha e devolve o foco ao cabeçalho. |

## Acessibilidade

- O cabeçalho é um `<button>` com `aria-expanded` e `aria-controls`; fechado, o painel fica `inert`, fora do foco e do leitor de tela.
- A `description` animada tem uma cópia oculta para o leitor de tela, que lê a frase inteira em vez das palavras soltas.

## Movimento

- Largura e altura crescem na mesma mola sem ultrapassagem, com tamanho real em vez de escala, então texto, borda e cantos não esticam.
- Ao fechar, os detalhes esmaecem primeiro e a caixa encolhe 60 ms depois; ao abrir, eles aparecem quando a caixa já abriu espaço, e a seta gira 180°.
- Com “reduzir movimento” ligado, o cartão abre e fecha na hora.

## Comportamento responsivo

- Um observador mede a largura disponível: o cartão fica centralizado, nunca passa do contêiner, e `width` e `expandedWidth` funcionam só como limites.

## Notas para IA

- Não há `expanded` nem `onExpandedChange`: o estado é interno e começa por `defaultExpanded`.
- Sem `width`, o cartão ocupa o contêiner; para ele crescer de lado ao abrir, passe os dois limites, como `width={360}` e `expandedWidth={460}`.
- `title` e `description` são texto; os detalhes vão em `children`. Importe de `@/components/ryan-ui/expandable-card/expandable-card`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/expandable-card · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
