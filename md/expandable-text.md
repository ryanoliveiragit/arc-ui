# Expandable text

> Texto longo recolhido em poucas linhas, com ler mais e mostrar menos.

- Tipo: componente (categoria Revelação)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/expandable-text
- Descrição original (inglês): Long text clamped to a few lines with a soft fade that glides open with Read more and closes with Show less, shown only when the text overflows.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-text.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-text.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-text.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/expandable-text.json`. Caminho do registro, relativo ao endereço do site: `r/expandable-text.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/expandable-text/expandable-text.tsx`
  - `components/ryan-ui/expandable-text/expandable-text.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/expandable-text.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Descrições de produto, biografias ou avaliações longas numa lista, cortadas em poucas linhas com `lines`.
- Textos de tamanho variável em que o botão só deve aparecer quando o texto realmente passa do corte.
- Parágrafos com links no meio: o texto inteiro continua no DOM, e um link escondido abaixo do corte abre o texto quando recebe foco.

## Quando não usar

- Use [`collapsible`](collapsible.md) quando a parte escondida é um bloco separado, como uma lista ou um formulário, e não a continuação do texto.
- Use [`accordion`](accordion.md) para várias seções com títulos próprios.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import ExpandableText from "@/components/ryan-ui/expandable-text/expandable-text";
import { Stack } from "./_kit";

export default function ExpandableTextDemo() {
  return (
    <Stack width={460}>
      <ExpandableText lines={3}>
        Harbor Coffee Roasters began in a converted boathouse in 2014 with a single two-kilo roaster and a simple idea: buy directly from farms we can visit, pay well above market, and roast in small batches so every bag arrives fresh. Today we work with eleven cooperatives across Colombia, Ethiopia and Guatemala, and we still roast every order by hand within 48 hours of shipping. Our subscriptions let you pick a cadence, pause whenever you like, and swap beans before each shipment.
      </ExpandableText>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ExpandableText`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` (obrigatória) | `ReactNode` | — | The text. Plain strings, paragraphs, and inline links all work; the whole text stays available to screen readers while clamped. |
| `lines` | `number` | `3` | How many lines show while collapsed. |
| `expanded` | `boolean` | — | Controlled open state. |
| `defaultExpanded` | `boolean` | `false` | — |
| `onExpandedChange` | `(expanded: boolean) => void` | — | — |
| `moreLabel` | `string` | `"Read more"` | Toggle label while collapsed. |
| `lessLabel` | `string` | `"Show less"` | Toggle label while open. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | — | Também aceita as props deste tipo, menos `children`. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No botão, abre ou fecha o texto. |
| `Tab` | Ao levar o foco a um link escondido abaixo do corte, o texto se abre sozinho. |

## Acessibilidade

- O botão tem `aria-expanded` e `aria-controls`; os dois rótulos dividem o mesmo espaço e o inativo fica oculto, então o nome lido é sempre o atual.
- O texto cortado continua inteiro no DOM, disponível para o leitor de tela; o corte é só visual.

## Movimento

- A altura desliza com uma desaceleração suave, de 500 a 600 ms ao abrir e de 400 a 450 ms ao fechar, conforme a distância; o esmaecimento da última linha some junto e a seta gira no mesmo passo.
- Ao fechar com o início do texto fora da tela, a página rola de volta até ele.
- Com “reduzir movimento” ligado, o texto abre e fecha na hora, os rótulos trocam sem transição e a rolagem de volta é instantânea.

## Comportamento responsivo

- Em repouso, o corte é CSS em `lh`, e um observador refaz a medida quando a largura ou a fonte mudam: o botão aparece ou some conforme o texto passa ou não do corte.

## Desempenho

- Cada instância usa um `ResizeObserver` para saber se o texto transborda; numa lista longa, é um observador por item.

## Notas para IA

- Traduza os rótulos com `moreLabel` e `lessLabel`; o padrão é “Read more” e “Show less”.
- Não desenhe um “ler mais” próprio: o botão já aparece só quando o texto passa de `lines` linhas (padrão 3).
- Para controlar, passe `expanded` com `onExpandedChange`. Importe de `@/components/ryan-ui/expandable-text/expandable-text`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/expandable-text · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
