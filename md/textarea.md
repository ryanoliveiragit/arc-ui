# Textarea

> Campo de várias linhas para notas, descrições e textos mais longos.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/textarea
- Descrição original (inglês): A multiline field for notes, descriptions, and longer text.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/textarea.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/textarea.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/textarea.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/textarea.json`. Caminho do registro, relativo ao endereço do site: `r/textarea.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/textarea/textarea.tsx`
  - `components/ryan-ui/textarea/textarea.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/textarea.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Comentários, descrições, observações de pedido e outros textos de várias linhas sem formatação.
- Campos de feedback ou suporte com uma linha de ajuda e um erro de validação animados.

## Quando não usar

- Use [`input`](input.md) para respostas de uma linha, como nome ou assunto.
- Use [`rich-text-editor`](rich-text-editor.md) quando o texto precisa de títulos, listas ou links.
- Use [`prompt-input`](prompt-input.md) para caixas de mensagem de chat ou IA que crescem e enviam com Enter.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Textarea } from "@/components/ryan-ui/textarea/textarea";
import { Caption, Stack } from "./_kit";

export default function TextareaDemo() {
  const [text, setText] = useState("");
  const max = 280;
  const over = text.length > max;
  return (
    <Stack width={420} gap={3}>
      <Textarea label="Feedback" description="Tell us what we could do better." placeholder="The export button was hard to find because…" rows={4} value={text} onChange={(e) => setText(e.target.value)} error={over ? `${text.length - max} characters over the limit.` : undefined} />
      <Caption>{text.length} / {max}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Textarea`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `description` | `string` | — | — |
| `error` | `string` | — | — |
| `...props` | `TextareaHTMLAttributes<HTMLTextAreaElement>` | — | Também aceita as props deste tipo. |

## Acessibilidade

- O `label` é um `<label>` ligado ao campo, e `description` e `error` entram em `aria-describedby` junto de qualquer `aria-describedby` que você passar.
- Com `error`, o campo recebe `aria-invalid` e a mensagem tem `role="alert"`, então é lida assim que aparece.

## Movimento

- As mensagens de ajuda e de erro abrem a altura numa mola e as palavras sobem com desfoque; só as palavras que mudaram se movem.
- Números dentro da mensagem, como em “12 characters over the limit”, rolam só os dígitos que mudaram.
- Com “reduzir movimento” ligado, as mensagens já aparecem na altura final e só esmaecem.

## Notas para IA

- Aceita as props de `<textarea>` (`rows`, `maxLength`, `value`, `onChange`) mais `label`, `description` e `error`; não há contador embutido.
- A altura mínima é 110px, redimensionável só na vertical e sem crescer com o texto; use `rows` para a altura inicial.
- Por estar num `role="alert"`, o `error` é relido a cada mudança; evite um erro que muda a cada tecla e mostre contadores fora dele.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/textarea · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
