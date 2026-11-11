# Money input

> Campo de valor monetário com agrupamento ao vivo, largura estável e dígitos que rolam.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/money-input
- Descrição original (inglês): A currency field with live grouping, stable width, rolling digits, and minor-unit output.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/money-input.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/money-input.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/money-input.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/money-input.json`. Caminho do registro, relativo ao endereço do site: `r/money-input.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/money-input/money-input.tsx`
  - `components/ryan-ui/money-input/money-input.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/money-input.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Valores de pagamento, fatura, transferência ou orçamento que seguem para o servidor como inteiro em centavos, sem arredondamento de ponto flutuante.
- Formulários com mais de uma moeda: o menu troca a moeda mantendo o número digitado, e símbolo e casas decimais acompanham; no iene, que não tem centavos, a fração cai.
- Recargas, gorjetas e doações em que valores redondos resolvem: os chips de `quickAdd` somam +10, +50 e +100 e as setas avançam uma unidade por vez.

## Quando não usar

- Use [`number-field`](number-field.md) para valores que podem ser negativos, como um ajuste de saldo, com `min` negativo e `prefix`: este campo só aceita dígitos e o separador decimal.
- Use [`range-histogram-slider`](range-histogram-slider.md) para escolher uma faixa de preço num filtro.
- Quando o valor precisa de mais casas que a moeda, como uma cotação de câmbio: as casas decimais seguem a moeda (duas no real, nenhuma no iene) e a digitação além delas é recusada.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import MoneyInput from "@/components/ryan-ui/money-input/money-input";
import { Caption, Stack } from "./_kit";

export default function MoneyInputDemo() {
  const [cents, setCents] = useState<number | null>(12500);
  return (
    <Stack gap={3} width={380}>
      <MoneyInput label="Invoice amount" description="Use the arrow keys or the quick add chips." value={cents} onValueChange={(v) => setCents(v)} max={100_000_000} />
      <Caption>Stored value: {cents === null ? "empty" : `${cents} minor units`}.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `MoneyInput`

A currency amount field. Digits group as they are typed without moving the caret, the missing cents wait as faint ghosts so the amount never changes width when it settles, long amounts scale down to fit instead of scrolling, and quick add chips and arrow keys roll the digits. The value comes out in minor units, so $12.50 is 1250.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `hideLabel` | `boolean` | `false` | — |
| `value` | `number \| null` | — | Amount in minor units (cents for USD, yen for JPY). `null` is empty. |
| `defaultValue` | `number \| null` | `null` | — |
| `onValueChange` | `(value: number \| null, details: MoneyInputDetails) => void` | — | — |
| `currency` | `string` | — | ISO 4217 code, such as "USD". |
| `defaultCurrency` | `string` | `"USD"` | — |
| `onCurrencyChange` | `(currency: string) => void` | — | — |
| `currencies` | `string[]` | `["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "C…` | Codes offered by the currency menu. Pass one code to hide the menu. |
| `min` | `number` | — | Lowest amount in minor units. Checked when the field loses focus. |
| `max` | `number` | — | Highest amount in minor units. Typing past it is refused with a nudge. |
| `quickAdd` | `number[]` | `[10, 50, 100]` | Quick add chips in major units. Pass an empty array to hide them. |
| `step` | `number` | — | Arrow keys move by this many minor units. Defaults to one major unit; Shift moves ten times as far. |
| `locale` | `string` | `"en-US"` | Formatting locale. Fixed by default so server and client render the same digits. |
| `description` | `string` | — | — |
| `error` | `string` | — | Replaces the built-in range message. |
| `disabled` | `boolean` | `false` | — |
| `name` | `string` | — | Adds a hidden input carrying the amount in minor units. |
| `id` | `string` | — | — |
| `className` | `string` | — | — |
| `onBlur` | `(event: ReactFocusEvent<HTMLInputElement>) => void` | — | — |

### Tipos exportados

#### `MoneyInputDetails`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `currency` (obrigatória) | `string` | — |
| `major` (obrigatória) | `number \| null` | The amount in major units, such as 12.5 for $12.50. |
| `formatted` (obrigatória) | `string` | The amount as a full currency string, such as "$12.50". |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | No campo, somam ou subtraem `step` (por padrão, uma unidade da moeda); com `Shift`, dez vezes isso. |
| `Page Up` ou `Page Down` | Somam ou subtraem dez vezes o `step`. |
| `Enter` | No campo, completa as casas decimais que faltam, como `12` virando `12.00`. |
| `Backspace` ou `Delete` | Sobre um separador de milhar, apagam o dígito vizinho em vez de parar no separador. |
| `↓` ou `↑` ou `Home` ou `End` | No botão da moeda, `↓` e `↑` abrem o menu; nele, movem o destaque, parando nas pontas, e letras buscam pelo código ou pelo nome da moeda. |
| `Enter` ou `Espaço` | No menu, escolhem a moeda em destaque; `Esc` fecha e devolve o foco ao botão, e `Tab` fecha seguindo adiante. |

## Acessibilidade

- O campo é um `<input>` de texto com `role="spinbutton"`, `aria-valuenow` em unidades inteiras e `aria-valuetext` com o valor formatado; `label` é obrigatório e `hideLabel` o deixa só para leitor de tela.
- Faixa permitida, `description` e erro entram em `aria-describedby` e o erro sai num `role="alert"`; uma região `role="status"` anuncia o novo valor após um chip ou uma seta e o limite que recusou a mudança.
- O menu de moedas é um `role="listbox"` com `aria-activedescendant`; os nomes das moedas seguem `locale`, mas `Quick add`, `Add …`, `Currency`, `Maximum is …` e a faixa são fixos em inglês.

## Movimento

- Os dígitos rolam no sentido da mudança quando o valor vem de um chip, de uma seta ou de fora; durante a digitação a troca é imediata, para não atrasar o cursor.
- Os centavos que faltam ficam apagados no lugar, então a largura não muda ao completar o valor; um valor longo encolhe para caber em vez de rolar, e o símbolo rola ao trocar a moeda.
- No limite, o valor dá um tranco lateral e volta com uma mola enquanto a faixa pisca em tom de aviso; com “reduzir movimento” ligado, não há tranco nem rolagem e os dígitos só esmaecem.

## Comportamento responsivo

- Ocupa a largura do contêiner com 76 px de altura (`--money-input-height`); até 420 px de tela os dígitos diminuem, e um valor que não cabe encolhe em vez de rolar.
- O menu de moedas abre abaixo do campo, alinhado à direita, com `min(256px, 100vw - 2rem)` e sem portal: evite ancestrais com `overflow: hidden`.

## Notas para IA

- O valor é um inteiro em unidades menores: R$ 12,50 é `1250`, ¥ 1250 é `1250` e `null` é vazio; `min`, `max` e `step` também são em unidades menores, mas `quickAdd` é em unidades inteiras.
- Para fixar a moeda, passe `currency` (ou `defaultCurrency`) e `currencies` só com esse código; com `currencies={["BRL"]}` sozinho, o campo continua no padrão `USD`.
- `max` recusa a digitação na hora, mas `min` só é conferido quando o campo perde o foco; `error` substitui essa mensagem, `locale="pt-BR"` troca os separadores e `name` envia as unidades menores.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/money-input · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
