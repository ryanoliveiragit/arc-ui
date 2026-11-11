# Drawer

> Painel lateral temporário para tarefas focadas.

- Tipo: componente (categoria Revelação)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/drawer
- Descrição original (inglês): A temporary side surface for focused work.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/drawer.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/drawer.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/drawer.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/drawer.json`. Caminho do registro, relativo ao endereço do site: `r/drawer.json`.

- Pacotes npm: `@radix-ui/react-dialog`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/drawer/drawer.tsx`
  - `components/ryan-ui/drawer/drawer.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-dialog lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/drawer.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Editar um registro ou perfil sem perder a lista de vista, com o formulário num painel lateral.
- Filtros de uma lista abertos pela esquerda (`side="left"`) e aplicados ao fechar.
- Detalhes de uma linha selecionada que continuam na tela enquanto o painel sai, com `useDrawerItem`.

## Quando não usar

- Use [`dialog`](dialog.md) para uma decisão curta que precisa de toda a atenção.
- Use [`bottom-sheet`](bottom-sheet.md) no celular quando o painel deve repousar em alturas diferentes e seguir o dedo.
- Use [`resizable-panels`](resizable-panels.md) quando o painel lateral é parte permanente do layout.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import Drawer, { DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ryan-ui/drawer/drawer";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Field, Row, Stack } from "./_kit";

const input: React.CSSProperties = { height: 36, padding: "0 var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-control)", background: "var(--surface)", color: "var(--text-primary)", font: "inherit", width: "100%" };

export default function DrawerDemo() {
  return (
    <Stack align="center" gap={4}>
      <Row justify="center">
        <Drawer>
          <DrawerTrigger asChild><Button variant="secondary">Edit profile</Button></DrawerTrigger>
          <DrawerContent title="Edit profile" description="Update how you appear to your team.">
            <Stack gap={4}>
              <Field label="Display name"><input style={input} defaultValue="Emma Collins" /></Field>
              <Field label="Role"><input style={input} defaultValue="Product designer" /></Field>
              <Row justify="flex-end"><DrawerClose asChild><Button variant="ghost">Cancel</Button></DrawerClose><DrawerClose asChild><Button>Save</Button></DrawerClose></Row>
            </Stack>
          </DrawerContent>
        </Drawer>
        <Drawer>
          <DrawerTrigger asChild><Button variant="ghost">Filters (left)</Button></DrawerTrigger>
          <DrawerContent side="left" title="Filters" description="Narrow the list of invoices.">
            <Stack gap={3}><Caption>Status: Paid, Pending, Overdue</Caption><DrawerClose asChild><Button>Apply filters</Button></DrawerClose></Stack>
          </DrawerContent>
        </Drawer>
      </Row>
      <Caption>Opens as a side surface; Escape or the close button dismisses it.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Drawer`

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### `DrawerContent`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` (obrigatória) | `string` | — | — |
| `description` | `string` | — | — |
| `children` (obrigatória) | `ReactNode` | — | — |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | — |
| `container` | `HTMLElement \| null` | — | Renders the drawer inside this element instead of the page body, anchored to its edges. The element needs position: relative and overflow: hidden. |
| `...props` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Content>` | — | Também aceita as props deste tipo. |

### Outras exportações

- `useDrawerItem` (hook)
- `DrawerTrigger` (valor)
- `DrawerClose` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` ou `Shift + Tab` | Percorrem os controles do painel sem sair dele; ao abrir, o foco vai ao primeiro controle, o botão de fechar. |
| `Esc` | Fecha o painel e devolve o foco ao `DrawerTrigger`. |

## Acessibilidade

- É um diálogo modal do Radix: `title` dá o nome, `description` a descrição, o foco fica preso no painel e o resto da página sai da árvore de acessibilidade.
- O botão de fechar se chama “Close drawer”, fixo em inglês no código.

## Movimento

- O painel entra pela borda de `side` numa mola sem ultrapassagem e sai mais rápido, esmaecendo só no último trecho para a sombra não sumir de repente.
- O cabeçalho é a alça: arrastar para a borda move o painel, o outro lado resiste como elástico, e passar de um terço do painel ou dar um gesto rápido fecha mantendo a velocidade.
- Com “reduzir movimento” ligado, não há arraste e o painel só esmaece ao entrar e sair.

## Comportamento responsivo

- Nas laterais o painel tem até 30rem e, abaixo de 40rem, ocupa quase toda a largura, com cantos e espaçamentos menores; em cima ou embaixo ocupa a largura toda, com até 32rem de altura.
- Com `container`, o painel abre dentro de um elemento, ancorado às bordas dele; esse elemento precisa de `position: relative` e `overflow: hidden`.

## Notas para IA

- Monte `Drawer`, `DrawerTrigger asChild` e `DrawerContent` com `title` e `side`; ações que fecham vão em `DrawerClose asChild`. Importe de `@/components/ryan-ui/drawer/drawer`.
- Ao abrir a partir de uma linha selecionada, passe o item por `useDrawerItem(item)` e renderize o resultado, para o conteúdo não sumir enquanto o painel sai.
- O arraste para fechar só existe com a raiz `Drawer` deste arquivo; sob um `Root` do Radix puro, o painel anima por keyframes de CSS e não arrasta.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/drawer · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
