# Smart form fill

> Formulário que se preenche com IA: você cola uma assinatura de e-mail ou anotações, os campos recebem um valor de cada vez com ponto de confiança, a fonte de cada valor fica destacada no texto colado, apostas baixas pedem revisão e o Undo devolve os valores anteriores.

- Tipo: componente (categoria Especial), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/smart-form-fill
- Descrição original (inglês): A paste-to-fill form card where AI reads an email signature or rough notes and fills the contact field by field with a confidence dot, lights up each value's source in the pasted text, flags low-confidence guesses for review, and Undo restores the old values.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/smart-form-fill.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/smart-form-fill.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/smart-form-fill.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/smart-form-fill.json`. Caminho do registro, relativo ao endereço do site: `r/smart-form-fill.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/smart-form-fill/smart-form-fill.tsx`
  - `components/ryan-ui/smart-form-fill/smart-form-fill.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/smart-form-fill.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Criar um registro a partir de texto não estruturado: contato de CRM, perfil de fornecedor ou endereço a partir de uma assinatura colada.
- Fluxos em que a pessoa cola um e-mail encaminhado ou anotações e espera o formulário se preencher sozinho, com revisão antes do save.
- Onboarding onde digitar seis campos à mão é a principal fricção.

## Quando não usar

- Digitação simples sem fonte não estruturada: use [`input`](input.md) e [`textarea`](textarea.md).
- Aplicações longas multi-página: adicione uma etapa de colar em vez de usar o cartão inteiro.
- Importação em lote de muitos registros: prefira um fluxo de importação de tabela.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { SmartFormFill } from "@/components/ryan-ui/smart-form-fill/smart-form-fill";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 700 };

export default function SmartFormFillDemo() {
  return (
    <Stack gap={3} width={680}>
      <SmartFormFill />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SmartFormFill`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `fields` | `SmartFormFillField[]` | `defaultContactFields` | — |
| `defaultValues` | `Record<string, string>` | `{}` | — |
| `onValuesChange` | `(values: Record<string, string>) => void` | — | — |
| `extract` | `(text: string, signal: AbortSignal) => Promise<SmartFormFillResult>` | `simulatedExtract` | — |
| `reviewThreshold` | `number` | `.8` | Campos abaixo disso pedem revisão e seguram o salvar até serem checados ou editados. |
| `samples` | `{ label: string; text: string }[]` | `[{ label: "Signature", text: SIGNATURE_SAMPLE…` | — |
| `autoPlay` | `boolean` | — | — |
| `onFill` | `(result: SmartFormFillResult) => void` | — | — |
| `onUndo` | `(restored: Record<string, string>) => void` | — | — |
| `onSubmit` | `(values: Record<string, string>) => void \| Promise<void>` | — | — |
| `resolveLogo` | `(company: string) => React.ReactNode \| undefined` | — | — |
| `model` | `{ name: string; mark?: React.ReactNode }` | `{ name: "Claude Haiku 5.5", mark: <ClaudeMark…` | — |
| `title` | `string` | `"New contact"` | — |
| `description` | `string` | `"Paste a signature, an email or rough notes. …` | — |
| `submitLabel` | `string` | `"Save contact"` | — |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `SmartFormFillResult` | `Record<string, SmartFormFillExtracted>` |

#### `SmartFormFillField`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `kind` | `"text" \| "email" \| "tel" \| "phone" \| "url" \| "company"` | "company" ativa o slot de logotipo; o resto vira o tipo nativo do input. |
| `placeholder` | `string` | — |
| `span` | `boolean` | Ocupa a linha inteira na grade de dois campos. |
| `autoComplete` | `string` | — |

#### `SmartFormFillExtracted`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | — |
| `confidence` (obrigatória) | `number` | 0 a 1. |
| `source` | `string` | Substringa exata do texto colado que originou o valor (liga causa e efeito). |
| `note` | `string` | Explica uma confiança baixa. |

### Outras exportações

- `defaultContactFields` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Percorre área de colar, Edit text, cada campo, botões Check, Undo e Save contact. |
| `Esc` | Interrompe uma leitura em andamento sem alterar nada. |
| `Ctrl + Enter` ou `Cmd + Enter` | No modo Edit text, lê o texto digitado na área. |

## Acessibilidade

- Região `aria-live` polida anuncia leitura, quantos campos foram preenchidos, pendências de revisão, checagem, undo e salvamento.
- Cada campo preenchido recebe `aria-description` com a confiança (e a nota, quando baixa); campos pendentes ficam `aria-invalid` até serem checados ou editados.
- Confiança nunca é só cor: ponto mais porcentagem ou palavra (Review, Checked, Edited); o botão Check nomeia o campo no `aria-label`.

## Movimento

- Os campos se preenchem em ordem com 140 ms de intervalo: o valor aparece em 200 ms e a moldura respira um tom do accent por 900 ms, sem mudança de tamanho.
- Trechos-fonte têm três tons por confiança: neutro (≥98%), âmbar suave (92–97%) e âmbar forte (<92%); ativo, hover ou foco ficam sempre no tom forte. Selos e rótulos trocam num crossfade (100 ms / 160 ms com 2 px) e o rótulo de leitura usa shimmer.
- Com “reduzir movimento”, todos os campos preenchem de uma vez, sem respiração nem shimmer, e o loop de autoplay desliga; todos os estados finais são mantidos. O autoplay pausa fora da tela e para para sempre no primeiro toque dentro do cartão.

## Comportamento responsivo

- Container queries: de 720 px para cima o texto colado fica à esquerda e o formulário à direita; abaixo disso o bem de colar empilha acima.
- Abaixo de 440 px cada campo ocupa a linha inteira e o rodapé empilha status sobre as ações.

## Desempenho

- Só CSS anima respiração, shimmer e spin; motion faz apenas os pequenos crossfades. Sem layout animation, seguro para uma instância por tela.

## Notas para IA

- Ligue `extract` ao seu modelo com saída estruturada `{ value, confidence, source }`, onde `source` é a substring exata do texto colado — ela alimenta o destaque que liga causa e efeito.
- Mantenha `reviewThreshold` perto de 0.8 para apostas (estado inferido, título reformulado, um de vários telefones) ficarem marcadas e bloquearem o Save até serem checados.
- Em produto use `autoPlay={false}`; o loop padrão é para docs e marketing. Colar no modo edição agenda a leitura ~700 ms depois e o botão principal é `Fill`. `resolveLogo` aceita seus logotipos; há marca da Stripe embutida e chip genérico para o resto.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/smart-form-fill · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
