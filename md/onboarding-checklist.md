# Onboarding checklist

> Lista que guia um novo espaço de trabalho pela configuração, um passo de cada vez.

- Tipo: componente (categoria Feedback)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/onboarding-checklist
- Descrição original (inglês): Guide a new workspace through setup, one step at a time.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/onboarding-checklist.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/onboarding-checklist.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/onboarding-checklist.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/onboarding-checklist.json`. Caminho do registro, relativo ao endereço do site: `r/onboarding-checklist.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/onboarding-checklist/onboarding-checklist.tsx`
  - `components/ryan-ui/onboarding-checklist/onboarding-checklist.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/onboarding-checklist.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- A configuração inicial de uma conta ou workspace, com três a oito passos que podem ser feitos em qualquer ordem.
- Passos que a própria interface executa: com `actionLabel` e um `onAction` assíncrono, o botão mostra carregando, marca o passo ao terminar e mostra a mensagem do erro se ele falhar.
- Um cartão de boas-vindas que a pessoa pode recolher (`defaultHidden`, `onHiddenChange`) e que, no fim, troca `title` por `doneTitle`.

## Quando não usar

- Use [`stepper`](stepper.md) quando a ordem é obrigatória, como num checkout em que uma etapa libera a próxima.
- Use [`todo-list`](todo-list.md) para mostrar o plano de um agente de IA avançando sozinho, sem a pessoa marcar nada.
- Use [`checkbox`](checkbox.md) para uma lista simples de tarefas, sem detalhes nem ações por item.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { OnboardingChecklist, type OnboardingStep } from "@/components/ryan-ui/onboarding-checklist/onboarding-checklist";
import { Stack } from "./_kit";

const steps: OnboardingStep[] = [
  { id: "create-workspace", title: "Create your workspace" },
  { id: "invite-team", title: "Invite your team", description: "Priya and Jonas are waiting.", actionLabel: "Send invites", onAction: () => {} },
  { id: "connect-github", title: "Connect GitHub", description: "Link the repository you want to sync.", actionLabel: "Connect", onAction: () => {} },
  { id: "two-factor", title: "Turn on two-factor sign-in" },
];

export default function OnboardingChecklistDemo() {
  // Remontar pelo key zera o estado interno do checklist.
  const [run, setRun] = useState(0);
  return (
    <Stack gap={4} width={440}>
      <OnboardingChecklist key={run} title="Set up Northwind" doneTitle="Northwind is ready" steps={steps} defaultCompleted={["create-workspace"]} />
      <button type="button" style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 6, padding: 0, border: 0, background: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "var(--text-sm)", fontFamily: "inherit", letterSpacing: "var(--tracking-body)" }} onClick={() => setRun(value => value + 1)}>
        <RotateCcw size={14} strokeWidth={1.75} aria-hidden="true" />
        Reset demo
      </button>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `OnboardingChecklist`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` (obrigatória) | `string` | — | — |
| `doneTitle` | `string` | `"You’re all set"` | Title once every step is done. |
| `steps` (obrigatória) | `OnboardingStep[]` | — | — |
| `defaultCompleted` | `string[]` | `[]` | — |
| `onCompletedChange` | `(completed: string[]) => void` | — | — |
| `defaultHidden` | `boolean` | `false` | — |
| `onHiddenChange` | `(hidden: boolean) => void` | — | — |
| `className` | `string` | — | — |

### Tipos exportados

#### `OnboardingStep`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `title` (obrigatória) | `string` | — |
| `description` | `string` | — |
| `actionLabel` | `string` | Label of the button that does the step. Without it, the step is checked off by hand. |
| `onAction` | `() => void \| Promise<void>` | Runs the step. Resolve to check it off; throw an Error to keep it open and show the error's message. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `↑` ou `↓` | Com o foco no título de um passo, vai para o título anterior ou o próximo, dando a volta no fim da lista. |
| `Home` ou `End` | Vai para o título do primeiro ou do último passo da lista. |
| `Enter` ou `Espaço` | No título, abre ou fecha os detalhes do passo; no círculo, marca ou desmarca; na ação, executa `onAction`. |

## Acessibilidade

- Cada círculo é um botão com `role="checkbox"` e `aria-checked`, nomeado pelo título do passo; o título abre os detalhes com `aria-expanded` e `aria-controls`.
- O anel é `role="progressbar"` (“N of M steps done”) e uma região `role="status"` anuncia cada passo feito ou desfeito; o erro de `onAction` aparece com `role="alert"`.
- Quando um passo com foco se recolhe, o foco vai para a ação do próximo passo aberto, e desmarcar no grupo de concluídos leva o foco ao círculo do passo que voltou.

## Movimento

- Ao marcar, o círculo se preenche do centro e o visto se desenha; o título ganha um risco que atravessa a linha e, depois de 0,72 s, o passo se recolhe para o grupo de concluídos.
- Linhas e painéis abrem e fecham a altura com uma mola sem ultrapassagem; o anel enche a cada passo, os números giram na direção da mudança e um visto aparece no anel quando tudo termina.
- Com “reduzir movimento”, as alturas mudam na hora com um esmaecer curto, risco e preenchimento aparecem sem transição e o giro do botão de ação para.

## Comportamento responsivo

- Num cartão com menos de 380 px (container query), o botão de esconder mostra só a seta e mantém o nome falado.

## Notas para IA

- Importe de `@/components/ryan-ui/onboarding-checklist/onboarding-checklist`. É não controlado: passe `defaultCompleted` com os ids já feitos e salve o progresso a partir de `onCompletedChange`.
- Em `onAction`, devolva uma Promise: resolver marca o passo; lançar `new Error("mensagem")` mantém o passo aberto com a mensagem. Sem `actionLabel`, o passo só é marcado à mão.
- Os textos fixos (“Setup progress”, “Hide”, “completed”, a mensagem de erro padrão) estão em inglês; traduza no arquivo copiado. Cada passo precisa de `id` estável.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/onboarding-checklist · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
