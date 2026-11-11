# Contact section

> Seção de contato com formulário, canais e escritórios, em três layouts à escolha.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/contact-section
- Descrição original (inglês): A validated contact form that morphs into a confirmation, support channels, and office cards with local times.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/contact-section.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/contact-section.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/contact-section.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/contact-section.json`. Caminho do registro, relativo ao endereço do site: `r/contact-section.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Avatar](avatar.md), [Button](button.md), [Copy button](copy-button.md), [Input](input.md), [Segmented control](segmented-control.md), [Textarea](textarea.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/contact-section/contact-section.tsx`
  - `components/ryan-ui/blocks/contact-section/contact-section.module.css`
  - `components/ryan-ui/lib/media.ts`
  - `components/ryan-ui/textarea/textarea.tsx`
  - `components/ryan-ui/textarea/textarea.module.css`
  - `components/ryan-ui/segmented-control/segmented-control.tsx`
  - `components/ryan-ui/segmented-control/segmented-control.module.css`
  - `components/ryan-ui/input/input.tsx`
  - `components/ryan-ui/input/input.module.css`
  - `components/ryan-ui/copy-button/copy-button.tsx`
  - `components/ryan-ui/copy-button/copy-button.module.css`
  - `components/ryan-ui/lib/use-copy-feedback.ts`
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`
  - `components/ryan-ui/avatar/avatar.tsx`
  - `components/ryan-ui/avatar/avatar.module.css`
  - `components/ryan-ui/lib/ryan-provider.tsx`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/contact-section.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Página ou seção de contato com formulário validado (nome, e-mail, assunto e mensagem) que vira uma confirmação no mesmo cartão, na variante `form`.
- Central de suporte com vários canais (chat, e-mail, vendas, comunidade), cada um com seu painel de detalhe, na variante `channels`.
- Empresas com escritórios em fusos diferentes: a variante `offices` mostra a hora local de cada um e se está aberto agora.

## Quando não usar

- Use [`feedback-widget`](feedback-widget.md) para colher uma opinião rápida sem a pessoa sair da página.
- Use [`signup-form`](signup-form.md) para criar conta, com força de senha e estado de conclusão próprios.
- Evite quando o formulário precisa de outros campos: nome, e-mail, assunto e mensagem são fixos no código, e só a lista de assuntos vem por prop.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import ContactSection from "@/components/ryan-ui/blocks/contact-section/contact-section";

export default function ContactSectionDemo() {
  return <ContactSection />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ContactSection`

A contact section in three layouts: a validated form whose card springs into a confirmation, a list of support channels whose detail panel morphs to each channel, and office cards with live local times and open status.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `"form" \| "channels" \| "offices"` | `"form"` | `form` validates and morphs into a confirmation, `channels` lists ways to reach you, `offices` shows live local times. |
| `title` | `string` | — | — |
| `description` | `string` | — | — |
| `topics` | `string[]` | `["Sales", "Support", "Partnerships", "Press"]` | Topics offered in the form. |
| `onSubmit` | `(message: ContactMessage) => void \| Promise<void>` | — | Called with a valid message. Reject to keep the form and show an error; resolve to show the confirmation. |
| `channels` | `ContactChannel[]` | `contactExampleChannels` | — |
| `channel` | `string` | — | Selected channel (controlled). |
| `defaultChannel` | `string` | — | — |
| `onChannelChange` | `(value: string) => void` | — | — |
| `offices` | `ContactOffice[]` | `contactExampleOffices` | — |
| `className` | `string` | — | — |

### `ContactSectionBlock`

Preview: the contact section with a switch between its three layouts. Messages are simulated and never sent.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ContactSectionVariant` | `"form" \| "channels" \| "offices"` |

#### `ContactMessage`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` (obrigatória) | `string` | — |
| `email` (obrigatória) | `string` | — |
| `topic` (obrigatória) | `string` | — |
| `message` (obrigatória) | `string` | — |

#### `ContactChannel`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `value` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `meta` (obrigatória) | `string` | One line under the label in the list, such as a response time. |
| `icon` | `ReactNode` | — |
| `detail` (obrigatória) | `ReactNode` | The detail shown when the channel is selected. |

#### `ContactOffice`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `city` (obrigatória) | `string` | — |
| `timeZone` (obrigatória) | `string` | IANA time zone, used for the live local time and open status. |
| `address` (obrigatória) | `string[]` | — |
| `email` | `string` | — |
| `hours` | `[number, number]` | Opening hours in local 24 hour time. Defaults to 9 to 18. |

### Outras exportações

- `contactExampleChannels` (valor)
- `contactExampleOffices` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` ou `←` ou `→` | No grupo de assuntos, marcam o assunto anterior ou o próximo, dando a volta nas pontas. |
| `↑` ou `↓` ou `←` ou `→` | Na lista de canais (variante `channels`), selecionam o canal anterior ou o próximo e trocam o painel, dando a volta. |
| `Home` ou `End` | Na lista de canais, selecionam o primeiro ou o último canal. |
| `Enter` | Num campo de linha única, envia o formulário; com erro, o foco vai para o primeiro campo inválido. |

## Acessibilidade

- Os campos vêm de `input` e `textarea`, com rótulo visível, `aria-invalid` e erro ligado ao campo em `role="alert"`; uma falha de envio também aparece em `role="alert"`.
- Os assuntos são um `radiogroup` com foco itinerante e os canais, um `tablist` vertical ligado ao `tabpanel`; durante a troca, a face que sai fica `inert`.
- Na confirmação, o foco vai para o título “Thanks, …”, e “Send another message” limpa o formulário e devolve o foco ao campo Name; os textos fixos estão em inglês.

## Movimento

- O cartão muda de altura numa mola ao virar confirmação, enquanto as faces trocam deslizando um pouco e saindo de um leve desfoque; o visto da confirmação se desenha.
- Nos assuntos e nos canais, um realce desliza até a opção escolhida, e o painel do canal ajusta a altura enquanto o conteúdo novo entra no sentido da navegação.
- Com “reduzir movimento” ligado, as faces só esmaecem, a altura troca na hora, os realces não deslizam e o visto já aparece desenhado.

## Comportamento responsivo

- Container query: abaixo de 820px o formulário desce para baixo do texto e os canais viram uma fileira que rola na horizontal, sem a linha de detalhe; abaixo de 520px os campos empilham.
- Os cartões de escritório se organizam em colunas automáticas de no mínimo 240px (`auto-fit`).

## Desempenho

- A variante `offices` atualiza a hora local a cada 15 segundos; antes de montar no navegador mostra “--:--”, então a primeira renderização bate com a do servidor.

## Notas para IA

- Importe `ContactSection` pelo nome (a exportação padrão é a prévia com seletor de variantes); `avatar`, `button`, `copy-button`, `input`, `segmented-control` e `textarea` são instalados junto.
- `onSubmit` recebe `{ name, email, topic, message }`: devolva uma promessa e rejeite para manter o formulário com a mensagem de falha; sem ele, o envio é só simulado (1,1 s) e nada sai da página.
- O e-mail “hello@example.com” e os prazos de resposta da variante `form` estão escritos no código; canais e escritórios de exemplo trocam por `channels` e `offices`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/contact-section · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
