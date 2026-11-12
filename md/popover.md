# Popover

> Pequena superfície ancorada para informações de contexto.

- Tipo: componente (categoria Revelação)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/popover
- Descrição original (inglês): A small anchored surface for contextual information.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/popover.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/popover.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/popover.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/popover.json`. Caminho do registro, relativo ao endereço do site: `r/popover.json`.

- Pacotes npm: `@radix-ui/react-popover`
- Arquivos, depois de instalados:
  - `components/ryan-ui/popover/popover.tsx`
  - `components/ryan-ui/popover/popover.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install @radix-ui/react-popover`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/popover.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Um painel pequeno junto de um botão, como o link de compartilhamento com a ação de copiar.
- Ajustes ou filtros rápidos que a pessoa abre, muda e fecha sem sair do contexto.
- Informação de contexto com um ou dois controles, que não deve bloquear o resto da página.

## Quando não usar

- Use [`tooltip`](tooltip.md) para um texto curto, sem interação, que nomeia um controle.
- Use [`dropdown-menu`](dropdown-menu.md) para uma lista de ações.
- Use [`dialog`](dialog.md) quando a decisão precisa bloquear a página até ser tomada.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ryan-ui/popover/popover";
import { Button } from "@/components/ryan-ui/button/button";
import { Caption, Room, Stack, demoStage, useQuietFirstOpen } from "./_kit";

export default function PopoverDemo() {
  // O preview já abre o painel, preso ao palco: dá para ver o gatilho e o painel juntos, inteiros.
  const quiet = useQuietFirstOpen();
  return (
    <Room below={168}>
      <Popover defaultOpen>
        <PopoverTrigger asChild><Button variant="secondary">Share link</Button></PopoverTrigger>
        <PopoverContent container={demoStage()} align="center" onOpenAutoFocus={quiet}>
          <Stack gap={3} style={{ width: 260 }}>
            <strong style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)" }}>Anyone with the link can view</strong>
            <Caption>atlas.example.com/p/q3-roadmap</Caption>
            <PopoverClose asChild><Button size="sm">Copy link</Button></PopoverClose>
          </Stack>
        </PopoverContent>
      </Popover>
    </Room>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `PopoverTrigger`

The trigger anchors the panel, so it opts out of press-scale: a scaled rect measured on open would shift the panel as the trigger springs back.

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### `PopoverContent`

Sem props próprias: aceita as do elemento ou do primitivo que envolve.

### Outras exportações

- `Popover` (valor)
- `PopoverClose` (valor)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No gatilho, abre ou fecha o painel; ao abrir, o foco vai para o primeiro controle de dentro. |
| `Tab` ou `Shift + Tab` | Circulam pelos controles do painel. |
| `Esc` | Fecha o painel e devolve o foco ao gatilho. |

## Acessibilidade

- É o Popover do Radix sem modo modal: o gatilho recebe `aria-haspopup="dialog"`, `aria-expanded` e `aria-controls`, e o painel tem `role="dialog"`.
- O painel não tem nome acessível por padrão; passe `aria-label` ou `aria-labelledby` ao `PopoverContent`.
- A página por trás continua acessível e rolável; clicar fora ou mover o foco para fora fecha o painel.

## Movimento

- O painel parte alguns pixels na direção do gatilho, a 97% do tamanho, e assenta com uma curva de mola em CSS; sai mais rápido do que entra.
- São transições, não keyframes: fechar no meio da abertura, ou reabrir durante o fechamento, inverte a partir de onde o painel está.
- Com “reduzir movimento” ligado, o painel só esmaece.

## Comportamento responsivo

- A largura vai de 12rem a `min(22rem, 100vw - 20px)`, e o painel muda de lado quando não cabe, com 10 px de folga da borda (`collisionPadding`).

## Notas para IA

- Monte `Popover`, `PopoverTrigger asChild` em volta do botão e `PopoverContent`; ações que fecham vão em `PopoverClose asChild`.
- O padrão é `align="start"` e `sideOffset={6}`; `side` e as demais props do Radix passam direto para o `PopoverContent`.
- Importe de `@/components/ryan-ui/popover/popover`; o `PopoverContent` já vem num portal, com 1rem de espaçamento interno, então não envolva o conteúdo em outro cartão.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/popover · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
