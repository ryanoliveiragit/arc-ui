# Search field

> Campo de busca reconhecível, com ícone, botão de limpar e foco bem marcado.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/search-field
- Descrição original (inglês): A recognizable search entry point with clear affordances.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/search-field.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/search-field.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/search-field.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/search-field.json`. Caminho do registro, relativo ao endereço do site: `r/search-field.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/search-field/search-field.tsx`
  - `components/ryan-ui/search-field/search-field.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/search-field.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Filtrar uma lista ou tabela que já está na tela, como destinos, pessoas ou arquivos.
- Campo de busca fixo no topo de uma página ou de uma barra lateral, com rótulo visível.

## Quando não usar

- Use [`combobox`](combobox.md) quando a busca termina na escolha de um item da lista.
- Use [`expanding-search`](expanding-search.md) ou [`morphing-search`](morphing-search.md) quando o espaço é curto e a busca começa como um ícone.
- Use [`command-palette`](command-palette.md) para buscar ações e navegar pela aplicação inteira pelo teclado.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { SearchField } from "@/components/ryan-ui/search-field/search-field";
import { Caption, Stack } from "./_kit";

const cities = ["Lisbon", "Porto", "Barcelona", "Berlin", "Amsterdam", "Copenhagen", "Vienna", "Prague", "Kyoto", "Osaka"];

export default function SearchFieldDemo() {
  const [q, setQ] = useState("");
  const hits = cities.filter((c) => c.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Stack width={360} gap={4}>
      <SearchField label="Search destinations" placeholder="Search destinations" value={q} onValueChange={setQ} />
      <Caption>{hits.length ? hits.join(", ") : "No destinations match."}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `SearchField`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | — |
| `value` (obrigatória) | `string` | — | — |
| `onValueChange` (obrigatória) | `(value: string) => void` | — | — |
| `...props` | `InputHTMLAttributes<HTMLInputElement>` | — | Também aceita as props deste tipo, menos `type`. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No botão de limpar, que entra na ordem de tabulação depois do campo quando há texto, apagam a busca e devolvem o foco ao campo. |

## Acessibilidade

- O rótulo é um `<label>` visível ligado ao campo `type="search"`, e a lupa é `aria-hidden`.
- O botão de limpar tem `aria-label="Clear search"`, fixo em inglês, e devolve o foco ao campo porque some debaixo do ponteiro.
- O componente não anuncia resultados: se a lista filtra ao vivo, informe a contagem numa região `aria-live` sua.

## Movimento

- O botão de limpar entra com uma mola curta e um leve desfoque e sai rápido; ele tem um espaço reservado, então o campo nunca muda de largura.
- A lupa passa de apagada para a cor do texto quando o campo recebe foco ou tem texto.
- Com “reduzir movimento” ligado, o botão só esmaece e as transições de cor são desligadas.

## Notas para IA

- É sempre controlado: `value` e `onValueChange(texto)` são obrigatórios; filtre no pai e, se for chamar a rede, use seu próprio debounce.
- Import nomeado, `import { SearchField } from "@/components/ryan-ui/search-field/search-field"`; `label` é obrigatório, e as outras props de `<input>`, como `placeholder`, passam direto.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/search-field · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
