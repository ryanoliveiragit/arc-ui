# Button

> Uma ação clara e responsiva, com estados secundários discretos.

- Tipo: componente (categoria Ações)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/button
- Descrição original (inglês): A clear, responsive action with quiet secondary states.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/button.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/button.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/button.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/button.json`. Caminho do registro, relativo ao endereço do site: `r/button.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/button.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Qualquer ação única numa página, formulário ou diálogo: salvar, continuar, cancelar.
- Ações cujo rótulo muda no lugar, como “Salvar” virando “Salvo”: a largura acompanha o texto novo com uma mola, sem pulo.
- Trabalho assíncrono curto, em que um indicador de carregamento no próprio botão já é retorno suficiente (prop `loading`).

## Quando não usar

- Use [`action-button`](action-button.md) quando o botão precisa mostrar sozinho os estados de pendente e concluído depois de uma ação assíncrona.
- Use [`split-button`](split-button.md) quando a ação principal tem alternativas próximas num menu.
- Use [`hold-to-confirm`](hold-to-confirm.md) para ações destrutivas que pedem mais que um clique.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import { ArrowRight, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Row, Stack } from "./_kit";

export default function ButtonDemo() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaving(true);
    window.setTimeout(() => { setSaving(false); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }, 1400);
  };

  return (
    <Stack gap={8} align="center">
      <Row justify="center">
        <Button onClick={save} loading={saving}>{saved ? "Saved" : "Save changes"}</Button>
        <Button variant="secondary"><Download size={16} aria-hidden="true" />Export</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="danger"><Trash2 size={16} aria-hidden="true" />Delete</Button>
      </Row>
      <Row justify="center">
        <Button size="sm" variant="secondary">Small</Button>
        <Button size="md" variant="secondary">Medium</Button>
        <Button size="lg" variant="secondary">Large<ArrowRight size={16} aria-hidden="true" /></Button>
        <Button variant="secondary" disabled>Disabled</Button>
      </Row>
      <Caption>Press “Save changes” to see the loading state and the label morph.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Button`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` | — |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | — |
| `loading` | `boolean` | `false` | — |
| `...props` | `ButtonHTMLAttributes<HTMLButtonElement>` | — | Também aceita as props deste tipo, menos `onDrag`, `onDragEnd`, `onDragStart` e `onAnimationStart`. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `ButtonVariant` | `"primary" \| "secondary" \| "ghost" \| "danger"` |
| `ButtonSize` | `"sm" \| "md" \| "lg"` |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Acionam o botão; com `loading`, o acionamento é ignorado. |
| `Tab` | Leva o foco ao próximo controle; o contorno de foco só aparece com teclado (`:focus-visible`, regra do `foundation.css`). |

## Acessibilidade

- É um `<button>` nativo: papel, foco e ativação por teclado vêm do navegador.
- Durante `loading` o botão recebe `aria-busy` e `aria-disabled`, continua focável e mantém o rótulo no DOM para leitores de tela.
- Num botão só com ícone, passe `aria-label` com o nome da ação.

## Movimento

- A pressão reduz levemente a escala do botão; âncoras de menus e popovers não escalam, para o painel medir o tamanho certo.
- Quando o conteúdo muda, a largura anima com uma mola sem ultrapassagem e o rótulo troca com um esmaecer curto.
- Com “reduzir movimento”, a escala da pressão e a mola da largura são desligadas, o rótulo troca com um esmaecer de 0,12 s e o indicador de carregamento não gira.

## Comportamento responsivo

- O rótulo não quebra linha (`white-space: nowrap`); em telas estreitas prefira rótulos curtos ou o tamanho `sm`.
- As alturas mínimas vêm dos tokens `--control-height-sm`, `-md` e `-lg`, então acompanham o resto dos controles.

## Desempenho

- A medição da largura do rótulo usa um observador por botão; é barato, mas evite centenas deles numa lista longa.

## Notas para IA

- Escolha padrão para uma ação única; para uma fileira de ações com ícones prefira `floating-button-group` ou `button-group`, e com alternativas próximas, `split-button`.
- Passe o rótulo que muda (Salvar → Salvo) como filho para ganhar a animação de largura sem configuração; `loading` bloqueia o `onClick` sem desabilitar o botão.
- Variantes `primary` (padrão), `secondary`, `ghost` e `danger`, tamanhos `sm`, `md` e `lg`; o componente não define `type`, então dentro de um `<form>` passe `type="button"` quando a ação não envia.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/button · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
