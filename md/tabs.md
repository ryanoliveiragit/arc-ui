# Tabs

> Alterna entre conteúdos relacionados no mesmo contexto.

- Tipo: componente (categoria Revelação)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/tabs
- Descrição original (inglês): Switch between related content in the same context.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tabs.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tabs.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tabs.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/tabs.json`. Caminho do registro, relativo ao endereço do site: `r/tabs.json`.

- Pacotes npm: `@radix-ui/react-tabs`, `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/tabs/tabs.tsx`
  - `components/ryan-ui/tabs/tabs.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-tabs lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/tabs.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Vistas relacionadas do mesmo objeto, como Visão geral, Atividade, Membros e Cobrança de um projeto.
- Seções de configurações em que a pessoa olha uma de cada vez e o resto da página fica igual.
- Muitas abas num espaço estreito: a lista rola de lado, com esmaecimento nas bordas e botões de rolagem.

## Quando não usar

- Use [`segmented-control`](segmented-control.md) quando a troca é um modo ou filtro sem painel de conteúdo próprio.
- Use [`accordion`](accordion.md) quando a pessoa precisa ler várias seções em sequência, como numa página longa no celular.
- Use [`stepper`](stepper.md) para etapas em ordem que a pessoa percorre uma vez.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ryan-ui/tabs/tabs";
import { Stack } from "./_kit";

const p: React.CSSProperties = { margin: 0, color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" };

export default function TabsDemo() {
  return (
    <Stack width={480}>
      <Tabs defaultValue="overview">
        <TabsList aria-label="Project sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><p style={{ ...p, paddingTop: "var(--space-4)" }}>Atlas is on track for its March release. 38 of 46 tasks are complete and no blockers are open.</p></TabsContent>
        <TabsContent value="activity"><p style={{ ...p, paddingTop: "var(--space-4)" }}>Marcus merged “Offline sync” an hour ago. Jasmine commented on the checkout designs yesterday.</p><p style={{ ...p, paddingTop: "var(--space-3)" }}>Olivia closed 6 issues this week.</p></TabsContent>
        <TabsContent value="members"><p style={{ ...p, paddingTop: "var(--space-4)" }}>Eight people have access: 5 editors, 2 reviewers and 1 admin.</p></TabsContent>
        <TabsContent value="billing"><p style={{ ...p, paddingTop: "var(--space-4)" }}>Team plan, billed annually. Next invoice of $1,440 on March 3.</p></TabsContent>
      </Tabs>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Tabs`

Props: `ComponentPropsWithoutRef<typeof TabsPrimitive.Root>`

### `TabsList`

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### `TabsTrigger`

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### `TabsContent`

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Entra na lista pela aba ativa e, dela, vai para o painel. |
| `←` ou `→` | Movem o foco para a aba anterior ou seguinte e já a ativam, voltando à primeira depois da última. |
| `Home` ou `End` | Levam à primeira ou à última aba. |
| `Enter` ou `Espaço` | Ativam a aba em foco. |

## Acessibilidade

- Sobre o Tabs do Radix: `tablist`, abas com `aria-selected` e `aria-controls`, painéis `tabpanel` focáveis e ligados à aba, e `tabindex` móvel para o foco.
- Passe `aria-label` ao `TabsList` para nomear o conjunto; os botões de rolagem se chamam “Scroll tabs left” e “Scroll tabs right”, fixos em inglês no código.
- O painel que sai fica `inert` enquanto esmaece, sem receber cliques nem foco.

## Movimento

- O destaque da aba ativa desliza até a nova aba numa mola sem ultrapassagem, sempre dentro do mesmo `Tabs`.
- O painel novo entra 8 px a partir do lado da aba escolhida, o antigo sai rápido para o outro lado, e a altura vai da anterior à nova numa mola sem ultrapassagem.
- Com “reduzir movimento” ligado, o destaque salta, os painéis só esmaecem no lugar, a altura não anima e a rolagem da lista é instantânea.

## Comportamento responsivo

- Quando as abas não cabem, a lista rola de lado com esmaecimento nas bordas e botões de seta, e a aba ativa ou em foco é trazida para a vista.

## Notas para IA

- Passe `defaultValue`, ou `value` com `onValueChange`; sem eles nenhuma aba começa selecionada e nenhum painel aparece.
- Painéis inativos são desmontados e perdem o estado interno; com `forceMount` eles ficam montados, mas também visíveis, então esconda o inativo pelo `data-state="inactive"`.
- Monte `Tabs`, `TabsList` com um `TabsTrigger` por aba e um `TabsContent` com o mesmo `value` de cada aba. Importe de `@/components/ryan-ui/tabs/tabs`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/tabs · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
