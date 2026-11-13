# Avatar

> Foto ou iniciais de uma pessoa, em vários tamanhos e com indicador de presença.

- Tipo: componente (categoria Dados)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/avatar
- Descrição original (inglês): A compact identity marker for people and accounts.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/avatar.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/avatar.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/avatar.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/avatar.json`. Caminho do registro, relativo ao endereço do site: `r/avatar.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/avatar/avatar.tsx`
  - `components/ryan-ui/avatar/avatar.module.css`
  - `components/ryan-ui/lib/ryan-provider.tsx`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/avatar.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Identificar uma pessoa ou conta ao lado do nome, num comentário, numa linha de lista ou no cabeçalho.
- Mostrar presença com `status` (`online` ou `offline`), num ponto no canto do avatar.
- Listas em que nem todos têm foto: sem `src`, ou se a imagem falhar, entram as iniciais de `name`.

## Quando não usar

- Use [`avatar-group`](avatar-group.md) para várias pessoas empilhadas num espaço pequeno.
- Use [`user-menu`](user-menu.md) quando o avatar abre o menu da conta.
- Para logotipos e imagens que não representam alguém, use uma imagem comum: o recorte é sempre circular e a alternativa à foto são as iniciais de um nome.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { Avatar } from "@/components/ryan-ui/avatar/avatar";
import { Caption, Row, Stack } from "./_kit";
import { avatar } from "@/components/ryan-ui/lib/media";

const people = [
  { id: "emma-collins" as const, name: "Emma Collins", size: "sm" as const, label: "Small" },
  { id: "marcus-johnson" as const, name: "Marcus Johnson", size: "md" as const, label: "Medium" },
  { id: "ava-mitchell" as const, name: "Ava Mitchell", size: "lg" as const, label: "Large" },
];

export default function AvatarDemo() {
  return (
    <Row justify="space-evenly" width={405}>
      {people.map((p) => (
        <Stack key={p.id} gap={1} align="center">
          <span style={{ display: "inline-block", marginBottom: 8 }}>
            <Avatar name={p.name} src={avatar(p.id)} size={p.size} />
          </span>
          <strong style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</strong>
          <Caption>{p.label}</Caption>
        </Stack>
      ))}
    </Row>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Avatar`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `name` (obrigatória) | `string` | — | — |
| `src` | `string` | — | — |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | — |
| `status` | `"online" \| "offline"` | — | — |
| `...props` | `HTMLAttributes<HTMLSpanElement>` | — | Também aceita as props deste tipo. |

## Acessibilidade

- O `span` recebe `role="img"` e `aria-label` com `name` e, se houver, o status; a foto tem `alt` vazio e as iniciais ficam em `aria-hidden`.
- `role` e `aria-label` passados por props são sobrescritos; quando o nome já aparece em texto ao lado, passe `aria-hidden` para o leitor de tela não repetir.
- O status entra no rótulo em inglês (“online”, “offline”) e, na tela, é só um ponto colorido.

## Movimento

- Uma foto ainda carregando surge de um desfoque leve; uma já em cache aparece na hora, e as iniciais de reserva entram com um esmaecer.
- O ponto de status aparece e troca com uma pequena escala em mola; com “reduzir movimento”, foto, iniciais e ponto mudam sem transição.

## Comportamento responsivo

- Os tamanhos são fixos em pixels (`sm` 28, `md` 36, `lg` 48, `xl` 88) e o avatar não encolhe dentro de uma linha flex.

## Desempenho

- A foto sai pelo componente de imagem do `RyanProvider`: por padrão um `<img>` com `loading="lazy"`; com `next/image` ela recebe `fill` e o `sizes` do tamanho escolhido.

## Notas para IA

- `name` é obrigatório mesmo com foto: dele saem o rótulo acessível e as iniciais (primeira letra das duas primeiras palavras).
- Não é interativo nem recebe foco: para um avatar clicável, envolva-o num `button` ou link com nome próprio, ou use `user-menu`.
- O export é nomeado, sem default: `import { Avatar } from "@/components/ryan-ui/avatar/avatar"`; props extras vão para o `span` raiz.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/avatar · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
