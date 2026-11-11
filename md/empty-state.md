# Empty state

> Estado vazio com título, explicação e uma ação para ajudar a pessoa a começar.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/empty-state
- Descrição original (inglês): A useful next step when there is nothing to show yet.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/empty-state.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/empty-state.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/empty-state.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/empty-state.json`. Caminho do registro, relativo ao endereço do site: `r/empty-state.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/empty-state/empty-state.tsx`
  - `components/ryan-ui/empty-state/empty-state.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/empty-state.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Lista, tabela ou busca sem nada para mostrar, com uma explicação curta e o próximo passo (criar, importar, limpar filtros).
- Primeiro uso de uma área do produto, quando ainda não existe nenhum item.
- Quando o resultado de uma ação troca a mensagem no mesmo lugar: mudar `title`, `description` ou `icon` transforma o conteúdo sem remontar o bloco.

## Quando não usar

- Use [`empty-states`](empty-states.md) quando quiser a versão com ilustração, em que as formas se transformam de uma cena para outra.
- Use [`skeleton`](skeleton.md) enquanto o conteúdo ainda está carregando; estado vazio é para quando a resposta chegou e não há itens.
- Use [`alert`](alert.md) para erros e avisos de que a pessoa precisa se recuperar.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { FolderOpen, Plus } from "lucide-react";
import { EmptyState } from "@/components/ryan-ui/empty-state/empty-state";
import { Button } from "@/components/ryan-ui/button/button";
import { Stack } from "./_kit";

export default function EmptyStateDemo() {
  const [count, setCount] = useState(0);
  return (
    <Stack width={460}>
      {count === 0 ? (
        <EmptyState
          icon={<FolderOpen size={24} aria-hidden="true" />}
          title="No projects yet"
          description="Projects keep your files, tasks and teammates in one place. Create your first to get started."
          action={<Button onClick={() => setCount(1)}><Plus size={16} aria-hidden="true" />New project</Button>}
        />
      ) : (
        <EmptyState
          title={`${count} project created`}
          description="Nice start. Invite a teammate or add your first task."
          action={<Button variant="secondary" onClick={() => setCount(0)}>Clear projects</Button>}
        />
      )}
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `EmptyState`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` (obrigatória) | `string` | — | — |
| `description` (obrigatória) | `string` | — | — |
| `action` | `ReactNode` | — | — |
| `icon` | `ReactNode` | — | — |
| `className` | `string` | — | — |
| `label` | `string` | — | Optional accessible label for the state region. |

## Acessibilidade

- A raiz é uma `<section>`; passe `label` para ela virar uma região nomeada, útil quando a página tem mais de um estado vazio.
- O título é sempre um `<h3>`: confira se esse nível cabe na hierarquia de títulos da página.
- O ícone fica em `aria-hidden` e, durante uma troca, a cópia que sai também, para o leitor de tela não ler o texto antigo junto com o novo.

## Movimento

- Na primeira aparição só a caixa do ícone entra, com um esmaecer e um leve aumento de escala.
- Quando `title`, `description` ou o ícone mudam, o texto novo sobe saindo de um leve desfoque enquanto o antigo sai, o ícone faz uma troca cruzada e a altura do bloco segue uma mola.
- Com “reduzir movimento”, as trocas viram um esmaecer rápido e a altura muda na hora.

## Comportamento responsivo

- Ocupa 100% da largura do pai, com respiro vertical entre `--space-8` e `--space-12` conforme a largura da tela; a descrição fica limitada a 18rem e quebra em linhas equilibradas.
- As ações quebram linha e continuam centralizadas quando não cabem lado a lado.

## Notas para IA

- `title` e `description` são strings obrigatórias (servem de chave da animação); `action` aceita qualquer nó, em geral um `button`, e `icon` substitui a pasta padrão.
- Para ter a transição entre estados, mantenha o mesmo `<EmptyState>` montado e troque as props; mudar a `key` remonta o componente e perde o efeito.
- O ícone só faz a troca cruzada quando o componente do ícone muda (de `Folder` para `Check`, por exemplo); use ícones de 24 px, como o padrão.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/empty-state · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
