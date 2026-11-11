# Cookie consent

> Barra de consentimento que vira painel de preferências e se recolhe em um botão para reabrir.

- Tipo: componente (categoria Feedback)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/cookie-consent
- Descrição original (inglês): A consent bar that morphs into preferences and folds into a reopen button.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cookie-consent.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cookie-consent.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cookie-consent.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/cookie-consent.json`. Caminho do registro, relativo ao endereço do site: `r/cookie-consent.json`.

- Pacotes npm: `@radix-ui/react-switch`, `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Button](button.md), [Switch](switch.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/cookie-consent/cookie-consent.tsx`
  - `components/ryan-ui/cookie-consent/cookie-consent.module.css`
  - `components/ryan-ui/switch/switch.tsx`
  - `components/ryan-ui/switch/switch.module.css`
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-switch lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/cookie-consent.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Pedir consentimento para cookies opcionais na primeira visita, com aceitar, rejeitar e personalizar lado a lado, e recusar tão fácil quanto aceitar.
- Deixar a pessoa mudar de ideia depois: a escolha vira um botão redondo no canto que reabre as preferências, e `openPreferences()` pelo `ref` atende um link “Cookies” no rodapé.
- Pedir de novo quando a política muda: aumente `version` e a escolha salva em `storageKey` deixa de valer.

## Quando não usar

- Use [`announcement-bar`](announcement-bar.md) para um recado de topo que não pede escolha nenhuma.
- Use [`dialog`](dialog.md) quando o fluxo exige bloquear a página até a decisão; esta camada não é modal e o site segue usável por trás.
- Use [`switch`](switch.md) direto numa página de configurações quando as preferências de privacidade fazem parte de um formulário maior.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { CookieConsent, type CookieConsentValue } from "@/components/ryan-ui/cookie-consent/cookie-consent";
import { Caption, Stack } from "./_kit";

export default function CookieConsentDemo() {
  const [choice, setChoice] = useState<CookieConsentValue | null>(null);
  return (
    <Stack gap={3} width={640}>
      <div style={{ position: "relative", height: 340, overflow: "hidden", border: "1px solid var(--border)", borderRadius: "var(--radius-panel)", background: "var(--surface)" }}>
        <div style={{ padding: "var(--space-5)", display: "grid", gap: "var(--space-3)" }}>
          <strong style={{ fontSize: "var(--text-lg)" }}>Harbour & Co. Journal</strong>
          <span style={{ color: "var(--text-muted)" }}>Notes on slow travel, small kitchens and well-made things.</span>
        </div>
        <CookieConsent
          strategy="absolute"
          position="bottom"
          policy={{ label: "Cookie policy", href: "#policy" }}
          onChange={value => setChoice(value)}
        />
      </div>
      <Caption>
        {choice ? `Saved: ${Object.entries(choice).filter(([, on]) => on).map(([id]) => id).join(", ") || "nothing"}. Use the small button to change it.` : "Choose “Customize” to open the preferences panel."}
      </Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CookieConsent`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `categories` | `CookieCategory[]` | `defaultCookieCategories` | — |
| `value` | `CookieConsentValue \| null` | — | The saved choice. `null` means the visitor has not decided yet. Leave it out to let the component manage it. |
| `defaultValue` | `CookieConsentValue \| null` | `null` | — |
| `onChange` | `(value: CookieConsentValue \| null, detail: { action: CookieConsentAction; updatedAt: Date }) => void` | — | — |
| `storageKey` | `string` | — | Remembers the choice in `localStorage` under this key. Read it elsewhere with `readCookieConsent`. |
| `version` | `string` | `"1"` | Bump when your categories or policy change to ask again. |
| `preferencesOpen` | `boolean` | — | Whether the preferences panel is open. |
| `defaultPreferencesOpen` | `boolean` | `false` | — |
| `onPreferencesOpenChange` | `(open: boolean) => void` | — | — |
| `policy` | `{ label: string; href?: string; onClick?: () => void }` | — | Link to the full policy, shown in the bar and panel. |
| `position` | `"bottom" \| "bottom-left" \| "bottom-right"` | `"bottom"` | — |
| `strategy` | `"fixed" \| "absolute"` | `"fixed"` | `fixed` pins to the viewport; `absolute` fills the nearest positioned ancestor, useful for previews. |
| `showReopenButton` | `boolean` | `true` | Keep a small button after a choice so visitors can change their mind. Defaults to true. |
| `reopenSide` | `"left" \| "right"` | — | Corner for the reopen button. Defaults to the bar's side, or left when the bar is centered. |
| `labels` | `Partial<CookieConsentLabels>` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `CookieConsentValue`: Category id to allowed. | `Record<string, boolean>` |
| `CookieConsentAction` | `"accept-all" \| "reject-all" \| "save" \| "reset"` |

#### `CookieCategory`

One group of cookies a visitor can allow or refuse.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `description` | `string` | — |
| `required` | `boolean` | Needed for the site to work. Always on and cannot be switched off. |
| `defaultEnabled` | `boolean` | Starting position of the switch before a choice is saved. Non-essential categories default to off. |

#### `StoredCookieConsent`

What is written to storage under `storageKey`.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `Record<string, boolean>` | — |
| `version` (obrigatória) | `string` | — |
| `updatedAt` (obrigatória) | `string` | — |

#### `CookieConsentHandle`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `openPreferences` (obrigatória) | `() => void` | Opens the preferences panel, for example from a "Cookie settings" footer link. |
| `closePreferences` (obrigatória) | `() => void` | Closes the preferences panel without saving. |
| `reset` (obrigatória) | `() => void` | Forgets the saved choice and asks again. |

#### `CookieConsentLabels`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `message` (obrigatória) | `ReactNode` | — |
| `customize` (obrigatória) | `string` | — |
| `acceptAll` (obrigatória) | `string` | — |
| `rejectAll` (obrigatória) | `string` | — |
| `save` (obrigatória) | `string` | — |
| `preferencesTitle` (obrigatória) | `string` | — |
| `preferencesDescription` (obrigatória) | `ReactNode` | — |
| `reopen` (obrigatória) | `string` | — |
| `alwaysOn` (obrigatória) | `string` | — |
| `close` (obrigatória) | `string` | — |

### Outras exportações

- `defaultCookieCategories` (valor)
- `readCookieConsent` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Esc` | Com o foco no painel de preferências, fecha sem salvar e devolve o foco ao botão “Customize” da barra ou ao botão de reabrir. |
| `Espaço` ou `Enter` | No interruptor de uma categoria, liga ou desliga no rascunho; nada é salvo até “Save choices”, “Accept all” ou “Reject all”. |
| `Tab` ou `Shift + Tab` | Percorre botões e interruptores; não há trap de foco, porque a camada não é modal. |

## Acessibilidade

- Barra e painel são `role="dialog"` com `aria-modal="false"`, sem trap de foco; abrir o painel leva o foco ao título, e salvar ou fechar devolve o foco à barra ou ao botão de reabrir.
- Cada interruptor tem `<label>` e `aria-describedby` com a descrição da categoria, e “Save choices” informa em texto oculto quantas categorias opcionais estão permitidas.
- Os textos padrão estão em inglês; passe `labels` (mensagem, botões, título, `reopen`, `alwaysOn`, `close`) para traduzir, inclusive os nomes acessíveis do botão de reabrir e do fechar.

## Movimento

- Uma única superfície muda de posição, largura, altura e raio com uma mola sem ultrapassagem entre barra, painel e botão redondo; crescer é um pouco mais lento que encolher.
- O conteúdo de cada forma troca com um esmaecer curto, subindo poucos pixels a partir de um leve desfoque, e a superfície entra de baixo com uma escala quase cheia.
- Com “reduzir movimento”, a forma muda na hora e só o conteúdo esmaece.

## Comportamento responsivo

- A barra vai até 660 px e o painel até 420 px; abaixo de 560 px a barra empilha texto e botões, e numa barra bem estreita (perto de 340 px) “Customize” desce para uma linha própria.
- A lista de categorias rola por dentro acima de `min(46vh, 300px)`; mude o limite com a variável `--cookie-consent-list-max`.

## Notas para IA

- Importe de `@/components/ryan-ui/cookie-consent/cookie-consent` (usa `button` e `switch`). Ela só registra a escolha: carregue scripts de análise ou marketing você mesmo, a partir de `onChange` ou `readCookieConsent(storageKey, version)`.
- Monte uma vez no layout com `storageKey`; nada aparece no servidor nem antes de ler o armazenamento. Numa prévia dentro de um cartão, use `strategy="absolute"` com um pai posicionado.
- Para um link “Cookies” no rodapé, guarde um `ref` e chame `openPreferences()`; `reset()` apaga a escolha e mostra a barra de novo.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/cookie-consent · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
