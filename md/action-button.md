# Action button

> Botão compacto para as ações mais usadas de uma barra de ferramentas.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/action-button
- Descrição original (inglês): A compact button for frequent toolbar actions.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/action-button.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/action-button.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/action-button.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/action-button.json`. Caminho do registro, relativo ao endereço do site: `r/action-button.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/action-button/action-button.tsx`
  - `components/ryan-ui/action-button/action-button.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/action-button.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Ações assíncronas que devem mostrar andamento e confirmação no próprio botão: salvar rascunho, publicar, sincronizar.
- Quando você quer que os estados de pendente e concluído sejam geridos pelo componente a partir de uma única função `onAction`.

## Quando não usar

- Use [`button`](button.md) quando precisar de variantes, tamanhos ou de um ícone próprio: aqui a aparência é fixa, preenchida e com uma seta à direita.
- Use [`action-swap`](action-swap.md) quando o botão alterna entre estados que permanecem, como Seguir e Seguindo, ou precisa de tom e ícone por estado.
- Use [`confirm-morph`](confirm-morph.md) ou [`hold-to-confirm`](hold-to-confirm.md) quando a ação é destrutiva e pede confirmação antes de rodar.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import ActionButton from "@/components/ryan-ui/action-button/action-button";
import { Caption, Row, Stack } from "./_kit";

const wait = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));

export default function ActionButtonDemo() {
  const [saves, setSaves] = useState(0);
  const [failures, setFailures] = useState(0);
  return (
    <Stack gap={6} align="center">
      <Row justify="center">
        <ActionButton label="Save draft" onAction={async () => { await wait(1200); setSaves(count => count + 1); }} />
        <ActionButton label="Publish" pendingLabel="Publishing" successLabel="Published" onAction={() => wait(1800)} />
      </Row>
      <Row justify="center">
        <ActionButton
          label="Sync calendar"
          pendingLabel="Syncing"
          successLabel="Synced"
          onAction={async () => { await wait(900); throw new Error("offline"); }}
          onActionError={() => setFailures(count => count + 1)}
        />
      </Row>
      <Caption>{saves} drafts saved · {failures} sync failures. Each button shows pending, then confirms in place.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ActionButton`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `successLabel` | `string` | `"Saved"` | — |
| `pendingLabel` | `string` | `"Saving"` | — |
| `onAction` (obrigatória) | `() => void \| Promise<void>` | — | — |
| `resetAfterMs` | `number` | `2400` | — |
| `onActionError` | `(error: unknown) => void` | — | — |
| `...props` | `ButtonHTMLAttributes<HTMLButtonElement>` | — | Também aceita as props deste tipo, menos `onClick`, `onDrag`, `onDragEnd`, `onDragStart` e `onAnimationStart`. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Disparam `onAction`; enquanto a ação está pendente, novos acionamentos são ignorados. |

## Acessibilidade

- É um `<button>` nativo com `type="button"` por padrão; pendente, recebe `aria-busy` e `aria-disabled` em vez de `disabled`, então o foco não se perde no meio da ação.
- O texto animado e os ícones ficam em `aria-hidden`: o leitor de tela recebe o `label` fixo e um `role="status"` que anuncia `pendingLabel` e depois `successLabel`.
- `pendingLabel` e `successLabel` têm padrão em inglês (“Saving” e “Saved”); passe os dois no idioma da interface.

## Movimento

- O rótulo troca com um esmaecer curto (o novo sobe 2 px) e a largura do botão acompanha o texto com uma mola sem ultrapassagem.
- A seta sai para a direita quando a ação começa, dá lugar a um indicador giratório e depois a um visto que se desenha; ao voltar ao repouso, a seta entra pela esquerda.
- Com “reduzir movimento”, o rótulo troca na hora, os ícones só esmaecem, a largura salta, o visto aparece pronto e o indicador não gira.

## Comportamento responsivo

- O rótulo não quebra linha e a largura muda a cada estado; em linhas apertadas, use textos de comprimento parecido em `label`, `pendingLabel` e `successLabel` para os vizinhos não se deslocarem.

## Desempenho

- Cada botão mantém um `ResizeObserver` para medir o rótulo e um temporizador para voltar ao repouso; evite centenas deles numa lista longa.

## Notas para IA

- A ação vai em `onAction` (não existe `onClick`): devolva uma Promise para o estado pendente durar enquanto ela roda e rejeite-a para sinalizar falha.
- Na falha o botão volta ao repouso sem mensagem e chama `onActionError`; mostre o erro você mesmo, por exemplo com `toast`.
- `resetAfterMs` (padrão 2400) define quanto tempo o estado concluído fica visível; com `0` ele permanece até o próximo clique.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/action-button · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
