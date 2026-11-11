# Loader

> Cinco indicadores de carregamento em três tamanhos, com rótulo lido por leitores de tela.

- Tipo: componente (categoria Feedback), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/loader
- Descrição original (inglês): A family of five loaders (spinner, dots, bars, pulse ring, orbit) in three sizes that share one box, color and accessible label.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/loader.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/loader.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/loader.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/loader.json`. Caminho do registro, relativo ao endereço do site: `r/loader.json`.

- Pacotes npm: nenhum além do React
- Arquivos, depois de instalados:
  - `components/ryan-ui/loader/loader.tsx`
  - `components/ryan-ui/loader/loader.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: não há pacotes para instalar.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/loader.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Uma espera curta sem progresso conhecido, como abrir uma fatura, enviar um formulário ou buscar resultados.
- Dentro de um botão ou de uma frase, com `size="sm"` e `tone="current"` para herdar a cor do texto.
- Esperas com sentido próprio: `dots` para “alguém está digitando”, `bars` para áudio carregando, `ring` para aguardar um sinal ao vivo e `orbit` para tarefas mais longas.

## Quando não usar

- Use [`progress`](progress.md) quando você sabe quanto falta: uma barra com número diz mais que um giro sem fim.
- Use [`skeleton`](skeleton.md) quando a espera é pelo conteúdo de uma área cujo formato você já conhece.
- Use [`loading-states`](loading-states.md) ou [`text-shimmer`](text-shimmer.md) para o “pensando” de interfaces de IA, com texto de status.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { Loader } from "@/components/ryan-ui/loader/loader";
import type { LoaderSize, LoaderVariant } from "@/components/ryan-ui/loader/loader";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Button } from "@/components/ryan-ui/button/button";
import { Row, Stack } from "./_kit";
import styles from "./loader.module.css";

const family: { variant: LoaderVariant; name: string; label: string }[] = [
  { variant: "spinner", name: "Spinner", label: "Loading invoice" },
  { variant: "dots", name: "Dots", label: "Maya is typing" },
  { variant: "bars", name: "Bars", label: "Buffering audio" },
  { variant: "ring", name: "Pulse ring", label: "Waiting for signal" },
  { variant: "orbit", name: "Orbit", label: "Building preview" },
];

const sizes = [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }];

export default function LoaderDemo() {
  const [size, setSize] = useState<LoaderSize>("lg");
  const [saving, setSaving] = useState(false);
  const save = () => { setSaving(true); window.setTimeout(() => setSaving(false), 2400); };

  return (
    <Stack gap={6} width={600} align="center">
      <SegmentedControl label="Loader size" options={sizes} value={size} onValueChange={value => setSize(value as LoaderSize)} />
      <ul className={styles.family}>
        {family.map(item => (
          <li key={item.variant} className={styles.tile}>
            <span className={styles.slot}><Loader variant={item.variant} size={size} label={item.label} /></span>
            <span className={styles.name}>{item.name}</span>
          </li>
        ))}
      </ul>
      <Row justify="center" gap={5}>
        <Button onClick={save} aria-busy={saving}>
          {saving ? <Loader size="sm" tone="current" label="Saving changes" /> : null}
          {saving ? "Saving" : "Save changes"}
        </Button>
        <Loader variant="dots" size="sm" showLabel label="Syncing 248 contacts" />
      </Row>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Loader`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `"spinner" \| "dots" \| "bars" \| "ring" \| "orbit"` | `"spinner"` | Which loader to draw. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Box size: 16 px, 24 px or 40 px. |
| `label` | `string` | `"Loading"` | What is loading. Screen readers announce it; it is hidden visually unless `showLabel` is set. |
| `showLabel` | `boolean` | `false` | Shows the label next to the loader. |
| `tone` | `"accent" \| "current"` | `"accent"` | "accent" draws in the accent color; "current" inherits the surrounding text color, for loaders inside buttons. |
| `speed` | `number` | `1` | Speed multiplier: 2 runs twice as fast, 0.5 at half speed. |
| `className` | `string` | — | Extra class for the root element. |
| `...props` | `HTMLAttributes<HTMLSpanElement>` | — | Também aceita as props deste tipo, menos `children`. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `LoaderVariant` | `"spinner" \| "dots" \| "bars" \| "ring" \| "orbit"` |
| `LoaderSize` | `"sm" \| "md" \| "lg"` |

## Acessibilidade

- A raiz é `role="status"` com `aria-live="polite"`, e `label` (padrão “Loading”) é o texto lido; o desenho é decorativo (`aria-hidden`).
- Escreva em `label` o que está carregando (“Salvando alterações”), não só “Carregando”; `showLabel` mostra o mesmo texto ao lado do desenho.
- Cada loader é uma região viva: evite vários ao mesmo tempo na tela e, dentro de um botão, marque o botão com `aria-busy`, como no demo.

## Movimento

- Tudo é animação CSS em laço: o arco do `spinner` estica e encolhe enquanto gira, os pontos fazem uma onda, as barras pulsam como um equalizador, o anel solta duas ondas e três satélites orbitam juntos.
- `speed` multiplica o ritmo de qualquer variante: 2 é o dobro da velocidade e 0,5 a metade.
- Com “reduzir movimento”, nada se desloca: cada variante para numa forma legível e o desenho inteiro só pulsa a opacidade devagar, para ainda dizer “trabalhando”.

## Desempenho

- A animação é só CSS (keyframes), sem timers nem re-render do React, então vários loaders na página não custam JavaScript.

## Notas para IA

- Importe de `@/components/ryan-ui/loader/loader`. As props que importam são `variant`, `size` (`sm` 16 px, `md` 24 px, `lg` 40 px) e `label`; o quadrado é o mesmo em todas as variantes, então trocar não mexe no layout.
- Dentro de um botão, use `size="sm"` e `tone="current"` para herdar a cor do texto; o padrão `accent` pinta com a cor de destaque.
- Não há prop de atraso nem de visibilidade: renderize o loader só durante a espera e tire-o quando ela acabar.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/loader · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
