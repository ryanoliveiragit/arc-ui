# Phone input

> Campo de telefone com seletor de país, formatação enquanto você digita e saída no padrão E.164.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/phone-input
- Descrição original (inglês): A phone field with a country picker, formatting as you type, and E.164 output.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/phone-input.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/phone-input.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/phone-input.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/phone-input.json`. Caminho do registro, relativo ao endereço do site: `r/phone-input.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/phone-input/phone-input.tsx`
  - `components/ryan-ui/phone-input/phone-input.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/phone-input.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Cadastro, checkout ou verificação por SMS que precisa do telefone em E.164 (`+5511961234567`).
- Públicos de vários países: a pessoa escolhe o país na lista ou cola um número com `+` e o país se ajusta sozinho.
- Formulários em que formatar enquanto se digita evita erro, com a máscara do país e uma sombra do formato que falta.

## Quando não usar

- Use [`input`](input.md) com `type="tel"` quando o público é de um país só e o E.164 não importa.
- Para países fora da tabela embutida (49) ou para saber se o número existe, use uma biblioteca de telefonia, porque aqui só a quantidade de dígitos é conferida.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import PhoneInput from "@/components/ryan-ui/phone-input/phone-input";
import { Caption, Stack } from "./_kit";

export default function PhoneInputDemo() {
  const [value, setValue] = useState("");
  return (
    <Stack width={360} gap={3}>
      <PhoneInput label="Mobile number" description="We only text delivery updates." value={value} onValueChange={setValue} defaultCountry="US" />
      <Caption>E.164 value: {value || "empty"}. Try pasting +44 7911 123456 or typing “+” to search calling codes.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `PhoneInput`

A phone number field with a country picker. The country button grows into a searchable list, the number formats as it is typed with a faint guide showing the rest of the expected shape, pasted or autofilled international numbers pick their own country, and the value comes out in E.164. Typing "+" in the number jumps into the picker with a calling code search.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `hideLabel` | `boolean` | `false` | — |
| `value` | `string` | — | The number in E.164, such as "+14155550132". An empty string clears the field. |
| `defaultValue` | `string` | — | — |
| `onValueChange` | `(value: string, details: PhoneInputDetails) => void` | — | Fires on every edit with the E.164 number (empty when there are no digits) and its parsed details. |
| `country` | `string` | — | ISO code of the selected country. |
| `defaultCountry` | `string` | `"US"` | ISO code used until someone picks a country or enters an international number. |
| `onCountryChange` | `(iso: string) => void` | — | — |
| `countries` | `string[]` | — | Limit the picker to these ISO codes. |
| `preferredCountries` | `string[]` | `["US", "CA", "GB"]` | Pinned at the top of the picker under "Suggested". |
| `description` | `string` | — | — |
| `error` | `string` | — | Replaces the built-in validation message. |
| `validate` | `boolean` | `true` | Show a message after blur when the number is incomplete. On by default. |
| `disabled` | `boolean` | `false` | — |
| `required` | `boolean` | — | — |
| `name` | `string` | — | Adds a hidden input carrying the E.164 value for native form submission. |
| `id` | `string` | — | — |
| `className` | `string` | — | — |
| `onBlur` | `(event: ReactFocusEvent<HTMLInputElement>) => void` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `PhoneStatus` | `"empty" \| "incomplete" \| "valid" \| "too-long"` |

#### `PhoneCountry`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `iso` (obrigatória) | `string` | ISO 3166-1 alpha-2 code, such as "US". |
| `name` (obrigatória) | `string` | — |
| `dial` (obrigatória) | `string` | Country calling code without the plus, such as "44". |
| `patterns` (obrigatória) | `string[]` | National formats from shortest to longest. `#` is a digit, anything else is a separator. |
| `trunk` (obrigatória) | `string` | A national number people may type before the number itself, such as "0" in "07911 123456". |
| `example` (obrigatória) | `string` | A realistic national number, used for the placeholder and the typing guide. |
| `areaCodes` | `string[]` | Area codes that pick this country when several share a calling code, such as Canada inside +1. |

#### `PhoneInputDetails`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `country` (obrigatória) | `PhoneCountry` | — |
| `formatted` (obrigatória) | `string` | The number as shown in the field, without the calling code. |
| `status` (obrigatória) | `"empty" \| "incomplete" \| "valid" \| "too-long"` | — |
| `valid` (obrigatória) | `boolean` | — |

### Outras exportações

- `PHONE_COUNTRIES` (valor)
- `flagOf` (função)
- `formatNational` (função)
- `parsePhoneNumber` (função)
- `formatPhoneNumber` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `+` | No campo do número, abre a lista de países já buscando por código de discagem. |
| `↓` ou `↑` | No botão do país, abrem a lista; dentro dela, movem o destaque enquanto o foco continua na busca. |
| `Page Up` ou `Page Down` | Pulam oito países por vez na lista. |
| `Home` ou `End` | Vão ao primeiro ou ao último país, quando a busca está vazia. |
| `Enter` | Escolhe o país em destaque e devolve o foco ao número, com o cursor no fim. |
| `Esc` | Fecha a lista sem trocar o país e devolve o foco ao botão do país. |

## Acessibilidade

- O botão do país diz país e código (“Country, Brazil +55”), e a busca é um `combobox` com `aria-activedescendant`, então o foco fica no campo de busca enquanto o destaque anda pela lista.
- Uma região `role="status"` anuncia a troca de país ao colar, o número de resultados da busca e “Valid … number” quando o número fecha, e a mensagem de erro tem `role="alert"`.
- Com `hideLabel`, o rótulo some da tela mas continua como nome do campo para leitores de tela.

## Movimento

- O botão do país e a lista são uma superfície só: largura, altura e cantos crescem numa mola sem ultrapassagem ao abrir e encolhem ao fechar.
- Ao trocar de país, bandeira e código rolam na direção da lista (um país mais abaixo entra por baixo), e o destaque desliza entre as linhas com mola própria.
- Com “reduzir movimento” ligado, a superfície troca de tamanho na hora e bandeira, mensagens e o sinal de válido só esmaecem.

## Comportamento responsivo

- A lista abre com a largura do campo, até 340px, e rola por dentro com no máximo 280px de altura, sem arrastar a página.
- O número usa `type="tel"`, `inputMode="tel"` e `autoComplete="tel"`, então o celular mostra o teclado de telefone e o preenchimento automático funciona.

## Desempenho

- A tabela de países vem dentro do componente, sem baixar metadados nem depender de biblioteca, e cada campo mantém um `ResizeObserver` para medir a superfície.

## Notas para IA

- O valor entra e sai em E.164; `onValueChange(valor, details)` traz também país, texto formatado, `status` e `valid`, e com `name` um campo oculto envia o E.164 no formulário.
- O país padrão é `US`: no Brasil passe `defaultCountry="BR"`; `countries` limita a lista e `preferredCountries` fixa países no topo, em “Suggested”.
- Nomes de países, busca e mensagens são em inglês e não há prop de tradução; `error` substitui a mensagem de validação, que aparece depois de sair do campo.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/phone-input · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
