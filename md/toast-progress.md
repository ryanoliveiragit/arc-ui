# Toast progress

> Aviso que acompanha uma tarefa: a barra e a porcentagem avançam e ele vira sucesso, com o check desenhado, ou erro com Tentar de novo.

- Tipo: componente (categoria Feedback), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/toast-progress
- Descrição original (inglês): A toast that follows a running task: a bar and a percentage advance, then it morphs in place into a success state with a drawn check, or into an error state with Retry.
- Versões: Padrão ([`toast`](toast.md)), Pilha ([`toast-stack`](toast-stack.md)), Com ação ([`toast-action`](toast-action.md)), Progresso (este item)

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast-progress.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast-progress.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast-progress.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast-progress.json`. Caminho do registro, relativo ao endereço do site: `r/toast-progress.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/toast-progress/toast-progress.tsx`
  - `components/ryan-ui/toast-progress/toast-progress.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/toast-progress.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Acompanhar uma tarefa em segundo plano com porcentagem conhecida, como envio, exportação ou importação, sem bloquear a tela.
- Fechar o ciclo no mesmo aviso: a barra completa e vira um visto de sucesso, ou congela no tom de perigo com “Retry” quando falha.
- Progresso com um detalhe que muda a cada atualização (“27 of 42 MB”, “3 seconds left”) em `description`, sem animar a troca de texto a cada vez.

## Quando não usar

- Use [`progress`](progress.md) quando o andamento deve ficar visível na própria página, perto do que está sendo processado.
- Use [`toast-stack`](toast-stack.md) com `update` para várias tarefas ao mesmo tempo; este acompanha uma só.
- Use [`toast`](toast.md) para um resultado que não precisou de progresso.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useEffect, useRef, useState } from "react";
import { FileArchive } from "lucide-react";
import ToastProgress from "@/components/ryan-ui/toast-progress/toast-progress";
import type { ToastProgressStatus } from "@/components/ryan-ui/toast-progress/toast-progress";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./toast-progress.module.css";

export const stage: DemoStage = { height: 480 };

const file = { name: "brand-kit.zip", megabytes: 42 };
/** Percent gained on each tick. A fixed sequence, so the demo plays the same way every time. */
const steps = [3, 6, 4, 8, 5, 9, 4, 7, 6, 5];
/** Where the weak connection gives up. */
const dropAt = 64;

interface Upload { open: boolean; status: ToastProgressStatus; value: number }

const fileState: Record<ToastProgressStatus | "idle", string> = { idle: "Ready to upload", loading: "Uploading", success: "Uploaded to Brand assets", error: "Upload interrupted" };

