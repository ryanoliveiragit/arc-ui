# Wallet card

> Cartão de pagamento que inclina em 3D e vira para mostrar o verso, com saldo que pode ser ocultado e últimas transações.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/wallet-card
- Descrição original (inglês): A payment card that leans toward the pointer in 3D and flips on a spring to show its back, with a balance that masks digit by digit and a short transaction list.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/wallet-card.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/wallet-card.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/wallet-card.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/wallet-card.json`. Caminho do registro, relativo ao endereço do site: `r/wallet-card.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/wallet-card/wallet-card.tsx`
  - `components/ryan-ui/blocks/wallet-card/wallet-card.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/wallet-card.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Painel ou landing de produto financeiro que mostra o cartão com saldo e as últimas transações, com um botão para esconder os valores.
- Quando o verso do cartão (assinatura e código de segurança) faz parte da história e deve abrir com um giro.

## Quando não usar

- Use [`tilt-card`](tilt-card.md) quando só quer a inclinação 3D para outro conteúdo, sem verso, máscara ou transações.
- Use [`metric-card`](metric-card.md) para mostrar um saldo com contexto num painel, sem o desenho do cartão.
- Use [`sortable-data-table`](sortable-data-table.md) para históricos longos: a lista daqui é curta, sem paginação, filtro ou ordenação.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import WalletCardPreview from "@/components/ryan-ui/blocks/wallet-card/wallet-card";
import type { DemoStage } from "./_kit";

// Card, actions and four transactions are taller than the default block stage.
export const stage: DemoStage = { height: 760 };

export default function WalletCardDemo() {
  return <WalletCardPreview />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `WalletCard`

A payment card with its account around it. The card leans toward the pointer in 3D under a moving glare and flips on a spring to show its back; the balance, the security code and the transaction amounts mask digit by digit. Touch and reduced motion get a still card that still flips and masks.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `holder` | `string` | `"Maya Okafor"` | Name printed on the card. |
| `issuer` | `string` | `"Northwind"` | Bank or product name printed on the card. |
| `last4` | `string` | `"4821"` | Last four digits of the card number. |
| `expiry` | `string` | `"08/29"` | Expiry date as printed, such as "08/29". |
| `cvv` | `string` | `"317"` | Security code on the back. It follows the balance mask. |
| `balance` | `number` | `12480.55` | Available balance. |
| `currency` | `string` | `"USD"` | ISO 4217 currency code used to format amounts. |
| `transactions` | `WalletTransaction[]` | `defaultTransactions` | Recent transactions, newest first. Pass an empty list to hide the section. |
| `masked` | `boolean` | — | Whether amounts are hidden (controlled). |
| `defaultMasked` | `boolean` | `false` | Whether amounts start hidden (uncontrolled). |
| `onMaskedChange` | `(masked: boolean) => void` | — | Called when the mask is toggled. |
| `flipped` | `boolean` | — | Whether the back of the card is showing (controlled). |
| `defaultFlipped` | `boolean` | `false` | Whether the card starts on its back (uncontrolled). |
| `onFlippedChange` | `(flipped: boolean) => void` | — | Called when the card is flipped. |
| `className` | `string` | — | Extra class for the root. |

### `WalletCardPreview`

Ready preview with sample account data.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

#### `WalletTransaction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable key. |
| `merchant` (obrigatória) | `string` | Who was paid, or who paid. |
| `detail` (obrigatória) | `string` | Second line: category, date or both. |
| `amount` (obrigatória) | `number` | Signed amount: negative for money out, positive for money in. |
| `icon` | `ReactNode` | Icon in the row's badge. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Nos botões “Show back” e “Hide amounts”, viram o cartão ou mascaram os valores; o cartão em si não recebe foco. |

## Acessibilidade

- A face que não está à mostra fica com `aria-hidden` e `inert`; o número é lido como “Card ending in” mais os quatro dígitos, e os valores mascarados como “Balance hidden”, em texto escondido.
- Os dois controles são botões com `aria-pressed`; o clique no cartão é só um atalho de ponteiro numa `div` sem papel, então os botões são o caminho acessível.
- Rótulos e textos escondidos estão fixos em inglês (“Show amounts”, “Recent activity”, “Card ending in”).

## Movimento

- Com mouse, o cartão inclina até 11° na direção do ponteiro em 3D numa mola, sob um brilho que acompanha o ponteiro, e volta reto ao sair.
- O giro de 180° usa uma mola com pequeno quique; ao mascarar, cada dígito vira ponto um após o outro (16 ms de intervalo) e as transações sobem em sequência ao montar.
- O toque não inclina o cartão; com “reduzir movimento” ligado também não há inclinação, o giro é imediato, os dígitos trocam sem deslize e as transações aparecem de uma vez.

## Comportamento responsivo

- A raiz é um contêiner de até 23rem; o cartão mantém a proporção de cartão de pagamento (1,586) e o saldo escala com a largura, de 1,5rem a 2rem (`8.6cqi`).

## Notas para IA

- Importe o componente nomeado `WalletCard`; o export padrão é o preview com dados de exemplo (titular, saldo e quatro transações).
- Controle `masked` com `onMaskedChange` e `flipped` com `onFlippedChange` para guardar a escolha; `transactions={[]}` esconde a lista e cada `amount` é um número com sinal, negativo para saída.
- Os valores são formatados sempre em `en-US` com a moeda de `currency`; o cartão só usa `last4`, e o `cvv` é impresso no verso protegido só pela máscara do saldo, então evite passar o código real.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/wallet-card · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
