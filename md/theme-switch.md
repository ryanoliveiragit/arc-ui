# Theme switcher

> Quatro transições suaves entre o tema claro e o escuro.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/theme-switch
- Descrição original (inglês): Four smooth ways to move between light and dark appearance.
- Versões: Padrão (este item), Eclipse ([`theme-switch-eclipse`](theme-switch-eclipse.md)), Split ([`theme-switch-split`](theme-switch-split.md)), Rise ([`theme-switch-rise`](theme-switch-rise.md))

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch.json`. Caminho do registro, relativo ao endereço do site: `r/theme-switch.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Button](button.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/theme-switch/theme-switch.tsx`
  - `components/ryan-ui/theme-switch/theme-switch.module.css`
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/theme-switch.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um botão de alternar entre claro e escuro na barra do app ou do site, com o sol e a lua girando no lugar.
- Quando a troca de tema vai ganhar uma transição de página inteira: o botão entrega a variante e o próprio elemento em `onThemeChange`, para a animação partir dele (`reveal`, o padrão).

## Quando não usar

- Use o seletor de tema do [`user-menu`](user-menu.md), ou um [`segmented-control`](segmented-control.md), quando a pessoa deve poder escolher também “Sistema”: aqui há só claro e escuro.
- Use [`switch`](switch.md) quando o tema é uma opção numa página de configurações, ao lado de outras chaves.
- Use [`icon-morph`](icon-morph.md) com `name="theme"` quando o botão já existe e você só quer o ícone de sol e lua que se transforma.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import ThemeSwitch from "@/components/ryan-ui/theme-switch/theme-switch";
import { useTheme } from "@/site/lib/theme";
import { switchTheme } from "@/site/lib/theme-transition";
import { Caption, Row, Stack } from "./_kit";

export default function ThemeSwitchDemo() {
  const { theme } = useTheme();
  return (
    <Stack gap={8} align="center">
      <Row justify="center" gap={4}>
        <ThemeSwitch theme={theme} label="Change appearance" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "reveal")} />
        <ThemeSwitch theme={theme} iconOnly label="Change appearance" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "reveal")} />
      </Row>
      <Caption>Reveal — a circle grows out of the button and floods the page with the next theme. This is the default variant.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ThemeSwitch`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `theme` (obrigatória) | `"light" \| "dark"` | — | — |
| `variant` | `"reveal" \| "eclipse" \| "split" \| "rise"` | `"reveal"` | — |
| `onThemeChange` (obrigatória) | `(next: Theme, variant: ThemeSwitchVariant, trigger: HTMLElement) => void` | — | — |
| `label` | `string` | — | — |
| `iconOnly` | `boolean` | `false` | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ThemeSwitchVariant` | `"reveal" \| "eclipse" \| "split" \| "rise"` |
| `Theme` | `"light" \| "dark"` |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Acionam o botão, que chama `onThemeChange` com o próximo tema. |

## Acessibilidade

- É o `button` da biblioteca, com `aria-pressed` verdadeiro no tema escuro; os ícones são `aria-hidden`.
- Sem `label`, o nome é montado em inglês e muda com o estado (“Switch to light mode”), o que confunde ao lado de `aria-pressed`; passe um `label` fixo, como “Tema escuro”.
- O texto visível “Switch theme” é fixo em inglês e, com `aria-label`, deixa de ser o nome do botão; numa interface em português, use `iconOnly` ou troque esse texto no arquivo instalado.

## Movimento

- Na troca, o sol e a lua giram no mesmo sentido (horário rumo ao escuro), com escala numa mola curta e esmaecer com leve desfoque; no escuro, a variante `reveal` ainda amplia o ícone para 1,08.
- Uma preferência salva que chega logo depois da hidratação troca o ícone sem animar, então uma página que abre no escuro não gira o botão.
- Com “reduzir movimento”, o ícone só esmaece, o ajuste da variante acontece sem transição e a pressão do botão não escala.

## Notas para IA

- O componente não troca o tema nem anima a página: ele chama `onThemeChange(next, variant, trigger)`, e o app aplica o tema (por exemplo, `data-theme` no `<html>`) e, se quiser, a transição.
- A transição do demo vem do site, não do item instalado: `document.startViewTransition` e um `clip-path` animado em `::view-transition-new(root)`, partindo de `trigger`, pulado com “reduzir movimento”.
- `theme` é controlado e só aceita `light` ou `dark` (resolva “sistema” antes de passar); as outras variantes são `eclipse`, `split` e `rise`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/theme-switch · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
