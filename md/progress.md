# Progress

> Barra que mostra quanto de uma tarefa conhecida já foi concluído.

- Tipo: componente (categoria Feedback)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/progress
- Descrição original (inglês): Show how much of a known task is complete.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/progress.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/progress.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/progress.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/progress.json`. Caminho do registro, relativo ao endereço do site: `r/progress.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/progress/progress.tsx`
  - `components/ryan-ui/progress/progress.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/progress.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Uma tarefa com fim conhecido, como envio de arquivo, importação ou processamento em etapas, com o número ao lado (`showValue`).
- Medidas de preenchimento que não são tempo, como perfil 72% completo ou 18 de 50 GB usados (`value` e `max`).
- Quando o fim merece um sinal: em 100% a barra assume a cor de sucesso e um visto aparece ao lado do número.

## Quando não usar

- Use [`loader`](loader.md) quando não dá para saber quanto falta; esta barra não tem modo indeterminado.
- Use [`usage-meter`](usage-meter.md) para uma cota dividida por categorias, com limite e aviso de quase cheio.
- Use [`toast-progress`](toast-progress.md) para acompanhar uma tarefa em segundo plano sem ocupar espaço na página.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useEffect, useState } from "react";
import { Progress } from "@/components/ryan-ui/progress/progress";
import { Button } from "@/components/ryan-ui/button/button";
import { Row, Stack } from "./_kit";

export default function ProgressDemo() {
  const [value, setValue] = useState(8);
  const [running, setRunning] = useState(true);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setValue(v => (v >= 100 ? (setRunning(false), 100) : Math.min(100, v + 7))), 700);
    return () => window.clearInterval(timer);
  }, [running]);
  return (
    <Stack gap={6} width={420}>
      <Progress label="Uploading Q3-report.pdf" value={value} showValue />
      <Row>
        <Button size="sm" variant="secondary" onClick={() => { setValue(0); setRunning(true); }}>Restart upload</Button>
        <Button size="sm" variant="ghost" onClick={() => setRunning(r => !r)}>{running ? "Pause" : "Resume"}</Button>
      </Row>
      <Progress label="Profile completeness" value={72} showValue />
      <Progress label="Storage used" value={18} max={50} showValue />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Progress`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` | `number` | `0` | — |
| `max` | `number` | `100` | — |
| `label` | `string` | — | — |
| `showValue` | `boolean` | `false` | — |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | — | Também aceita as props deste tipo, menos `children`. |

## Acessibilidade

- É `role="progressbar"` com `aria-valuenow`, `aria-valuemax` e `aria-valuetext` em porcentagem; o nome vem de `label` e, sem ele, é o genérico “Progress”.
- Passe sempre `label` dizendo o que avança (“Enviando relatório.pdf”): ele é o nome acessível e também o texto visível acima da barra.

## Movimento

- Uma única mola sem ultrapassagem move o preenchimento e conta o número, então os dois sempre batem; o preenchimento desliza da esquerda em vez de esticar, e a ponta arredondada mantém a forma.
- Ao chegar a 100%, o visto entra com um pequeno atraso ao lado do número e a cor muda para a de sucesso; trocar `label` faz o texto novo subir com um leve desfoque.
- Com “reduzir movimento”, a barra salta para o valor, o rótulo só esmaece e a cor muda sem transição.

## Notas para IA

- Importe de `@/components/ryan-ui/progress/progress`. `value` vai de 0 a `max` (padrão 100) e é limitado a esse intervalo; não há modo indeterminado.
- Ocupa toda a largura do pai, então dê largura ao contêiner. Atualize `value` à vontade: cada mudança só redireciona a mola.
- Com `max`, o número mostrado continua em porcentagem (18 de 50 vira 36%); se quiser “18 de 50 GB”, escreva isso em `label`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/progress · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
