# Select

> Campo de escolha compacto com um menu que funciona bem pelo teclado.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/select
- Descrição original (inglês): A compact choice field with a keyboard friendly menu.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/select.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/select.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/select.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/select.json`. Caminho do registro, relativo ao endereço do site: `r/select.json`.

- Pacotes npm: `@radix-ui/react-select`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/select/select.tsx`
  - `components/ryan-ui/select/select.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-select lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/select.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Escolher um valor de uma lista média num formulário, como fuso horário, país ou categoria.
- Quando o espaço é curto e as opções não precisam ficar à vista o tempo todo.
- Formulários que pedem teclado completo e envio nativo, com `name` e `required` do Radix.

## Quando não usar

- Use [`radio-group`](radio-group.md) ou [`segmented-control`](segmented-control.md) quando são poucas opções e vale mostrar todas.
- Use [`combobox`](combobox.md) quando a lista é longa e a pessoa prefere digitar para filtrar.
- Use [`multi-select`](multi-select.md) quando dá para escolher mais de um valor.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Select } from "@/components/ryan-ui/select/select";
import { Caption, Stack } from "./_kit";

export default function SelectDemo() {
  const [zone, setZone] = useState("");
  return (
    <Stack width={320} gap={4}>
      <Select
        label="Time zone"
        description="Used for scheduling and reminders."
        placeholder="Choose a time zone"
        value={zone}
        onValueChange={setZone}
        options={[
          { value: "pst", label: "Pacific Time (UTC-8)" },
          { value: "mst", label: "Mountain Time (UTC-7)" },
          { value: "est", label: "Eastern Time (UTC-5)" },
          { value: "gmt", label: "London (UTC+0)" },
          { value: "cet", label: "Central Europe (UTC+1)" },
          { value: "jst", label: "Tokyo (UTC+9)", disabled: true },
        ]}
      />
      <Caption>{zone ? `Selected: ${zone.toUpperCase()}` : "Open the menu and use the arrow keys."}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Select`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `description` | `string` | — | — |
| `placeholder` | `string` | `"Select an option"` | — |
| `id` | `string` | — | — |
| `className` | `string` | — | — |
| `options` (obrigatória) | `{ value: string; label: string; disabled?: boolean }[]` | — | — |
| `...props` | `ComponentPropsWithoutRef<typeof SelectPrimitive.Root>` | — | Também aceita as props deste tipo, menos `children`. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` ou `↓` ou `↑` | No botão, abrem o menu com o foco na opção escolhida. |
| `↓` ou `↑` | No menu, movem entre as opções, pulando as desabilitadas. |
| `Home` ou `End` | Vão à primeira ou à última opção. |
| `Enter` ou `Espaço` | Escolhem a opção em foco, fecham o menu e devolvem o foco ao botão. |
| `Esc` | Fecha o menu sem mudar o valor. |
| `A–Z` | Digitar o começo de um rótulo pula para essa opção; com o menu fechado, já troca o valor. |

## Acessibilidade

- O botão é o `combobox` do Radix, ligado ao `<label>` visível e à `description` por `aria-describedby`; o valor real fica num texto oculto para leitores de tela enquanto a cópia visível anima.
- Com o menu aberto, o foco fica preso nas opções e o resto da página fica oculto para tecnologia assistiva, e ao fechar o foco volta ao botão.

## Movimento

- O menu cresce a partir da borda do botão com um leve deslocamento e escala, e a seta gira; o botão nunca escala, para o menu medir a posição certa.
- O valor exibido rola na direção da lista, com uma opção mais abaixo entrando por baixo e uma mais acima por cima, e o tique da opção marcada surge com leve desfoque.
- Com “reduzir movimento” ligado, menu e valor só esmaecem e o tique aparece sem animação.

## Comportamento responsivo

- O menu acompanha a largura do botão e tem no máximo 320px de altura ou o espaço que sobra na tela, com setas de rolagem nas pontas, e o Radix o reposiciona para não sair da tela.

## Notas para IA

- Import nomeado `Select`; passe `options` como `{ value, label, disabled? }` e use `value` com `onValueChange` ou `defaultValue`.
- Não use `value=""` numa opção: o valor vazio é o estado que mostra o `placeholder`.
- Para busca dentro da lista prefira `combobox`, e para várias escolhas, `multi-select`; `className` vai para o botão, não para o campo inteiro.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/select · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
