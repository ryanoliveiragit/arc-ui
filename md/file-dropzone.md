# File dropzone

> Uma área generosa para soltar um ou vários arquivos, com progresso de envio.

- Tipo: componente (categoria Entradas)
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/file-dropzone
- Descrição original (inglês): A generous target for dropping one or more files.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-dropzone.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-dropzone.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-dropzone.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/file-dropzone.json`. Caminho do registro, relativo ao endereço do site: `r/file-dropzone.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/file-dropzone/file-dropzone.tsx`
  - `components/ryan-ui/file-dropzone/file-dropzone.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/file-dropzone.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Anexar um ou vários arquivos arrastando, escolhendo no dispositivo ou colando uma captura de tela com o ponteiro sobre o alvo ou o foco dentro dele.
- Envios com retorno por arquivo: com `onUpload`, cada linha mostra progresso, conclusão ou falha, com botão para tentar de novo.
- Quando há regras de entrada: `accept`, `maxSize` e `maxFiles` recusam arquivos com uma mensagem, e o alvo treme de leve.

## Quando não usar

- Use [`file-upload`](file-upload.md) quando a lista de arquivos precisa ser controlada de fora (`value` + `onChange`); aqui ela é estado interno e `defaultItems` só vale na montagem.
- Use [`prompt-input`](prompt-input.md) para anexos dentro de uma caixa de mensagem, onde eles aparecem como chips.
- Para trocar uma única imagem, como foto de perfil ou capa, um botão que abre o seletor ocupa menos espaço que o alvo inteiro.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto.

```tsx
import FileDropzone, { type FileDropzoneUpload } from "@/components/ryan-ui/file-dropzone/file-dropzone";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const upload: FileDropzoneUpload = (_item, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    let p = 0;
    const id = window.setInterval(() => {
      p += 12 + Math.random() * 10;
      if (p >= 100) { window.clearInterval(id); onProgress(100); resolve(); } else onProgress(Math.round(p));
    }, 220);
    signal.addEventListener("abort", () => { window.clearInterval(id); reject(new DOMException("Aborted", "AbortError")); });
  });

export default function FileDropzoneDemo() {
  return (
    <Stack width={440}>
      <FileDropzone
        label="Upload project files"
        description="Drop files here or choose from your device"
        note="PNG, JPG or PDF up to 10 MB"
        accept="image/*,.pdf"
        maxSize={10 * 1024 * 1024}
        maxFiles={5}
        onUpload={upload}
        defaultItems={[{ id: "earlier", name: "brand-guidelines.pdf", size: 2_400_000, status: "uploaded" }]}
      />
    </Stack>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `FileDropzone`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `accept` | `string` | — | — |
| `multiple` | `boolean` | `true` | — |
| `maxFiles` | `number` | `5` | — |
| `onFilesChange` | `(files: File[]) => void` | — | — |
| `label` | `string` | `"Add files"` | — |
| `description` | `string` | `"Drop files here or choose from your device"` | — |
| `defaultItems` | `FileDropzoneItem[]` | — | Rows present at mount, such as files uploaded earlier. They render in place without an entrance. |
| `onUpload` | `(item: FileDropzoneItem, options: { onProgress: (percent: number) => void; signal: AbortSignal }) => Promise<void>` | — | Uploads each added file. Without it the list shows plain selections. |
| `maxSize` | `number` | — | Files above this many bytes fail with a size reason and never upload. |
| `listPlacement` | `"below" \| "inside"` | `"below"` | Render the file list under the drop target or inside its edge. |
| `note` | `string` | — | Replaces the small line under the description. |
| `dropLabel` | `string` | — | Label while files hover over the target. |
| `compactAt` | `number` | — | Once the list holds this many files, the prompt folds to a slim bar so the list has room. A file dragged over brings the icon back. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `FileDropzoneStatus` | `"uploading" \| "uploaded" \| "failed"` |
| `FileDropzoneUpload`: Report 0 to 100 through onProgress, resolve when the file lands, or reject with an Error whose message becomes the row's reason. Removing the row aborts the signal. | `(item: FileDropzoneItem, options: { onProgress: (percent: number) => void; signal: AbortSignal }) => Promise<void>` |

#### `FileDropzoneItem`

`preview` is a thumbnail URL; image files added by the visitor get one automatically.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` (obrigatória) | `string` | — |
| `name` (obrigatória) | `string` | — |
| `size` (obrigatória) | `number` | — |
| `status` | `"uploading" \| "uploaded" \| "failed"` | — |
| `progress` | `number` | — |
| `error` | `string` | — |
| `retryable` | `boolean` | — |
| `file` | `File` | — |
| `preview` | `string` | — |

### Outras exportações

- `formatFileSize` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Enter` ou `Espaço` | No alvo, abrem o seletor de arquivos do sistema. |
| `↑` ou `↓` | Na lista, passam o foco para a linha de cima ou de baixo, mantendo a mesma ação (remover ou tentar de novo). |
| `Delete` ou `Backspace` | Removem o arquivo da linha em foco. |
| `Tab` | Percorre o alvo e os botões de cada linha. |

## Acessibilidade

- O alvo inteiro é um único `<button>` descrito por `description` e pela nota; o `<input type="file">` nativo fica oculto e fora da ordem de tabulação.
- Adições, conclusões, falhas e remoções saem numa região `role="status"`, as recusas num `role="alert"`, e cada envio tem um `role="progressbar"`; esses textos são fixos em inglês.
- Ao remover uma linha, o foco vai para o botão de remover da linha seguinte (ou da anterior, ou para o alvo); ao tentar de novo, para o botão de remover da própria linha.

## Movimento

- Com um arquivo sobre o alvo, o tracejado fecha numa linha contínua, o alvo pulsa devagar, as três folhas do ícone se abrem e uma luz na borda segue o ponteiro.
- As linhas novas caem do alvo para a lista em sequência e abrem a própria altura; a barra e a porcentagem seguem a mesma mola e, ao concluir, um visto se desenha.
- Com “reduzir movimento” ligado, linhas e textos só esmaecem, o progresso salta para o valor e não há pulso nem tremor.

## Comportamento responsivo

- A lista é um contêiner de consulta: abaixo de 440 px o botão de tentar de novo fica só com o ícone, e abaixo de 300 px o ícone ou a miniatura do arquivo some.
- `compactAt` dobra o alvo numa barra baixa quando a lista chega a esse número de arquivos, e `listPlacement="inside"` põe a lista dentro da borda do alvo.

## Desempenho

- Imagens adicionadas ganham miniatura por `URL.createObjectURL`, liberada ao remover a linha ou desmontar; nesses mesmos momentos os envios em andamento são abortados pelo `signal`.

## Notas para IA

- `onUpload(item, { onProgress, signal })` deve devolver uma promessa: informe de 0 a 100, resolva ao concluir e rejeite com um `Error` cuja mensagem vira o motivo da falha; respeite o `signal`.
- Sem `onUpload` a lista mostra só as seleções; `onFilesChange(files)` entrega os `File` atuais, e os padrões são `multiple` ligado e `maxFiles={5}`.
- `maxSize` é em bytes e `accept` aceita extensões, tipos MIME e curingas como `image/*`; `label`, `description`, `note` e `dropLabel` têm padrões em inglês.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/file-dropzone · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
