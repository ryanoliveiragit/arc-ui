# Bottom sheet

> Painel inferior que repousa em alturas definidas e acompanha o dedo ao arrastar.

- Tipo: componente (categoria Revelação)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/bottom-sheet
- Descrição original (inglês): A sheet that rests at a peek or full height and follows your finger.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bottom-sheet.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bottom-sheet.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bottom-sheet.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/bottom-sheet.json`. Caminho do registro, relativo ao endereço do site: `r/bottom-sheet.json`.

- Pacotes npm: `@radix-ui/react-dialog`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/bottom-sheet/bottom-sheet.tsx`
  - `components/ryan-ui/bottom-sheet/bottom-sheet.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-dialog lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/bottom-sheet.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Tarefas secundárias no celular em que uma prévia ajuda antes da vista completa: resumo do pedido, opções de compartilhamento, filtros, detalhes de uma viagem.
- Conteúdo que a pessoa arrasta entre meia altura e quase tela cheia, com alturas de repouso como `detents={[0.4, 0.85]}`.
- Fluxos que precisam saber onde a folha parou, pelo índice que `onDetentChange` informa.

## Quando não usar

- Use [`dialog`](dialog.md) quando a decisão precisa interromper a pessoa no centro da tela.
- Use [`drawer`](drawer.md) para painéis laterais em telas largas; esta folha tem no máximo 36rem de largura e fica centrada na borda de baixo.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import BottomSheet, { BottomSheetClose } from "@/components/ryan-ui/bottom-sheet/bottom-sheet";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Stack } from "./_kit";

const lines = [
  ["Subtotal", "$128.00"], ["Shipping", "$6.50"], ["Tax", "$10.24"], ["Total", "$144.74"],
];

export default function BottomSheetDemo() {
  const [detent, setDetent] = useState(0);
  return (
    <Stack align="center" gap={4}>
      <BottomSheet
        trigger={<Button variant="secondary">Review order</Button>}
        title="Order summary"
        description="Two items, shipping to Portland, OR."
        detents={[0.4, 0.85]}
        onDetentChange={setDetent}
      >
        <Stack gap={3}>
          {lines.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}><span>{k}</span><span>{v}</span></div>
          ))}
          <Caption>Drag the sheet up for the full list, or down to dismiss.</Caption>
          <BottomSheetClose asChild><Button>Place order</Button></BottomSheetClose>
        </Stack>
      </BottomSheet>
      <Caption>Last resting height: {detent === 0 ? "peek" : "full"}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `BottomSheet`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `trigger` | `ReactNode` | — | The control that opens the sheet, usually a button. Focus returns to it when the sheet closes. |
| `open` | `boolean` | — | — |
| `defaultOpen` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `title` (obrigatória) | `string` | — | — |
| `description` | `string` | — | — |
| `detents` | `number[]` | — | Resting heights as fractions of the viewport height. The sheet opens at `initialDetent` and never grows past the largest. |
| `initialDetent` | `number` | — | Index into the sorted detents the sheet opens at. Defaults to the smallest. |
| `onDetentChange` | `(index: number) => void` | — | — |
| `closeLabel` | `string` | — | — |
| `className` | `string` | — | — |
| `children` (obrigatória) | `ReactNode` | — | — |

### Outras exportações

- `BottomSheetClose` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↓` ou `Page Down` ou `Espaço` | Com o foco na folha, abre até a maior altura; já aberta, rola o conteúdo. |
| `↑` ou `Page Up` ou `Shift + Espaço` | Com o foco na folha, rola o conteúdo para cima. |
| `↑` ou `↓` | No puxador, sobe ou desce uma altura de repouso; para baixo ele para na menor, sem fechar. |
| `Home` ou `End` | No puxador, vai à maior ou à menor altura. |
| `Enter` ou `Espaço` | No puxador, alterna entre a menor e a maior altura. |
| `Esc` | Fecha a folha e devolve o foco ao `trigger`; enquanto ela está aberta, o foco fica preso nela. |

## Acessibilidade

- É um diálogo modal do Radix: `title` vira o nome acessível, `description` a descrição, e o resto da página sai da árvore de acessibilidade enquanto a folha está aberta.
- Ao abrir, o foco vai para a própria folha; o puxador é um botão com `aria-expanded` e o rótulo “Expand sheet” ou “Collapse sheet”.
- Cada mudança de altura é anunciada numa região `aria-live` educada (“Sheet expanded”, “Sheet collapsed”); esses textos são fixos em inglês, e só o botão de fechar aceita rótulo próprio (`closeLabel`).

## Movimento

- A folha segue o dedo 1:1 para baixo e resiste como elástico acima da maior altura; ao soltar, a velocidade projeta o destino e um gesto rápido sempre avança pelo menos uma altura.
- Um gesto rápido para baixo a partir da menor altura fecha a folha mantendo a velocidade; o escurecimento do fundo acompanha a posição em vez de um tempo fixo.
- Com “reduzir movimento” ligado, a folha vai direto a cada altura e só esmaece ao entrar e sair; a rolagem do conteúdo deixa de ser suave.

## Comportamento responsivo

- A largura é `min(100%, 36rem)` e as alturas são frações de `100dvh`; o espaço inferior respeita a área segura do aparelho (`safe-area-inset-bottom`).
- O conteúdo só rola na maior altura; abaixo dela, arrastar, girar a roda ou tabular até um campo fora da tela abre a folha primeiro, e um observador a reposiciona quando a janela muda de altura.

## Notas para IA

- `title` é obrigatório e `detents` são frações da altura da janela (padrão `[0.45, 0.92]`), ordenadas pelo componente; `initialDetent` é o índice nessa lista ordenada.
- Passe o botão em `trigger` para o foco voltar a ele ao fechar; para fechar por dentro, envolva a ação em `BottomSheetClose asChild`.
- No toque, arrastar na vertical sobre o conteúdo move a folha até ela abrir por completo; só então o conteúdo rola. Importe de `@/components/ryan-ui/bottom-sheet/bottom-sheet`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/bottom-sheet · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
