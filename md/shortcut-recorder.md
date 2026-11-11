# Shortcut recorder

> Grave atalhos de teclado em teclas visuais, com aviso de conflito e uma lista de atalhos pesquisável.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/shortcut-recorder
- Descrição original (inglês): Record key combinations into key caps, with conflict warnings, Kbd, and a searchable cheatsheet.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/shortcut-recorder.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/shortcut-recorder.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/shortcut-recorder.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/shortcut-recorder.json`. Caminho do registro, relativo ao endereço do site: `r/shortcut-recorder.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/shortcut-recorder/shortcut-recorder.tsx`
  - `components/ryan-ui/shortcut-recorder/shortcut-recorder.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/shortcut-recorder.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Telas de preferências em que a pessoa redefine os atalhos de teclado do produto.
- Apps com muitos atalhos que precisam de uma folha de referência pesquisável, via `ShortcutList`.
- Mostrar atalhos em menus e textos com teclas desenhadas, via `ShortcutKeys` e `ShortcutKbd`.

## Quando não usar

- Use [`command-palette`](command-palette.md) quando o objetivo é executar ações pelo teclado, não configurá-las.
- Para só exibir um atalho fixo, use `ShortcutKeys` deste mesmo arquivo, sem o gravador.
- Em apps usados quase só por toque, atalhos de teclado têm pouco uso e a tela de configuração pode ficar de fora.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import ShortcutRecorder, { ShortcutList } from "@/components/ryan-ui/shortcut-recorder/shortcut-recorder";
import { Caption, Stack } from "./_kit";

export default function ShortcutRecorderDemo() {
  const [value, setValue] = useState<string | null>("Mod+K");
  return (
    <Stack width={480} gap={6}>
      <Stack gap={2}>
        <ShortcutRecorder
          label="Open command palette"
          description="Press the field, then the new combination."
          value={value}
          onValueChange={(v) => setValue(v)}
          resetValue="Mod+K"
          bindings={[{ shortcut: "Mod+P", label: "Quick open" }, { shortcut: "Mod+Shift+F", label: "Search in files" }]}
        />
        <Caption>Stored as: {value ?? "unset"}. Try Mod+P to see a conflict warning.</Caption>
      </Stack>
      <ShortcutList
        groups={[
          { label: "Navigation", items: [{ label: "Command palette", shortcut: "Mod+K" }, { label: "Quick open", shortcut: "Mod+P" }, { label: "Go to line", shortcut: "Ctrl+G" }] },
          { label: "Editing", items: [{ label: "Duplicate line", shortcut: "Mod+Shift+D" }, { label: "Toggle comment", shortcut: "Mod+/" }] },
        ]}
      />
    </Stack>
  );
}
export const stage = { height: 560 };
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ShortcutKbd`

A key cap. Use it inline in copy, in menus, or through `ShortcutKeys` for a whole combination.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactNode` | — | — |
| `pressed` | `boolean` | `false` | Draws the key pushed down and lit, such as while it is held. |
| `size` | `"sm" \| "md"` | `"md"` | — |
| `...props` | `HTMLAttributes<HTMLElement>` | — | Também aceita as props deste tipo. |

### `ShortcutKeys`

A shortcut as key caps, with a spoken label for assistive technology.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `shortcut` (obrigatória) | `string` | — | — |
| `platform` | `"mac" \| "other"` | — | — |
| `pressed` | `ReadonlySet<string>` | — | Held key ids from `usePressedKeys`; matching caps light up. |
| `size` | `"sm" \| "md"` | `"md"` | — |
| `className` | `string` | — | — |

### `ShortcutRecorder`

A field that records a keyboard shortcut. Press it, then press the combination: held modifiers light up as caps while you build the chord, the finished shortcut settles into place, and a combination that is already taken asks before it is used. Escape cancels, Backspace clears, and the reset button restores the default. Caps follow the platform: ⌘ on a Mac, Ctrl elsewhere.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `hideLabel` | `boolean` | `false` | — |
| `value` | `string \| null` | — | — |
| `defaultValue` | `string \| null` | `null` | — |
| `onValueChange` | `(value: string \| null, details: { replaced?: ShortcutBinding }) => void` | — | `replaced` is the binding the new shortcut was taken from after "Use anyway", so the caller can unbind it. |
| `resetValue` | `string \| null` | — | What the reset button restores. Defaults to `defaultValue`. |
| `bindings` | `ShortcutBinding[]` | `[]` | Shortcuts already in use. Recording one of them asks before taking it. |
| `warnReserved` | `boolean` | `true` | Also warn about combinations the browser or system keeps, such as ⌘W and ⌘C. On by default. |
| `requireModifier` | `boolean` | `true` | Require ⌘, Ctrl, or ⌥ (function keys are always allowed). On by default. |
| `platform` | `"mac" \| "other"` | — | — |
| `placeholder` | `string` | `"Record shortcut"` | — |
| `description` | `string` | — | — |
| `disabled` | `boolean` | `false` | — |
| `id` | `string` | — | — |
| `className` | `string` | — | — |

