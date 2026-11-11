# Inline edit

> Renomeie no próprio lugar: o texto vira campo sem mudar de posição.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/inline-edit
- Descrição original (inglês): Rename in place: the text becomes a field without moving.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/inline-edit.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/inline-edit.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/inline-edit.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/inline-edit.json`. Caminho do registro, relativo ao endereço do site: `r/inline-edit.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/inline-edit/inline-edit.tsx`
  - `components/ryan-ui/inline-edit/inline-edit.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/inline-edit.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Nomes e textos curtos que são lidos muito mais do que editados: título de projeto, nome de arquivo, descrição.
- Edição que salva campo a campo, sem formulário: `onSave` pode devolver uma promessa, e o texto novo aparece na hora enquanto ela corre.
- Títulos que precisam continuar sendo títulos: `as` mantém o texto num `h1`, `h2`, `h3`, `p` ou `span`.

## Quando não usar

- Use [`input`](input.md) ou [`textarea`](textarea.md) num formulário quando vários campos precisam ser salvos juntos.
- Use [`rich-text-editor`](rich-text-editor.md) quando o texto precisa de formatação.
- Quando sair do campo não pode gravar: aqui perder o foco salva, como numa renomeação, e só `Esc` descarta.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import InlineEdit from "@/components/ryan-ui/inline-edit/inline-edit";
import { Caption, Stack, Surface } from "./_kit";

export default function InlineEditDemo() {
  const [name, setName] = useState("Q4 launch plan");
  const [desc, setDesc] = useState("Everything we need to ship the new pricing page before the holidays.");
  return (
    <Surface width={440} padding={6}>
      <Stack gap={3}>
        <InlineEdit as="h2" label="Project name" value={name} onSave={(v) => new Promise((r) => setTimeout(() => { setName(v); r(null); }, 700))} validate={(v) => (v.trim() ? null : "A project needs a name.")} />
        <InlineEdit as="p" variant="body" multiline label="Description" value={desc} onSave={setDesc} placeholder="Add a description" />
        <Caption>Click either text to edit. Enter saves, Escape cancels.</Caption>
      </Stack>
    </Surface>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `InlineEdit`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` (obrigatória) | `string` | — | The saved value. A new value from outside replaces the text while it is not being edited. |
| `onSave` (obrigatória) | `(next: string) => void \| Promise<unknown>` | — | Persists the new value. Return a promise to show the saving state, and reject it to roll back. |
| `label` (obrigatória) | `string` | — | Accessible name, for example “Project name”. |
| `validate` | `(next: string) => string \| null \| undefined` | — | Returns a message when the draft cannot be saved. |
| `placeholder` | `string` | `""` | Shown when the value is empty. |
| `multiline` | `boolean` | `false` | Wraps onto several lines and grows in height. Enter still saves; Shift+Enter adds a line break. |
| `variant` | `"title" \| "body"` | `"title"` | `title` for names and headings, `body` for descriptions. |
| `as` | `"span" \| "p" \| "h1" \| "h2" \| "h3"` | `"span"` | The element that holds the text, so a title can stay a heading. |
| `className` | `string` | — | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No texto, entram em edição com todo o conteúdo selecionado. |
| `Enter` | No campo, salva; durante uma composição de IME não dispara. |
| `Shift + Enter` | Com `multiline`, insere uma quebra de linha. |
| `Esc` | Cancela a edição, restaura o texto e devolve o foco a ele. |
| `Tab` | Passa pelos botões de salvar e de cancelar; quando o foco sai do componente, o texto é salvo. |

## Acessibilidade

- Em repouso o texto é um `<button>` com `aria-label` no formato “rótulo: valor” e a dica `Activate to edit.`; em edição vira `<input>` ou `<textarea>` com o mesmo `label`.
- O erro de `validate` liga-se ao campo por `aria-invalid` e `aria-describedby`, e os avisos de salvando e salvo saem numa região `role="status"`.
- As dicas, os anúncios e a mensagem de falha (com o botão `Try again`) são fixos em inglês; só `label`, `placeholder` e o texto de `validate` vêm de você.

## Movimento

- O texto vira campo no mesmo lugar e com as mesmas métricas; a moldura acompanha a largura do que é digitado com uma mola rápida e, com `multiline`, a altura.
- Ao salvar, o texto novo fica esmaecido ao lado de um indicador girando até a promessa resolver, e então um visto se desenha; numa falha, o texto salvo volta e a moldura pisca em tom de erro.
- Com “reduzir movimento” ligado, os tamanhos mudam na hora, os textos só esmaecem e o indicador de salvamento não gira.

## Comportamento responsivo

- A linha reserva 66 px à direita para os botões (38 px com `multiline`), então o texto não muda de quebra ao entrar em edição; em linha única, o excesso é cortado com reticências.

## Notas para IA

- `value` é o valor salvo e `onSave(next)` deve gravá-lo: devolva uma promessa e rejeite-a para o componente restaurar o último valor salvo e oferecer nova tentativa.
- `validate(next)` devolve a mensagem de erro ou nada; antes disso o texto é aparado e, em linha única, espaços repetidos viram um só, e `onSave` não é chamado se nada mudou.
- `label` é obrigatório (é o nome acessível e não aparece na tela), `variant` é `title` ou `body` e `as` escolhe a tag, por exemplo `as="h2"`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/inline-edit · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
