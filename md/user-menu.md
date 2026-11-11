# User menu

> Conta, ajustes, tema e sair atrás do avatar; no celular abre como painel inferior.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/user-menu
- Descrição original (inglês): Your account, settings, theme, and sign out behind the avatar. Opens as a bottom sheet on phones.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/user-menu.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/user-menu.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/user-menu.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/user-menu.json`. Caminho do registro, relativo ao endereço do site: `r/user-menu.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/user-menu/user-menu.tsx`
  - `components/ryan-ui/user-menu/user-menu.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/user-menu.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- O menu da conta atrás da foto da pessoa na barra superior do app: identidade, atalhos de conta, tema e sair.
- Apps com presença (Disponível, Ocupado, Ausente), em que a pessoa troca o status sem sair da tela.
- Interfaces que precisam do mesmo menu no celular: abaixo de 640 px ele vira uma folha inferior sem configuração extra.

## Quando não usar

- Use [`dropdown-menu`](dropdown-menu.md) para menus de ações gerais, sem a identidade da pessoa nem seletores.
- Evite para listas longas de destinos: o próprio código recomenda três ou quatro itens; navegação maior pertence a [`site-header`](site-header.md) ou a uma barra lateral como [`animated-sidebar`](animated-sidebar.md).

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { CreditCard, Settings, UserRound } from "lucide-react";
import UserMenu from "@/components/ryan-ui/user-menu/user-menu";
import { avatar } from "@/components/ryan-ui/lib/media";
import { Caption, Row, Stack } from "./_kit";

