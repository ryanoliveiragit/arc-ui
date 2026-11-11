# Alert

> Uma mensagem persistente que ajuda a pessoa a se recuperar de um problema ou seguir em frente.

- Tipo: componente (categoria Feedback)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/alert
- Descrição original (inglês): A persistent message that helps people recover or continue.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/alert.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/alert.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/alert.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/alert.json`. Caminho do registro, relativo ao endereço do site: `r/alert.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/alert/alert.tsx`
  - `components/ryan-ui/alert/alert.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/alert.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um problema que a pessoa precisa resolver para seguir, como pagamento recusado ou armazenamento quase cheio, mostrado no lugar onde ele acontece.
- Uma mensagem que muda de estado no mesmo lugar, como uma verificação que vai de `info` para `success`: o ícone se transforma e a altura acompanha o texto novo com uma mola.
- Avisos que a pessoa pode dispensar (`onDismiss`): ao sumir, o alerta recolhe a altura e o conteúdo de baixo sobe sem pular.

## Quando não usar

- Use [`toast`](toast.md) para confirmar uma ação concluída em segundo plano, que não pede nada da pessoa.
- Use [`announcement-bar`](announcement-bar.md) para um recado do site inteiro no topo da página, como uma promoção ou um lançamento.
- Use [`dialog`](dialog.md) quando a pessoa precisa decidir algo antes de continuar.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { Alert } from "@/components/ryan-ui/alert/alert";
import { Button } from "@/components/ryan-ui/button/button";
import { Row, Stack } from "./_kit";

export default function AlertDemo() {
  const [open, setOpen] = useState(true);
  return (
    <Stack gap={4} width={480}>
      <Alert tone="danger" title="Payment failed" open={open} onDismiss={() => setOpen(false)}>
        Your card ending in 4242 was declined. Update your billing details to keep your Pro plan active.
      </Alert>
      {!open && <Row><Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Show the alert again</Button></Row>}
      <Alert tone="warning" title="Storage almost full">You have used 92% of your 50 GB. Archive old projects or upgrade.</Alert>
      <Alert tone="success" title="Domain verified">acme-studio.com now points to your workspace.</Alert>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Alert`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `tone` | `"info" \| "success" \| "warning" \| "danger"` | — | — |
| `title` (obrigatória) | `string` | — | — |
| `children` | `ReactNode` | — | — |
| `open` | `boolean` | — | Controls presence. Hiding the alert collapses its height and fades it out. |
| `onDismiss` | `() => void` | — | Shows a dismiss button. An uncontrolled alert collapses first, then calls this. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | — | Também aceita as props deste tipo. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `AlertTone` | `"info" \| "success" \| "warning" \| "danger"` |

## Acessibilidade

- O tom `danger` usa `role="alert"`, que interrompe o leitor de tela; os outros tons usam `role="status"`, lido sem interromper. Reserve `danger` para o que é urgente.
- O ícone é decorativo (`aria-hidden`), então o título precisa dizer o que aconteceu; ao trocar título ou texto, a cópia que sai fica oculta e só o texto atual é lido.
- O botão de fechar é um `<button>` nativo com `aria-label` fixo em inglês (`Dismiss: <título>`); num site em português, ajuste esse texto no arquivo copiado.

## Movimento

- Trocar `tone` transforma o ícone no lugar (o antigo encolhe com leve desfoque e o novo cresce), e um título ou texto novo sobe enquanto o anterior sai por cima.
- A coluna de texto anima a altura com uma mola sem ultrapassagem logo depois de uma troca de conteúdo; mudanças passivas, como redimensionar a janela, seguem na hora.
- Com `open` ou `onDismiss`, aparecer e sumir recolhem a altura junto com o esmaecer; com “reduzir movimento”, o texto só esmaece e altura, entrada e saída mudam sem animação.

## Notas para IA

- Importe de `@/components/ryan-ui/alert/alert`; `title` é obrigatório e os filhos viram a descrição. Sem `open` e sem `onDismiss`, o alerta aparece sem animação de entrada (trocas de tom e texto ainda animam).
- Controlado: passe `open` e, em `onDismiss`, ponha `open` em `false`. Sem `open`, o próprio alerta se recolhe ao fechar e só depois chama `onDismiss`.
- Escolha `tone` pelo efeito: `danger` só para erro que bloqueia, porque é anunciado na hora; `warning` para risco próximo; `success` e `info` para o resto.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/alert · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
