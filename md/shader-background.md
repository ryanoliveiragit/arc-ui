# Shader background

> Fundo animado em canvas: um campo de ruído que flui na cor de destaque e pausa quando sai da tela.

- Tipo: componente (categoria Especial), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/shader-background
- Descrição original (inglês): An animated WebGL backdrop: a flowing noise field tinted with the accent that pauses off screen, holds still under reduced motion and falls back to a flat surface.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/shader-background.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/shader-background.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/shader-background.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/shader-background.json`. Caminho do registro, relativo ao endereço do site: `r/shader-background.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/shader-background/shader-background.tsx`
  - `components/ryan-ui/shader-background/shader-background.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/shader-background.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- O fundo de uma seção de destaque, como o hero de uma landing page ou uma tela de login, com movimento lento na cor de destaque.
- Fundos que devem seguir tema claro e escuro e a cor de destaque sem configuração: as cores vêm dos tokens e são relidas quando o tema muda.

## Quando não usar

- Atrás de texto longo, tabelas ou formulários, um fundo que se mexe atrapalha a leitura; use uma superfície lisa.
- Use [`hero-section`](hero-section.md) quando precisa do hero inteiro pronto, com título, botões e ilustrações, e não só do fundo.
- Como fundo de cada cartão numa lista ou grade ele não serve: cada instância é um canvas WebGL próprio.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { ShaderBackground } from "@/components/ryan-ui/shader-background/shader-background";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Button } from "@/components/ryan-ui/button/button";
import type { DemoStage } from "./_kit";
import styles from "./shader-background.module.css";

export const stage: DemoStage = { layout: "fill", height: 480 };

const moods = [{ value: "calm", label: "Calm" }, { value: "flow", label: "Flow" }, { value: "rush", label: "Rush" }];
const speeds: Record<string, number> = { calm: 0.45, flow: 1, rush: 2.6 };

export default function ShaderBackgroundDemo() {
  const [mood, setMood] = useState("flow");
  const [paused, setPaused] = useState(false);

  return (
    <ShaderBackground className={styles.hero} speed={speeds[mood] ?? 1} paused={paused}>
      <div className={styles.copy}>
        <p className={styles.kicker}>Tidewater Cloud</p>
        <h2 className={styles.title}>Deploys that stay out of your way</h2>
        <p className={styles.lead}>Push a branch and get a preview in seconds. The background is a live shader tinted with your accent color.</p>
        <div className={styles.actions}>
          <Button>Start a project<ArrowRight size={16} aria-hidden="true" /></Button>
          <Button variant="secondary" onClick={() => setPaused(value => !value)} aria-pressed={paused}>
            {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            {paused ? "Resume" : "Pause"}
          </Button>
        </div>
        <SegmentedControl label="Flow speed" options={moods} value={mood} onValueChange={setMood} />
      </div>
    </ShaderBackground>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `ShaderBackground`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `speed` | `number` | `1` | Flow speed multiplier. 1 is a calm drift; 0 freezes the field. |
| `scale` | `number` | `1` | Zoom of the noise field. Larger values show finer, busier detail. |
| `intensity` | `number` | `0.7` | How strongly the accent tints the field, from 0 (barely there) to 1. |
| `paused` | `boolean` | `false` | Holds the current frame. The field resumes from the same place. |
| `quality` | `number` | `0.75` | Render resolution as a fraction of the display pixels, from 0.25 to 1. The field is soft, so a lower value costs less and rarely shows. |
| `children` | `ReactNode` | — | Content shown above the field. |
| `className` | `string` | — | Extra class for the root element. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | — | Também aceita as props deste tipo. |

## Acessibilidade

- O canvas é `aria-hidden` e não recebe ponteiro; o conteúdo vem em `children`, numa camada acima, com a semântica que você der.
- O campo mistura o fundo da página com manchas na cor de destaque; confira o contraste do texto por cima e reduza `intensity` se precisar.

## Movimento

- Um campo de ruído dobrado sobre si mesmo flui devagar, como líquido; `speed` muda o ritmo (0 congela), `scale` o tamanho do detalhe e `intensity` a força do destaque.
- O canvas aparece com um esmaecer de 0,48 s quando o primeiro quadro fica pronto; antes disso, e sem WebGL, fica a superfície lisa de `--background`.
- Com “reduzir movimento”, o campo fica parado num quadro fixo e o esmaecer inicial é desligado; `paused` congela o quadro atual e retoma do mesmo ponto.

## Comportamento responsivo

- Ocupa o tamanho do próprio elemento, com pelo menos 12 rem de altura, e redesenha quando ele muda de tamanho.

## Desempenho

- O laço de `requestAnimationFrame` só roda com o fundo na tela, a aba visível, sem `paused` e com `speed` diferente de 0; parado, ele desenha uma vez e não gasta mais.
- `quality` (padrão 0,75) reduz os pixels desenhados, com densidade limitada a 2×; cada instância é um contexto WebGL próprio, então use poucos por página.

## Notas para IA

- Importe `ShaderBackground` de `@/components/ryan-ui/shader-background/shader-background` e ponha o conteúdo como filho; defina a altura com `className` ou deixe o conteúdo definir (mínimo de 12 rem).
- As cores vêm de `--background`, `--surface-muted` e `--accent`; para outro tom, mude esses tokens num ancestral em vez de editar o shader.
- Ofereça um botão de pausa ligado a `paused` quando o fundo fica muito tempo na tela, como no demo.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/shader-background · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
