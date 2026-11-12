# OTP input

> Campo de código de seis dígitos com suporte a colar e navegação pelo teclado.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/otp-input
- Descrição original (inglês): A six digit verification flow with paste support and keyboard navigation.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/otp-input.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/otp-input.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/otp-input.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/otp-input.json`. Caminho do registro, relativo ao endereço do site: `r/otp-input.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/otp-input/otp-input.tsx`
  - `components/ryan-ui/otp-input/otp-input.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/otp-input.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Código de verificação de tamanho fixo, enviado por e-mail ou SMS ou gerado por um app autenticador, digitado casa a casa.
- Quando colar o código inteiro precisa funcionar: o texto colado é distribuído pelas casas a partir da que está em foco.

## Quando não usar

- Use [`sign-in`](sign-in.md) quando quer o fluxo inteiro de e-mail e código já montado, com reenvio e estado de conta.
- Use [`input`](input.md) para códigos de tamanho variável ou com separadores, como cupons e chaves de recuperação.
- Use [`password-field`](password-field.md) para segredos que não devem aparecer na tela; aqui os caracteres ficam visíveis.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { OtpInput } from "@/components/ryan-ui/otp-input/otp-input";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "center", height: 360 };

export default function OtpInputDemo() {
  const [code, setCode] = useState("");
  const done = code.length === 6;
  const wrong = done && code !== "482913";
  return (
    <Stack width={380} gap={3} align="center" style={{ textAlign: "center" }}>
      <OtpInput
        label="Verification code"
        description="Enter the 6-digit code we sent to maya@northwind.studio."
        value={code}
        onChange={setCode}
        error={wrong ? "That code is not right. Try 482913." : undefined}
      />
      <Caption>{done ? (wrong ? "Rejected" : "Verified") : `${code.length} of 6 digits. Paste works too.`}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `OtpInput`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `length` | `number` | `6` | — |
| `value` | `string` | `""` | — |
| `onChange` | `(value: string) => void` | — | — |
| `label` (obrigatória) | `string` | — | — |
| `description` | `string` | — | — |
| `error` | `string` | — | — |
| `autoFocus` | `boolean` | `false` | — |
| `disabled` | `boolean` | `false` | — |
| `inputMode` | `"numeric" \| "text"` | `"numeric"` | — |
| `className` | `string` | — | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Movem o foco para a casa anterior ou seguinte. |
| `Backspace` | Numa casa vazia, apaga a casa anterior e leva o foco para ela. |
| `Delete` | Apaga o caractere da casa em foco. |
| `Ctrl + V` | Cola o código a partir da casa em foco; no modo numérico, o que não é dígito é descartado. |
| `Tab` ou `Shift + Tab` | Passam por cada casa: todas são campos independentes na ordem de foco. |

## Acessibilidade

- As casas formam um `role="group"` com `aria-label` vindo de `label`, e cada campo se identifica como “digit N of M”, em inglês fixo no arquivo.
- `description` e `error` são ligados a todas as casas por `aria-describedby`; com erro, as casas recebem `aria-invalid` e a mensagem é um `role="alert"`.
- A primeira casa usa `autoComplete="one-time-code"`; em cores forçadas o anel animado some e o contorno nativo de foco volta.

## Movimento

- Cada dígito sobe para dentro da casa saindo de um leve desfoque; ao colar, os dígitos chegam em onda da esquerda para a direita.
- Um único anel de foco desliza entre as casas com uma mola curta, e um erro novo sacode a fileira de lado uma vez, com a mensagem abrindo a própria altura.
- Com “reduzir movimento” ligado, os dígitos só esmaecem, o anel salta de casa, não há sacudida e as mensagens aparecem sem animação.

## Comportamento responsivo

- As casas têm 42 × 48 px e encolhem em largura quando a fileira não cabe; até 360 px de viewport o espaço entre elas cai para 6 px e a altura para 44 px.

## Notas para IA

- É só controlado: sem `value` e `onChange` os dígitos digitados não aparecem; `onChange` devolve a string compacta, então confira `value.length === length` para validar ou enviar.
- `label` é obrigatório; `length` é 6 por padrão, `inputMode="text"` aceita letras e passar um `error` novo dispara a sacudida.
- Importe de `@/components/ryan-ui/otp-input/otp-input` (não fica em `blocks/`); não há `onComplete`, e `sign-in` e `login-centered` mostram como enviar ao completar a última casa.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/otp-input · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
