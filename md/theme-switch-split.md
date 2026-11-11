# Split

> O novo tema se abre a partir de uma fenda fina no centro.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/theme-switch-split
- Descrição original (inglês): The next appearance opens from a slim center seam.
- Versões: Padrão ([`theme-switch`](theme-switch.md)), Eclipse ([`theme-switch-eclipse`](theme-switch-eclipse.md)), Split (este item), Rise ([`theme-switch-rise`](theme-switch-rise.md))

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch-split.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch-split.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch-split.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/theme-switch-split.json`. Caminho do registro, relativo ao endereço do site: `r/theme-switch-split.json`.

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
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/theme-switch-split.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um botão de tema centralizado ou numa barra simétrica, quando o tema novo deve se abrir a partir de uma fenda vertical no meio da tela.
- Quando você quer uma troca curta e simétrica (520 ms no demo), que não depende de onde o botão está.

## Quando não usar

- Use [`theme-switch`](theme-switch.md) (variante `reveal`) quando a transição deve partir do próprio botão.
- Use [`theme-switch-rise`](theme-switch-rise.md) quando o botão fica perto da base da tela e uma subida combina mais.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import ThemeSwitch from "@/components/ryan-ui/theme-switch/theme-switch";
import { useTheme } from "@/site/lib/theme";
import { switchTheme } from "@/site/lib/theme-transition";
import { Caption, Row, Stack } from "./_kit";

export default function ThemeSwitchSplitDemo() {
  const { theme } = useTheme();
  return (
    <Stack gap={8} align="center">
      <Row justify="center" gap={4}>
        <ThemeSwitch theme={theme} variant="split" label="Change appearance" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "split")} />
        <ThemeSwitch theme={theme} variant="split" iconOnly label="Change appearance" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "split")} />
      </Row>
      <Caption>Split — two halves open from the center line of the page until the new theme is fully visible.</Caption>
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
| `Enter` ou `Espaço` | Acionam o botão, que chama `onThemeChange` com o próximo tema e `"split"`. |

## Acessibilidade

- É o `button` da biblioteca, com `aria-pressed` verdadeiro no tema escuro e ícones `aria-hidden`; o demo mostra a versão com texto e a só com ícone, ambas com o `label` fixo “Change appearance”.
- Na versão com texto, o rótulo visível é o fixo “Switch theme”, em inglês, e não é o nome do botão quando há `label`; numa interface em português, use `iconOnly` ou troque esse texto no arquivo instalado.

## Movimento

- Com `variant="split"`, o ícone se desloca 1 px para a direita no tema escuro, numa curva de mola, e volta ao retornar ao claro, enquanto o sol e a lua trocam girando.
- A abertura da página não vem no componente: no demo, o tema novo surge de uma fenda no centro que se abre para os lados, recortando `::view-transition-new(root)` de `inset(0 50% 0 50%)` até `inset(0 0 0 0)`.
- Com “reduzir movimento”, o ícone só esmaece e o deslocamento acontece sem transição; o utilitário do demo também troca o tema sem animar a página.

## Notas para IA

- É o mesmo `ThemeSwitch` com `variant="split"`: importe de `@/components/ryan-ui/theme-switch/theme-switch`; `onThemeChange` recebe `"split"` como segundo argumento.
- Implemente a abertura no app: dentro de `document.startViewTransition`, aplique o tema e anime o `clip-path` de `::view-transition-new(root)`; o `trigger` não é necessário para esta variante.
- `theme` é controlado e só aceita `light` ou `dark`; pule a animação quando `prefers-reduced-motion` estiver ligado, como faz o demo.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/theme-switch-split · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
