# Centered login

> Cartão de login centralizado, com passkey em primeiro lugar, que muda de e-mail para código sem trocar de tela.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/login-centered
- Descrição original (inglês): A passkey-first login card on a quiet ring backdrop that morphs through email and code.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/login-centered.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/login-centered.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/login-centered.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/login-centered.json`. Caminho do registro, relativo ao endereço do site: `r/login-centered.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Button](button.md), [Input](input.md), [OTP input](otp-input.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/login-centered/login-centered.tsx`
  - `components/ryan-ui/blocks/login-centered/login-centered.module.css`
  - `components/ryan-ui/otp-input/otp-input.tsx`
  - `components/ryan-ui/otp-input/otp-input.module.css`
  - `components/ryan-ui/input/input.tsx`
  - `components/ryan-ui/input/input.module.css`
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/login-centered.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Tela de login que ocupa a página inteira e oferece passkey primeiro, com e-mail mais código de 6 dígitos e três provedores de login único como alternativas.
- Protótipos e demos que precisam de um fluxo de entrada navegável sem backend: todos os passos são simulados com temporizadores.
- Produtos em que entrar e criar conta dividem o mesmo cartão: o botão do topo alterna entre os modos “Sign in” e “Sign up”.

## Quando não usar

- Use [`sign-in`](sign-in.md) quando basta um cartão solto de e-mail e código, sem o fundo de anéis, o cabeçalho e o rodapé de página.
- Use [`signup-form`](signup-form.md) quando a criação de conta pede nome, senha e medidor de força.
- Use [`otp-input`](otp-input.md) quando você já tem o fluxo e só falta o campo de código.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import LoginCentered from "@/components/ryan-ui/blocks/login-centered/login-centered";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "center", height: 720 };

export default function LoginCenteredDemo() {
  return <LoginCentered />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `LoginCentered`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `demoCode` | `string` | `"482913"` | The code the simulated email contains. |
| `fullScreen` | `boolean` | `false` | Fill the viewport (100dvh, no frame) when the block is the whole page. |
| `demoEmail` | `string` | `"maya@northwind.studio"` | The account a simulated passkey or single sign-on resolves to. |
| `termsHref` | `string` | `"#terms"` | — |
| `privacyHref` | `string` | `"#privacy"` | — |
| `onSignIn` | `(email: string, method: LoginMethod, mode: Mode) => void` | — | Called once the simulated sign in or sign up succeeds. |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `LoginMethod` | `"Passkey" \| "Email code" \| Provider` |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` | No campo de e-mail ou em qualquer casa do código, envia o formulário do passo atual. |
| `←` ou `→` | No passo do código, movem o foco entre as casas (comportamento do `otp-input`). |
| `Backspace` | Numa casa vazia do código, apaga a casa anterior e volta o foco para ela. |
| `Tab` | Percorre os controles do passo; os botões bloqueados usam `aria-disabled` e continuam focáveis. |

## Acessibilidade

- Cada mudança de passo é anunciada por uma região `role="status"` com `aria-live="polite"` escondida visualmente; a linha de status visível do rodapé fica com `aria-hidden`.
- O foco acompanha o fluxo: vai para o botão de passkey, para o campo de e-mail, para a primeira casa do código e, ao concluir, para o título de boas-vindas.
- O grupo de provedores é um `role="group"` nomeado, cada botão tem `aria-label` próprio e o botão de reenvio informa no `aria-label` quantos segundos faltam.

## Movimento

- Os passos sobem para o lugar saindo de um leve desfoque e, ao voltar, descem de cima; a altura do cartão segue o novo conteúdo com uma mola sem ultrapassagem, só durante a troca.
- Os anéis do fundo deslizam de leve com o mouse, os de fora mais que os de dentro; no passkey dois anéis pulsam a partir da digital, a contagem de reenvio rola dígito a dígito e o sucesso desenha um círculo e um visto.
- Com “reduzir movimento” ligado, os passos só esmaecem, a altura troca na hora, os anéis ficam parados e o pulso do passkey não é renderizado.

## Comportamento responsivo

- Usa container queries do próprio bloco: abaixo de 520 px e de 400 px de largura os espaçamentos, o título e os botões de provedor encolhem.
- Ocupa a largura do contêiner com altura mínima de 640 px; `fullScreen` troca para `min-height: 100dvh` e remove borda e raio.

## Desempenho

- Um `ResizeObserver` mede o cartão para animar a altura e a contagem de reenvio usa um temporizador de 1 s só no passo do código; todos os temporizadores são limpos ao desmontar.

## Notas para IA

- Nada é autenticado de verdade: `startPasskey`, `submitEmail`, `verify` e `signInWith` usam `setTimeout`, e `onSignIn(email, method, mode)` só avisa que a simulação terminou; troque essas funções pelas chamadas reais.
- Props: `fullScreen` para ocupar a página, `demoCode` (o código aceito, padrão `482913`), `demoEmail` (a conta devolvida por passkey e provedores), `termsHref` e `privacyHref`.
- Depende de `button`, `input` e `otp-input`; a marca “ryan-ui” e todos os textos estão fixos em inglês no arquivo, sem props para traduzir.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/login-centered · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
