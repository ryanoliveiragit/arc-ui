# Pagination

> Navegação entre páginas de uma coleção longa, com limites claros e reticências quando necessário.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/pagination
- Descrição original (inglês): Move through a long collection with clear bounds.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/pagination.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/pagination.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/pagination.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/pagination.json`. Caminho do registro, relativo ao endereço do site: `r/pagination.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/pagination/pagination.tsx`
  - `components/ryan-ui/pagination/pagination.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/pagination.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Tabelas e listas com número de páginas conhecido, como pedidos ou resultados de busca.
- Quando a pessoa avança página a página ou salta entre páginas vizinhas: a janela mostra cinco números em torno da atual.

## Quando não usar

- Use [`infinite-masonry`](infinite-masonry.md) para feeds que carregam mais itens conforme a rolagem chega ao fim.
- Use [`stepper`](stepper.md) para os passos de um fluxo; paginação é para páginas de uma mesma coleção.
- Evite quando o total de páginas é desconhecido (APIs por cursor): o componente exige `pageCount` e não tem modo só de anterior e próximo.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Pagination } from "@/components/ryan-ui/pagination/pagination";
import { Caption, Stack, Surface } from "./_kit";

const orders = Array.from({ length: 240 }, (_, i) => i + 1);
const perPage = 10;

export default function PaginationDemo() {
  const [page, setPage] = useState(1);
  const [short, setShort] = useState(2);
  const count = orders.length / perPage;
  const first = (page - 1) * perPage + 1;
  return (
    <Stack width={560} gap={6} align="center">
      <Stack gap={3} align="center">
        <Pagination page={page} pageCount={count} onPageChange={setPage} />
        <Caption>Showing orders {first} to {first + perPage - 1} of {orders.length}</Caption>
      </Stack>
      <Surface padding={3}>
        <Pagination page={short} pageCount={5} onPageChange={setShort} label="Search results pages" />
      </Surface>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Pagination`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `page` (obrigatória) | `number` | — | — |
| `pageCount` (obrigatória) | `number` | — | — |
| `onPageChange` (obrigatória) | `(page: number) => void` | — | — |
| `label` | `string` | `"Pagination"` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` ou `Shift + Tab` | Percorrem o botão anterior, os números de página e o botão próximo. |
| `Enter` ou `Espaço` | Acionam o botão em foco e chamam `onPageChange`. |

## Acessibilidade

- É um `<nav>` nomeado por `label` (padrão “Pagination”): dê um nome diferente a cada paginação quando houver mais de uma na página.
- A página atual recebe `aria-current="page"`, cada número tem `aria-label` “Page N” e as setas ficam `disabled` na primeira e na última página; esses rótulos estão fixos em inglês.
- Os itens são botões, não links: a troca de URL ou de dados fica por conta do seu `onPageChange`.

## Movimento

- Uma única marca desliza numa mola até o número da página atual.
- Quando a janela de cinco números se desloca, eles andam juntos como uma esteira, cada um o mesmo número de casas, enquanto os que entram e saem esmaecem.
- Com “reduzir movimento”, a marca salta e os números trocam sem deslizar.

## Comportamento responsivo

- São no máximo sete botões de 2.25rem (duas setas e cinco números), cerca de 276 px no total; se faltar largura, a navegação quebra linha.

## Notas para IA

- É controlado: guarde `page` (começa em 1) no estado e atualize em `onPageChange`; não há modo livre nem `className`.
- Calcule `pageCount` com `Math.ceil(total / porPagina)`: o componente arredonda frações para baixo, e a última página parcial ficaria inacessível.
- Importe com chaves, de `@/components/ryan-ui/pagination/pagination` (não há export default); não há reticências nem atalho para a primeira e a última página, então mostre o total por perto.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/pagination · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
