# Expandable control

> Botão de ícone ou chip que se alarga com mola ao ser pressionado e revela o rótulo ou uma ação extra.

- Tipo: componente (categoria Ações), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/expandable-control
- Descrição original (inglês): An icon button or chip that widens on a spring when pressed to reveal its label and an optional trailing action.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-control.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-control.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-control.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-control.json`. Caminho do registro, relativo ao endereço do site: `r/expandable-control.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/expandable-control/expandable-control.tsx`
  - `components/ryan-ui/expandable-control/expandable-control.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/expandable-control.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Uma fileira de ícones em que só o controle em uso mostra o nome, como Compartilhar, Salvar e Avisar num artigo.
- Filtros ou estados em forma de chip (`variant="chip"`) que, ativos, mostram o valor e uma ação de limpar, como “Status: Aberto ×”.

## Quando não usar

- Use [`expanding-button-group`](expanding-button-group.md) quando os ícones formam uma barra única e o rótulo deve seguir o ponteiro ou o foco, sem clique.
- Use [`chip-group`](chip-group.md) quando a pessoa escolhe entre várias opções de filtro.
- Use [`button`](button.md) com rótulo quando a ação é usada com frequência: aqui o nome só aparece depois de um clique.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Bell, Bookmark, Check, Copy, Filter, Radio, Share2, X } from "lucide-react";
import { ExpandableControl } from "@/components/ryan-ui/expandable-control/expandable-control";
import { Caption, Row, Stack } from "./_kit";

type Tool = "share" | "save" | "alerts";

export default function ExpandableControlDemo() {
  const [open, setOpen] = useState<Tool | null>("share");
  const [copied, setCopied] = useState(false);
  const [live, setLive] = useState(false);
  const [filter, setFilter] = useState(true);

  const toggle = (tool: Tool) => (next: boolean) => setOpen(next ? tool : null);
  const copy = () => { setCopied(true); window.setTimeout(() => setCopied(false), 1600); };

  return (
    <Stack gap={8} align="center">
      <Stack gap={3} align="center">
        <Row gap={2} justify="center">
          <ExpandableControl
            tone="accent"
            icon={<Share2 size={18} />}
            label={copied ? "Link copied" : "Share article"}
            expanded={open === "share"}
            onExpandedChange={toggle("share")}
            action={{ icon: copied ? <Check size={16} /> : <Copy size={16} />, label: "Copy link", onClick: copy }}
          />
          <ExpandableControl tone="accent" icon={<Bookmark size={18} />} label="Saved to Reading list" expanded={open === "save"} onExpandedChange={toggle("save")} />
          <ExpandableControl tone="accent" icon={<Bell size={18} />} label="Notify me" detail="weekly" expanded={open === "alerts"} onExpandedChange={toggle("alerts")} />
        </Row>
        <Caption>Press an icon: it opens in place and the others make room.</Caption>
      </Stack>

      <Row gap={2} justify="center">
        <ExpandableControl variant="chip" icon={<Radio size={15} />} label="Live now" detail="128 watching" expanded={live} onExpandedChange={setLive} />
        <ExpandableControl
          variant="chip"
          icon={<Filter size={15} />}
          label="Status: Open"
          expanded={filter}
          onExpandedChange={setFilter}
          action={{ icon: <X size={14} />, label: "Clear filter", onClick: () => setFilter(false) }}
        />
      </Row>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ExpandableControl`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `icon` (obrigatória) | `ReactNode` | — | Always visible. Usually a 16 to 18 px icon. |
| `label` (obrigatória) | `string` | — | The text revealed when the control opens. Also its accessible name while only the icon shows. |
| `expanded` | `boolean` | — | Open state (controlled). |
| `defaultExpanded` | `boolean` | `false` | Open at first (uncontrolled). |
| `onExpandedChange` | `(expanded: boolean) => void` | — | Runs when the control opens or closes. |
| `action` | `ExpandableControlAction` | — | A second button revealed after the label, such as copy, clear or dismiss. |
| `variant` | `"button" \| "chip"` | `"button"` | `button` is a round control at the standard control height; `chip` is the compact pill for tags and filters. |
| `tone` | `"neutral" \| "accent"` | `"neutral"` | `accent` fills the control with the accent color while it is open. |
| `detail` | `ReactNode` | — | Extra content shown after the label while open, such as a count. |
| `disabled` | `boolean` | `false` | Turns the control off: it is dimmed and ignores pointer and keyboard input. |
| `className` | `string` | — | Extra class names for the root element. |

### Tipos exportados

#### `ExpandableControlAction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `icon` (obrigatória) | `ReactNode` | Icon of the trailing button. |
| `label` (obrigatória) | `string` | Accessible name of the trailing button, for example "Copy link". |
| `onClick` (obrigatória) | `() => void` | Runs when the trailing button is pressed. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No botão principal, abrem ou fecham o controle; na ação extra, executam `action.onClick`. |
| `Esc` | Com o controle aberto, fecha e devolve o foco ao botão principal. |

## Acessibilidade

- O botão principal tem `aria-expanded` e `aria-label` igual a `label`, aberto ou fechado; o rótulo visível e `detail` ficam em `aria-hidden`, então o que estiver só em `detail` não é anunciado.
- A ação extra é um segundo `<button>` com `aria-label` e `title` vindos de `action.label`; ela só existe com o controle aberto e vem logo depois do principal na ordem do `Tab`.

## Movimento

- Ao abrir, a largura cresce numa mola sem ultrapassagem e o rótulo desliza 8 px saindo de um leve desfoque; ao fechar, ele esmaece rápido enquanto a largura se recolhe, e os vizinhos acompanham sem pulo.
- O ícone fica parado numa caixa do tamanho do controle fechado e encolhe para 0,86 na pressão; a ação extra encolhe para 0,9.
- Com “reduzir movimento”, o rótulo e a ação só esmaecem, a largura muda de uma vez e a pressão não altera a escala.

## Notas para IA

- Para que só um fique aberto por vez, controle no pai: `expanded={aberto === "share"}` e `onExpandedChange={v => setAberto(v ? "share" : null)}`.
- `action` recebe `icon`, `label` e `onClick` e só aparece com o controle aberto; `detail` acrescenta um texto depois do rótulo, como uma contagem.
- `tone="accent"` preenche com a cor de destaque quando aberto, e `variant="chip"` é a versão compacta, de 2rem de altura, para filtros e tags.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/expandable-control · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
