# Plan comparison

> Comparação de planos com troca de cobrança mensal ou anual e foco nas diferenças reais.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/plan-comparison
- Descrição original (inglês): Compare meaningful differences between plans and billing periods.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/plan-comparison.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/plan-comparison.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/plan-comparison.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/plan-comparison.json`. Caminho do registro, relativo ao endereço do site: `r/plan-comparison.json`.

- Pacotes npm: `@radix-ui/react-switch`, `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Button](button.md), [Segmented control](segmented-control.md), [Switch](switch.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/plan-comparison/plan-comparison.tsx`
  - `components/ryan-ui/blocks/plan-comparison/plan-comparison.module.css`
  - `components/ryan-ui/switch/switch.tsx`
  - `components/ryan-ui/switch/switch.module.css`
  - `components/ryan-ui/segmented-control/segmented-control.tsx`
  - `components/ryan-ui/segmented-control/segmented-control.module.css`
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-switch lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/plan-comparison.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Seção de preços que compara dois planos linha a linha, com troca entre cobrança mensal e anual e um filtro para mostrar só as diferenças.
- Ponto de partida para editar: planos, preços e recursos são constantes no topo do arquivo, prontos para trocar pelos seus.

## Quando não usar

- Use [`comparison-table`](comparison-table.md) para comparar o seu produto com concorrentes, com cabeçalho fixo e uma coluna em destaque.
- Use [`billing-toggle`](billing-toggle.md) quando só precisa da troca de período com preços que rolam, em cartões de plano.
- Para três ou mais planos o bloco não serve como está: a grade e o tipo `Feature` têm exatamente duas colunas, Team e Studio.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import PlanComparison from "@/components/ryan-ui/blocks/plan-comparison/plan-comparison";

export default function PlanComparisonDemo() {
  return <PlanComparison />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `PlanComparison`

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | No seletor de período, trocam entre mensal e anual e levam o foco junto (`segmented-control`). |
| `Espaço` ou `Enter` | No interruptor “Show differences only”, ligam ou desligam o filtro; num botão de plano, selecionam ou desfazem a seleção. |

## Acessibilidade

- A matriz usa papéis ARIA de tabela (`table`, `row`, `columnheader`, `rowheader`, `cell`), e cada valor traz o nome do plano em texto escondido, então faz sentido lido sozinho.
- Os botões de plano expõem `aria-pressed` e uma região `role="status"` anuncia o plano escolhido; o preço de cada plano fica numa região `aria-live="polite"` com `aria-atomic`.
- O filtro é o `switch` com o rótulo “Show differences only” e o período é o `segmented-control` nomeado “Billing period”.

## Movimento

- Trocar o período faz cada preço contar até o novo valor em 0,24 s, e a contagem “N of 8 features” acompanha o filtro.
- Ligar o filtro fecha a altura das linhas de recursos iguais numa mola sem ultrapassagem e as reabre com esmaecimento; escolher um plano tinge a coluna e um trilho de 2 px desliza até ela.
- Com “reduzir movimento” ligado, os números trocam na hora, as linhas entram e saem sem animação e o trilho salta.

## Comportamento responsivo

- O layout segue a largura do bloco, medida por um `ResizeObserver`: até 720 px a introdução empilha e as margens diminuem; até 540 px o nome do recurso sobe para cima dos dois valores e a coluna “What changes” some.

## Notas para IA

- `PlanComparison` não recebe props: edite `features` (com `shared: true` no que o filtro esconde) e `pricing` no topo do arquivo, e os textos fixos no JSX.
- Os botões “Select …” só marcam o plano com `aria-pressed`, sem callback; ligue o seu checkout trocando o `onClick` deles.
- Os valores “Included” e “Not included” são comparados como texto exato para ganhar o visto e o tom apagado; o bloco depende de `button`, `segmented-control` e `switch`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/plan-comparison · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