export default function ToastProgressDemo() {
  const [upload, setUpload] = useState<Upload | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const stop = () => window.clearInterval(timer.current);
  useEffect(() => stop, []);

  function start(from: number, failAt?: number) {
    stop();
    let value = from;
    let tick = 0;
    setUpload({ open: true, status: "loading", value });
    timer.current = window.setInterval(() => {
      value = Math.min(value + steps[tick++ % steps.length]!, failAt ?? 100);
      const status: ToastProgressStatus = failAt !== undefined && value >= failAt ? "error" : value >= 100 ? "success" : "loading";
      if (status !== "loading") stop();
      setUpload(current => current && { ...current, status, value });
    }, 150);
  }

  const status = upload?.status ?? "idle";
  const value = upload?.value ?? 0;
  // The full upload takes about three seconds at this pace.
  const secondsLeft = Math.max(Math.ceil((100 - value) * 3 / 100), 1);
  const copy = status === "success"
    ? { title: "Upload complete", description: `${file.name} is ready to share.` }
    : status === "error"
      ? { title: "Upload interrupted", description: `The connection dropped at ${value}%. Nothing was lost.` }
      : { title: `Uploading ${file.name}`, description: `About ${secondsLeft} ${secondsLeft === 1 ? "second" : "seconds"} left` };

  return (
    <div className={styles.scene}>
      <section className={styles.panel} aria-label="Brand assets">
        <div className={styles.file}>
          <span className={styles.tile} aria-hidden="true"><FileArchive width={20} height={20} strokeWidth={1.75} /></span>
          <span className={styles.text}><span className={styles.name}>{file.name}</span><span className={styles.detail}>{file.megabytes} MB, {fileState[status]}</span></span>
        </div>
        <Row gap={2}>
          <Button onClick={() => start(0)}>Upload file</Button>
          <Button variant="secondary" onClick={() => start(0, dropAt)}>Upload on a weak signal</Button>
        </Row>
      </section>
      <Caption className={styles.note}>The weak signal drops at {dropAt}%: press Retry in the toast to pick up from there.</Caption>
      <ToastProgress
        open={upload?.open ?? false}
        onOpenChange={open => { if (!open) stop(); setUpload(current => current && { ...current, open }); }}
        position="bottom-center"
        contained
        className={styles.toast}
        // Success is left to the component: it shows as soon as the value reaches 100. Only the failure has to be told.
        status={status === "error" ? "error" : undefined}
        value={value}
        title={copy.title}
        description={copy.description}
        onRetry={() => start(value)}
        duration={4000}
      />
    </div>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ToastProgress`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` (obrigatória) | `string` | — | What is running, or how it ended. Pass the text for the current status; the copy swaps in place when it changes. |
| `description` | `string` | — | Optional second line. While the task runs it may change on every tick (for example "27 of 42 MB") without replaying the swap. |
| `value` (obrigatória) | `number` | — | How far the task is, from 0 to 100. The bar and the number glide to each new value. |
| `status` | `"loading" \| "success" \| "error"` | — | State of the task. Left out, the toast runs until `value` reaches 100 and then shows success. |
| `icon` | `ReactNode` | — | Glyph in the status circle while the task runs. A spinner by default. |
| `formatValue` | `(value: number) => string` | `percent` | Text beside the title while the task runs. Receives the rounded value that is on screen; by default it prints a percentage such as "64%". |
| `retryLabel` | `string` | `"Retry"` | Label of the action shown when the task fails. |
| `onRetry` | `() => void` | — | Runs when Retry is pressed. Without it the failed state has no action. Set `status` back to `"loading"` to resume. |
| `open` | `boolean` | — | Whether the toast is showing (controlled). |
| `defaultOpen` | `boolean` | `true` | Whether the toast starts showing when `open` is not passed. |
| `onOpenChange` | `(open: boolean, reason?: ToastProgressCloseReason) => void` | — | Called when the toast closes itself, with the reason: `"timeout"` or `"dismiss"`. |
| `duration` | `number` | `4000` | Milliseconds the success state stays before the toast closes itself. Pass 0 or Infinity to keep it. A running or failed task never closes by itself. |
| `position` | `"inline" \| "bottom-right" \| "bottom-center" \| "bottom-left"` | `"inline"` | Where the toast sits. `inline` stays in the flow; the bottom positions pin it to the window. |
| `contained` | `boolean` | `false` | With a bottom position, pins the toast inside the nearest positioned ancestor instead of the window, for panels and previews. |
| `hotkey` | `boolean` | `true` | Alt+T moves focus into the toast (to Retry when it is showing). |
| `className` | `string` | — | Extra class for the toast surface. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ToastProgressStatus`: `loading` shows the bar and the number; `success` and `error` are the two ways the task can end. | `"loading" \| "success" \| "error"` |
| `ToastProgressCloseReason`: Why the toast closed: the success state timed out, or the person closed it (button, Escape or swipe). | `"timeout" \| "dismiss"` |
| `ToastProgressPosition`: `inline` renders where it is placed, like `Toast`. The others pin it to the bottom edge, like `ToastStack`. | `"inline" \| "bottom-right" \| "bottom-center" \| "bottom-left"` |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Alt + T` | Leva o foco ao “Retry”, quando a tarefa falhou, ou ao botão de fechar; desligue com `hotkey={false}`. |
| `Esc` | Com o foco dentro, fecha o aviso (motivo `dismiss`) e devolve o foco para onde ele estava. |
| `Enter` ou `Espaço` | Em “Retry”, chama `onRetry`; o foco passa para o botão de fechar enquanto a tarefa recomeça. |

## Acessibilidade

- O aviso é `role="status"` com `aria-live="polite"`, e a barra é `role="progressbar"` nomeada pelo título, com `aria-valuetext` vindo de `formatValue`.
- Enquanto a tarefa roda, a descrição que muda a cada atualização fica com `aria-live="off"` e o número ao lado do título é `aria-hidden`, para não haver leitura a cada passo.
- Ao fechar com o foco dentro, ele volta para onde estava; o `aria-label` do fechar é fixo em inglês (“Dismiss notification”).

## Movimento

- Barra e número deslizam juntos até cada novo `value` com uma mola; no fim, a barra completa em 0,32 s e só então o aviso muda para sucesso.
- Na mudança de estado, o giro encolhe com desfoque e um visto ou um ponto de exclamação se desenha; o texto troca subindo, o número dá lugar ao “Retry” e, no sucesso, a barra afina e some.
- Com “reduzir movimento”, a barra salta para o valor, o giro fica parado, as trocas só esmaecem e o arraste para dispensar fica desligado.

## Comportamento responsivo

- Nas posições `bottom-*` fica fixo na janela com até 24 rem e centraliza no rodapé abaixo de 30 rem; com `contained`, prende-se ao ancestral posicionado.
- Num aviso estreito (menos de 23 rem), o “Retry” desce para baixo do texto.

## Notas para IA

- Importe de `@/components/ryan-ui/toast-progress/toast-progress`. Atualize `value`; sem `status`, chegar a 100 já mostra sucesso. A falha precisa de `status="error"`, e para retomar volte a `"loading"`.
- Passe em `title` o texto do estado atual. Rodando ou com erro, o aviso não fecha sozinho; o sucesso fecha após `duration`, que recomeça do zero se a pessoa segurar o aviso com mouse ou foco.
- Sem `onRetry`, o erro aparece sem botão. Se outro aviso da página também usa `Alt + T` (`toast-stack`, `toast-action`), desligue `hotkey` num deles.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/toast-progress · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