### `ShortcutList`

A searchable, grouped cheatsheet. Holding a modifier lights that cap in every row and fades rows that do not use it, so people can explore by holding keys; a row whose whole combination is down lights up. Search matches names, groups, and key names such as "cmd k".

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `groups` (obrigatória) | `ShortcutListGroup[]` | — | — |
| `label` | `string` | `"Keyboard shortcuts"` | Accessible name of the list. |
| `searchable` | `boolean` | `true` | — |
| `searchPlaceholder` | `string` | `"Search shortcuts"` | — |
| `highlightPressed` | `boolean` | `true` | Light up caps as keys are held, and fade rows that do not use the held modifiers. On by default. |
| `platform` | `"mac" \| "other"` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `Platform` | `"mac" \| "other"` |
| `KbdProps`: @deprecated Renamed to `ShortcutKbdProps`. | `ShortcutKbdProps` |

#### `ShortcutToken`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `id` (obrigatória) | `string` | — |
| `spoken` (obrigatória) | `string` | — |

#### `ShortcutBinding`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `shortcut` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |

#### `ShortcutListItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `shortcut` (obrigatória) | `string` | — |
| `keywords` | `string` | — |

#### `ShortcutListGroup`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `items` (obrigatória) | `ShortcutListItem[]` | — |

### Outras exportações

- `keyId` (função)
- `normalizeShortcut` (função)
- `shortcutFromEvent` (função)
- `matchesShortcut` (função)
- `shortcutTokens` (função)
- `formatShortcut` (função)
- `usePlatform` (hook)
- `usePressedKeys` (hook)
- `Kbd` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No campo, começam a gravar; a próxima combinação com modificador vira o atalho. |
| `Esc` | Cancela a gravação e mantém o atalho anterior. |
| `Backspace` ou `Delete` | Apagam o atalho, durante a gravação ou fora dela. |
| `Tab` | Durante a gravação, para de gravar e segue para o próximo controle. |
| `Ctrl` ou `Alt` ou `Shift` ou `⌘` | Segurados com a `ShortcutList` na tela, acendem essa tecla em todas as linhas e esmaecem as linhas que não a usam. |
| `Esc` | Na busca da `ShortcutList`, apaga o texto digitado. |

## Acessibilidade

- O campo é um botão com `aria-pressed` durante a gravação, nomeado pelo rótulo mais o atalho falado (“Control Shift L”) e descrito pela mensagem de baixo.
- Uma região `role="status"` narra cada passo: início da gravação, atalho definido, conflito, limpeza e cancelamento; os textos são em inglês e fixos.
- `ShortcutKeys` tem `role="img"` com o nome falado da combinação, e os botões de restaurar e limpar têm `aria-label` próprio.

## Movimento

- As teclas entram uma depois da outra com uma mola curta e afundam um pixel quando estão seguradas, e um ponto pulsa devagar enquanto grava.
- A linha de mensagem abre a altura numa mola medindo o texto, e os botões de restaurar e limpar crescem no lugar.
- Com “reduzir movimento” ligado, as teclas só esmaecem, o ponto fica parado e nada afunda.

## Comportamento responsivo

- A `ShortcutList` usa consulta de contêiner: a partir de 520px de largura, os grupos ficam em duas colunas.

## Desempenho

- Com `highlightPressed` ligado (padrão), a `ShortcutList` escuta `keydown` e `keyup` da janela inteira na fase de captura; desligue se não usar as linhas acesas.

## Notas para IA

- Guarde o valor como texto (`"mod+shift+k"`), em que `mod` é ⌘ no Mac e Ctrl no resto; para disparar a ação, use `matchesShortcut(evento, atalho, plataforma)` com `usePlatform()`.
- Passe em `bindings` os atalhos já usados para avisar conflitos; em “Use anyway”, `onValueChange` traz `details.replaced` para você desligar o atalho antigo.
- `requireModifier` (padrão) exige ⌘, Ctrl ou ⌥, exceto em teclas F, e `warnReserved` avisa sobre atalhos do navegador como ⌘W e ⌘C.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/shortcut-recorder · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
