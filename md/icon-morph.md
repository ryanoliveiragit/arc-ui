# Icon morph

> Ícones que se transformam entre estados: menu em fechar, play em pausa, copiar em confirmado e outros.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/icon-morph
- Descrição original (inglês): Icons that morph between states: menu to close, play to pause, copy to check, and more.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/icon-morph.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/icon-morph.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/icon-morph.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/icon-morph.json`. Caminho do registro, relativo ao endereço do site: `r/icon-morph.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/icon-morph/icon-morph.tsx`
  - `components/ryan-ui/icon-morph/icon-morph.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/icon-morph.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Botões de alternância cujo ícone representa o estado: abrir e fechar o menu, tocar e pausar, ativar e silenciar notificações, curtir.
- Confirmações pequenas dentro de um botão seu, como copiar virando visto ou adicionar virando visto (`copy` e `plus`).

## Quando não usar

- Use [`copy-button`](copy-button.md) quando precisa copiar um valor com a confirmação já pronta.
- Use [`theme-switch`](theme-switch.md) para alternar entre claro e escuro: ele já é um botão completo, com o ícone animado e o nome acessível.
- Para um ícone que não muda de estado, use o ícone comum da biblioteca Lucide; aqui há só oito pares fixos de desenhos.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import IconMorph, { type IconMorphName } from "@/components/ryan-ui/icon-morph/icon-morph";
import { Caption, Row, Stack } from "./_kit";

const icons: { name: IconMorphName; label: string; on: string; off: string }[] = [
  { name: "menu", label: "Menu", off: "Open menu", on: "Close menu" },
  { name: "play", label: "Play", off: "Play", on: "Pause" },
  { name: "plus", label: "Plus", off: "Add to list", on: "Added" },
  { name: "copy", label: "Copy", off: "Copy", on: "Copied" },
  { name: "theme", label: "Theme", off: "Light", on: "Dark" },
  { name: "chevron", label: "Chevron", off: "Expand", on: "Collapse" },
  { name: "bell", label: "Bell", off: "Muted", on: "Notifications on" },
  { name: "heart", label: "Heart", off: "Like", on: "Liked" },
];

