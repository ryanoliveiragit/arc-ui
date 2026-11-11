# Collapsible

> Uma região que abre e fecha no lugar, com altura em mola, conteúdo que entra em foco e seta que gira.

- Tipo: componente (categoria Revelação), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/collapsible
- Descrição original (inglês): One region that opens in place: the height follows on a spring, the content fades in from a small blur and the chevron turns; controlled or uncontrolled.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/collapsible.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/collapsible.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/collapsible.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/collapsible.json`. Caminho do registro, relativo ao endereço do site: `r/collapsible.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/collapsible/collapsible.tsx`
  - `components/ryan-ui/collapsible/collapsible.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/collapsible.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Configurações avançadas ao lado de um título, como opções de build, com um resumo em `hint` que muda conforme o estado.
- “Mostrar mais” abaixo de uma lista curta, com a variante `plain` e o gatilho colocado depois do conteúdo.
- Formulários com um bloco opcional: o conteúdo continua montado quando fechado, então os campos guardam o valor.

## Quando não usar

- Use [`accordion`](accordion.md) para um conjunto de seções relacionadas em que só uma fica aberta por vez.
- Use [`expandable-text`](expandable-text.md) para um parágrafo longo cortado em poucas linhas.
- Use [`popover`](popover.md) quando o detalhe deve flutuar sobre a página em vez de empurrar o conteúdo abaixo.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ryan-ui/collapsible/collapsible";
import Switch from "@/components/ryan-ui/switch/switch";
import { Caption, Stack } from "./_kit";
import styles from "./collapsible.module.css";

const settings = [
  { name: "Framework", value: "Vite 8" },
  { name: "Node version", value: "22.x" },
  { name: "Build command", value: "pnpm build" },
  { name: "Output folder", value: "dist" },
];

const earlier = ["Fix avatar upload on slow networks", "Raise the export limit to 50,000 rows", "Remember the last used workspace"];

export default function CollapsibleDemo() {
  const [open, setOpen] = useState(true);
  const [cache, setCache] = useState(true);
  const [more, setMore] = useState(false);

  return (
    <Stack gap={5} width={440}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger icon={<SlidersHorizontal size={16} />} hint={open ? "Applies to every new deployment" : "Vite 8, Node 22, cache " + (cache ? "on" : "off")}>Build settings</CollapsibleTrigger>
        <CollapsibleContent>
          <dl className={styles.settings}>
            {settings.map(row => <div key={row.name} className={styles.row}><dt>{row.name}</dt><dd>{row.value}</dd></div>)}
          </dl>
          <Switch label="Reuse the dependency cache" checked={cache} onCheckedChange={setCache} />
        </CollapsibleContent>
      </Collapsible>

      <Collapsible variant="plain" open={more} onOpenChange={setMore}>
        <div className={styles.release}>
          <span className={styles.version}>v4.2</span>
          <span>Add scheduled exports for reports</span>
        </div>
        <CollapsibleContent className={styles.more}>
          <ul className={styles.changes}>{earlier.map(change => <li key={change}>{change}</li>)}</ul>
        </CollapsibleContent>
        <CollapsibleTrigger>{more ? "Hide earlier changes" : "Show 3 more changes"}</CollapsibleTrigger>
      </Collapsible>
      <Caption>Both are controlled: the hint and the label follow the open state.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Collapsible`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Whether the region is open. Pass it together with `onOpenChange` to control the state yourself. |
| `defaultOpen` | `boolean` | `false` | Initial state when uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | — | Called with the next state whenever the trigger is used. |
| `disabled` | `boolean` | `false` | Keeps the current state and ignores the trigger. |
| `variant` | `"card" \| "plain"` | `"card"` | "card" draws one bordered surface around the trigger and the content; "plain" leaves both bare for your own layout. |
| `className` | `string` | — | Extra class for the root element. |
| `children` (obrigatória) | `ReactNode` | — | A `CollapsibleTrigger`, a `CollapsibleContent`, and anything that should stay visible between them. |

### `CollapsibleTrigger`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `hint` | `ReactNode` | — | Short supporting text shown under the label, such as a summary of what is inside. |
| `icon` | `ReactNode` | — | Leading icon or avatar. |
| `hideChevron` | `boolean` | `false` | Removes the chevron, for triggers that carry their own affordance. |
| `className` | `string` | — | Extra class for the button. |
| `children` (obrigatória) | `ReactNode` | — | The label. |
| `...props` | `ButtonHTMLAttributes<HTMLButtonElement>` | — | Também aceita as props deste tipo, menos `type`. |

### `CollapsibleContent`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `className` | `string` | — | Extra class for the padded inner element that holds the content. |
| `children` (obrigatória) | `ReactNode` | — | The content that opens and closes. It stays mounted, so fields inside keep their values. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No gatilho, abre ou fecha a região. |

## Acessibilidade

- O gatilho é um `<button>` com `aria-expanded` e `aria-controls`; o conteúdo é uma `region` nomeada pelo gatilho.
- Depois de fechar, a região recebe `visibility: hidden` e sai da ordem de Tab e da árvore de acessibilidade, embora continue montada.
- Com `disabled` no `Collapsible`, o gatilho fica desativado e o estado atual é mantido; ícone e seta ficam ocultos para o leitor de tela.

## Movimento

- A altura acompanha o conteúdo numa mola sem ultrapassagem, e o conteúdo sobe 8 px saindo de um desfoque de 4 px enquanto aparece.
- A seta gira 180° numa mola curta; um novo clique no meio da animação inverte o movimento a partir de onde ele está.
- Com “reduzir movimento” ligado, a região abre e fecha na hora e as transições de cor e borda são desligadas.

## Desempenho

- O conteúdo fica montado mesmo fechado, então é renderizado desde o início; numa página com muitos `Collapsible` de conteúdo pesado, todo esse conteúdo existe ao mesmo tempo.

## Notas para IA

- Monte as três partes: `Collapsible` por fora, `CollapsibleTrigger` e `CollapsibleContent` dentro; fora de um `Collapsible`, as partes lançam erro.
- Para controlar, passe `open` com `onOpenChange`; um `onClick` no gatilho que chama `preventDefault()` cancela a troca.
- `variant="card"` (padrão) desenha uma superfície com borda; `plain` deixa gatilho e conteúdo sem moldura. Importe de `@/components/ryan-ui/collapsible/collapsible`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/collapsible · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
