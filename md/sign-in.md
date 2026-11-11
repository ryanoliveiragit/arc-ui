# Sign in

> Cartão de entrada que passa de e-mail para código de seis dígitos e depois para a sua conta.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/sign-in
- Descrição original (inglês): A sign in card that morphs from email to a six digit code to your account.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sign-in.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sign-in.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sign-in.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/sign-in.json`. Caminho do registro, relativo ao endereço do site: `r/sign-in.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Avatar](avatar.md), [Button](button.md), [Input](input.md), [OTP input](otp-input.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/sign-in/sign-in.tsx`
  - `components/ryan-ui/blocks/sign-in/sign-in.module.css`
  - `components/ryan-ui/lib/media.ts`
  - `components/ryan-ui/otp-input/otp-input.tsx`
  - `components/ryan-ui/otp-input/otp-input.module.css`
  - `components/ryan-ui/input/input.tsx`
  - `components/ryan-ui/input/input.module.css`
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`
  - `components/ryan-ui/avatar/avatar.tsx`
  - `components/ryan-ui/avatar/avatar.module.css`
  - `components/ryan-ui/lib/ryan-provider.tsx`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/sign-in.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Cartão de entrada solto numa página sua, com e-mail mais código de 6 dígitos como caminho principal e passkey e três provedores de login único como alternativas.
- Protótipos que precisam de um fluxo de entrada navegável sem backend: envio, verificação e provedores são simulados com temporizadores.
- Quando vale corrigir erros comuns de domínio no e-mail: “gmial.com” vira a sugestão “gmail.com”, aplicada com um clique.

## Quando não usar

- Use [`login-centered`](login-centered.md) quando o login ocupa a tela inteira, o passkey deve vir primeiro ou o mesmo cartão precisa alternar para a criação de conta.
- Use [`signup-form`](signup-form.md) para criar conta com nome, senha e aceite de termos.
- Use [`otp-input`](otp-input.md) quando você já tem o fluxo e só falta o campo do código.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import SignIn from "@/components/ryan-ui/blocks/sign-in/sign-in";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "center", height: 720 };

export default function SignInDemo() {
  return <SignIn />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SignIn`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `demoCode` | `string` | `"123456"` | The code the simulated email contains. |
| `onSignIn` | `(account: SignInAccount, method: SignInMethod) => void` | — | Called once the simulated sign in succeeds. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `SignInMethod` | `"Email code" \| "Passkey" \| Provider` |

#### `SignInAccount`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` (obrigatória) | `string` | — |
| `email` (obrigatória) | `string` | — |
| `photo` | `string` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` | No campo de e-mail, segue para o código; numa casa do código, envia a verificação, que também dispara sozinha ao completar as 6 casas. |
| `←` ou `→` | No passo do código, movem o foco entre as casas (comportamento do `otp-input`). |
| `Backspace` | Numa casa vazia do código, apaga a anterior e volta o foco para ela. |
| `Tab` | Percorre os controles do passo; o botão de reenvio continua focável durante a contagem, com `aria-disabled`. |

## Acessibilidade

- Cada mudança de passo é anunciada por uma região `role="status"` com `aria-live="polite"` escondida; a linha de status visível do rodapé fica com `aria-hidden`.
- O foco acompanha o fluxo: primeira casa do código, título de boas-vindas ao concluir e o campo de e-mail, com o texto selecionado, ao trocar de e-mail ou sair.
- Os provedores formam um `role="group"` nomeado com `aria-label` por botão, o reenvio diz no `aria-label` quantos segundos faltam e a sugestão de domínio é um botão “Use …”.

## Movimento

- Os passos cruzam de lado saindo de um leve desfoque, voltando pelo lado oposto, e a altura do cartão segue o passo novo numa mola sem ultrapassagem só durante a troca.
- Ao concluir pelo código, o avatar pequeno cresce até o grande (layout compartilhado), um anel se desenha em volta, um selo de visto surge e título, detalhes e botão sobem em sequência.
- Com “reduzir movimento” ligado, os passos só esmaecem, a altura troca na hora e o avatar, o anel e o selo aparecem sem animação.

## Comportamento responsivo

- O cartão tem `min(100%, 432px)`; uma container query de até 380 px aperta margens, título e botões de provedor, e até 480 px de viewport o raio diminui.

## Desempenho

- Um `ResizeObserver` mede o conteúdo para animar a altura e a contagem de reenvio usa um temporizador de 1 s só no passo do código; os temporizadores são limpos ao desmontar.

## Notas para IA

- Nada é autenticado de verdade: `submitEmail`, `verify` e `signInWith` usam `setTimeout` e `onSignIn(account, method)` só avisa o fim da simulação; troque essas funções pelas chamadas reais.
- Só há duas props, `demoCode` (padrão `123456`, exibido como dica no campo do código) e `onSignIn`; tire a dica em produção e saiba que os textos estão fixos em inglês.
- Depende de `avatar`, `button`, `input` e `otp-input`; o “Sign up” do rodapé só muda a linha de status, então ligue-o à sua rota de cadastro, por exemplo com `signup-form`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/sign-in · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
