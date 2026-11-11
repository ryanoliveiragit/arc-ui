# Page header

> Cabeçalho de projeto que encolhe numa barra compacta ao rolar, com abas de contagem animada.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/page-header
- Descrição original (inglês): A project page header that folds into a compact bar as you scroll, with tabs whose counts roll.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/page-header.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/page-header.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/page-header.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/page-header.json`. Caminho do registro, relativo ao endereço do site: `r/page-header.json`.

- Pacotes npm: `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`, `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Animated counter](animated-counter.md), [Avatar](avatar.md), [Avatar group](avatar-group.md), [Badge](badge.md), [Button](button.md), [Progress](progress.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/page-header/page-header.tsx`
  - `components/ryan-ui/lib/use-copy-feedback.ts`
  - `components/ryan-ui/blocks/page-header/page-header.module.css`
  - `components/ryan-ui/progress/progress.tsx`
  - `components/ryan-ui/progress/progress.module.css`
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`
  - `components/ryan-ui/badge/badge.tsx`
  - `components/ryan-ui/badge/badge.module.css`
  - `components/ryan-ui/avatar-group/avatar-group.tsx`
  - `components/ryan-ui/avatar-group/avatar-group.module.css`
  - `components/ryan-ui/avatar/avatar.tsx`
  - `components/ryan-ui/avatar/avatar.module.css`
  - `components/ryan-ui/lib/ryan-provider.tsx`
  - `components/ryan-ui/animated-counter/animated-counter.tsx`
  - `components/ryan-ui/animated-counter/animated-counter.module.css`
  - `components/ryan-ui/lib/media.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-dropdown-menu @radix-ui/react-tabs lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/page-header.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Ponto de partida para o cabeçalho da página de um projeto num app: trilha, título com status, membros, ações e abas de seção com contagens.
- Telas longas em que o título deve sair do caminho ao rolar sem sumir: o cabeçalho dobra numa barra compacta que leva de volta ao topo.

## Quando não usar

- Use [`site-header`](site-header.md) para a navegação do topo de um site; este bloco é o cabeçalho de uma página dentro do produto.
- Use [`tabs`](tabs.md) ou [`breadcrumb`](breadcrumb.md) quando precisa só da troca de seções ou só da trilha, sem o conjunto inteiro.
- Se a página rola a janela, a dobra não acontece: ela lê a rolagem do corpo interno do bloco, que tem altura fixa de 640 px.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import PageHeader from "@/components/ryan-ui/blocks/page-header/page-header";

export default function PageHeaderDemo() {
  return <PageHeader />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `PageHeader`

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `←` ou `→` | Na fileira de seções, levam o foco à aba vizinha e já a selecionam, dando a volta nas pontas (abas Radix). |
| `Home` ou `End` | Selecionam a primeira ou a última seção. |
| `Tab` | Da aba ativa, segue para o painel da seção, que é focável. |
| `Enter` ou `Espaço` ou `↓` | No botão de três pontos, abrem o menu de ações (Radix). |
| `↑` ou `↓` | No menu de ações, movem entre os itens e dão a volta nas pontas. |
| `Esc` | Fecha o menu e devolve o foco ao botão de três pontos. |

## Acessibilidade

- A trilha fica num `<nav aria-label="Breadcrumb">` com `aria-current="page"`; ao dobrar ela vira `inert` e um botão com o título assume, rolando ao topo e levando o foco ao `<h2>`.
- Os resultados das ações (seguir, compartilhar, criar ou concluir issue, copiar o link) são anunciados por uma região `role="status"`, e o aviso visual fica com `aria-hidden`.
- Ao concluir uma issue, o foco passa ao botão da issue seguinte ou ao painel quando a lista esvazia; abaixo de 460 px “New issue” vira só ícone e mantém o `aria-label`.

## Movimento

- Rolar o corpo além de 16 px dobra o cabeçalho: a introdução fecha a altura numa mola sem ultrapassagem, o título encolhe e desfoca e a trilha dá lugar ao título compacto, que só reabre a 4 px do topo.
- O sublinhado da aba ativa desliza entre as abas, as contagens rolam, o painel entra deslizando 12 px no sentido da aba escolhida e as linhas de issue abrem e fecham a própria altura.
- Com “reduzir movimento” ligado, dobra, painéis e linhas trocam na hora ou só esmaecem, o sublinhado salta e as transições CSS são removidas.

## Comportamento responsivo

- Quando a barra fica estreita, “Follow” e “Share update” recolhem para o menu de três pontos (largura numa mola) e só voltam com uma folga, sem piscar no limite.
- Container queries do quadro: até 559 px some o primeiro nível da trilha, a fileira de abas rola de lado com a borda esmaecida e as linhas se reorganizam; em telas de até 560 px o quadro ganha quase toda a altura.

## Desempenho

- Um `ResizeObserver` só na barra decide quando recolher as ações, e os temporizadores das ações simuladas e do aviso de 3,2 s são limpos ao desmontar.

## Notas para IA

- `PageHeader` não recebe props: projeto, trilha, pessoas, issues, atualizações e arquivos são constantes do arquivo e as ações são simuladas, então copie o arquivo instalado e troque dados e handlers pelos seus.
- A dobra depende do corpo interno com rolagem própria (`.scroller`) dentro de um quadro de altura fixa; com altura `auto` o corpo não rola e o cabeçalho nunca dobra.
- Precisa de `animated-counter`, `avatar`, `avatar-group`, `badge`, `button` e `progress`, além das abas e do menu Radix; as fotos de exemplo vêm de `@/lib/media`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/page-header · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
