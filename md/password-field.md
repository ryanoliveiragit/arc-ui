# Password field

> Capture texto sensível com um botão para revelar o que foi digitado.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/password-field
- Descrição original (inglês): Capture sensitive text with a visible reveal control.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/password-field.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/password-field.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/password-field.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/password-field.json`. Caminho do registro, relativo ao endereço do site: `r/password-field.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/password-field/password-field.tsx`
  - `components/ryan-ui/password-field/password-field.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/password-field.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Senha no login ou na troca de senha, quando a pessoa quer conferir o que digitou antes de enviar.
- Outros segredos digitados, como uma chave de API, trocando os nomes do botão por `messages`.

## Quando não usar

- Use [`password-strength`](password-strength.md) quando a pessoa está criando uma senha e precisa ver os requisitos e a força enquanto digita.
- Use [`otp-input`](otp-input.md) para códigos de verificação de seis dígitos.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { PasswordField } from "@/components/ryan-ui/password-field/password-field";
import { Caption, Stack } from "./_kit";

export default function PasswordFieldDemo() {
  const [pw, setPw] = useState("correct-horse-battery");
  return (
    <Stack gap={3} width={360}>
      <PasswordField label="Password" description="Use the eye to check what you typed." value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
      <Caption>{pw.length} characters.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `PasswordField`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `description` | `string` | — | — |
| `messages` | `Partial<PasswordFieldMessages>` | — | Translated or reworded toggle names. |
| `...props` | `InputHTMLAttributes<HTMLInputElement>` | — | Também aceita as props deste tipo, menos `type`. |

### Tipos exportados

#### `PasswordFieldMessages`

The toggle's names. Both have English defaults; pass the ones you translate.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `showPassword` (obrigatória) | `string` | — |
| `hidePassword` (obrigatória) | `string` | — |

### Outras exportações

- `defaultPasswordFieldMessages` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Leva o foco do campo ao botão do olho. |
| `Enter` ou `Espaço` | No botão do olho, mostram ou escondem a senha. |

## Acessibilidade

- `label` vira um `<label>` ligado ao campo, e `description` entra em `aria-describedby` junto com o que você passar nessa prop.
- O botão do olho tem `aria-pressed` e nome que alterna entre `Show password` e `Hide password`; traduza com `messages={{ showPassword, hidePassword }}`.
- Não há prop de erro: passe `aria-invalid` para a borda ficar vermelha e ligue sua mensagem por `aria-describedby`.

## Movimento

- Ao mostrar a senha, um traço se desenha sobre o olho, cortando o contorno por baixo, e se recolhe ao esconder, em vez de trocar um ícone pelo outro.
- A troca entre pontos e letras aparece com um breve esmaecer e desfoque a partir do primeiro clique, e a linha de ajuda abre a própria altura com uma mola.
- Com “reduzir movimento” ligado, o traço troca na hora, o texto não esmaece e o botão não encolhe ao ser pressionado.

## Notas para IA

- Aceita as props de `<input>` exceto `type` (`value`, `onChange`, `name`, `autoComplete`…) e o `ref` aponta para o campo; use `autoComplete="current-password"` no login e `"new-password"` no cadastro.
- Mostrar ou esconder é estado interno: não há prop para controlar nem para saber se a senha está visível.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/password-field · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
