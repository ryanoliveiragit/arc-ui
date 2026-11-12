# Dropdown menu

> Lista enxuta de ações ancorada a um botão.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/dropdown-menu
- Descrição original (inglês): A focused list of actions anchored to a trigger.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dropdown-menu.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dropdown-menu.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dropdown-menu.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dropdown-menu.json`. Caminho do registro, relativo ao endereço do site: `r/dropdown-menu.json`.

- Pacotes npm: `@radix-ui/react-dropdown-menu`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/dropdown-menu/dropdown-menu.tsx`
  - `components/ryan-ui/dropdown-menu/dropdown-menu.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-dropdown-menu lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/dropdown-menu.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um conjunto curto de ações sobre a página ou um objeto, atrás de um botão com rótulo, como “Ações do projeto”.
- Escolhas como “Ordenar por”, em que o próprio gatilho mostra a opção atual: troque `label` e o texto novo entra animado, com a largura do gatilho acompanhando numa mola.

## Quando não usar

- Use [`select`](select.md) quando a escolha é um valor de formulário com a opção marcada: aqui os itens são ações, sem estado selecionado.
- Use [`split-button`](split-button.md) quando uma ação principal deve rodar com um clique e as outras são alternativas dela.
- Use [`context-menu`](context-menu.md) para ações abertas com o botão direito sobre o próprio objeto, sem gatilho visível.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Copy, Pencil, Share2, Trash2, Archive } from "lucide-react";
import DropdownMenu from "@/components/ryan-ui/dropdown-menu/dropdown-menu";
import { Caption, Room, Row, Stack, demoStage, useQuietFirstOpen } from "./_kit";

export default function DropdownMenuDemo() {
  const [last, setLast] = useState("Nothing yet");
  const act = (name: string) => () => setLast(name);
  // The first menu is already open, inside the stage. Non-modal, so the docs page keeps scrolling while it shows.
  const stage = demoStage();
  const quiet = useQuietFirstOpen();
  return (
    <Stack gap={4} align="center">
      <Room below={206}>
      <Row justify="center">
        <DropdownMenu
          label="Project actions"
          defaultOpen
          modal={false}
          onOpenAutoFocus={quiet}
          container={stage}
          items={[
            { label: "Rename", icon: <Pencil size={15} aria-hidden="true" />, onSelect: act("Rename") },
            { label: "Duplicate", icon: <Copy size={15} aria-hidden="true" />, onSelect: act("Duplicate") },
            { label: "Share", icon: <Share2 size={15} aria-hidden="true" />, onSelect: act("Share") },
            { label: "Archive", icon: <Archive size={15} aria-hidden="true" />, disabled: true },
            { label: "Delete project", icon: <Trash2 size={15} aria-hidden="true" />, destructive: true, separatorBefore: true, onSelect: act("Delete project") },
          ]}
        />
        <DropdownMenu
          label="Sort by"
          container={stage}
          items={[
            { label: "Most recent", onSelect: act("Most recent") },
            { label: "Name", onSelect: act("Name") },
            { label: "Size", onSelect: act("Size") },
          ]}
        />
      </Row>
      </Room>
      <Caption>Last choice: {last}. Arrow keys move, Escape closes.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `DropdownMenu`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `items` (obrigatória) | `DropdownItem[]` | — | — |
| `icon` | `ReactNode` | — | — |
| `defaultOpen` | `boolean` | — | — |
| `container` | `HTMLElement \| null` | — | — |
| `modal` | `boolean` | `true` | — |
| `onOpenAutoFocus` | `(event: Event) => void` | — | — |

### Tipos exportados

#### `DropdownItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `onSelect` | `() => void` | — |
| `disabled` | `boolean` | — |
| `icon` | `ReactNode` | — |
| `destructive` | `boolean` | — |
| `separatorBefore` | `boolean` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` ou `↓` | No gatilho, abrem o menu com o foco no primeiro item. |
| `↓` ou `↑` | Percorrem os itens habilitados e dão a volta nas pontas. |
| `Home` ou `End` | Vão para o primeiro e o último item; `Page Up` e `Page Down` fazem o mesmo. |
| `A–Z` | Digitar o começo de um rótulo leva o foco a esse item. |
| `Enter` ou `Espaço` | Escolhem o item em foco e fecham o menu. |
| `Esc` | Fecha o menu e devolve o foco ao gatilho. |

## Acessibilidade

- Usa o `DropdownMenu` do Radix: o gatilho recebe `aria-haspopup`, `aria-expanded` e `aria-controls`, os itens são `role="menuitem"`, e itens `disabled` ficam esmaecidos e são pulados pelas setas.
- O menu é modal: enquanto está aberto, o foco fica preso nele, a página não rola, o resto fica oculto para leitores de tela e um clique fora só fecha o menu.
- O gatilho sempre mostra o texto de `label`, que também nomeia o menu; os ícones do gatilho e dos itens são decorativos.

## Movimento

- O menu surge deslocado 5 px na direção do gatilho e em escala de 0,97, por transição CSS, e sai mais rápido do que entrou; os itens entram em sequência, 35 ms entre um e outro.
- Um realce único desliza entre os itens numa mola sob o ponteiro e salta direto com as setas; a seta do gatilho gira 180° com o menu aberto.
- Com “reduzir movimento”, o menu só esmaece, os itens aparecem juntos e o realce, a seta e o rótulo do gatilho trocam sem animação.

## Comportamento responsivo

- O menu é alinhado ao fim do gatilho, fica a 12 px das bordas da janela, muda de lado se faltar espaço e nunca passa da largura disponível; o rótulo do gatilho termina em reticências quando o espaço acaba.

## Notas para IA

- Passe `label` e `items` (cada um com `label`, `onSelect` e, se quiser, `icon`, `disabled`, `destructive` e `separatorBefore`); o `label` do item também é a chave React, então não repita rótulos.
- O gatilho é fixo (texto de `label`, `icon` opcional e uma seta) e o estado aberto é interno: não há prop para outro gatilho, para um botão só com ícone nem para controlar `open`.
- Os itens não mostram marca de seleção; para um seletor de valor, prefira `select`, ou mostre a escolha atual no próprio `label`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/dropdown-menu · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
