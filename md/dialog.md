# Dialog

> Uma janela focada para decisões que pedem atenção.

- Tipo: componente (categoria Revelação)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/dialog
- Descrição original (inglês): A focused surface for decisions that need attention.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dialog.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dialog.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dialog.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/dialog.json`. Caminho do registro, relativo ao endereço do site: `r/dialog.json`.

- Pacotes npm: `@radix-ui/react-dialog`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/dialog/dialog.tsx`
  - `components/ryan-ui/dialog/dialog.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-dialog lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/dialog.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Confirmar uma ação destrutiva, como excluir um projeto, explicando as consequências em `description`.
- Um formulário curto que precisa ser concluído ou cancelado antes de voltar à página.
- Decisões que não podem passar despercebidas: o fundo escurece com desfoque e a página por trás fica inacessível até o diálogo fechar.

## Quando não usar

- Use [`drawer`](drawer.md) para tarefas mais longas em que a pessoa ainda quer ver a página ao lado.
- Use [`popover`](popover.md) para informação de contexto que não precisa bloquear a página.
- Use [`confirm-morph`](confirm-morph.md) ou [`hold-to-confirm`](hold-to-confirm.md) para confirmar uma ação destrutiva no próprio botão, sem abrir janela.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ryan-ui/dialog/dialog";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack } from "./_kit";

export default function DialogDemo() {
  const [status, setStatus] = useState("Project “Atlas” is active.");
  const [open, setOpen] = useState(false);
  return (
    <Stack align="center" gap={4}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button variant="danger">Delete project</Button></DialogTrigger>
        <DialogContent title="Delete Atlas?" description="This removes 42 files and 3 members' access. It cannot be undone.">
          <Row justify="flex-end">
            <DialogClose asChild><Button variant="ghost">Keep project</Button></DialogClose>
            <Button variant="danger" onClick={() => { setStatus("Project “Atlas” was deleted."); setOpen(false); }}>Delete</Button>
          </Row>
        </DialogContent>
      </Dialog>
      <Caption>{status}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Dialog`

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### `DialogContent`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` (obrigatória) | `string` | — | — |
| `description` | `string` | — | — |
| `children` (obrigatória) | `ReactNode` | — | — |
| `...props` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Content>` | — | Também aceita as props deste tipo. |

### Outras exportações

- `DialogTrigger` (valor)
- `DialogClose` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` ou `Shift + Tab` | Percorrem os controles do diálogo sem sair dele; ao abrir, o foco vai ao primeiro controle, o botão de fechar. |
| `Esc` | Fecha o diálogo e devolve o foco ao `DialogTrigger`. |

## Acessibilidade

- Diálogo modal do Radix: `role="dialog"` com `title` como nome (um `<h2>`) e `description` como descrição; o resto da página sai da árvore de acessibilidade e a rolagem trava.
- O foco fica preso no diálogo e volta ao gatilho ao fechar; o botão de fechar se chama “Close dialog”, fixo em inglês no código.
- Para mandar o foco inicial a outro controle, use `onOpenAutoFocus` no `DialogContent`, que repassa as props do Radix.

## Movimento

- O fundo esmaece com um desfoque de 7 px enquanto o painel sobe 8 px e cresce de 96% numa mola sem ultrapassagem; fechar é mais curto e parte de onde a entrada estiver.
- Se `title` ou `description` mudam com o diálogo aberto, o texto novo sobe e o antigo sai para cima.
- Com “reduzir movimento” ligado, fundo e painel só esmaecem, em 120 ms.

## Comportamento responsivo

- O painel tem até 440 px de largura (a tela menos 2rem no celular) e altura máxima de `100dvh` menos 2rem, rolando por dentro quando o conteúdo passa disso.

## Notas para IA

- Monte `Dialog`, `DialogTrigger asChild` em volta do botão e `DialogContent` com `title`; botões que fecham vão em `DialogClose asChild`. Importe de `@/components/ryan-ui/dialog/dialog`.
- Para fechar depois de uma ação assíncrona, controle com `open` e `onOpenChange` e passe `false` quando ela terminar, como o demo faz.
- Use o `Dialog` deste arquivo como raiz: sob um `Root` do Radix puro, o `DialogContent` anima por keyframes de CSS, sem a mola do Motion.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/dialog · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
