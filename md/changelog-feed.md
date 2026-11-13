# Changelog feed

> Linha do tempo de novidades por mês, com versões, tipos de mudança e navegação lateral.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/changelog-feed
- Descrição original (inglês): Release notes you can filter, open in place, and scroll through month by month.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/changelog-feed.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/changelog-feed.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/changelog-feed.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/changelog-feed.json`. Caminho do registro, relativo ao endereço do site: `r/changelog-feed.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Copy button](copy-button.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/changelog-feed/changelog-feed.tsx`
  - `components/ryan-ui/blocks/changelog-feed/changelog-feed.module.css`
  - `components/ryan-ui/lib/media.ts`
  - `components/ryan-ui/copy-button/copy-button.tsx`
  - `components/ryan-ui/copy-button/copy-button.module.css`
  - `components/ryan-ui/lib/use-copy-feedback.ts`
  - `components/ryan-ui/lib/ryan-provider.tsx`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/changelog-feed.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Página de novidades ou notas de versão de um produto, com cada entrada marcada como New, Improved ou Fixed e detalhes que abrem no lugar.
- Históricos longos agrupados por mês, em que a barra de meses mostra em que mês a rolagem está e salta para outro.
- Notas que pedem uma imagem com legenda ou um trecho de código com botão de copiar, sem sair da lista.

## Quando não usar

- Use [`timeline`](timeline.md) para uma sequência de eventos agrupada por dia, sem filtros por tipo nem versões.
- Use [`blog-grid`](blog-grid.md) quando as novidades são artigos com capa, autor e leitura completa.
- Evite quando os tipos de mudança são outros: New, Improved e Fixed são fixos no código, assim como os textos da interface, em inglês.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import ChangelogFeed from "@/components/ryan-ui/blocks/changelog-feed/changelog-feed";

export default function ChangelogFeedDemo() {
  return <ChangelogFeed />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ChangelogFeed`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `entries` | `ChangelogEntry[]` | `exampleEntries` | Release notes, newest first. Each entry belongs to one of `months` by key. |
| `months` | `ChangelogMonth[]` | `exampleMonths` | Months shown in the month bar, newest first. |
| `title` | `string` | `"Changelog"` | — |
| `subtitle` | `string` | `"Halden 4.12 shipped on September 18, 2026"` | One line under the title, such as the latest release. |
| `endNote` | `string` | `"That is everything since Halden 4.5 in June."` | Closing line at the end of the list. |
| `defaultOpen` | `string[]` | — | Entry ids open on first render. Defaults to the newest entry. |
| `className` | `string` | — | — |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ChangelogKind` | `"new" \| "improved" \| "fixed"` |
| `ChangelogMedia` | `` \| { type: "photo"; src: string; alt: string; caption: string; /** Pixel size, needed when `src` is a URL rather than an imported image. */ width?: number; height?: number } \| { type: "code"; file: string; code: string } `` |

#### `ChangelogEntry`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `month` (obrigatória) | `string` | — |
| `date` (obrigatória) | `string` | — |
| `iso` (obrigatória) | `string` | — |
| `version` (obrigatória) | `string` | — |
| `kind` (obrigatória) | `Kind` | — |
| `title` (obrigatória) | `string` | — |
| `summary` (obrigatória) | `string` | — |
| `details` (obrigatória) | `string[]` | — |
| `media` | `Media` | — |

#### `ChangelogMonth`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` (obrigatória) | `string` | — |
| `label` (obrigatória) | `string` | — |
| `short` (obrigatória) | `string` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Numa nota, abrem ou fecham os detalhes; nos filtros, ligam ou desligam o tipo; num mês da barra, rolam a lista até ele. |
| `↑` ou `↓` ou `Page Up` ou `Page Down` | Com a área das notas em foco (ela entra na ordem do Tab), rolam a lista como qualquer área de rolagem. |
| `Enter` | No campo de e-mail de “Subscribe”, envia; um endereço inválido faz o campo tremer, mostra o erro e mantém o foco nele. |
| `Esc` | No campo de e-mail, volta ao botão “Subscribe” e devolve o foco a ele. |

## Acessibilidade

- Cada nota é um botão com `aria-expanded` e `aria-controls`, os filtros usam `aria-pressed` e uma região `role="status"` oculta anuncia quantas notas ficaram visíveis depois de filtrar.
- O e-mail tem rótulo oculto, `aria-invalid` no erro e mensagem num `role="status"`; ao confirmar, o foco vai para “Undo”, cujo nome inclui o endereço inscrito.
- O mês atual e as contagens animadas são `aria-hidden`; para o leitor de tela, cada mês é uma `section` com título próprio e a barra de meses é um `nav` com botões “Jump to …”.

## Movimento

- Os detalhes abrem com a altura numa mola e o conteúdo sobe de um leve desfoque; ao filtrar, as notas restantes deslizam para o novo lugar enquanto as que saem esmaecem.
- Os números rolam para cima quando crescem e para baixo quando diminuem, o nome do mês entra no sentido da rolagem e a pílula da barra de meses desliza até o mês atual.
- Com “reduzir movimento” ligado, as transições CSS vão a zero, molas e tremor do erro são desligados, as trocas viram corte ou esmaecer curto e o salto até um mês deixa de ser suave.

## Comportamento responsivo

- A lista rola dentro de uma altura fixa de 560px (520px em telas de até 640px); abaixo de 640px o cabeçalho empilha e data e versão vão para cima do título de cada nota.
- Usa media queries da janela, não do contêiner: abaixo de 480px somem o ano, a contagem do mês e o total de notas visíveis.

## Desempenho

- A rolagem é lida no máximo uma vez por quadro (`requestAnimationFrame`) e um `ResizeObserver` refaz a conta quando a lista muda de altura; fotos e código só entram no DOM quando a nota abre.
- Todas as notas ficam no DOM, cada uma com animação de layout; para centenas de versões, corte ou pagine a lista antes de passar `entries`.

## Notas para IA

- Cada entrada precisa de `month` igual a uma `key` de `months` (os dois do mais novo para o mais antigo): entradas sem mês correspondente não aparecem.
- O “Subscribe” só valida o e-mail e mostra a confirmação, sem prop de envio; para inscrever de verdade, edite `SubscribeControl` no arquivo instalado.
- Depende de `copy-button` (instalado junto) para copiar os trechos de código; `defaultOpen` recebe ids e, sem ele, a primeira entrada já começa aberta.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/changelog-feed · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
