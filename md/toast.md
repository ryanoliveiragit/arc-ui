# Toast

> Aviso rápido e discreto que aparece, some sozinho e pode ser dispensado com um gesto.

- Tipo: componente (categoria Feedback)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/toast
- Descrição original (inglês): Brief confirmation for a completed background action.
- Versões: Padrão (este item), Pilha ([`toast-stack`](toast-stack.md)), Com ação ([`toast-action`](toast-action.md)), Progresso ([`toast-progress`](toast-progress.md))

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/toast.json`. Caminho do registro, relativo ao endereço do site: `r/toast.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/toast/toast.tsx`
  - `components/ryan-ui/toast/toast.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/toast.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Confirmar uma ação que deu certo e não pede mais nada: rascunho salvo, link copiado, convite enviado.
- Um único aviso por vez, num lugar que você controla, com `open` e `onOpenChange` ligados ao estado da tela.
- Telas de toque em que deslizar o aviso para o lado é o jeito natural de dispensar.

## Quando não usar

- Use [`toast-action`](toast-action.md) quando o aviso oferece desfazer ou outra ação; o tempo dele pausa com mouse e foco.
- Use [`toast-stack`](toast-stack.md) para vários avisos seguidos ou de tipos diferentes (erro, aviso, carregando); este só mostra o visto de sucesso.
- Use [`alert`](alert.md) para erros e avisos que precisam ficar na tela até a pessoa agir.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import Toast from "@/components/ryan-ui/toast/toast";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Stack } from "./_kit";

export default function ToastDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Stack gap={5} align="center" width={420} style={{ minHeight: 220 }}>
      <Button onClick={() => setOpen(true)}>Save draft</Button>
      <div style={{ minHeight: 84, width: "100%", display: "grid", justifyItems: "center", alignContent: "start" }}>
      <Toast open={open} onOpenChange={setOpen} title="Draft saved" description="Your changes to “Spring lookbook” are safe." duration={4000} />
      </div>
      <Caption>It closes by itself, or swipe it sideways.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Toast`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` (obrigatória) | `string` | — | — |
| `description` | `string` | — | — |
| `open` | `boolean` | `true` | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `duration` | `number` | `4500` | — |

## Acessibilidade

- É `role="status"` com `aria-live="polite"` e `aria-atomic`: o leitor de tela lê título e descrição juntos, sem interromper, e as cópias que saem ficam ocultas.
- O tempo não pausa com mouse nem com foco e não há atalho para chegar ao aviso; não ponha nele nada que a pessoa precise ler com calma ou acionar.
- O botão de fechar é um `<button>` com `aria-label` “Dismiss notification”, fixo em inglês no arquivo.

## Movimento

- Entra subindo 16 px de uma escala um pouco menor, com uma mola sem ultrapassagem, enquanto o visto se desenha; ao fechar, desce um pouco e esmaece.
- Arrastado para o lado, segue o dedo; passando de 80 px ou solto rápido, sai voando na direção do gesto com a velocidade da soltura, senão volta com uma mola.
- Com “reduzir movimento”, entrada e saída viram um esmaecer curto e o arraste fica desligado.

## Comportamento responsivo

- A largura vai até 26 rem e cabe no pai; o título fica numa linha e é cortado com reticências, então ponha detalhes longos em `description`, que quebra linha.

## Notas para IA

- Importe o padrão: `import Toast from "@/components/ryan-ui/toast/toast"` (não há exportação nomeada). Ele aparece onde é renderizado; posicione-o você, por exemplo num contêiner fixo no canto.
- O fechamento automático (`duration`, padrão 4500 ms) só funciona com `onOpenChange`; passe uma função estável, como o `setOpen` do `useState`, porque uma função nova a cada render reinicia a contagem.
- Para mostrar o aviso de novo, volte `open` para `true`; mudar `title` com ele aberto troca o texto no lugar, sem reiniciar o tempo.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/toast · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
