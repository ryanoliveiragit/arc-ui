# Rise

> O novo tema sobe até ocupar a página.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/theme-switch-rise
- Descrição original (inglês): The next appearance rises into place.
- Versões: Padrão ([`theme-switch`](theme-switch.md)), Eclipse ([`theme-switch-eclipse`](theme-switch-eclipse.md)), Split ([`theme-switch-split`](theme-switch-split.md)), Rise (este item)

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch-rise.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch-rise.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch-rise.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch-rise.json`. Caminho do registro, relativo ao endereço do site: `r/theme-switch-rise.json`.

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
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/theme-switch-rise.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um botão de tema perto da base da tela ou num canto inferior, como no demo, quando o tema novo deve subir da borda de baixo.
- Quando a transição deve ser um movimento reto e simples, que não depende de onde o botão está.

## Quando não usar

- Use [`theme-switch`](theme-switch.md) (variante `reveal`) quando a transição deve nascer no ponto do clique.
- Use [`theme-switch-split`](theme-switch-split.md) quando o botão fica no centro de uma barra e uma abertura simétrica combina mais.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import type { CSSProperties } from "react";
import ThemeSwitch from "@/components/ryan-ui/theme-switch/theme-switch";
import { useTheme } from "@/site/lib/theme";
import { switchTheme } from "@/site/lib/theme-transition";
import { Caption, Stack } from "./_kit";

/** A content frame with the switch floating where a real app would keep it. */
const frame: CSSProperties = { position: "relative", border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", background: "var(--surface)", padding: "var(--space-5)" };
const line = (width: string): CSSProperties => ({ display: "block", height: 10, borderRadius: 999, background: "var(--surface-muted)", width });

export default function ThemeSwitchRiseDemo() {
  const { theme } = useTheme();
  return (
    <Stack gap={5} width={440}>
      <div style={frame}>
        <span style={{ ...line("38%"), background: "var(--surface-raised)", boxShadow: "inset 0 0 0 1px var(--border-subtle)" }} aria-hidden="true" />
        <span style={{ ...line("84%"), marginTop: "var(--space-3)" }} aria-hidden="true" />
        <span style={{ ...line("70%"), marginTop: "var(--space-3)" }} aria-hidden="true" />
        <span style={{ ...line("52%"), marginTop: "var(--space-3)" }} aria-hidden="true" />
        <span style={{ position: "absolute", right: "var(--space-4)", bottom: "var(--space-4)" }}>
          <ThemeSwitch theme={theme} variant="rise" iconOnly label="Change appearance" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "rise")} />
        </span>
      </div>
      <Caption>Rise — the new theme sweeps up from the bottom edge of the screen.</Caption>
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
| `Enter` ou `Espaço` | Acionam o botão, que chama `onThemeChange` com o próximo tema e `"rise"`. |

## Acessibilidade

- É o `button` da biblioteca, com `aria-pressed` verdadeiro no tema escuro e ícones `aria-hidden`; só com ícone (`iconOnly`, como no demo), `label` é o único nome, então passe um texto fixo, como “Mudar aparência”.
- Sem `label`, o nome padrão é montado em inglês e muda com o estado (“Switch to light mode”); fora do `iconOnly`, o texto visível é o fixo “Switch theme”.

## Movimento

- Com `variant="rise"`, o ícone sobe 2 px no tema escuro, numa curva de mola, e desce ao voltar ao claro, enquanto o sol e a lua trocam girando.
- A subida da página não vem no componente: no demo, o tema novo é revelado de baixo para cima em 520 ms, recortando `::view-transition-new(root)` de `inset(100% 0 0 0)` até `inset(0 0 0 0)`.
- Com “reduzir movimento”, o ícone só esmaece e o deslocamento acontece sem transição; o utilitário do demo também troca o tema sem animar a página.

## Notas para IA

- É o mesmo `ThemeSwitch` com `variant="rise"`: importe de `@/components/ryan-ui/theme-switch/theme-switch`; `onThemeChange` recebe `"rise"` como segundo argumento.
- Implemente a subida no app: dentro de `document.startViewTransition`, aplique o tema e anime o `clip-path` de `::view-transition-new(root)`; como ela não parte do botão, o `trigger` pode ser ignorado.
- No demo, o botão flutua no canto inferior direito de um quadro (`position: absolute` no pai); o componente não se posiciona sozinho.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/theme-switch-rise · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
