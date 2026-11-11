# Hold to confirm

> Confirma uma ação destrutiva ao segurar o botão, não com um toque.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/hold-to-confirm
- Descrição original (inglês): Confirm a destructive action by holding, not tapping.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hold-to-confirm.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hold-to-confirm.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hold-to-confirm.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/hold-to-confirm.json`. Caminho do registro, relativo ao endereço do site: `r/hold-to-confirm.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/hold-to-confirm/hold-to-confirm.tsx`
  - `components/ryan-ui/hold-to-confirm/hold-to-confirm.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/hold-to-confirm.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Ações destrutivas ou difíceis de desfazer cujas consequências já estão visíveis na tela, como excluir o projeto que está aberto.
- Ações em que um toque acidental não pode contar e um diálogo seria pesado: publicar, arquivar, liberar um envio.

## Quando não usar

- Use [`dialog`](dialog.md) quando a pessoa precisa ler as consequências antes de confirmar.
- Use [`confirm-morph`](confirm-morph.md) quando a confirmação deve oferecer Cancelar, mostrar o andamento e permitir Desfazer no lugar.
- Use [`toast-action`](toast-action.md) com Desfazer para ações frequentes e reversíveis: segurar a cada uso deixa o fluxo lento.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import HoldToConfirm from "@/components/ryan-ui/hold-to-confirm/hold-to-confirm";
import { Caption, Row, Stack } from "./_kit";

export default function HoldToConfirmDemo() {
  const [holding, setHolding] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  return (
    <Stack gap={6} align="center">
      <HoldToConfirm
        key={resetKey}
        label="Hold to delete project"
        confirmedLabel="Project deleted"
        tone="danger"
        onHoldChange={setHolding}
        onConfirm={() => setDeleted(true)}
      />
      <Row justify="center">
        <HoldToConfirm label="Hold to publish" confirmedLabel="Published" duration={800} onConfirm={() => {}} />
        <HoldToConfirm label="Hold to archive" confirmedLabel="Archived" tone="neutral" onConfirm={() => {}} />
      </Row>
      <Caption>
        {deleted ? (
          <>Deleted. <button type="button" onClick={() => { setDeleted(false); setResetKey(key => key + 1); }} style={{ all: "unset", cursor: "pointer", textDecoration: "underline" }}>Reset the demo</button></>
        ) : holding ? "Keep holding…" : "Press and hold; releasing early cancels."}
      </Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `HoldToConfirm`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` (obrigatória) | `string` | — | The instruction and the action, for example “Hold to delete project”. |
| `confirmedLabel` | `string` | `"Done"` | Shown once the hold completes, for example “Deleted”. |
| `onConfirm` (obrigatória) | `() => void` | — | Called once when the hold completes. |
| `duration` | `number` | `1200` | Hold length in milliseconds. |
| `icon` | `ReactNode` | `<Trash2 strokeWidth={1.75} />` | — |
| `tone` | `"accent" \| "danger" \| "neutral"` | `"accent"` | `accent` (default) fills with the selected accent; `danger` is for an irreversible action; `neutral` fills with the foreground. |
| `confirmed` | `boolean` | — | Controls the done state. Set it back to false to reset the button; leave it undefined to let the button keep its own state. |
| `onHoldChange` | `(holding: boolean) => void` | — | Reports when a hold starts and ends, for surrounding hints such as “Keep holding”. |
| `...props` | `ButtonHTMLAttributes<HTMLButtonElement>` | — | Também aceita as props deste tipo, menos `children`, `onClick`, `onDrag`, `onDragEnd`, `onDragStart`, `onAnimationStart` e `onAnimationEnd`. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Espaço` ou `Enter` | Mantidas pressionadas no botão, enchem o preenchimento; soltar antes do fim o desfaz, e completar chama `onConfirm`. |

## Acessibilidade

- É um `<button>` com `aria-describedby` apontando para uma instrução oculta (“Press and hold for 1.2 seconds to confirm…”, fixa em inglês); ao concluir, recebe `aria-disabled` e um `role="status"` anuncia `confirmedLabel`.
- O `aria-label` acompanha o texto visível (`label`, depois `confirmedLabel`); um clique ou toque rápido não confirma, então diga no `label` que é preciso segurar, como “Segure para excluir o projeto”.
- Arrastar o ponteiro para mais de 24 px fora do botão, ou tirar o foco dele, cancela o pressionamento.

## Movimento

- O preenchimento avança em ritmo linear por `duration` ms, como uma cópia invertida do botão revelada da esquerda (o texto muda de cor na borda); soltar antes o rebobina numa mola, e pressionar de novo continua de onde parou.
- Na pressão, o botão encolhe levemente (0,97); ao concluir, o ícone vira um visto que se desenha e a largura acompanha o novo rótulo numa mola sem ultrapassagem.
- Com “reduzir movimento”, o preenchimento ainda avança enquanto se segura (ele é o cronômetro), mas volta de uma vez ao soltar; não há escala, e rótulo e ícone só esmaecem.

## Notas para IA

- `onConfirm` roda uma vez, ao completar; depois o botão fica concluído até remontar (o demo troca a `key`) ou, no modo controlado, até `confirmed` voltar a `false`.
- `tone="danger"` é para ações irreversíveis (o padrão `accent` usa a cor de destaque); `duration` ajusta o tempo (1200 ms) e `icon` troca a lixeira padrão.
- Use `onHoldChange` para uma dica ao redor, como “Continue segurando…”; `confirmedLabel` tem padrão em inglês (“Done”), e a instrução oculta só muda no arquivo instalado.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/hold-to-confirm · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
