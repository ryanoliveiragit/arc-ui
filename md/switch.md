# Switch

> Um interruptor tátil para ajustes que passam a valer na hora.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/switch
- Descrição original (inglês): A tactile toggle for settings that take effect immediately.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/switch.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/switch.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/switch.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/switch.json`. Caminho do registro, relativo ao endereço do site: `r/switch.json`.

- Pacotes npm: `@radix-ui/react-switch`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/switch/switch.tsx`
  - `components/ryan-ui/switch/switch.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-switch motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/switch.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Preferências que passam a valer na hora, como notificações, sincronização ou recursos em teste.
- Listas de ajustes ligados e desligados, um por linha, com o rótulo ao lado.

## Quando não usar

- Use [`checkbox`](checkbox.md) quando a escolha só vale depois de enviar um formulário ou faz parte de uma lista de opções.
- Use [`segmented-control`](segmented-control.md) quando os dois estados têm nomes próprios, como Mensal e Anual.
- Use [`theme-switch`](theme-switch.md) para trocar entre tema claro e escuro com transição de página.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { useState } from "react";
import Switch from "@/components/ryan-ui/switch/switch";
import { Caption, Stack } from "./_kit";

export default function SwitchDemo() {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  return (
    <Stack width={320} gap={4}>
      <Switch label="Push notifications" checked={push} onCheckedChange={setPush} />
      <Switch label="Weekly email digest" checked={email} onCheckedChange={setEmail} />
      <Switch label="Beta features (managed by admin)" defaultChecked disabled />
      <Caption>Push {push ? "on" : "off"}, digest {email ? "on" : "off"}. Changes apply immediately.</Caption>
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `Switch`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | — | — |
| `...props` | `ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>` | — | Também aceita as props deste tipo. |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Espaço` ou `Enter` | Ligam ou desligam; segurando Espaço, o polegar se alarga como sob um dedo e viaja ao soltar. |

## Acessibilidade

- É o `Switch` do Radix: um `<button role="switch">` com `aria-checked`, e dentro de um `<form>` um campo oculto envia `name` e `value`.
- O `label` fica dentro do botão, então clicar no texto também alterna, e vira o nome acessível; sem `label`, passe `aria-label` ou `aria-labelledby`.

## Movimento

- O polegar viaja numa mola sem ultrapassagem e para exatamente no estado que anuncia; ao pressionar, ele se alarga na direção do outro lado, como sob um dedo.
- Mudanças sem pressão, como pelo Enter ou vindas do estado, ganham um esticão curto no meio do caminho, e a trilha passa para a cor de ligado.
- Com “reduzir movimento” ligado, o polegar muda de lado na hora e as transições de cor são desligadas.

## Notas para IA

- Use para ajustes que valem na hora, sem botão de salvar: `checked` com `onCheckedChange` controlado, ou `defaultChecked`.
- Para o texto à esquerda e o switch à direita numa linha de ajustes, deixe `label` de fora, escreva seu texto e ligue os dois com `aria-labelledby`.
- Aceita as props do Radix (`disabled`, `required`, `name`, `value`); num formulário, o valor enviado quando ligado é `on`, a menos que você passe `value`.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/switch · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
