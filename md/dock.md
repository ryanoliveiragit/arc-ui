# Dock

> Dock de aplicativos: os ícones crescem perto do cursor, mostram o nome, pulam ao clicar e o ativo ganha um ponto.

- Tipo: componente (categoria Ações), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/dock
- Descrição original (inglês): An app dock whose tiles magnify around the cursor, show a tooltip, bounce when pressed and mark the active one with a dot.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dock.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dock.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dock.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dock.json`. Caminho do registro, relativo ao endereço do site: `r/dock.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/dock/dock.tsx`
  - `components/ryan-ui/dock/dock.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/dock.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um lançador de aplicativos ou de áreas no rodapé de uma tela, com poucos ícones e um item ativo.
- Interfaces de demonstração ou criativas em que a ampliação sob o cursor faz parte da identidade.

## Quando não usar

- Use [`floating-button-group`](floating-button-group.md) para barras de ferramentas de trabalho, com rótulos e atalhos, em que tiles que crescem e quicam atrapalhariam.
- Use [`bounce-sidebar`](bounce-sidebar.md) ou [`animated-sidebar`](animated-sidebar.md) para a navegação principal de um app com muitas seções e nomes sempre visíveis.
- Evite como única navegação em telas estreitas: no toque não há ampliação nem balão com o nome, e a fileira não se adapta à largura.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Calendar, Mail, Music, NotebookPen, Settings, Terminal } from "lucide-react";
import { Dock } from "@/components/ryan-ui/dock/dock";
import type { DockItem } from "@/components/ryan-ui/dock/dock";
import { Caption, Stack } from "./_kit";

const icon = { size: 20, strokeWidth: 1.75 };
const apps: DockItem[] = [
  { id: "mail", label: "Mail", icon: <Mail {...icon} />, open: true },
  { id: "calendar", label: "Calendar", icon: <Calendar {...icon} /> },
  { id: "notes", label: "Notes", icon: <NotebookPen {...icon} />, open: true },
  { id: "music", label: "Music", icon: <Music {...icon} /> },
  { id: "terminal", label: "Terminal", icon: <Terminal {...icon} />, open: true },
  { id: "settings", label: "Settings", icon: <Settings {...icon} />, separatorBefore: true },
];

export default function DockDemo() {
  const [active, setActive] = useState<string | null>("notes");
  const name = apps.find(app => app.id === active)?.label;
  return (
    <Stack gap={5} align="center" style={{ paddingTop: "var(--space-12)" }}>
      <Dock items={apps} size={40} value={active} onValueChange={setActive} label="Applications" />
      <Caption>{name ? `${name} is in front.` : "Nothing is open."} Hover the dock or use the arrow keys.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Dock`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` (obrigatória) | `DockItem[]` | — | The tiles, left to right. |
| `value` | `string \| null` | — | Id of the active item (controlled). Pass null for none. |
| `defaultValue` | `string \| null` | `null` | Active item when uncontrolled. |
| `onValueChange` | `(value: string) => void` | — | Called with the id of the pressed item. |
| `size` | `number` | `48` | Tile size at rest, in pixels. |
| `magnification` | `number` | `1.6` | How much the tile under the cursor grows: 1.6 means 60% larger. |
| `range` | `number` | `140` | Distance in pixels over which the magnification falls off to nothing. |
| `label` | `string` | `"Dock"` | Accessible name of the toolbar. |
| `className` | `string` | — | Extra class for the dock bar. |

### Tipos exportados

#### `DockItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique id, reported by `onValueChange` when the item is pressed. |
| `label` (obrigatória) | `string` | Name shown in the tooltip and announced to screen readers. |
| `icon` (obrigatória) | `ReactNode` | The icon, usually an SVG sized around 45% of the tile. |
| `open` | `boolean` | Draws a quiet dot under the icon, for something that is running in the background. |
| `separatorBefore` | `boolean` | Draws a thin divider before this item, to split the dock into groups. |
| `disabled` | `boolean` | Keeps the item visible but not pressable. |
| `onSelect` | `() => void` | Runs when the item is pressed, after the bounce starts. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `→` ou `←` | Movem o foco entre os tiles habilitados e dão a volta nas pontas; o tile em foco é ampliado como se o cursor estivesse sobre ele. |
| `Home` ou `End` | Vão para o primeiro e o último tile habilitado. |
| `Enter` ou `Espaço` | Acionam o tile: ele quica, vira o ativo e chama `onValueChange` e `onSelect`. |

## Acessibilidade

- O contêiner é `role="toolbar"` com `aria-label` (padrão em inglês, “Dock”); cada tile é um `<button>` com `aria-label` igual a `label` e `aria-pressed` marcando o ativo.
- O balão com o nome é só visual (`aria-hidden`) e aparece com o ponteiro ou com o foco do teclado; o ponto de `open` também é decorativo e não é anunciado.
- Todos os tiles são paradas de `Tab`, além das setas; `separatorBefore` insere um `role="separator"` vertical.

## Movimento

- Com mouse ou caneta, cada tile cresce conforme a proximidade do cursor, numa curva que se apaga em `range` px (140), suavizada por uma mola; o tile sob o cursor chega a `magnification` vezes o tamanho (1,6).
- Ao pressionar, o tile dá dois pulos, um alto e um baixo (0,62 s); o ponto sob o ativo se alonga numa barra curta, e o balão com o nome sobe e esmaece acima do tile.
- No toque não há ampliação nem balão; com “reduzir movimento”, também não há ampliação nem pulos, e o balão só esmaece.

## Comportamento responsivo

- O dock não rola nem quebra linha: os tiles têm largura fixa (`size`), e num contêiner mais estreito que a fileira eles transbordam; dimensione `size` e a quantidade de itens para a menor tela.
- Os tiles crescem para cima a partir da base da barra, que mantém a altura; deixe espaço livre acima do dock para os tiles ampliados e o balão.

## Desempenho

- A cada movimento do ponteiro sobre o dock, cada tile mede a própria posição e anima o tamanho numa mola; pense em uma dezena de tiles, não em dezenas.

## Notas para IA

- Cada item precisa de `id`, `label` e `icon` (um SVG de uns 45% de `size`); controle o ativo com `value` e `onValueChange`, ou deixe interno com `defaultValue`.
- `open` desenha o ponto de “em execução”, `separatorBefore` uma divisória antes do item e `disabled` o deixa visível mas inerte; `size`, `magnification` e `range` ajustam a ampliação.
- Dê ao pai espaço acima do dock (o demo usa `padding-top` de `--space-12`) e largura para a fileira inteira.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/dock · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
