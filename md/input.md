# Input

> Campo de uma linha com rótulos claros e estados úteis.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/input
- Descrição original (inglês): A single line field with clear labels and useful states.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/input.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/input.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/input.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/input.json`. Caminho do registro, relativo ao endereço do site: `r/input.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/input/input.tsx`
  - `components/ryan-ui/input/input.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/input.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Texto de uma linha num formulário: nome, e-mail, URL, código.
- Campos que precisam de ajuda e de validação visíveis: `description` e `error` abrem a própria linha sob o campo sem dar tranco no layout.
- Mensagens com contagem que muda durante a digitação, como “12 caracteres restantes”: só os dígitos alterados rolam.

## Quando não usar

- Use [`textarea`](textarea.md) para texto de várias linhas.
- Use [`password-field`](password-field.md) para senhas e [`search-field`](search-field.md) para busca: eles já trazem o botão de revelar e o de limpar.
- Use [`number-field`](number-field.md) ou [`money-input`](money-input.md) para números e valores em dinheiro, que pedem limites, passos e formatação.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Input } from "@/components/ryan-ui/input/input";
import { Stack } from "./_kit";

export default function InputDemo() {
  const [email, setEmail] = useState("ryan@");
  const invalid = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email);
  return (
    <Stack gap={5} width={360}>
      <Input label="Work email" type="email" description="We will send your receipts here." value={email} onChange={(e) => setEmail(e.target.value)} error={invalid ? "Enter a complete email address." : undefined} placeholder="you@company.com" />
      <Input label="Company" placeholder="Acme Inc." />
      <Input label="Workspace URL" value="acme-inc" readOnly disabled description="Contact support to change this." />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Input`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `description` | `string` | — | — |
| `error` | `string` | — | — |
| `...props` | `InputHTMLAttributes<HTMLInputElement>` | — | Também aceita as props deste tipo. |

## Acessibilidade

- É um `<input>` nativo com um `<label>` ligado por `htmlFor`; `label` é obrigatório.
- `error` marca o campo com `aria-invalid` e a mensagem sai num `role="alert"`; `description` e `error` entram em `aria-describedby`, somados ao que você passar nessa prop.
- O foco é indicado só pelo escurecimento da borda, sem anel; as palavras animadas das mensagens ficam ocultas, e o leitor de tela lê uma cópia em texto simples.

## Movimento

- As linhas de ajuda e de erro abrem a própria altura com uma mola, e as palavras sobem de um leve desfoque.
- Quando a mensagem muda, só as palavras diferentes se movem, e os números rolam para cima se cresceram e para baixo se diminuíram.
- Com “reduzir movimento” ligado, as linhas aparecem já no tamanho final e as palavras só esmaecem.

## Comportamento responsivo

- Ocupa 100% da largura do contêiner, com altura mínima de 44 px (`--control-height-md`); quem define a largura é o pai.

## Notas para IA

- Aceita todas as props de `<input>` (`type`, `value`, `onChange`, `placeholder`, `disabled`…) e o `ref` aponta para o elemento nativo.
- `error` é uma string, não um booleano: passe o texto quando houver erro e `undefined` quando não houver; a `description` continua visível junto com o erro.
- Não há variações de tamanho nem espaço para ícone ou botão dentro do campo: para isso existem `password-field`, `search-field` e `money-input`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/input · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
