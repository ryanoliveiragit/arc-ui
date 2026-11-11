# Avatar group

> Grupo de avatares sobrepostos que resume uma equipe e mostra quantos membros a mais existem.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/avatar-group
- Descrição original (inglês): Show a team or set of contributors in a small space.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/avatar-group.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/avatar-group.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/avatar-group.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/avatar-group.json`. Caminho do registro, relativo ao endereço do site: `r/avatar-group.json`.

- Pacotes npm: `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Avatar](avatar.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/avatar-group/avatar-group.tsx`
  - `components/ryan-ui/avatar-group/avatar-group.module.css`
  - `components/ryan-ui/avatar/avatar.tsx`
  - `components/ryan-ui/avatar/avatar.module.css`
  - `components/ryan-ui/lib/ryan-provider.tsx`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/avatar-group.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Mostrar quem participa de um projeto, documento ou equipe em pouco espaço: cabeçalho, cartão ou célula de tabela.
- Listas que mudam ao vivo: quem entra ou sai abre ou fecha o próprio espaço e o resto da pilha desliza.
- Grupos maiores que o espaço: `max` limita os avatares visíveis e o restante vira um contador `+N`.

## Quando não usar

- Use [`avatar`](avatar.md) para uma pessoa só.
- Quando cada pessoa precisa ser clicável ou a lista completa tem de estar à vista, use uma lista com nomes: aqui nada recebe foco e quem passa de `max` não é mostrado.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { AvatarGroup } from "@/components/ryan-ui/avatar-group/avatar-group";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack } from "./_kit";
import { people } from "@/components/ryan-ui/lib/media";

export default function AvatarGroupDemo() {
  const [count, setCount] = useState(6);
  const members = people.slice(0, count).map((p, i) => ({ name: p.name, src: p.src, status: i % 3 === 0 ? ("online" as const) : undefined }));
  return (
    <Stack gap={6} align="center">
      <AvatarGroup members={members} max={4} size="lg" label="Design team" />
      <Row>
        <Button size="sm" variant="secondary" onClick={() => setCount(c => Math.min(people.length, c + 1))}>Add a member</Button>
        <Button size="sm" variant="ghost" onClick={() => setCount(c => Math.max(1, c - 1))}>Remove one</Button>
      </Row>
      <AvatarGroup members={people.slice(0, 3).map(p => ({ name: p.name, src: p.src }))} size="sm" />
      <Caption>{count} people on the project.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `AvatarGroup`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `members` (obrigatória) | `AvatarGroupMember[]` | — | — |
| `max` | `number` | `4` | — |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | — |
| `label` | `string` | `"Team members"` | — |

### Tipos exportados

#### `AvatarGroupMember`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` (obrigatória) | `string` | — |
| `src` | `string` | — |
| `status` | `"online" \| "offline"` | — |

## Acessibilidade

- O contêiner é um `role="group"` nomeado por `label` (o padrão é inglês, “Team members”); cada avatar anuncia o nome, e o contador anuncia “N more” seguido do rótulo.
- O balão com o nome é só visual: aparece ao passar o mouse e fica em `aria-hidden`; em toque ele não aparece, e os nomes além de `max` não ficam em lugar nenhum.

## Movimento

- Um membro novo abre o próprio espaço em largura com mola sem ultrapassagem e os demais deslizam; quem sai fecha o espaço do mesmo jeito.
- O contador `+N` rola no sentido da mudança: o número novo sobe quando há mais gente e desce quando há menos.
- Com “reduzir movimento”, entradas, saídas e contador trocam na hora e o balão do nome aparece sem subir.

## Notas para IA

- `members` é uma lista `{ name, src?, status? }` e o `name` serve de `key`: dois membros com o mesmo nome geram aviso do React e quebram a animação.
- Para ver entrada e saída animadas, altere a lista `members` com o componente montado; `max` (padrão 4) decide quantos aparecem antes do `+N`.
- Depende de `avatar` e só aceita `size` `sm`, `md` ou `lg`; passe `label` em português, porque o padrão é inglês.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/avatar-group · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
