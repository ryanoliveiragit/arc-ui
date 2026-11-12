# Tooltip

> Texto curto de apoio para controles pouco familiares.

- Tipo: componente (categoria Revelação)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/tooltip
- Descrição original (inglês): Short supporting text for unfamiliar controls.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tooltip.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tooltip.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tooltip.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tooltip.json`. Caminho do registro, relativo ao endereço do site: `r/tooltip.json`.

- Pacotes npm: `@radix-ui/react-tooltip`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/tooltip/tooltip.tsx`
  - `components/ryan-ui/tooltip/tooltip.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-tooltip motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/tooltip.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Nomear botões só com ícone numa barra de ferramentas, como Negrito, Itálico e Link.
- Mostrar o atalho de teclado de um controle, como “Bold (Ctrl+B)”.
- Uma explicação curta para um controle pouco familiar; se o texto muda com o balão aberto, como “Copiar” para “Copiado”, a troca é animada.

## Quando não usar

- Use [`hover-card`](hover-card.md) para prévias ricas de uma pessoa ou de um link.
- Use [`popover`](popover.md) quando o conteúdo tem botões, links ou campos.
- Evite para informação essencial: com toque o tooltip não abre, então ela deve estar visível na tela.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { Bold, Italic, Link2, Share2 } from "lucide-react";
import Tooltip from "@/components/ryan-ui/tooltip/tooltip";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack, demoStage } from "./_kit";

export default function TooltipDemo() {
  // The first tip is already showing, inside the stage; hovering any other control hands over to it.
  const stage = demoStage();
  return (
    <Stack align="center" gap={5}>
      <Row justify="center">
        <Tooltip content="Bold (Ctrl+B)" defaultOpen container={stage}><Button variant="secondary" aria-label="Bold"><Bold size={16} aria-hidden="true" /></Button></Tooltip>
        <Tooltip content="Italic (Ctrl+I)" container={stage}><Button variant="secondary" aria-label="Italic"><Italic size={16} aria-hidden="true" /></Button></Tooltip>
        <Tooltip content="Insert link" side="bottom" container={stage}><Button variant="secondary" aria-label="Insert link"><Link2 size={16} aria-hidden="true" /></Button></Tooltip>
        <Tooltip content="Share with your team" side="right" container={stage}><Button variant="secondary" aria-label="Share"><Share2 size={16} aria-hidden="true" /></Button></Tooltip>
      </Row>
      <Caption>Hover or focus a control; moving between them is instant.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Tooltip`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `content` (obrigatória) | `ReactNode` | — | — |
| `children` (obrigatória) | `ReactElement` | — | — |
| `side` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | — |
| `container` | `HTMLElement \| null` | — | Render the tooltip inside this element and limit collisions to it (used by the demo stages). |
| `defaultOpen` | `boolean` | `false` | Starts open, for previews and first-run hints. It stays until the person interacts (hover or focus on its trigger, Escape, a press elsewhere) or another tooltip opens; scrolling does not dismiss it. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Ao focar o gatilho pelo teclado, o tooltip aparece; ao sair, some. |
| `Esc` | Fecha o tooltip sem tirar o foco do gatilho. |

## Acessibilidade

- O balão tem `role="tooltip"` e, aberto, o gatilho recebe `aria-describedby` apontando para ele: o texto é uma descrição, não o nome do controle.
- Num botão só com ícone, passe `aria-label` no próprio botão; o tooltip complementa, como no demo.
- O Radix ignora ponteiros de toque e não abre o tooltip num foco causado por toque ou clique, então ele não aparece em celulares.

## Movimento

- O primeiro tooltip espera 250 ms e desliza 3 px a partir do gatilho crescendo de 97%; enquanto algum estiver aberto, e até 300 ms depois, o próximo abre na hora e só esmaece.
- Quando um `content` em texto muda com o balão aberto, o novo sobe, o antigo sai para cima e o balão ajusta o tamanho numa mola.
- Com “reduzir movimento” ligado, o balão só esmaece e a troca de texto acontece sem deslocamento.

## Comportamento responsivo

- O balão tem até 15rem de largura e quebra o texto em linhas; troca de lado quando não cabe, com 12 px de folga da borda.

## Notas para IA

- O filho precisa ser um único elemento que aceite `ref` e receba foco, como um `<button>`; o texto vai em `content`.
- Só há `content`, `children` e `side` (padrão `top`); o atraso e a janela de troca rápida são fixos no código.
- Cada `Tooltip` traz o próprio provedor do Radix, então não é preciso envolver o app num `TooltipProvider`. Importe de `@/components/ryan-ui/tooltip/tooltip`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/tooltip · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