export default function IconMorphDemo() {
  const [state, setState] = useState<Record<string, boolean>>({});
  return (
    <Stack gap={5} align="center" width={560}>
      <Row justify="center" gap={4}>
        {icons.map(icon => {
          const active = !!state[icon.name];
          return (
            <button
              key={icon.name}
              type="button"
              aria-pressed={active}
              aria-label={`${icon.label}: ${active ? icon.on : icon.off}`}
              onClick={() => setState(current => ({ ...current, [icon.name]: !current[icon.name] }))}
              style={{ display: "grid", justifyItems: "center", gap: "var(--space-2)", width: 112, padding: "var(--space-4) var(--space-2)", color: "var(--foreground)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", font: "inherit", cursor: "pointer" }}
            >
              <IconMorph name={icon.name} state={active} size={28} />
              <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>{active ? icon.on : icon.off}</span>
            </button>
          );
        })}
      </Row>
      <Caption>Tap any tile to morph its icon to the second state and back.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `MenuIcon`

Menu to close: the outer lines slide to the middle as they rotate into an X, and the middle line folds away.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `state` | `boolean` | `false` | The second state of the icon. menu: close, play: pause, plus: check, copy: check, theme: moon, chevron: turned, bell: notifications on, heart: liked. |
| `size` | `number` | — | Rendered size in px. Defaults to 24. |
| `strokeWidth` | `number` | — | Stroke width in the 24 unit grid. Defaults to 1.75. |
| `...props` | `SVGProps<SVGSVGElement>` | — | Também aceita as props deste tipo, menos `ref` e `children`. |

### `PlayPauseIcon`

Play to pause: the triangle splits into two halves that straighten into bars.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `state` | `boolean` | `false` | The second state of the icon. menu: close, play: pause, plus: check, copy: check, theme: moon, chevron: turned, bell: notifications on, heart: liked. |
| `size` | `number` | — | Rendered size in px. Defaults to 24. |
| `strokeWidth` | `number` | — | Stroke width in the 24 unit grid. Defaults to 1.75. |
| `...props` | `SVGProps<SVGSVGElement>` | — | Também aceita as props deste tipo, menos `ref` e `children`. |

### `PlusCheckIcon`

Plus to check: each bar swings its ends to become one leg of the check.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `state` | `boolean` | `false` | The second state of the icon. menu: close, play: pause, plus: check, copy: check, theme: moon, chevron: turned, bell: notifications on, heart: liked. |
| `size` | `number` | — | Rendered size in px. Defaults to 24. |
| `strokeWidth` | `number` | — | Stroke width in the 24 unit grid. Defaults to 1.75. |
| `...props` | `SVGProps<SVGSVGElement>` | — | Também aceita as props deste tipo, menos `ref` e `children`. |

### `CopyCheckIcon`

Copy to check: the back sheet tucks under the front one, the front one settles away, and the check draws in.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `state` | `boolean` | `false` | The second state of the icon. menu: close, play: pause, plus: check, copy: check, theme: moon, chevron: turned, bell: notifications on, heart: liked. |
| `size` | `number` | — | Rendered size in px. Defaults to 24. |
| `strokeWidth` | `number` | — | Stroke width in the 24 unit grid. Defaults to 1.75. |
| `...props` | `SVGProps<SVGSVGElement>` | — | Também aceita as props deste tipo, menos `ref` e `children`. |

### `SunMoonIcon`

Sun to moon: the disc grows while a shadow slides across it from the corner, carving the crescent, and the rays turn and fold in. The crescent is drawn as an outline: the disc's edge outside the shadow, and the shadow's edge inside the disc.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `state` | `boolean` | `false` | The second state of the icon. menu: close, play: pause, plus: check, copy: check, theme: moon, chevron: turned, bell: notifications on, heart: liked. |
| `size` | `number` | — | Rendered size in px. Defaults to 24. |
| `strokeWidth` | `number` | — | Stroke width in the 24 unit grid. Defaults to 1.75. |
| `...props` | `SVGProps<SVGSVGElement>` | — | Também aceita as props deste tipo, menos `ref` e `children`. |

### `ChevronIcon`

A chevron that turns on a spring, for disclosure and sort controls.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `turn` | `number` | `180` | Degrees the chevron turns when `state` is true. 180 flips down to up; 90 turns right to down. |
| `pointing` | `"down" \| "right"` | `"down"` | Where the chevron points at rest. |
| `...props` | `IconMorphIconProps` | — | Também aceita as props deste tipo. |

### `BellIcon`

Notifications on and off: turning on rings the bell from its top, with the clapper lagging behind; turning off strikes it through.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `state` | `boolean` | `false` | The second state of the icon. menu: close, play: pause, plus: check, copy: check, theme: moon, chevron: turned, bell: notifications on, heart: liked. |
| `size` | `number` | — | Rendered size in px. Defaults to 24. |
| `strokeWidth` | `number` | — | Stroke width in the 24 unit grid. Defaults to 1.75. |
| `...props` | `SVGProps<SVGSVGElement>` | — | Também aceita as props deste tipo, menos `ref` e `children`. |

### `HeartIcon`

Like: the heart fills with a pop, and a ring and a few sparks burst out once. Unliking simply empties it.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `state` | `boolean` | `false` | The second state of the icon. menu: close, play: pause, plus: check, copy: check, theme: moon, chevron: turned, bell: notifications on, heart: liked. |
| `size` | `number` | — | Rendered size in px. Defaults to 24. |
| `strokeWidth` | `number` | — | Stroke width in the 24 unit grid. Defaults to 1.75. |
| `...props` | `SVGProps<SVGSVGElement>` | — | Também aceita as props deste tipo, menos `ref` e `children`. |

### `IconMorph`

One entry point for every morphing icon: pick it by `name` and drive it with `state`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `name` (obrigatória) | `"menu" \| "play" \| "plus" \| "copy" \| "theme" \| "chevron" \| "bell" \| "heart"` | — | — |
| `...props` | `IconMorphIconProps` | — | Também aceita as props deste tipo. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `IconMorphName` | `"menu" \| "play" \| "plus" \| "copy" \| "theme" \| "chevron" \| "bell" \| "heart"` |

## Acessibilidade

- Todo ícone é um SVG com `aria-hidden="true"` e `focusable="false"`: coloque-o num `<button>` que tenha o nome acessível e `aria-pressed` refletindo `state`.
- Como o desenho muda com o estado (o menu vira X, o play vira pausa), atualize junto o nome do botão, por exemplo de “Abrir menu” para “Fechar menu”.

## Movimento

- O ícone se transforma em vez de trocar: as linhas do menu giram até formar um X, o play se divide em duas barras, o sol cresce enquanto uma sombra recorta a lua, tudo em molas que podem ser interrompidas no meio.
- Ligar o sino o faz balançar (0,9 s), com o badalo atrasado, e curtir o coração dispara um anel e faíscas uma vez; desligar risca o sino, e descurtir só esvazia o coração.
- Com “reduzir movimento”, o ícone troca de estado na hora, sem o balanço do sino nem a explosão do coração.

## Notas para IA

- Use `<IconMorph name="menu" state={aberto} />` ou o componente específico: `MenuIcon`, `PlayPauseIcon`, `PlusCheckIcon`, `CopyCheckIcon`, `SunMoonIcon`, `ChevronIcon`, `BellIcon` ou `HeartIcon`.
- O pai controla `state`, pois o ícone não tem clique nem estado próprio; `size` (24) e `strokeWidth` (1,75) ajustam o desenho, e o `ChevronIcon` aceita `turn` (graus) e `pointing`.
- Herda a cor do texto (`currentColor`); o coração curtido usa `--icon-morph-like`, que por padrão é a cor de perigo.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/icon-morph · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
