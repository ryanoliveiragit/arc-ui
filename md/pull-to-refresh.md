# Pull to refresh

> Área de rolagem que você puxa para baixo para atualizar: o indicador estica, gira durante a atualização e volta ao lugar.

- Tipo: componente (categoria Feedback), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/pull-to-refresh
- Descrição original (inglês): A scroll container you drag down with a finger or the mouse: the indicator stretches, spins while the async refresh runs, confirms and settles.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/pull-to-refresh.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/pull-to-refresh.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/pull-to-refresh.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/pull-to-refresh.json`. Caminho do registro, relativo ao endereço do site: `r/pull-to-refresh.json`.

- Pacotes npm: `motion`, `lucide-react`
- Arquivos, depois de instalados:
  - `components/ryan-ui/pull-to-refresh/pull-to-refresh.tsx`
  - `components/ryan-ui/pull-to-refresh/pull-to-refresh.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion lucide-react`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/pull-to-refresh.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Listas em que puxar para baixo é o gesto esperado no celular, como caixa de entrada, feed ou notificações.
- Uma área com rolagem própria dentro de um painel ou de uma moldura de app (`height`), que atualiza o conteúdo sem recarregar a página.
- Atualizações que às vezes começam fora do gesto, por um botão ou um timer: `refreshing` mostra o mesmo estado de atualização.

## Quando não usar

- Para a página inteira rolando no `body` ele não serve: o gesto só existe dentro do próprio contêiner, que precisa de altura.
- Use [`infinite-masonry`](infinite-masonry.md) quando o conteúdo novo deve chegar ao rolar até o fim, e não ao puxar o topo.
- Use [`message-scroller`](message-scroller.md) para conversas, em que o conteúdo novo chega no fim da lista.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { PullToRefresh } from "@/components/ryan-ui/pull-to-refresh/pull-to-refresh";
import { avatar } from "@/components/ryan-ui/lib/media";
import type { PersonId } from "@/components/ryan-ui/lib/media";
import { motionTokens } from "@/components/ryan-ui/lib/motion-tokens";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./pull-to-refresh.module.css";

export const stage: DemoStage = { height: 580 };

interface Mail { id: string; who: PersonId; from: string; subject: string; time: string; fresh?: boolean; }

const inbox: Mail[] = [
  { id: "m1", who: "jasmine-brooks", from: "Jasmine Brooks", subject: "Design review moved to Thursday", time: "9:41" },
  { id: "m2", who: "daniel-kim", from: "Daniel Kim", subject: "Staging is back up, sorry for the noise", time: "9:12" },
  { id: "m3", who: "sofia-ramirez", from: "Sofia Ramirez", subject: "Vendor contract: two small changes", time: "8:57" },
  { id: "m4", who: "marcus-johnson", from: "Marcus Johnson", subject: "Can you look at the checkout PR?", time: "8:30" },
  { id: "m5", who: "hannah-walsh", from: "Hannah Walsh", subject: "Onboarding call notes", time: "Yesterday" },
  { id: "m6", who: "andre-williams", from: "Andre Williams", subject: "October invoices are ready", time: "Yesterday" },
  { id: "m7", who: "chloe-nguyen", from: "Chloe Nguyen", subject: "Dashboard numbers for the board deck", time: "Monday" },
];
const incoming: Omit<Mail, "id" | "time">[] = [
  { who: "emma-collins", from: "Emma Collins", subject: "New icons are in the shared library" },
  { who: "nathan-cole", from: "Nathan Cole", subject: "Headcount plan needs your sign-off" },
  { who: "ava-mitchell", from: "Ava Mitchell", subject: "Launch post draft, comments welcome" },
  { who: "tyler-hayes", from: "Tyler Hayes", subject: "Northwind wants a second demo" },
];

export default function PullToRefreshDemo() {
  const [mail, setMail] = useState(inbox);
  const [refreshes, setRefreshes] = useState(0);
  const count = useRef(0);

  // Stands in for a network request: a moment later, one new message arrives.
  const refresh = () => new Promise<void>(resolve => {
    window.setTimeout(() => {
      const next = incoming[count.current % incoming.length]!;
      count.current += 1;
      setMail(current => [{ ...next, id: `new-${count.current}`, time: "Now", fresh: true }, ...current.map(item => ({ ...item, fresh: false }))]);
      setRefreshes(count.current);
      resolve();
    }, 1400);
  });

  return (
    <Stack gap={3} align="center" width={340}>
      <div className={styles.phone}>
        <header className={styles.bar}>
          <h2 className={styles.barTitle}>Inbox</h2>
          <span className={styles.barMeta}>{refreshes ? `${refreshes} new since you opened it` : "Up to date"}</span>
        </header>
        <PullToRefresh onRefresh={refresh} label="Inbox messages" refreshLabel="Check for new mail">
          <ul className={styles.list}>
            {mail.map(item => (
              <motion.li key={item.id} className={styles.item} layout="position" initial={item.fresh ? { opacity: 0, y: -16 } : false} animate={{ opacity: 1, y: 0 }} transition={motionTokens.spring.smooth}>
                <img className={styles.avatar} src={avatar(item.who)} alt="" />
                <span className={styles.copy}>
                  <span className={styles.from}>{item.from}{item.fresh ? <span className={styles.fresh} aria-label="New" /> : null}</span>
                  <span className={styles.subject}>{item.subject}</span>
                </span>
                <span className={styles.time}>{item.time}</span>
              </motion.li>
            ))}
          </ul>
        </PullToRefresh>
      </div>
      <Caption>Drag the list down with the mouse or a finger and let go. With the keyboard, Tab to “Check for new mail”.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `PullToRefresh`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `onRefresh` (obrigatória) | `() => Promise<unknown> \| void` | — | Runs when a pull is released past the threshold. Return a promise: the indicator spins until it settles. |
| `children` (obrigatória) | `ReactNode` | — | The scrolling content. |
| `refreshing` | `boolean` | — | Shows the refreshing state from outside, for a refresh that did not start with a pull (a button, a timer). |
| `threshold` | `number` | `72` | Pull distance in pixels at which releasing starts a refresh. |
| `maxPull` | `number` | `150` | The farthest the content can travel, in pixels. Resistance grows toward it. |
| `disabled` | `boolean` | `false` | Turns the gesture off; the content still scrolls. |
| `height` | `number \| string` | — | Height of the scroll area, as a number of pixels or any CSS length. Defaults to filling its parent. |
| `label` | `string` | `"Content"` | Accessible name of the scroll region. |
| `refreshLabel` | `string` | `"Refresh"` | Text of the keyboard refresh button. |
| `className` | `string` | — | Extra class for the outer element. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | O primeiro foco do componente é o botão `refreshLabel` (padrão “Refresh”), que só aparece com foco de teclado; o próximo `Tab` vai para a área de rolagem. |
| `Enter` ou `Espaço` | No botão, dispara o mesmo `onRefresh` do gesto; durante a atualização ele fica `aria-disabled` e não repete. |
| `↑` ou `↓` ou `Page Up` ou `Page Down` | Com o foco na área de rolagem, rolam o conteúdo (comportamento nativo). |

## Acessibilidade

- A área de rolagem é `role="region"`, focável, com `aria-busy` durante a atualização; troque o nome genérico de `label` (padrão “Content”) pelo nome da lista.
- Uma região `role="status"` anuncia “Refreshing” e “Updated” (fixos em inglês no código), e o indicador visual é `aria-hidden`.

## Movimento

- O conteúdo segue o dedo 1:1 no começo e com resistência crescente até `maxPull`; o indicador aparece, cresce, a seta vira e, passado `threshold`, ele estica numa cápsula na cor de destaque.
- Ao soltar depois do limite, o conteúdo fica parado a até 56 px enquanto o indicador gira; quando a Promise termina, um visto aparece por 0,65 s e tudo volta com uma mola sem ultrapassagem.
- Com “reduzir movimento”, as voltas viram saltos, os ícones só esmaecem e o giro fica mais lento (2,4 s por volta).

## Comportamento responsivo

- Ocupa a altura do pai por padrão; se o pai não tiver altura definida, passe `height` para a área poder rolar.
- `overscroll-behavior` impede que o puxão passe para a página e dispare o recarregar do próprio navegador no celular.

## Desempenho

- O puxão anima um único valor de movimento (transform), sem re-render do React a cada quadro; o toque usa um listener não passivo para poder bloquear a rolagem só durante o gesto.

## Notas para IA

- Importe de `@/components/ryan-ui/pull-to-refresh/pull-to-refresh`. `onRefresh` deve devolver uma Promise: o indicador gira até ela terminar; sem Promise, gira 0,6 s.
- Dê altura ao componente (`height` ou um pai com altura) e ponha a lista dentro dele: ele mesmo é a área que rola.
- No desktop, arrastar com o mouse não é óbvio; mantenha também um botão visível que chama a mesma função e mostre o estado com `refreshing`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/pull-to-refresh · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
