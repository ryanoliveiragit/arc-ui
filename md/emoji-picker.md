# Emoji picker

> Seletor de emoji completo com busca instantânea, categorias sincronizadas à rolagem, tons de pele, emojis usados recentemente e uma grade virtualizada que se navega por inteiro pelo teclado.

- Tipo: componente (categoria Entradas), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/emoji-picker
- Descrição original (inglês): A full emoji picker with instant search, scroll-synced categories, skin tones, recently used emoji, and a virtualized, keyboard-navigable grid.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/emoji-picker.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/emoji-picker.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/emoji-picker.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/emoji-picker.json`. Caminho do registro, relativo ao endereço do site: `r/emoji-picker.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/emoji-picker/emoji-picker.tsx`
  - `components/ryan-ui/emoji-picker/emoji-picker.module.css`
  - `components/ryan-ui/emoji-picker/emoji-data.ts`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/emoji-picker.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Compositores de mensagem, caixas de comentário e entradas de chat, onde a pessoa espera o conjunto completo de emoji com busca.
- Escolher um emoji para um status, um projeto, um ícone de página ou um rótulo.
- Qualquer campo de texto que precise inserir emoji em posição exata do cursor, com seleção múltipla mantendo o painel aberto.

## Quando não usar

- Use reações ([`reactions`](reactions.md)) para um conjunto pequeno e fixo de respostas rápidas num post ou comentário.
- Use [`combobox`](combobox.md) ou [`select`](select.md) quando as escolhas são uma lista curta e conhecida.
- Não use como seletor de ícone: emoji é renderizado pelas fontes do sistema e muda de aparência entre plataformas, então não sirva como glifo visual definitivo de UI.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useRef, useState } from "react";
import { ArrowUp, SmilePlus } from "lucide-react";
import EmojiPicker from "@/components/ryan-ui/emoji-picker/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ryan-ui/popover/popover";
import { Room, demoStage, useQuietFirstOpen } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./emoji-picker.module.css";

export const stage: DemoStage = { height: 560 };

const MESSAGES = [
  { name: "Jordan Reyes", body: "Launch checklist is green. Shipping the pricing page at 3pm unless anyone objects.", from: "var(--tone-orchid)", to: "var(--tone-sky)" },
  { name: "Chloe Nguyen", body: "Copy is final and the screenshots are swapped in.", from: "var(--tone-green)", to: "var(--tone-violet)" },
] as const;

export default function EmojiPickerDemo() {
  // O preview já abre o picker sobre o composer, contido no palco: dá para ver o gatilho e o painel juntos.
  const quiet = useQuietFirstOpen();
  const [open, setOpen] = useState(true);
  const [text, setText] = useState("Looks great, ship it");
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (emoji: string, shift: boolean) => {
    const el = inputRef.current;
    if (el && typeof el.selectionStart === "number") {
      const start = el.selectionStart ?? text.length;
      const end = el.selectionEnd ?? text.length;
      setText(text.slice(0, start) + emoji + text.slice(end));
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + emoji.length, start + emoji.length);
      });
    } else {
      setText(text + emoji);
    }
    // Sem Shift o picker fecha; com Shift ele fica aberto para escolher vários.
    if (!shift) setOpen(false);
  };

  return (
    <Room above={232} below={8}>
      <div className={styles.chat}>
        {MESSAGES.map(m => (
          <div key={m.name} className={styles.msg}>
            <span className={styles.avatar} style={{ backgroundImage: `linear-gradient(135deg, ${m.from}, ${m.to})` }} aria-hidden="true" />
            <div className={styles.bubble}>
              <strong>{m.name}</strong>
              <p>{m.body}</p>
            </div>
          </div>
        ))}

        <div className={styles.composer}>
          <input ref={inputRef} className={styles.input} value={text} onChange={e => setText(e.target.value)} aria-label="Message" />
          <div className={styles.row}>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button type="button" className={styles.emojiBtn} aria-label="Add emoji">
                  <SmilePlus size={18} aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                container={demoStage()}
                side="top"
                align="start"
                sideOffset={8}
                onOpenAutoFocus={quiet}
                style={{ padding: 0, width: 352, height: 410 }}
              >
                <EmojiPicker storageKey="demo-emoji-picker" onSelect={(s, e) => pick(s.emoji, e.shiftKey)} />
              </PopoverContent>
            </Popover>
            <span className={styles.hint}>Shift picks several</span>
            <button type="button" className={styles.send} aria-label="Send">
              <ArrowUp size={16} strokeWidth={2.25} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Room>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `EmojiPicker`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `onSelect` | `(selection: EmojiSelection, event: MouseEvent \| KeyboardEvent) => void` | — | Called when an emoji is chosen by click, Enter, or Space. Check event.shiftKey to keep a popover open for several picks. |
| `skinTone` | `0 \| 1 \| 2 \| 3 \| 4 \| 5` | — | Controlled skin tone: 0 is the default yellow, 1 to 5 go light to dark. |
| `defaultSkinTone` | `0 \| 1 \| 2 \| 3 \| 4 \| 5` | — | Skin tone before anything has been stored. |
| `onSkinToneChange` | `(tone: SkinTone) => void` | — | Called when a tone is chosen in the tone menu. |
| `storageKey` | `string \| null` | `"arc-emoji-picker"` | localStorage key for recent emoji and the tone. Pass null to keep them in memory for this page only. Blocked storage falls back to memory automatically. |
| `recentLimit` | `number` | `27` | How many recently used emoji to keep. |
| `defaultRecent` | `readonly string[]` | `DEFAULT_RECENT` | Shown under Popular until something has been picked. |
| `columns` | `number` | — | Emoji per row. Defaults to as many 36px cells as fit, at least 6. |
| `autoFocus` | `boolean` | `false` | Focuses the search field on mount. Popovers and dialogs usually focus it already. |
| `searchPlaceholder` | `string` | `"Search emoji"` | Placeholder of the search field. |
| `label` | `string` | `"Emoji picker"` | Accessible name of the picker group. |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | — | Também aceita as props deste tipo, menos `onSelect` e `children`. |

### `ALL_EMOJI`

Flat, order-stable list used for search across categories.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `SkinTone` | `0 \| 1 \| 2 \| 3 \| 4 \| 5` |

#### `EmojiSelection`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `emoji` (obrigatória) | `string` | Chosen emoji with the active skin tone applied where the base takes one. |
| `base` (obrigatória) | `string` | Base sequence without a skin tone modifier. |
| `name` (obrigatória) | `string` | Display name of the emoji. |
| `skinTone` (obrigatória) | `0 \| 1 \| 2 \| 3 \| 4 \| 5` | Skin tone applied (0 = default). |

#### `EmojiEntry`

Compact built-in dataset: one line per emoji, `base|name|keywords…|tonePositions?`. Parsed once per page load and shared by every picker instance. Skin tone positions mark single-cluster emoji (hands, feet, people) that take a tone modifier; ZWJ sequences skip tones.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `base` (obrigatória) | `string` | The base sequence without a skin tone modifier; what gets stored as "recent". |
| `name` (obrigatória) | `string` | — |
| `keywords` (obrigatória) | `string` | — |
| `tonePositions` (obrigatória) | `number` | — |
| `lower` (obrigatória) | `string` | Precomputed lowercase haystack for search. |

#### `EmojiSection`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `name` (obrigatória) | `string` | — |
| `icon` (obrigatória) | `string` | — |
| `items` (obrigatória) | `EmojiEntry[]` | — |

### Outras exportações

- `applyTone` (função)
- `EMOJI_SECTIONS` (valor)
- `DEFAULT_RECENT` (valor)
- `TONE_HAND` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | Percorre busca → barra de categorias → grade → botão de tom de pele; cada célula é alcançada pelas setas dentro da grade (tabindex roving). |
| `Setas` ou `Enter` ou `Espaço` | Na grade, movem a célula destacada (↑ na primeira linha volta para a busca); Enter/Espaço escolhem. Na barra de categorias, ←/→ navegam entre abas e Enter/Espaço saltam à seção. |
| `PageUp` ou `PageDown` ou `Home` ou `End` | Uma página inteira ou o início/fim da linha; Ctrl/Cmd + Home/End vão ao primeiro/último emoji da lista. |
| `Esc` | Em cascata: primeiro fecha o menu de tom de pele, depois limpa a busca, só então deixa o popover hospedeiro fechar. |

## Acessibilidade

- O raiz é um role=group nomeado pela prop label; a grade é role=grid com aria-rowcount e aria-activedescendant apontando para a célula destacada, cada célula um gridcell rotulado pelo nome do emoji.
- As seções são títulos role=columnheader; a barra de categorias é role=toolbar; o menu de tom é um radiogroup com o tom ativo marcado e tabindex roving.
- O botão de tom anuncia o tom atual ("Skin tone: Default"); a linha de prévia e os ícones são decorativos e o contador de resultados de busca sai por região aria-live polite.

## Movimento

- Célula pressionada encolhe até 0,86; hover e destaque pintam accent-subtle com anel interno, e o emoji da prévia repica da escala 1,18 numa mola snappy.
- O indicador da barra de categorias desliza de aba em aba com a mola morph; o menu de tom de pele abre e fecha revelando por clipPath com easing padrão.
- O scroll da grade sincroniza a aba ativa continuamente; um pulso trava o indicador no alvo enquanto o salto suave termina (jumpLock).
- Com movimento reduzido, transições CSS somem, molas viram pulos diretos e o reveal do menu de tom desliga o inicial/exit.

## Comportamento responsivo

- Largura e altura aceitas por style (--emoji-picker-width/height, padrão 352×408px); a coluna de células se ajusta à largura medida (mínimo 6 colunas de 36px) ou é fixada pela prop columns.
- A grade é virtualizada: só as linhas visíveis mais um overscan de 3 linhas existem no DOM, então listas com milhares de itens rodam no mesmo custo.
- Num palco de demo, prenda o PopoverContent com container={demoStage()}, side="top", align="start" e sideOffset 8 para o painel abrir inteiro acima do gatilho.

## Desempenho

- O dataset embarcado é parseado uma vez por carga e compartilhado por todas as instâncias; a busca testa um haystack minúsculo pré-computado por emoji.
- Mapeamento base→entrada construído em Map para itens recentes em O(1); o handler de scroll é amortizado por requestAnimationFrame.

## Notas para IA

- onSelect recebe (seleção, evento): escolha com Shift mantenha o popover aberto (controle open/onOpenChange você mesmo) para seleção múltipla, como o demo "Shift picks several".
- storageKey persiste recents e tom no localStorage com fallback em memória se o storage estiver bloqueado; passe null para guardar só na sessão; recentLimit corta a lista e defaultRecent semeia a seção Popular.
- O tom de pele se aplica sozinho aos emojis de mão/pessoa de cluster único; sequências ZWJ ignoram o modificador, e a seleção devolve base (sem tom) além do emoji final renderizado.
- Dentro de PopoverContent passe style={{ padding: 0, width: 352, height: 410 }}; o componente não tem chrome próprio — superfície, borda e sombra vêm do host — e o host precisa dar altura definida, senão a lista estica o painel.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/emoji-picker · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
