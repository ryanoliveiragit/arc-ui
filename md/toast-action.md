# Toast action

> Aviso com uma ação, como Desfazer, e uma barra fina que se esgota até ele sair; passar o mouse ou focar pausa a contagem.

- Tipo: componente (categoria Feedback), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/toast-action
- Descrição original (inglês): A toast with one action, such as Undo, and a thin countdown bar that drains until it leaves; hover or focus holds the countdown, and taking the action swaps the copy for a short confirmation.
- Versões: Padrão ([`toast`](toast.md)), Pilha ([`toast-stack`](toast-stack.md)), Com ação (este item), Progresso ([`toast-progress`](toast-progress.md))

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast-action.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast-action.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast-action.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast-action.json`. Caminho do registro, relativo ao endereço do site: `r/toast-action.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/toast-action/toast-action.tsx`
  - `components/ryan-ui/toast-action/toast-action.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/toast-action.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Logo depois de algo reversível, como excluir, arquivar ou enviar, oferecendo “Desfazer” enquanto a barra de tempo corre.
- Quando a pessoa precisa de tempo para reagir: a contagem para com o mouse em cima, com foco ou com a aba oculta e retoma de onde parou.
- Quando o resultado da ação deve ficar claro: ao tocar nela, o texto troca por `confirmation` com um visto desenhado antes de o aviso sair.

## Quando não usar

- Use [`toast`](toast.md) para uma confirmação simples, sem ação.
- Use [`toast-stack`](toast-stack.md) quando vários avisos podem chegar em sequência; este mostra um por vez.
- Use [`confirm-morph`](confirm-morph.md) ou [`hold-to-confirm`](hold-to-confirm.md) quando a ação destrutiva deve ser confirmada antes, e não desfeita depois.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FileArchive, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ToastAction from "@/components/ryan-ui/toast-action/toast-action";
import type { ToastActionCloseReason } from "@/components/ryan-ui/toast-action/toast-action";
import { Button } from "@/components/ryan-ui/button/button";
import { motionTokens } from "@/components/ryan-ui/lib/motion-tokens";
import { Caption } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./toast-action.module.css";

export const stage: DemoStage = { height: 480 };

interface SharedFile { id: string; name: string; detail: string; Icon: LucideIcon }

const sharedFiles: SharedFile[] = [
  { id: "report", name: "Q3-report.pdf", detail: "2.4 MB, edited yesterday", Icon: FileText },
  { id: "forecast", name: "Forecast-2027.xlsx", detail: "860 KB, edited 2 hours ago", Icon: FileSpreadsheet },
  { id: "brand", name: "brand-kit.zip", detail: "42 MB, shared with 6 people", Icon: FileArchive },
];
const hint = "Delete a file, then hover or focus the toast to hold its countdown.";

