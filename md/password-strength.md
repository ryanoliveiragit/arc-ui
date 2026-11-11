# Password strength

> Mostra a força de uma nova senha enquanto ela é digitada, com requisitos em tempo real.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/password-strength
- Descrição original (inglês): Show how strong a new password is while it is typed.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/password-strength.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/password-strength.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/password-strength.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/password-strength.json`. Caminho do registro, relativo ao endereço do site: `r/password-strength.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/password-strength/password-strength.tsx`
  - `components/ryan-ui/password-strength/password-strength.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/password-strength.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Cadastro de conta ou troca de senha, quando a pessoa precisa ver as regras sendo cumpridas enquanto digita.
- Políticas de senha próprias: regras, rótulos, mínimo de caracteres e textos são configuráveis por props.
- Fluxos que reagem à força em código, já que `onValueChange` entrega o nível e as regras cumpridas junto do valor.

## Quando não usar

- Use [`password-field`](password-field.md) no login, onde medir a força só atrapalha quem já tem senha.
- Use [`signup-form`](signup-form.md) quando precisa do cadastro inteiro, com validação dos campos e estado de conclusão.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import PasswordStrength from "@/components/ryan-ui/password-strength/password-strength";
import { Caption, Stack } from "./_kit";

export default function PasswordStrengthDemo() {
  const [label, setLabel] = useState("Too short");
  return (
    <Stack gap={3} width={380}>
      <PasswordStrength label="New password" defaultValue="sunrise" autoComplete="new-password" onValueChange={(_, s) => setLabel(s.label)} />
      <Caption>Strength: {label}. Try adding capitals, numbers and symbols.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `PasswordStrength`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `value` | `string` | — | — |
| `defaultValue` | `string` | `""` | — |
| `onValueChange` | `(value: string, strength: PasswordStrengthResult) => void` | — | — |
| `rules` | `PasswordRule[]` | `defaultPasswordRules` | Rules to check. Strength is the share of rules met, spread over four steps. |
| `error` | `string` | — | Error copy tied to the field. The field shakes once each time a new error appears. |
| `revealed` | `boolean` | — | — |
| `onRevealedChange` | `(revealed: boolean) => void` | — | — |
| `messages` | `Partial<Omit<PasswordStrengthMessages, "levels">> & { levels?: Partial<PasswordStrengthLevels> }` | — | Translated or reworded copy. Every string has an English default; see PasswordStrengthMessages. |
| `shortLength` | `number` | — | Below this many characters the meter holds at its first step and reads "Too short". Defaults to 8. |
| `countCharacters` | `(password: string) => number` | — | How characters are counted for shortLength. Defaults to code points, so an emoji counts once; pass `password => password.length` to count UTF-16 units like a server might. |
| `...props` | `InputHTMLAttributes<HTMLInputElement>` | — | Também aceita as props deste tipo, menos `type`, `value`, `defaultValue` e `children`. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `PasswordStrengthMessagesInput`: Partial messages, with partial strength words, for the `messages` prop. | `Partial<Omit<PasswordStrengthMessages, "levels">> & { levels?: Partial<PasswordStrengthLevels> }` |

#### `PasswordRule`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `test` (obrigatória) | `(password: string) => boolean` | — |
| `remaining` | `(password: string) => number` | Characters still missing. Shown as a rolling count beside the rule while it is unmet. |

#### `PasswordStrengthResult`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `level` (obrigatória) | `0 \| 1 \| 2 \| 3 \| 4` | — |
| `label` (obrigatória) | `string` | — |
| `met` (obrigatória) | `string[]` | — |
| `short` | `boolean` | True while the password is shorter than the short length, so the meter holds at its first step. |

#### `PasswordStrengthLevels`

The strength words, one per meter step. Override them to translate the meter.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `tooShort` (obrigatória) | `string` | — |
| `weak` (obrigatória) | `string` | — |
| `fair` (obrigatória) | `string` | — |
| `good` (obrigatória) | `string` | — |
| `strong` (obrigatória) | `string` | — |

#### `PasswordStrengthMessages`

Every user-facing string in PasswordStrength. All have English defaults; pass only the ones you change.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `levels` (obrigatória) | `PasswordStrengthLevels` | — |
| `showPassword` (obrigatória) | `string` | Name of the show password toggle. It is a pressed toggle (aria-pressed), so the name stays the same in both states. |
| `meterLabel` (obrigatória) | `string` | Accessible name of the strength meter. |
| `noPassword` (obrigatória) | `string` | Meter value text while the field is empty. |
| `rulesLabel` (obrigatória) | `string` | Accessible name of the requirements list. |
| `ruleMet` (obrigatória) | `string` | Read after a rule's label for screen readers, including any leading punctuation. |
| `ruleNotMet` (obrigatória) | `string` | — |
| `remainingPrefix` (obrigatória) | `string` | Words around the rolling count beside an unmet rule, as in "4 more". |
| `remainingSuffix` (obrigatória) | `string` | — |
| `summary` (obrigatória) | `(result: { label: string; met: number; total: number }) => string` | The polite live-region summary read after each change. |

#### `PasswordRuleLabels`

Labels for the built-in rules. `length` receives the minimum length.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `length` (obrigatória) | `(minLength: number) => string` | — |
| `case` (obrigatória) | `string` | — |
| `number` (obrigatória) | `string` | — |
| `symbol` (obrigatória) | `string` | — |

#### `PasswordRuleOptions`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `minLength` | `number` | Characters the length rule asks for. Defaults to 12. |
| `labels` | `Partial<PasswordRuleLabels>` | Translated or reworded rule labels. |
| `countCharacters` | `(password: string) => number` | How the length rule counts characters. Defaults to code points. |

#### `EstimateStrengthOptions`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `shortLength` | `number` | Below this many characters a password stays at the first step, however varied it is. Defaults to 8. |
| `levels` | `Partial<PasswordStrengthLevels>` | Strength words for the result's label. |
| `countCharacters` | `(password: string) => number` | How characters are counted for shortLength. Defaults to code points. |

### Outras exportações

- `defaultPasswordStrengthMessages` (valor)
- `countCodePoints` (função)
- `createPasswordRules` (função)
- `defaultPasswordRules` (valor)
- `estimateStrength` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No botão de olho, que vem logo depois do campo na ordem de tabulação, mostram ou escondem a senha. |

## Acessibilidade

- O medidor tem `role="meter"` com `aria-valuenow` de 0 a 4 e `aria-valuetext` com a palavra da força, e cada regra leva “, met” ou “, not met” escondido para leitores de tela.
- Uma região `role="status"` lê um resumo depois de cada mudança (“Strength: Good. 3 of 4 requirements met.”), e o campo aponta para a lista de regras e para o erro com `aria-describedby`.
- O botão de olho tem nome fixo e informa o estado com `aria-pressed`; todos os textos vêm em inglês, então traduza com `messages`, inclusive `levels` e `summary`.

## Movimento

- Os quatro segmentos entram da esquerda numa mola sem ultrapassagem, em onda: uma senha colada enche da esquerda para a direita e, ao apagar, eles esvaziam no sentido contrário.
- A palavra da força sobe quando melhora e desce quando piora, cada regra cumprida desenha um tique, a contagem do que falta rola os dígitos e um erro novo sacode o campo uma vez.
- Com “reduzir movimento” ligado, as trocas viram esmaecimentos curtos ou instantâneos e o campo não sacode.

## Comportamento responsivo

- Em telas de toque (`pointer: coarse`) o texto do campo sobe para 16px, para o teclado do celular não dar zoom ao focar.

## Notas para IA

- As regras padrão pedem 12 caracteres, maiúsculas e minúsculas, número e símbolo; mude com `createPasswordRules({ minLength, labels })` ou passe `rules` próprias com `test` e, para a contagem, `remaining`.
- Abaixo de `shortLength` (8) o medidor fica no primeiro passo, com “Too short”, mesmo que as outras regras passem; os testes rodam a cada tecla, então mantenha `test` barato.
- `onValueChange(valor, força)` traz `level` de 0 a 4 e os ids das regras cumpridas, mas a pontuação roda no aparelho e só orienta quem digita, então valide a política também no servidor.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/password-strength · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
