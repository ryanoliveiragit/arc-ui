# Logo marquee

> Faixa de logos de clientes que desliza sem parar e pausa quando você aponta.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/logo-marquee
- Descrição original (inglês): A quiet, continuously moving row of brand marks with a pause control.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/logo-marquee.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/logo-marquee.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/logo-marquee.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/logo-marquee.json`. Caminho do registro, relativo ao endereço do site: `r/logo-marquee.json`.

- Pacotes npm: `lucide-react`, `motion`
- Usa outros itens do ryan-ui (vêm junto na instalação): [Button](button.md)
- Arquivos, depois de instalados:
  - `components/ryan-ui/blocks/logo-marquee/logo-marquee.tsx`
  - `components/ryan-ui/blocks/logo-marquee/logo-marquee.module.css`
  - `components/ryan-ui/button/button.tsx`
  - `components/ryan-ui/button/button.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/logo-marquee.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Faixa de prova social numa landing page: clientes, integrações ou ferramentas compatíveis passando em linha contínua.
- Quando há marcas suficientes para uma cópia da lista ser mais larga que a seção e nenhuma delas precisa de destaque ou de link.

## Quando não usar

- Use [`marquee`](marquee.md) quando o conteúdo que rola não é uma lista de marcas ou quando precisa controlar velocidade, direção ou rolagem vertical.
- Com poucas marcas, prefira uma grade estática: se uma cópia da lista for mais estreita que a seção, o laço não fecha e aparece um vazio no fim.
- Se cada logo precisa ser um link ou abrir um caso de cliente, este bloco não serve: os itens são só símbolo e nome, sem interação.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import LogoMarquee from "@/components/ryan-ui/blocks/logo-marquee/logo-marquee";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "fill", frame: true, height: 520 };

export default function LogoMarqueeDemo() {
  // The band is a page section: centered in the frame with a page margin around it, not glued to the top edge.
  return (
    <div style={{ display: "grid", minHeight: "100dvh", alignContent: "center", padding: "var(--space-8) var(--space-6)" }}>
      <LogoMarquee />
    </div>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `LogoMarquee`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `title` | `string` | `"Good work moves between tools"` | — |
| `description` | `string` | `"From the first idea to the final handoff, a …` | — |
| `brands` | `LogoMarqueeBrand[]` | `exampleBrands` | — |
| `tone` | `"color" \| "mono"` | `"color"` | `color` shows each mark in its official colors; `mono` draws every mark in the text color. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `LogoMarqueeTone` | `"color" \| "mono"` |

#### `LogoMarqueeBrand`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` (obrigatória) | `string` | — |
| `icon` (obrigatória) | `string` | Monochrome SVG, drawn as a mask in the text color. |
| `color` | `string` | Single brand color for the mark in color tone. Leave out for brands whose mark is black or white. |
| `colorIcon` | `string` | Full color SVG for multicolor marks, used in color tone instead of `icon`. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No botão “Pause” ou “Play”, pausam ou retomam o movimento da faixa. |

## Acessibilidade

- A faixa é uma `role="region"` nomeada, a cópia duplicada da lista fica com `aria-hidden` e os símbolos são decorativos: o nome de cada marca é texto real.
- O botão de pausa tem `aria-label` que muda entre pausar e retomar, e uma região `aria-live="polite"` anuncia “Motion paused”.
- Os nomes acessíveis da região e do botão estão fixos em inglês no arquivo (“Illustrative tool logos”, “Pause logo motion”); ajuste-os ao trocar as marcas.

## Movimento

- A faixa desliza para a esquerda em laço contínuo de 39 s com animação CSS linear; passar o mouse sobre ela ou acionar o botão congela o movimento onde ele está.
- Com “reduzir movimento” ligado, a animação é removida, as marcas viram uma lista centralizada que quebra em linhas, a cópia duplicada some e o botão de pausa é escondido.

## Comportamento responsivo

- Uma container query da seção (até 639 px) empilha título e descrição, reduz o tipo e aproxima as marcas.

## Desempenho

- O movimento é uma única animação CSS de `transform` na faixa, sem JavaScript por quadro; cada símbolo é pintado como máscara CSS a partir da URL do SVG, então use arquivos pequenos.

## Notas para IA

- Passe `brands` com `name` e `icon` (URL de um SVG monocromático, usado como máscara); `color` pinta o símbolo no tom `color` e `colorIcon` troca a máscara por uma imagem colorida.
- As marcas padrão são formas abstratas de exemplo, não logos reais; a duração do laço é fixa em 39 s, então listas longas passam mais rápido.
- `tone="mono"` desenha tudo na cor do texto; não há prop `className`, e o bloco depende de `button`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/logo-marquee · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
