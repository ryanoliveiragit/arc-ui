# Checkbox

> Uma escolha binária com estado preciso e fácil de ler.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/checkbox
- Descrição original (inglês): A binary choice with a precise, legible state.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/checkbox.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/checkbox.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/checkbox.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/checkbox.json`. Caminho do registro, relativo ao endereço do site: `r/checkbox.json`.

- Pacotes npm: `@radix-ui/react-checkbox`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/checkbox/checkbox.tsx`
  - `components/ryan-ui/checkbox/checkbox.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-checkbox motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/checkbox.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Opções independentes que podem ser marcadas em qualquer combinação, como preferências de notificação.
- Aceite explícito num formulário (termos, consentimento), que só vale ao enviar.
- Caixa “selecionar tudo” que resume um grupo: `checked="indeterminate"` mostra o traço quando só parte dos itens está marcada.

## Quando não usar

- Use [`switch`](switch.md) quando a mudança tem efeito imediato, sem botão de salvar.
- Use [`radio-group`](radio-group.md) quando só uma opção pode ficar marcada.
- Use [`chip-group`](chip-group.md) para filtros que as pessoas ligam e desligam com frequência acima de uma lista.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Checkbox } from "@/components/ryan-ui/checkbox/checkbox";
import { Caption, Stack } from "./_kit";

export default function CheckboxDemo() {
  const [items, setItems] = useState({ updates: true, digest: false, security: true });
  const all = Object.values(items).every(Boolean);
  const some = Object.values(items).some(Boolean);
  const set = (k: keyof typeof items) => (c: boolean | "indeterminate") => setItems((s) => ({ ...s, [k]: c === true }));
  return (
    <Stack gap={4} width={380}>
      <Checkbox
        label="All notifications"
        checked={all ? true : some ? "indeterminate" : false}
        onCheckedChange={(c) => setItems({ updates: c === true, digest: c === true, security: c === true })}
      />
      <Stack gap={3} style={{ paddingLeft: "var(--space-6)" }}>
        <Checkbox label="Product updates" description="New features and improvements." checked={items.updates} onCheckedChange={set("updates")} />
        <Checkbox label="Weekly digest" description="A Monday summary of your workspace." checked={items.digest} onCheckedChange={set("digest")} />
        <Checkbox label="Security alerts" description="Sign-ins from new devices." checked={items.security} onCheckedChange={set("security")} />
        <Checkbox label="Billing emails" description="Managed by your admin." checked disabled />
      </Stack>
      <Caption>The top box turns indeterminate when only some are on.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Checkbox`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | — | — |
| `description` | `string` | — | — |
| `...props` | `ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>` | — | Também aceita as props deste tipo. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Espaço` | Marca ou desmarca a caixa em foco; `Enter` não alterna. |

## Acessibilidade

- Usa o `Checkbox` do Radix: um botão com `role="checkbox"` e `aria-checked`, que vale `mixed` no estado indeterminado.
- `label` gera um `<label>` ligado ao controle e `description` entra por `aria-describedby`; sem `label`, passe `aria-label`, senão o nome acessível vira o genérico `Checkbox`.
- A área de clique tem 44 px de lado, embora o quadrado desenhado tenha 18 px, e clicar no rótulo também alterna.

## Movimento

- O preenchimento cresce com uma mola curta enquanto o traço da marca se desenha; ao desmarcar, o traço se recolhe.
- A marca e o traço do estado indeterminado têm os mesmos três pontos, então um se transforma no outro em vez de trocar.
- Com “reduzir movimento” ligado, a troca de estado é instantânea e o quadrado não encolhe ao ser pressionado.

## Notas para IA

- Controlado com `checked` + `onCheckedChange` ou não controlado com `defaultChecked`; o valor pode ser `true`, `false` ou `"indeterminate"`.
- Em `onCheckedChange`, compare com `=== true` antes de gravar um booleano, porque o valor recebido pode ser `"indeterminate"`.
- As demais props vão para o `Checkbox.Root` do Radix (`disabled`, `required`, `name`, `value`) e o `ref` aponta para o botão.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/checkbox · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
