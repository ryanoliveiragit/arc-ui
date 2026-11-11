# Copy button

> Copia um valor e confirma na hora.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/copy-button
- Descrição original (inglês): Copy a value with immediate confirmation.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/copy-button.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/copy-button.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/copy-button.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/copy-button.json`. Caminho do registro, relativo ao endereço do site: `r/copy-button.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/copy-button/copy-button.tsx`
  - `components/ryan-ui/copy-button/copy-button.module.css`
  - `components/ryan-ui/lib/use-copy-feedback.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/copy-button.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Ao lado de um valor que a pessoa vai colar em outro lugar: um comando de instalação, uma chave de API, um link de convite.
- Em tabelas, cartões e campos somente leitura, só com ícone (`iconOnly`) ou sem borda (`variant="plain"`) para ocupar pouco espaço.

## Quando não usar

- Use [`code-block`](code-block.md) para exibir trechos de código: ele já inclui este botão.
- Quando copiar é um item de menu ou parte de outro controle, use o hook `useCopyFeedback` (instalado junto, em `lib/use-copy-feedback.ts`) em vez de aninhar este botão.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { CopyButton } from "@/components/ryan-ui/copy-button/copy-button";
import { Caption, Row, Stack, Surface } from "./_kit";

export default function CopyButtonDemo() {
  const [copies, setCopies] = useState(0);
  return (
    <Stack gap={6} align="center" width={440}>
      <Surface padding={4} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <code style={{ fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>npm install ryan-ui</code>
        <CopyButton value="npm install ryan-ui" onCopied={() => setCopies(count => count + 1)} />
      </Surface>
      <Row justify="center" gap={5}>
        <CopyButton value="sk_live_51Nq8x2Kd" label="Copy key" variant="plain" onCopied={() => setCopies(count => count + 1)} />
        <CopyButton value="https://ryan-ui.dev/docs" iconOnly label="Copy link" onCopied={() => setCopies(count => count + 1)} />
        <CopyButton value="unavailable" disabled label="Copy" />
      </Row>
      <Caption>Copied {copies} time{copies === 1 ? "" : "s"}. Press a button: the icon swaps and the label confirms.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `CopyButton`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` (obrigatória) | `string` | — | — |
| `label` | `string` | `"Copy"` | — |
| `className` | `string` | — | — |
| `iconOnly` | `boolean` | `false` | — |
| `variant` | `"outline" \| "plain"` | `"outline"` | — |
| `disabled` | `boolean` | — | — |
| `onCopied` | `() => void` | — | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Copiam `value` e mostram a confirmação no próprio botão. |

## Acessibilidade

- É um `<button type="button">` cujo nome acessível é sempre `label`; a palavra visível e os ícones ficam em `aria-hidden`.
- O resultado é anunciado numa região `aria-live="polite"` como “`label`: Copied” ou “`label`: Could not copy”; o nome do botão não muda.
- Na versão `iconOnly`, `label` é o único nome do botão: passe um texto que diga o que é copiado, como “Copiar link”.

## Movimento

- Ao copiar, o ícone troca por um visto que se desenha (ou por um alerta, na falha) e a palavra troca com um esmaecer curto; a largura acompanha a nova palavra numa mola sem ultrapassagem.
- A pressão reduz a escala para 0,97 (0,96 só com ícone) e solta numa curva de mola; depois de 1,9 s o botão volta ao rótulo original.
- Com “reduzir movimento”, as trocas são instantâneas, o visto aparece pronto, a largura salta e a pressão não altera a escala.

## Notas para IA

- Passe o texto exato em `value` e um `label` curto; `onCopied` só roda quando a cópia dá certo, e a falha aparece no próprio botão por 1,9 s.
- “Copied”, “Failed” e os anúncios são fixos em inglês; numa interface em português, troque essas strings no arquivo instalado.
- A cópia usa a Clipboard API e, se ela faltar ou for recusada (iframes, contexto inseguro), recorre a um `<textarea>` oculto com `execCommand("copy")`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/copy-button · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
