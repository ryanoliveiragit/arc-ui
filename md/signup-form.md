# Sign up form

> Cadastro com validação por campo, força da senha e um estado de conclusão claro.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/signup-form
- Descrição original (inglês): An account creation flow with field validation, password strength, and a clear completion state.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/signup-form.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/signup-form.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/signup-form.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/signup-form.json`. Caminho do registro, relativo ao endereço do site: `r/signup-form.json`.

- Pacotes npm: `@radix-ui/react-checkbox`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Button](button.md), [Checkbox](checkbox.md), [Input](input.md), [Password field](password-field.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/signup-form/signup-form.tsx`
  - `components/ryan-ui/blocks/signup-form/signup-form.module.css`
  - `components/ryan-ui/password-field/password-field.tsx`
  - `components/ryan-ui/password-field/password-field.module.css`
  - `components/ryan-ui/input/input.tsx`
  - `components/ryan-ui/input/input.module.css`
  - `components/ryan-ui/checkbox/checkbox.tsx`
  - `components/ryan-ui/checkbox/checkbox.module.css`
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-checkbox motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/signup-form.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Página ou cartão de criação de conta com login único (Google, Apple, GitHub) e, abaixo, nome, e-mail de trabalho e senha com medidor de força.
- Fluxos em que o erro deve aparecer no campo certo: as mensagens surgem ao sair de um campo preenchido ou ao enviar, e o foco vai para o primeiro inválido.
- Quando a criação precisa terminar num estado claro de conclusão, com o método usado e a preferência de e-mails, sem trocar de página.

## Quando não usar

- Use [`sign-in`](sign-in.md) ou [`login-centered`](login-centered.md) para quem já tem conta.
- Use [`newsletter-signup`](newsletter-signup.md) quando só precisa coletar um e-mail.
- Use [`password-strength`](password-strength.md) quando quer só o medidor de força dentro de um formulário seu.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import SignupForm from "@/components/ryan-ui/blocks/signup-form/signup-form";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "center", height: 800 };

export default function SignupFormDemo() {
  return <SignupForm />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SignupForm`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `onSubmit` | `(details: SignupDetails) => void \| Promise<void>` | — | Receives the details once every field is valid. Throw to show a submit error. |
| `serverError` | `string \| null` | — | An error from your API, shown above the submit button. |
| `onProvider` | `(provider: Provider) => void` | — | Called when someone picks a single sign-on provider. The preview simulates the redirect. |

### Tipos exportados

#### `SignupDetails`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` (obrigatória) | `string` | — |
| `email` (obrigatória) | `string` | — |
| `password` (obrigatória) | `string` | — |
| `productUpdates` (obrigatória) | `boolean` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` | Em qualquer campo, envia o formulário; com erro, o foco vai para o primeiro campo inválido. |
| `Espaço` | Na caixa “Email me product updates”, marca ou desmarca (checkbox Radix). |

## Acessibilidade

- Os campos vêm de `input` e `password-field`, com rótulo visível e mensagem de erro ligada a cada um; ao enviar com erro, o foco vai para o primeiro campo inválido.
- A linha de força é ligada à senha por `aria-describedby` e vira `role="alert"` em erro; o medidor colorido fica com `aria-hidden`, então o nível chega em palavras, de “Weak” a “Strong”.
- O erro de envio, seu (`serverError`) ou lançado por `onSubmit`, aparece em `role="alert"`; os passos são anunciados por `role="status"` e o título de boas-vindas recebe o foco ao concluir.

## Movimento

- Os passos cruzam de lado saindo de um leve desfoque, a altura do cartão segue numa mola sem ultrapassagem só durante a troca e a conclusão desenha um círculo e depois um visto.
- O texto de força troca no lugar subindo de um leve desfoque enquanto o medidor acende barra a barra, com cor por nível, e a linha de erro de envio abre a própria altura numa mola.
- Com “reduzir movimento” ligado, os passos só esmaecem, a altura e as linhas trocam na hora, o visto aparece pronto e o medidor muda de cor sem transição.

## Comportamento responsivo

- O cartão tem `min(100%, 432px)`; uma container query de até 380 px aperta margens, título, botões de provedor e barras do medidor, e até 480 px de viewport o raio diminui.

## Notas para IA

- `onSubmit(details)` recebe `name`, `email`, `password` e `productUpdates`; lance um `Error` para mostrar a mensagem dele, e saiba que a conclusão espera no mínimo 700 ms mesmo com resposta rápida.
- `serverError` mostra um erro da sua API acima do botão; `onProvider(provider)` é chamado no clique, mas o bloco simula o redirecionamento e conclui em 900 ms com dados de exemplo.
- As regras são fixas (nome com 2 ou mais caracteres, e-mail completo, senha com 8 ou mais) e as mensagens estão em inglês; “Terms”, “Privacy policy” e “Sign in” só mudam a linha de status.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/signup-form · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
