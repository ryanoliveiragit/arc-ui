# Announcement bar

> Faixa no topo que alterna mensagens, mostra contagem regressiva e recolhe com suavidade ao ser dispensada.

- Tipo: componente (categoria Feedback)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/announcement-bar
- Descrição original (inglês): A top banner that rotates messages, counts down, and collapses smoothly when dismissed.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/announcement-bar.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/announcement-bar.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/announcement-bar.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/announcement-bar.json`. Caminho do registro, relativo ao endereço do site: `r/announcement-bar.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/announcement-bar/announcement-bar.tsx`
  - `components/ryan-ui/announcement-bar/announcement-bar.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/announcement-bar.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um recado para o site inteiro no topo da página: promoção com prazo, versão nova ou evento ao vivo, com um link de ação.
- Duas a quatro mensagens que se revezam no mesmo espaço, com pausa ao passar o mouse ou focar e, com `controls`, botões de anterior, próximo e pausa.
- Campanhas que a pessoa fecha uma vez: com `id`, a dispensa fica salva em `localStorage` e a barra não volta; troque o `id` para mostrar uma campanha nova a todos.

## Quando não usar

- Use [`alert`](alert.md) para uma mensagem ligada a uma tela ou formulário específico, que ajuda a resolver um problema ali.
- Use [`toast`](toast.md) ou [`toast-stack`](toast-stack.md) para o resultado de algo que a pessoa acabou de fazer.
- Use [`countdown`](countdown.md) quando a contagem regressiva é o centro da página, como a tela de um lançamento, e não um detalhe numa faixa.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { AnnouncementBar } from "@/components/ryan-ui/announcement-bar/announcement-bar";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "fill", frame: true, height: 300 };

export default function AnnouncementBarDemo() {
  const [open, setOpen] = useState(true);
  const [sale] = useState(() => Date.now() + 2 * 86_400_000 + 5 * 3_600_000);
  return (
    <div>
      <AnnouncementBar
        controls
        interval={5000}
        open={open}
        onOpenChange={setOpen}
        messages={[
          { id: "sale", message: "Spring sale: 30% off annual plans.", countdown: { to: sale, label: "Ends in" }, action: { label: "Shop the sale", href: "#sale" } },
          { id: "release", message: "Version 4.2 is here with shared workspaces.", action: { label: "See what's new", href: "#release" } },
          { id: "event", message: "Join our live product tour on Thursday at 10 am PT.", action: { label: "Save your seat", href: "#event" } },
        ]}
      />
      <Stack gap={4} align="center" style={{ padding: "var(--space-8) var(--space-4)" }}>
        {!open && <Button variant="secondary" onClick={() => setOpen(true)}>Bring the bar back</Button>}
        <Caption>Messages rotate on their own; hover to pause, or use the arrows.</Caption>
      </Stack>
    </div>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `AnnouncementBar`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `messages` (obrigatória) | `Announcement[]` | — | — |
| `id` | `string` | — | Remembers dismissal under this id. Change the id to show a new campaign to everyone again. |
| `open` | `boolean` | — | Whether the bar is shown. Leave it out to let the component manage it. |
| `defaultOpen` | `boolean` | `true` | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `index` | `number` | — | Index of the visible message. |
| `defaultIndex` | `number` | `0` | — |
| `onIndexChange` | `(index: number) => void` | — | — |
| `interval` | `number` | `6000` | Milliseconds each message stays before the next one. Defaults to 6000. |
| `autoPlay` | `boolean` | `true` | Rotate automatically. Pauses on hover, focus, or a hidden tab, and is turned off when the visitor prefers reduced motion. Defaults to true. |
| `controls` | `boolean` | `false` | Show previous, next, and pause controls when there are several messages. Defaults to false: only the close button shows. |
| `dismissible` | `boolean` | `true` | — |
| `tone` | `"neutral" \| "inverted"` | `"neutral"` | — |
| `onAction` | `(announcement: Announcement) => void` | — | — |
| `onCountdownEnd` | `(announcement: Announcement) => void` | — | — |
| `label` | `string` | `"Announcements"` | Accessible name of the region. |
| `className` | `string` | — | — |

### Tipos exportados

#### `AnnouncementAction`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` (obrigatória) | `string` | — |
| `href` | `string` | — |
| `onClick` | `() => void` | — |

#### `Announcement`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | Stable id, reported to callbacks. |
| `message` (obrigatória) | `ReactNode` | — |
| `action` | `AnnouncementAction` | — |
| `countdown` | `{ to: Date \| string \| number; label?: string }` | Counts down to a moment, for example the end of a sale. |

### Outras exportações

- `clearAnnouncementDismissal` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` ou `Shift + Tab` | Percorre o link de ação e os botões de anterior, pausa, próximo e fechar; enquanto o foco estiver dentro da barra, a rotação fica parada. |

## Acessibilidade

- É uma `<section>` com `aria-label` (padrão “Announcements”); com mais de uma mensagem vira um carrossel (`aria-roledescription`) e cada mensagem é um grupo rotulado “N of M”.
- Enquanto gira sozinha, a área das mensagens fica com `aria-live="off"` para não falar a cada troca; parada por pausa, foco, mouse ou “reduzir movimento”, passa a `polite`.
- Os rótulos dos botões (“Previous announcement”, “Pause announcements”, “Dismiss”) e a leitura da contagem estão fixos em inglês; passe `label` em português e ajuste os demais no arquivo copiado.

## Movimento

- A próxima mensagem sobe de baixo com um leve desfoque enquanto a anterior sai por cima (voltar faz o caminho inverso), e a barra acompanha a altura da nova com uma mola sem ultrapassagem.
- O anel de pausa é o relógio da rotação: enche de forma linear durante `interval`, para onde está ao pausar e completa o resto ao retomar; na contagem, cada dígito que muda cai de cima.
- Fechar recolhe a altura com uma mola e a página sobe junto. Com “reduzir movimento”, a rotação automática é desligada, as mensagens só esmaecem e fechar vira um esmaecer curto.

## Comportamento responsivo

- Abaixo de 560 px de largura da própria barra (container query), a coluna que espelha os botões some e a mensagem passa a alinhar à esquerda em vez de centralizar.
- Mensagem, contagem e link quebram em linhas quando falta espaço (a contagem e o link não se partem por dentro), e a barra cresce até a nova altura com a mola.

## Desempenho

- Cada contagem acorda uma vez por segundo, alinhada ao segundo cheio; a rotação é uma animação linear que para com a aba oculta, o mouse em cima ou o foco dentro.

## Notas para IA

- Importe de `@/components/ryan-ui/announcement-bar/announcement-bar`; cada item de `messages` precisa de `id` estável. A barra fica no fluxo (não é fixa nem sticky): ponha-a acima do cabeçalho.
- Com `open` controlado, a dispensa é gravada em `localStorage` (havendo `id`), mas não é lida; para lembrar, deixe o estado com o componente. `clearAnnouncementDismissal(id)` apaga a dispensa, e a barra volta na próxima montagem.
- `controls` vem desligado (só o botão de fechar aparece). `countdown.to` passa por `new Date()`; use uma data ISO com fuso (`Z` ou `-03:00`) para não depender do fuso do visitante.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/announcement-bar · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
