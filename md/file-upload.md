# File upload

> Envio de arquivos com arrastar e soltar, limite de tamanho, progresso e mensagens de erro.

- Tipo: bloco
- Página: https://ryanoliveiragit.github.io/arc-ui/#/b/file-upload
- Descrição original (inglês): A complete file selection flow with constraints, progress, and error feedback.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-upload.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-upload.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-upload.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-upload.json`. Caminho do registro, relativo ao endereço do site: `r/file-upload.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/file-upload/file-upload.tsx`
  - `components/ryan-ui/file-upload/file-upload.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/file-upload.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Formulários que pedem um ou mais arquivos com regras de tipo e tamanho, mostrando o motivo da recusa na própria linha do arquivo.
- Envio com progresso por arquivo, cancelamento ao remover e botão de tentar de novo quando falha, ligado ao seu `onUpload`.

## Quando não usar

- Use [`file-dropzone`](file-dropzone.md) quando basta uma área generosa para soltar arquivos, sem lista nem progresso.
- Evite para escolher uma imagem de perfil com recorte ou prévia: cada linha mostra só um ícone pelo tipo, o nome e o tamanho.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import { FileUpload } from "@/components/ryan-ui/file-upload/file-upload";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "center", height: 520 };

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function FileUploadDemo() {
  return (
    <Stack width={480}>
      <FileUpload
        label="Project files"
        description="Drop images or PDFs here, or browse. Up to 5 MB each."
        accept="image/*,application/pdf"
        maxSize={5 * 1024 * 1024}
        onUpload={async (file, { onProgress, signal }) => {
          for (let percent = 0; percent <= 100; percent += 10) {
            if (signal.aborted) return;
            onProgress(percent);
            await wait(180);
          }
        }}
      />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `FileUpload`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `accept` | `string` | — | — |
| `disabled` | `boolean` | `false` | — |
| `label` | `string` | `"Upload files"` | — |
| `description` | `string` | `"Drop files here or browse from your device."` | — |
| `multiple` | `boolean` | `true` | — |
| `maxSize` | `number` | — | — |
| `value` | `FileUploadItem[]` | — | — |
| `onChange` | `(files: FileUploadItem[]) => void` | — | — |
| `onUpload` | `(file: File, options: { onProgress: (percent: number) => void; signal: AbortSignal }) => Promise<void>` | — | Uploads each accepted file. Report progress from 0 to 100, resolve when done, or reject to mark the file as failed. Removing a file aborts its signal. |

### Tipos exportados

#### `FileUploadItem`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `file` (obrigatória) | `File` | — |
| `error` | `string` | — |

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | Na área de envio, abrem a janela de escolha de arquivos do sistema. |
| `Enter` ou `Espaço` | Nos botões de cada linha, removem o arquivo ou tentam de novo; ao remover, o foco vai para o “remover” do arquivo vizinho ou volta à área de envio. |

## Acessibilidade

- A área de envio é um `role="button"` focável, com `aria-disabled` e a descrição ligada por `aria-describedby`; o `input` de arquivo real fica escondido e fora do Tab.
- Uma região `aria-live` anuncia arquivos adicionados, recusados, enviados, com falha e removidos, e os botões de cada linha incluem o nome do arquivo (“Remove foto.png”, “Retry foto.png”).

## Movimento

- Cada linha abre e fecha a altura numa mola; a barra de progresso e a porcentagem seguem a mesma mola, e a barra só se recolhe depois de mostrar 100%.
- Os textos de estado trocam subindo de um leve desfoque, o visto de pronto se desenha e a nuvem sobe um pouco quando um arquivo paira sobre a área.
- Com “reduzir movimento” ligado, linhas, barra e textos mudam na hora ou só esmaecem, e a nuvem não se move.

## Desempenho

- Cada envio tem seu `AbortController`: remover o arquivo ou desmontar o componente cancela o sinal, então o seu `onUpload` precisa respeitar `signal` para parar a rede.

## Notas para IA

- Apesar de estar entre os blocos, instala em `@/components/ryan-ui/file-upload/file-upload`; sem `onUpload`, os arquivos só aparecem como prontos e nada é enviado.
- `onUpload(file, { onProgress, signal })` deve chamar `onProgress` de 0 a 100, resolver ao terminar e rejeitar na falha; recusados por `accept` ou `maxSize` (em bytes) ficam na lista e não são enviados.
- `value` e `onChange` controlam a lista de `{ id, file, error }`; com `multiple={false}`, um arquivo novo substitui o anterior e cancela o envio em andamento.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/b/file-upload · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
