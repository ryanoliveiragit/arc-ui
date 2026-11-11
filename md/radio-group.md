# Radio group

> Escolha uma opção entre várias visíveis, com um destaque que desliza até a linha escolhida.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/radio-group
- Descrição original (inglês): Choose one option from a visible set.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/radio-group.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/radio-group.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/radio-group.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/radio-group.json`. Caminho do registro, relativo ao endereço do site: `r/radio-group.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/radio-group/radio-group.tsx`
  - `components/ryan-ui/radio-group/radio-group.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/radio-group.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Escolha única entre poucas opções que devem ficar todas à vista, como plano de cobrança ou frequência de envio.
- Formulários em que cada opção tem uma linha de explicação embaixo do nome.
- Quando você quer o comportamento nativo do rádio (setas, Tab e envio de formulário) com um destaque animado.

## Quando não usar

- Use [`radio-cards`](radio-cards.md) quando cada opção precisa de preço, ícone ou aparência de cartão.
- Use [`select`](select.md) quando a lista é longa ou o espaço é curto.
- Use [`segmented-control`](segmented-control.md) para alternar entre visões de uma mesma tela.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { RadioGroup } from "@/components/ryan-ui/radio-group/radio-group";
import { Caption, Stack } from "./_kit";

export default function RadioGroupDemo() {
  const [plan, setPlan] = useState("pro");
  return (
    <Stack width={380} gap={4}>
      <RadioGroup
        label="Billing plan"
        value={plan}
        onValueChange={setPlan}
        options={[
          { value: "starter", label: "Starter", description: "For side projects, up to 3 members" },
          { value: "pro", label: "Pro", description: "Unlimited projects and priority support" },
          { value: "enterprise", label: "Enterprise", description: "SSO, audit logs and a dedicated manager" },
        ]}
      />
      <Caption>Current plan: {plan}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `RadioGroup`

One highlight travels to the chosen row while the new dot springs in and the old one shrinks away, so a change reads as a single physical move. Arrow keys take the same path. Rows and text never resize.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `options` (obrigatória) | `{ value: string; label: string; description?: string }[]` | — | — |
| `value` (obrigatória) | `string` | — | — |
| `onValueChange` (obrigatória) | `(value: string) => void` | — | — |
| `name` | `string` | — | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↓` ou `→` | Selecionam a opção seguinte, como em qualquer rádio nativo, e o destaque desliza junto. |
| `↑` ou `←` | Selecionam a opção anterior. |
| `Espaço` | Marca a opção em foco quando nenhuma está marcada. |
| `Tab` | Entra no grupo pela opção marcada e sai numa tecla só. |

## Acessibilidade

- É um `fieldset` com `legend` e rádios nativos que compartilham o mesmo `name`, então papel, nome do grupo e navegação vêm do navegador.
- Nome e descrição de cada opção ficam dentro do `<label>`, e os dois entram no nome acessível do rádio.

## Movimento

- Um único destaque viaja até a linha escolhida numa mola sem ultrapassagem, enquanto o ponto novo cresce e o antigo encolhe; linhas e textos nunca mudam de tamanho.
- Ao apertar, a marca afunda rápido e mostra um ponto fraco de prévia, e o ponto de verdade cresce ao soltar.
- Com “reduzir movimento” ligado, destaque e ponto mudam na hora e as transições de cor e de pressão são desligadas.

## Notas para IA

- É sempre controlado: `value` e `onValueChange` são obrigatórios e não existe `defaultValue`, então guarde a escolha num `useState`.
- Import nomeado, `import { RadioGroup } from "@/components/ryan-ui/radio-group/radio-group"`; `label` vira a `legend` e cada opção é `{ value, label, description? }`, só texto.
- Passe `name` dentro de um formulário nativo; sem ele, os rádios usam um nome gerado.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/radio-group · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