export default function UserMenuDemo() {
  const [signedOut, setSignedOut] = useState(false);
  return (
    <Stack gap={6} align="center">
      <Row justify="center" gap={8}>
        <UserMenu
          user={{ name: "Emma Collins", email: "emma@northwind.io", plan: "Pro", avatarSrc: avatar("emma-collins") }}
          defaultStatus="available"
          showName
          items={[
            { label: "Profile", icon: <UserRound size={15} aria-hidden="true" />, keys: ["⌘", "P"] },
            { label: "Settings", icon: <Settings size={15} aria-hidden="true" />, keys: ["⌘", ","] },
            { label: "Billing", icon: <CreditCard size={15} aria-hidden="true" /> },
          ]}
          onSignOut={() => setSignedOut(true)}
        />
        <UserMenu
          user={{ name: "Marcus Johnson", email: "marcus@northwind.io", avatarSrc: avatar("marcus-johnson") }}
          showTheme={false}
          align="start"
        />
      </Row>
      <Caption>{signedOut ? "Signed out (demo only). Open the menu again to keep exploring." : "Open the avatar menu: status, theme, account links, sign out."}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `PresenceDot`

A presence mark that morphs between statuses: the color crossfades while a hole opens for away and a bar slides in for busy.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### `UserMenu`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `user` (obrigatória) | `UserMenuUser` | — | — |
| `status` | `"available" \| "busy" \| "away"` | — | Presence status. Passing `status` or `onStatusChange` shows the presence dot and an inline status switch. |
| `defaultStatus` | `"available" \| "busy" \| "away"` | `"available"` | — |
| `onStatusChange` | `(status: UserStatus) => void` | — | — |
| `theme` | `"light" \| "dark" \| "system"` | — | — |
| `defaultTheme` | `"light" \| "dark" \| "system"` | `"system"` | — |
| `onThemeChange` | `(theme: ThemePreference) => void` | — | Reports the choice. Applying it to the page is up to the app. |
| `showTheme` | `boolean` | `true` | Shows the inline light, dark, and system switch. |
| `items` | `UserMenuItem[]` | `[]` | Account destinations with optional shortcut hints, such as ["⌘", ","]. Keep it to three or four. |
| `onSignOut` | `() => void \| Promise<unknown>` | — | — |
| `signOutKeys` | `string[]` | — | — |
| `align` | `"start" \| "center" \| "end"` | `"end"` | — |
| `showName` | `boolean` | `false` | Shows the name and a chevron beside the avatar from 640px up. |
| `open` | `boolean` | — | — |
| `defaultOpen` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `portal` | `boolean` | `true` | Renders the desktop panel in a portal on the body. Pass false to keep it inside the trigger's wrapper. |
| `ref` | `Ref<HTMLButtonElement>` | — | The trigger button, for returning focus after the menu is swapped out. |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `UserStatus` | `"available" \| "busy" \| "away"` |
| `ThemePreference` | `"light" \| "dark" \| "system"` |

#### `UserMenuUser`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` (obrigatória) | `string` | — |
| `email` (obrigatória) | `string` | — |
| `plan` | `string` | — |
| `avatarSrc` | `string` | — |
| `avatarSrcSet` | `string` | — |

#### `UserMenuItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `icon` | `ReactNode` | — |
| `keys` | `string[]` | — |
| `onSelect` | `() => void` | — |

### Outras exportações

- `userStatuses` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` ou `↓` | No avatar, abrem o menu com o foco na primeira linha; `↑` abre com o foco na última. |
| `↓` ou `↑` | No menu, percorrem linhas e seletores e dão a volta nas pontas; `Home` e `End` vão às pontas. |
| `←` ou `→` | Num seletor (Status ou Tema), escolhem na hora a opção anterior ou a seguinte, sem fechar o menu. |
| `A–Z` | Digitar o começo de um rótulo leva o foco à linha correspondente. |
| `Enter` ou `Espaço` | Acionam a linha em foco; itens e Sair fecham o menu, e escolhas de status e tema o mantêm aberto. |
| `Esc` ou `Tab` | Fecham o menu e devolvem o foco ao avatar. |

## Acessibilidade

- O avatar é um botão com `aria-haspopup="menu"`, `aria-expanded` e um nome montado em inglês (“Account menu, Emma Collins, Available”); o painel é `role="menu"` rotulado por ele, e Status e Tema usam `menuitemradio`.
- O foco só entra no menu quando alguém o abre (um menu que já nasce aberto não rouba o foco) e volta ao avatar ao fechar; no celular, a folha tem `aria-modal`, um véu e trava a rolagem da página.
- O status combina cor e forma (círculo cheio, barra ou anel), sem depender só da cor; os textos de Status, Tema, Sair e das opções são fixos em inglês no código.

## Movimento

- No desktop, o painel cresce a partir do centro do avatar numa mola sem ultrapassagem, com as linhas entrando em sequência, e fecha com um esmaecer curto; um realce único desliza entre as linhas.
- No celular, a folha sobe da base e pode ser arrastada para baixo para fechar (mais de 80 px ou um gesto rápido); trocar o status transforma o ponto, abrindo o furo do ausente ou a barra do ocupado.
- Com “reduzir movimento”, painel e folha só esmaecem, a folha não arrasta, as transições de cor e forma são desligadas e o indicador de saída gira mais devagar.

## Comportamento responsivo

- Abaixo de 640 px de largura, o mesmo conteúdo abre como folha inferior com véu, linhas mais altas e sem as dicas de atalho; o nome ao lado do avatar (`showName`) também some.
- No desktop, o painel tem 15,5rem, fica a 12 px das bordas, abre abaixo do avatar e vira para cima quando falta espaço, reposicionando-se ao rolar ou redimensionar.

## Notas para IA

- Passe `user` (`name`, `email` e, se quiser, `plan` e `avatarSrc`, com iniciais quando falta a foto); o status só aparece com `status` ou `onStatusChange`, porque `defaultStatus` sozinho não o mostra.
- `onThemeChange` só informa a escolha (`light`, `dark` ou `system`); aplicar o tema à página é com o app, e `showTheme={false}` esconde o seletor.
- `onSignOut` pode devolver uma Promise: o item mostra o andamento e o menu fecha quando ela termina; as `keys` de cada item (como `["⌘", ","]`) são só dica visual.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/user-menu · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
