# Token swap

> Cartão de troca de tokens com dois campos que trocam de lugar ao inverter, taxa e custos ao vivo e confirmação animada (dados fictícios).

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/token-swap
- Descrição original (inglês): Play-money swap card: two amount fields with token pickers that trade places when flipped, live rate and fee rows, and a pending then confirmed state.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/token-swap.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/token-swap.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/token-swap.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/token-swap.json`. Caminho do registro, relativo ao endereço do site: `r/token-swap.json`.

- Pacotes npm: `motion`, `lucide-react`, `@radix-ui/react-dropdown-menu`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/token-swap/token-swap.tsx`
  - `components/ryan-ui/blocks/token-swap/token-swap.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react @radix-ui/react-dropdown-menu`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/token-swap.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Troca de tokens com dinheiro fictício em demos, tutoriais ou jogos: dois campos com seletor de token, botão de inverter, taxa e tarifas.
- Cartão de conversão autônomo em que o valor recebido é calculado na hora a partir dos preços em dólar que você fornece.

## Quando não usar

- Use [`money-input`](money-input.md) para um campo de valor numa moeda dentro de um formulário comum.
- Use [`prediction-market`](prediction-market.md) para comprar resultados de sim ou não.
- Para ativos reais não serve como está: não há carteira nem cotação, tarifa de rede e slippage são constantes e uma troca rejeitada volta ao início sem mensagem.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import TokenSwapPreview from "@/components/ryan-ui/blocks/token-swap/token-swap";

export default function TokenSwapDemo() {
  return <TokenSwapPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `TokenSwap`

Swap card with play money: two amount fields with token pickers, a flip button that makes the two fields trade places, live rate and fee rows, and a pending then confirmed state.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `tokens` | `SwapToken[]` | `sampleTokens` | Tokens offered in both pickers. Defaults to five made-up tokens. |
| `defaultPay` | `string` | — | Symbol of the token paid at the start. |
| `defaultReceive` | `string` | — | Symbol of the token received at the start. |
| `amount` | `string` | — | Amount to pay, as typed. Pass it with `onAmountChange` to control the field. |
| `defaultAmount` | `string` | `"1.5"` | Starting amount when uncontrolled. |
| `onAmountChange` | `(amount: string) => void` | — | Called with the cleaned text of the pay field whenever it changes. |
| `feeRate` | `number` | `0.003` | Share of the paid amount kept as a fee. Defaults to 0.3%. |
| `onSwap` | `(quote: SwapQuote) => void \| Promise<void>` | — | Runs when the person confirms. The card shows its pending state until the returned promise settles; without it, a short delay stands in. |
| `className` | `string` | — | Extra class for the card. |

### `TokenSwapPreview`

Ready preview: the swap card centered on a quiet stage.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

#### `SwapToken`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `symbol` (obrigatória) | `string` | Ticker, such as "ORB". Also the token's id. |
| `name` (obrigatória) | `string` | Full name, shown in the token menu. |
| `price` (obrigatória) | `number` | Price in US dollars. Rates between tokens derive from it. |
| `balance` (obrigatória) | `number` | Balance of the pretend wallet. |
| `tone` | `"teal" \| "sky" \| "orchid" \| "violet" \| "rose" \| "amber" \| "green"` | Categorical tone of the token mark. |

#### `SwapQuote`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `pay` (obrigatória) | `string` | Symbol of the token paid. |
| `receive` (obrigatória) | `string` | Symbol of the token received. |
| `amount` (obrigatória) | `number` | Amount paid, in the pay token. |
| `received` (obrigatória) | `number` | Amount received after the fee, in the receive token. |

### Outras exportações

- `sampleTokens` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` | No campo do valor, confirma a troca quando o valor é maior que zero e cabe no saldo. |
| `Enter` ou `Espaço` ou `↓` | No seletor de token, abrem o menu de tokens (Radix). |
| `↑` ou `↓` | No menu, movem entre os tokens; `Enter` ou `Espaço` escolhe, e escolher o token do outro lado inverte o par. |
| `Esc` | Fecha o menu e devolve o foco ao seletor. |

## Acessibilidade

- Cada campo tem rótulo visível e `aria-describedby` para a linha do valor em dólar, que vira o aviso de saldo insuficiente junto com `aria-invalid`; o campo de recebimento é só leitura e sai da ordem de Tab.
- Os seletores são menus Radix com itens de rádio, cada gatilho diz no `aria-label` o lado e o token, e o botão de inverter diz no `aria-label` como o par vai ficar.
- Ao confirmar, o formulário fica `inert` e o recibo é `role="status"`, mas o foco não é levado ao recibo nem reposto em “New swap”; mova-o você se precisar.

## Movimento

- Ao inverter, os dois campos trocam de lugar numa mola com leve quique, o que sobe cresce um pouco enquanto o outro afunda e a seta gira 180°.
- A linha da taxa e o rótulo do botão trocam deslizando na vertical; ao confirmar, o recibo cobre o formulário numa mola, o círculo surge e o visto se desenha.
- Com “reduzir movimento” ligado, os campos trocam na hora, a seta não gira, os rótulos só esmaecem, o menu abre sem animação e o indicador de espera gira mais devagar.

## Notas para IA

- Importe o componente nomeado `TokenSwap`; o export padrão é o preview, e `sampleTokens` são tokens e preços inventados, sem relação com ativos reais.
- `onSwap(quote)` recebe `pay`, `receive`, `amount` e `received`: devolva uma Promise para segurar o estado pendente; os saldos só mudam no estado local após o sucesso e o `balance` de cada token é só o inicial.
- A taxa vem dos `price` em dólar (preço de quem paga dividido pelo de quem recebe) e a tarifa de `feeRate` (padrão 0,3%); controle o valor com `amount` e `onAmountChange` ou use `defaultAmount`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/token-swap · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
