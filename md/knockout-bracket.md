# Knockout bracket

> Chave de mata-mata em colunas: escolha o vencedor e ele avança pela linha de conexão até a próxima fase.

- Tipo: bloco, novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/knockout-bracket
- Descrição original (inglês): Single-elimination bracket with rounds in columns and measured connector lines; picking a winner draws its line and slides the team into the next round.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/knockout-bracket.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/knockout-bracket.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/knockout-bracket.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/knockout-bracket.json`. Caminho do registro, relativo ao endereço do site: `r/knockout-bracket.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/knockout-bracket/knockout-bracket.tsx`
  - `components/ryan-ui/blocks/knockout-bracket/knockout-bracket.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/knockout-bracket.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Chaves de mata-mata de torneios, campeonatos internos ou bolões, em que a pessoa escolhe o vencedor de cada partida até chegar ao campeão.
- Simuladores de “quem passa” com 4, 8 ou 16 participantes, com preenchimento automático pelo melhor cabeça de chave e botão para recomeçar.

## Quando não usar

- Use [`sortable-data-table`](sortable-data-table.md) para uma classificação com pontos e saldo, como a de pontos corridos ou de fase de grupos.
- Evite para dupla eliminação ou chaves com número de participantes fora de potência de dois: o bloco só monta eliminação simples e não trata folgas.
- Evite com 32 ou mais participantes: as rodadas dividem a largura, sem rolagem horizontal, e a primeira coluna fica muito alta.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI.

```tsx
import KnockoutBracket from "@/components/ryan-ui/blocks/knockout-bracket/knockout-bracket";

export default function KnockoutBracketDemo() {
  return <KnockoutBracket defaultValue={{ "0-0": "harbor", "0-1": "lakeside" }} />;
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `KnockoutBracket`

Single-elimination bracket: pick a winner and it travels along its connector into the next round.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `teams` | `BracketTeam[]` | `sampleTeams` | Teams in bracket order: the first two meet in the first match, and so on. The count must be a power of two. Defaults to eight sample clubs. |
| `value` | `Record<string, string>` | — | Picked winners. Pass it with `onValueChange` to control the bracket. |
| `defaultValue` | `Record<string, string>` | `{}` | Starting picks when uncontrolled. |
| `onValueChange` | `(picks: BracketPicks) => void` | — | Called with all picks after one changes. Picks that no longer follow from earlier rounds are already removed. |
| `title` | `string` | `"Harbor Cup playoffs"` | Heading above the bracket. |
| `className` | `string` | — | Extra class for the section. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `BracketPicks`: Winner of each decided match: match id (`round-index`, both from zero) to team id. | `Record<string, string>` |

#### `BracketTeam`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Unique id, used in the picks. |
| `name` (obrigatória) | `string` | Full team name. |
| `code` (obrigatória) | `string` | Three-letter code, shown instead of the name when the bracket is narrow. |
| `seed` (obrigatória) | `number` | Seed number shown before the name. Auto-fill favours the lower seed. |

### Outras exportações

- `sampleTeams` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Num time, marcam-no como vencedor da partida ou desmarcam, se já for; nos botões, preenchem tudo (“Auto-fill”) ou recomeçam (“Reset”). |

## Acessibilidade

- Cada rodada é um `group` com o nome da fase, e cada time é um botão com `aria-pressed` e nome completo, como “Harbor City, seed 1. Pick to win quarterfinal 1”.
- O campeão é anunciado numa região `role="status"`; as linhas de ligação são `aria-hidden`, e os textos fixos estão em inglês.

## Movimento

- Escolher um vencedor desenha a linha dele até a próxima rodada, desliza o destaque entre as duas vagas da partida e faz o time entrar na vaga seguinte vindo da esquerda, de um leve desfoque.
- “Auto-fill” decide uma partida por vez, a cada 0,32 s, para que cada avanço seja visto; o campeão aparece com uma mola de leve quique.
- Com “reduzir movimento” ligado, linhas e destaques mudam na hora, os times só esmaecem e o preenchimento automático não espera entre as partidas.

## Comportamento responsivo

- As linhas são medidas das caixas reais e refeitas por `ResizeObserver` quando a chave muda de tamanho; abaixo de 44rem de contêiner, os nomes viram códigos de três letras e as fases ganham nomes curtos.

## Notas para IA

- Importe `KnockoutBracket` e passe `teams` na ordem da chave (os dois primeiros se enfrentam na primeira partida); a quantidade precisa ser potência de dois.
- As escolhas são `{ "rodada-partida": idDoTime }`, ambos a partir de zero (`"0-0"` é a primeira partida); use `value` com `onValueChange`, que já recebe as escolhas sem as que perderam o sentido.
- `seed` decide o “Auto-fill” (vence o menor número) e `code` aparece no lugar do nome quando a chave fica estreita.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/knockout-bracket · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
