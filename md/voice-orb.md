# Voice orb

> Orbe de assistente de voz que mostra quando ele escuta, pensa ou fala, com anéis e barras que acompanham o volume.

- Tipo: componente (categoria Agentes de IA), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/voice-orb
- Descrição original (inglês): A voice assistant orb with idle, listening, thinking and speaking states whose rings and waveform bars follow a live level value.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/voice-orb.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/voice-orb.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/voice-orb.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/voice-orb.json`. Caminho do registro, relativo ao endereço do site: `r/voice-orb.json`.

- Pacotes npm: `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/voice-orb/voice-orb.tsx`
  - `components/ryan-ui/voice-orb/voice-orb.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/voice-orb.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- O rosto de um assistente de voz: mostra de quem é a vez, entre repouso, ouvindo, pensando e falando.
- Quando há um nível de áudio ao vivo, do microfone ou da reprodução, para os anéis e as barras acompanharem a voz.
- Como o botão principal da conversa por voz, para começar a ouvir ou interromper a fala, com `onPress`.

## Quando não usar

- Use [`loading-states`](loading-states.md) para indicar que a IA está pensando numa conversa de texto.
- Use [`button`](button.md) com um ícone de microfone quando basta ligar e desligar a gravação, sem estados nem nível de áudio.
- Use [`loader`](loader.md) para um carregamento genérico, sem relação com voz.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useEffect, useRef, useState } from "react";
import { useAnimationFrame, useMotionValue } from "motion/react";
import VoiceOrb from "@/components/ryan-ui/voice-orb/voice-orb";
import type { VoiceOrbState } from "@/components/ryan-ui/voice-orb/voice-orb";
import SegmentedControl from "@/components/ryan-ui/segmented-control/segmented-control";
import { Caption, Stack } from "./_kit";

const options = [{ value: "idle", label: "Idle" }, { value: "listening", label: "Listening" }, { value: "thinking", label: "Thinking" }, { value: "speaking", label: "Speaking" }];
/** One voice turn: listen, think, answer, rest. Milliseconds each state lasts before the next one. */
const turn: Partial<Record<VoiceOrbState, { next: VoiceOrbState; after: number }>> = { listening: { next: "thinking", after: 3200 }, thinking: { next: "speaking", after: 2000 }, speaking: { next: "idle", after: 4200 } };
const hints: Record<VoiceOrbState, string> = { idle: "Press the orb to start a turn.", listening: "The rings follow the microphone level.", thinking: "Working on the answer.", speaking: "The bars follow the voice. Press the orb to interrupt." };

export default function VoiceOrbDemo() {
  const [state, setState] = useState<VoiceOrbState>("listening");
  const [auto, setAuto] = useState(true);
  const level = useMotionValue(0);
  const current = useRef(state);
  current.current = state;

  // A stand-in for a real audio level: syllable-like bursts inside slower phrases.
  useAnimationFrame(time => {
    const seconds = time / 1000;
    const live = current.current === "listening" || current.current === "speaking";
    const syllable = (0.5 + 0.5 * Math.sin(seconds * 7.3)) * (0.6 + 0.4 * Math.sin(seconds * 2.1 + 1));
    const phrase = 0.7 + 0.3 * Math.sin(seconds * 0.9);
    level.set(live ? Math.min(1, 0.25 + syllable * 0.75 * phrase) : 0);
  });

  // While a turn is running, each state hands over to the next one on its own.
  useEffect(() => {
    const step = turn[state];
    if (!auto || !step) return;
    const timer = window.setTimeout(() => setState(step.next), step.after);
    return () => window.clearTimeout(timer);
  }, [auto, state]);

  return (
    <Stack gap={5} align="center" width={420}>
      <VoiceOrb state={state} level={level} size={224} label="Assistant voice" onPress={() => { setAuto(true); setState(state === "idle" ? "listening" : "idle"); }} />
      <SegmentedControl label="Orb state" value={state} onValueChange={value => { setAuto(false); setState(value as VoiceOrbState); }} options={options} />
      <Caption>{hints[state]}</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `VoiceOrb`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `state` | `"idle" \| "listening" \| "thinking" \| "speaking"` | `"idle"` | Who has the floor. Drives the colors, the rings and how the bars move. |
| `level` | `number \| MotionValue<number>` | `0` | Loudness from 0 to 1 (microphone while listening, playback while speaking). Pass a motion value to update it every frame without re-rendering. |
| `size` | `number` | `176` | Diameter of the whole orb, rings included, in pixels. |
| `label` | `string` | `"Voice assistant"` | Accessible name of the orb. The current state is announced after it. |
| `showLabel` | `boolean` | `true` | Shows the state caption under the orb. When false the state is still announced to assistive technology. |
| `stateLabels` | `Partial<Record<VoiceOrbState, string>>` | — | Caption per state, to translate or reword the defaults. |
| `onPress` | `() => void` | — | Makes the orb a button, for example to start listening or to interrupt the answer. |
| `className` | `string` | — | Extra class for the root element. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `VoiceOrbState` | `"idle" \| "listening" \| "thinking" \| "speaking"` |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Com `onPress`, o orbe é um `<button>` e essas teclas o acionam; sem `onPress`, ele não recebe foco. |

## Acessibilidade

- Com `onPress` o orbe é um `<button>` com `aria-label` igual a `label`; sem `onPress`, é um `role="img"` com o mesmo nome.
- O estado fica num `role="status"`, visível como legenda ou só para leitor de tela com `showLabel={false}`; os textos padrão (“Tap to talk”, “Listening”, “Thinking”, “Speaking”) mudam por `stateLabels`.
- O `label` não muda com o estado: se o toque faz coisas diferentes, como começar a ouvir ou interromper, troque o `label` a cada estado.

## Movimento

- Em repouso o núcleo respira; ouvindo, anéis contornados se abrem em volta; pensando, um arco gira; falando, o núcleo se enche da cor de destaque e os anéis viram discos suaves.
- Ouvindo e falando, as barras e os anéis seguem `level` a cada quadro: a barra do meio sobe mais e os anéis de fora seguem com uma mola mais frouxa, como uma onda; pensando, as barras ondulam sozinhas.
- Com “reduzir movimento” ligado, cada estado vira uma forma parada: barras fixas por estado, anéis num tamanho só, sem respiração, giro nem pulso do núcleo.

## Desempenho

- Cada uma das cinco barras roda um callback por quadro enquanto o orbe está montado, mesmo em repouso ou com “reduzir movimento”; mantenha um orbe por tela e desmonte-o fora da conversa por voz.
- Passe `level` como `MotionValue`, por exemplo alimentado por um `AnalyserNode`, para atualizar a cada quadro sem renderizar o React; um número em `level` exige uma renderização a cada mudança.

## Notas para IA

- O orbe não lê o microfone: calcule o volume de 0 a 1 e passe em `level`, de preferência como `MotionValue`; `state` decide cores, anéis e o movimento das barras.
- Use `onPress` para começar a ouvir ou interromper a fala, e mude `label` conforme o que o toque faz em cada estado.
- `size` é o diâmetro em pixels, anéis incluídos (padrão 176); o orbe não encolhe com o contêiner, então escolha o tamanho pensando na menor tela.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/voice-orb · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
