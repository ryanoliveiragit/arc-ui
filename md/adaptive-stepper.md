# Adaptive stepper

> Contador que não muda de tamanho: os dígitos rolam até o novo valor e o botão de menos ou de mais se recolhe no limite.

- Tipo: componente (categoria Entradas), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/adaptive-stepper
- Descrição original (inglês): A numeric stepper with a fixed footprint: digits roll between values, and the minus or plus button folds away at the minimum or maximum.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/adaptive-stepper.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/adaptive-stepper.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/adaptive-stepper.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/adaptive-stepper.json`. Caminho do registro, relativo ao endereço do site: `r/adaptive-stepper.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/adaptive-stepper/adaptive-stepper.tsx`
  - `components/ryan-ui/adaptive-stepper/adaptive-stepper.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/adaptive-stepper.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Quantidades pequenas com limites conhecidos, ajustadas um passo por vez: hóspedes, noites, itens do carrinho.
- Linhas de formulário ou de lista em que o controle não pode mudar de largura: o espaço dos dois botões e do maior valor fica reservado mesmo quando um botão some.
- Quando o limite precisa ficar evidente: em `min` ou `max` o botão correspondente some, em vez de só ficar esmaecido.

## Quando não usar

- Use [`number-field`](number-field.md) quando a pessoa precisa digitar o valor: aqui o número não é editável, só os botões e as setas o mudam.
- Use [`slider`](slider.md) para faixas largas ou contínuas, em que chegar ao valor passo a passo levaria toques demais.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { AdaptiveStepper } from "@/components/ryan-ui/adaptive-stepper/adaptive-stepper";
import { Caption, Stack, Surface } from "./_kit";
import styles from "./adaptive-stepper.module.css";

const NIGHTLY = 184;

export default function AdaptiveStepperDemo() {
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(3);
  const [pets, setPets] = useState(0);

  return (
    <Surface width={380} padding={6}>
      <Stack gap={4}>
        <div className={styles.row}>
          <div><p className={styles.name}>Guests</p><p className={styles.hint}>Sleeps up to 6</p></div>
          <AdaptiveStepper label="Guests" value={guests} onValueChange={setGuests} min={1} max={6} formatValueText={value => `${value} guests`} />
        </div>
        <div className={styles.row}>
          <div><p className={styles.name}>Nights</p><p className={styles.hint}>Hold a button to run</p></div>
          <AdaptiveStepper label="Nights" value={nights} onValueChange={setNights} min={1} max={28} formatValueText={value => `${value} nights`} />
        </div>
        <div className={styles.row}>
          <div><p className={styles.name}>Pets</p><p className={styles.hint}>Two at most</p></div>
          <AdaptiveStepper label="Pets" value={pets} onValueChange={setPets} min={0} max={2} size="sm" />
        </div>
        <div className={styles.total}>
          <span>Total for {nights} {nights === 1 ? "night" : "nights"}</span>
          <strong>${(NIGHTLY * nights + pets * 25).toLocaleString("en-US")}</strong>
        </div>
        <Caption>At a limit the button folds away and the number slides over. The control keeps its size.</Caption>
      </Stack>
    </Surface>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `AdaptiveStepper`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` | `number` | — | The current value (controlled). |
| `defaultValue` | `number` | — | The starting value (uncontrolled). Defaults to `min`. |
| `onValueChange` | `(value: number) => void` | — | Runs with the new value after every step. |
| `min` | `number` | `0` | Lowest value. The minus button folds away here. |
| `max` | `number` | `10` | Highest value. The plus button folds away here. |
| `step` | `number` | `1` | Amount added or removed per press. |
| `largeStep` | `number` | — | Amount for Page Up and Page Down. Defaults to five steps. |
| `label` (obrigatória) | `string` | — | Accessible name, for example "Quantity". |
| `formatValueText` | `(value: number) => string` | — | Spoken form of the value, for example `value => value + " guests"`. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height: 36, 44 or 50 px. |
| `name` | `string` | — | Field name: adds a hidden input so the value submits with a form. |
| `disabled` | `boolean` | `false` | Turns the control off: it is dimmed and ignores pointer and keyboard input. |
| `className` | `string` | — | Extra class names for the root element. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `→` | Soma um `step`. |
| `↓` ou `←` | Subtrai um `step`. |
| `Page Up` ou `Page Down` | Soma ou subtrai `largeStep` (por padrão, cinco passos). |
| `Home` ou `End` | Vai para `min` ou para `max`. |
| `Tab` | Leva o foco ao número; os botões de menos e de mais ficam fora da ordem de tabulação. |

## Acessibilidade

- O número é um `role="spinbutton"` com `aria-valuenow`, `aria-valuemin` e `aria-valuemax`; `label` é obrigatório e vira o nome acessível.
- Passe `formatValueText` para o leitor de tela anunciar o valor com unidade (“3 noites”) em vez do número puro.
- Pressionar um botão leva o foco ao número, então o foco não se perde quando o botão some no limite; os botões têm `aria-label` em inglês (`Increase …`, `Decrease …`), montado a partir de `label`.

## Movimento

- Cada dígito rola para cima quando o valor sobe e para baixo quando desce, com uma mola sem ultrapassagem e um leve desfoque.
- Em `min` ou `max` o botão correspondente dobra contra a borda e some, e o número desliza meio botão para o lado que ficou vazio.
- Com “reduzir movimento” ligado, dígitos e botões só esmaecem e o número muda de lugar na hora.

## Comportamento responsivo

- A largura é fixa (dois botões mais os dígitos do maior entre `min` e `max`) e a altura segue `size`: 36, 44 ou 50 px.

## Notas para IA

- Funciona controlado (`value` + `onValueChange`) ou não controlado (`defaultValue`, que cai em `min`); os padrões são `min={0}`, `max={10}` e `step={1}`.
- `label` é obrigatório e não aparece na tela: ponha o texto visível ao lado, e passe `name` se o valor deve seguir no envio de um formulário (vira um campo oculto).
- Segurar um botão já repete o passo (espera 380 ms, depois um a cada 75 ms) e as casas decimais seguem as de `step` e `min`: não reimplemente isso por fora.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/adaptive-stepper · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