export default function ToastActionDemo() {
  const reduce = useReducedMotion();
  const [files, setFiles] = useState(sharedFiles);
  const [removed, setRemoved] = useState<{ file: SharedFile; index: number; count: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(hint);

  function remove(file: SharedFile) {
    setRemoved({ file, index: files.indexOf(file), count: (removed?.count ?? 0) + 1 });
    setFiles(files.filter(item => item !== file));
    setOpen(true);
    setNote(hint);
  }

  function restore() {
    if (!removed) return;
    const next = [...files];
    next.splice(Math.min(removed.index, next.length), 0, removed.file);
    setFiles(next);
    setNote(`${removed.file.name} is back where it was.`);
  }

  function onOpenChange(next: boolean, reason?: ToastActionCloseReason) {
    setOpen(next);
    if (removed && reason !== "action") setNote(`${removed.file.name} was deleted for good.`);
  }

  return (
    <div className={styles.scene}>
      <section className={styles.panel} aria-label="Shared files">
        <header className={styles.header}><span>Shared files</span><span className={styles.count}>{files.length}</span></header>
        <ul className={styles.list}>
          {/* Rows fold their height, so the ones below slide up (or make room again) in the same motion. */}
          <AnimatePresence initial={false}>
            {files.map(file => (
              <motion.li
                key={file.id}
                className={styles.item}
                initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={reduce ? { duration: motionTokens.duration.instant } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}
              >
                <div className={styles.row}>
                  <span className={styles.tile} aria-hidden="true"><file.Icon width={18} height={18} strokeWidth={1.75} /></span>
                  <span className={styles.text}><span className={styles.name}>{file.name}</span><span className={styles.detail}>{file.detail}</span></span>
                  <button type="button" className={styles.remove} aria-label={`Delete ${file.name}`} onClick={() => remove(file)}><Trash2 width={16} height={16} strokeWidth={1.75} aria-hidden="true" /></button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {files.length === 0 ? <div className={styles.empty}><span>No shared files left.</span><Button variant="secondary" size="sm" onClick={() => { setFiles(sharedFiles); setOpen(false); setRemoved(null); setNote(hint); }}>Bring the samples back</Button></div> : null}
      </section>
      <Caption className={styles.note}>{note}</Caption>
      <ToastAction
        open={open}
        onOpenChange={onOpenChange}
        position="bottom-center"
        contained
        className={styles.toast}
        resetKey={removed?.count}
        icon={<Trash2 width={15} height={15} strokeWidth={2} />}
        title={removed ? `${removed.file.name} deleted` : ""}
        description="It stays recoverable until this closes."
        actionLabel="Undo"
        onAction={restore}
        confirmation="File restored"
        confirmationDescription={removed ? `${removed.file.name} is back in Shared files.` : undefined}
        duration={6000}
      />
    </div>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ToastAction`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` (obrigatória) | `string` | — | What just happened, in a few words. Changing the title or description while the toast is open swaps the copy in place and restarts the countdown. |
| `description` | `string` | — | Optional second line with the detail. |
| `resetKey` | `string \| number` | — | Identifies the event the toast is about. A new value while the toast is open starts it over (action back, countdown full) even when the copy is the same, for example when the same file is deleted twice. |
| `icon` | `ReactNode` | — | Glyph in the status circle before the action is taken, for example a trash icon at 16px. |
| `actionLabel` | `string` | `"Undo"` | Label of the single action. |
| `onAction` | `() => void` | — | Runs when the action is taken. The toast then shows the confirmation and leaves by itself. |
| `confirmation` | `string` | `"Action undone"` | Title shown after the action is taken. |
| `confirmationDescription` | `string` | — | Optional second line of the confirmation. |
| `confirmationDuration` | `number` | `1800` | Milliseconds the confirmation stays before the toast leaves. |
| `open` | `boolean` | — | Whether the toast is showing (controlled). |
| `defaultOpen` | `boolean` | `true` | Whether the toast starts showing when `open` is not passed. |
| `onOpenChange` | `(open: boolean, reason?: ToastActionCloseReason) => void` | — | Called when the toast closes itself, with the reason: `"timeout"`, `"dismiss"`, or `"action"` whenever the action was taken first. |
| `duration` | `number` | `6000` | Milliseconds of countdown before the toast closes itself. Pass 0 or Infinity to keep it until it is closed; the bar is then hidden. |
| `position` | `"inline" \| "bottom-right" \| "bottom-center" \| "bottom-left"` | `"inline"` | Where the toast sits. `inline` stays in the flow; the bottom positions pin it to the window. |
| `contained` | `boolean` | `false` | With a bottom position, pins the toast inside the nearest positioned ancestor instead of the window, for panels and previews. |
| `hotkey` | `boolean` | `true` | Alt+T moves focus to the action, so keyboard users can reach it before the countdown ends. |
| `className` | `string` | — | Extra class for the toast surface. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ToastActionCloseReason`: Why the toast closed: the countdown ran out, the person closed it (button, Escape or swipe), or the action was taken. | `"timeout" \| "dismiss" \| "action"` |
| `ToastActionPosition`: `inline` renders where it is placed, like `Toast`. The others pin it to the bottom edge, like `ToastStack`. | `"inline" \| "bottom-right" \| "bottom-center" \| "bottom-left"` |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Alt + T` | Leva o foco à ação do aviso aberto (ou ao botão de fechar, depois da ação), para alcançá-la antes do fim do tempo; desligue com `hotkey={false}`. |
| `Tab` ou `Shift + Tab` | Com o foco dentro do aviso, a contagem pausa; ao sair, retoma de onde parou. |
| `Enter` ou `Espaço` | Na ação, executa `onAction` e mostra a confirmação; o foco passa para o botão de fechar. |
| `Esc` | Com o foco dentro, fecha o aviso e devolve o foco para onde ele estava antes. |

## Acessibilidade

- É `role="status"` com `aria-live="polite"`; a cópia que sai fica oculta, então só o texto atual é lido, inclusive a confirmação.
- Ao fechar com o foco dentro, ele volta para onde estava antes de entrar no aviso; depois da ação, vai para o botão de fechar em vez de cair na página.
- `duration={0}` mantém o aviso até ser fechado, para quem precisa de mais tempo; o `aria-label` do fechar é fixo em inglês (“Dismiss notification”).

## Movimento

- Uma barra fina no rodapé esvazia em ritmo linear até o aviso sair; enquanto a contagem está pausada, ela fica mais apagada.
- Ao tomar a ação, o ícone encolhe com desfoque e um visto se desenha no lugar, o texto troca subindo e a altura acompanha com uma mola; o botão da ação sai do fluxo e esmaece.
- Entra subindo com uma mola e sai voando quando arrastado para o lado. Com “reduzir movimento”, a barra desce em 8 degraus, tudo só esmaece e o arraste fica desligado.

## Comportamento responsivo

- Nas posições `bottom-*` fica fixo na janela com até 24 rem e, em telas abaixo de 30 rem, centraliza no rodapé; com `contained`, prende-se ao ancestral posicionado.
- Num aviso com menos de 23 rem de largura, a ação desce para baixo do texto em vez de espremê-lo.

## Notas para IA

- Importe de `@/components/ryan-ui/toast-action/toast-action`. Desfaça a operação em `onAction` e só apague de vez em `onOpenChange` quando o motivo não for `"action"`.
- Para repetir o aviso num evento igual (o mesmo arquivo excluído duas vezes), mude `resetKey`: a ação volta e a barra enche de novo.
- Use `position="bottom-center"` (ou outro canto) para fixar na janela, ou `inline` para ficar no fluxo; numa prévia dentro de um painel, some `contained` e dê `position: relative` ao pai.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/toast-action · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
