# Eclipse

> O novo tema atravessa a página como um eclipse.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/theme-switch-eclipse
- Descrição original (inglês): The next appearance crosses the page like an eclipse.
- Versões: Padrão ([`theme-switch`](theme-switch.md)), Eclipse (este item), Split ([`theme-switch-split`](theme-switch-split.md)), Rise ([`theme-switch-rise`](theme-switch-rise.md))

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch-eclipse.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch-eclipse.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch-eclipse.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch-eclipse.json`. Caminho do registro, relativo ao endereço do site: `r/theme-switch-eclipse.json`.

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
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/theme-switch-eclipse.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um botão de tema numa barra de app, como no demo, quando a troca deve atravessar a tela como um disco que entra pela lateral.
- Quando o tema muda raramente e cabe uma transição mais longa: no demo, o eclipse leva 720 ms, contra 520 a 560 ms das outras variantes.

## Quando não usar

- Use [`theme-switch`](theme-switch.md) (variante `reveal`) quando a transição deve partir do próprio botão, onde a pessoa clicou.
- Use [`theme-switch-rise`](theme-switch-rise.md) ou [`theme-switch-split`](theme-switch-split.md) para uma troca mais curta.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import type { CSSProperties } from "react";
import ThemeSwitch from "@/components/ryan-ui/theme-switch/theme-switch";
import { useTheme } from "@/site/lib/theme";
import { switchTheme } from "@/site/lib/theme-transition";
import { Caption, Stack } from "./_kit";

/** Fake app chrome so the switch sits where it really lives: a product header. */
const bar: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", background: "var(--surface)", padding: "var(--space-3) var(--space-3) var(--space-3) var(--space-4)" };
const brand: CSSProperties = { display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontWeight: 600 };

export default function ThemeSwitchEclipseDemo() {
  const { theme } = useTheme();
  return (
    <Stack gap={5} width={440}>
      <div style={bar}>
        <span style={brand}>
          <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 6, background: "var(--accent)" }} aria-hidden="true" />
          Ledger
        </span>
        <ThemeSwitch theme={theme} variant="eclipse" iconOnly label="Change appearance" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "eclipse")} />
      </div>
      <Caption>Eclipse — the new appearance crosses the page like a disc entering from the edge and covering the screen.</Caption>
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
| `Enter` ou `Espaço` | Acionam o botão, que chama `onThemeChange` com o próximo tema e `"eclipse"`. |

## Acessibilidade

- É o `button` da biblioteca, com `aria-pressed` verdadeiro no tema escuro e ícones `aria-hidden`; só com ícone (`iconOnly`, como no demo), `label` é o único nome, então passe um texto fixo, como “Mudar aparência”.
- Sem `label`, o nome padrão é montado em inglês e muda com o estado (“Switch to light mode”); fora do `iconOnly`, o texto visível é o fixo “Switch theme”.

## Movimento

- Com `variant="eclipse"`, o ícone se desloca 2 px para a esquerda no tema escuro, numa curva de mola, e volta ao retornar ao claro; o sol e a lua trocam girando.
- A travessia da página não vem no componente: no demo, um círculo do tamanho da diagonal da tela parte de fora, pela esquerda, até cobri-la, via View Transitions.
- Com “reduzir movimento”, o ícone só esmaece e o deslocamento acontece sem transição; o utilitário do demo também troca o tema sem animar a página.

## Notas para IA

- É o mesmo `ThemeSwitch` com `variant="eclipse"`: importe de `@/components/ryan-ui/theme-switch/theme-switch`; `onThemeChange` recebe `"eclipse"` como segundo argumento.
- Implemente a travessia no app: dentro de `document.startViewTransition`, aplique o tema e anime o `clip-path` de `::view-transition-new(root)` de `circle(D at -D 50%)` até `circle(D at 50% 50%)`, com D a diagonal da tela.
- `theme` é controlado e só aceita `light` ou `dark`; pule a animação quando `prefers-reduced-motion` estiver ligado, como faz o demo.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/theme-switch-eclipse · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
