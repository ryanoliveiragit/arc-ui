# Avatar upload

> Clique ou solte uma foto sobre o avatar para cortá-la no lugar, com arraste, pinça e zoom; o envio passa por um anel de progresso e assenta, com erros claros e nova tentativa.

- Tipo: componente (categoria Entradas), novo no ryan-ui
- Página: https://ryanoliveiragit.github.io/arc-ui/#/c/avatar-upload
- Descrição original (inglês): Click or drop a photo onto the avatar to crop it in place with drag, pinch and zoom. It uploads through a progress ring and settles, with clear errors and retry.

## Instalação

Com a CLI do shadcn (um comando copia o código e instala as dependências):

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/avatar-upload.json
```

Com outro gerenciador: `pnpm dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/avatar-upload.json`, `yarn dlx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/avatar-upload.json` ou `bunx --bun shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/avatar-upload.json`. Caminho do registro, relativo ao endereço do site: `r/avatar-upload.json`.

- Pacotes npm: `lucide-react`, `motion`
- Arquivos, depois de instalados:
  - `components/ryan-ui/avatar-upload/avatar-upload.tsx`
  - `components/ryan-ui/avatar-upload/avatar-upload.module.css`

Primeira vez no projeto: instale a base uma vez (`npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/ryan-foundation.json`) e importe `@/components/ryan-ui/foundation.css` na raiz do app. Requer React 19 e o alias `@/`.

### Manual

1. Instale os pacotes: `npm install lucide-react motion`.
2. Copie os arquivos listados acima. O conteúdo de cada um está em `r/avatar-upload.json` (campo `files[].content`).
3. Garanta que `foundation.css` (os tokens) e `motion-tokens.ts` já estão no projeto.

## Quando usar

- Configurações de perfil, conta ou membros de equipe em que a pessoa define a própria foto, com recorte circular e enquadramento antes do envio.
- Upload de retrato com validação de tipo e tamanho de arquivo e mensagens claras antes da foto chegar ao servidor.
- Fluxos que precisam do recorte já exportado (PNG/JPEG quadrado) em vez do arquivo bruto.

## Quando não usar

- Para enviar vários arquivos de qualquer tipo use uma dropzone ([`file-dropzone`](file-dropzone.md)); aqui o alvo é um único retrato.
- Não use para capas, banners ou fotos em faixa: a exportação é sempre um círculo quadrado (padrão 512 px).
- Quando a foto já vem recortada do servidor e só precisa de preview, um avatar simples com botão de trocar resolve sem o editor.

## Uso

O demo da página do item, com os imports como ficam depois de instalar pela CLI. `Stack`, `Row`, `Caption`, `Field` e `Surface` (de `./_kit`) são auxiliares de layout do site: troque pelo layout do seu projeto. O arquivo `.module.css` importado pelo demo é só do exemplo.

```tsx
import { useCallback, useRef, useState } from "react";
import AvatarUpload, { type AvatarUploadHandle } from "@/components/ryan-ui/avatar-upload/avatar-upload";
import { portrait } from "@/components/ryan-ui/lib/media";
import type { DemoStage } from "./_kit";
import styles from "./avatar-upload.module.css";

export const stage: DemoStage = { height: 540 };

type PortraitId = Parameters<typeof portrait>[0];

/** Pseudo-random bytes, so a fake oversized file actually reports its weight. */
const readBytes = (value: number) => {
  const buffer = new ArrayBuffer(value);
  const view = new DataView(buffer);
  let seed = 0x9e3779b9;
  for (let i = 0; i < value; i += 512) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    view.setUint32(i, seed, true);
  }
  return buffer;
};

interface UploadOptions {
  report(progress: number): void;
  signal: AbortSignal;
  /** Progress point at which this attempt breaks, when the "Fail next upload" chip is armed. */
  failAt?: number;
}

/** ~1.2 s of ticking progress, abortable through the signal. */
function simulateUpload({ report, signal, failAt }: UploadOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    let p = 0;
    const tick = window.setInterval(() => {
      if (signal.aborted) {
        window.clearInterval(tick);
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      p = Math.min(1, p + 0.045 + Math.random() * 0.05);
      report(p);
      if (failAt != null && p >= failAt) {
        window.clearInterval(tick);
        reject(new Error("network"));
        return;
      }
      if (p >= 1) {
        window.clearInterval(tick);
        resolve();
      }
    }, 80);
    signal.addEventListener(
      "abort",
      () => {
        window.clearInterval(tick);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

const SAMPLES = [
  { id: "andre-williams", name: "Andre Williams" },
  { id: "sofia-ramirez", name: "Sofia Ramirez" },
  { id: "mateo-alvarez", name: "Mateo Alvarez" },
] as const;

export default function AvatarUploadDemo() {
  const picker = useRef<AvatarUploadHandle>(null);
  const [photo, setPhoto] = useState<string | null>(() => portrait("chloe-nguyen"));
  const [failArmed, setFailArmed] = useState(false);
  const failArmedRef = useRef(failArmed);
  failArmedRef.current = failArmed;

  const onUpload = useCallback(
    (image: Blob, options: { report: (progress: number) => void; signal: AbortSignal }) =>
      simulateUpload({
        report: options.report,
        signal: options.signal,
        // Consumed once: the retry that follows the failure succeeds, like the network clearing up.
        failAt: failArmedRef.current ? 0.62 : undefined,
      }).finally(() => {
        if (failArmedRef.current) setFailArmed(false);
      }),
    [],
  );

  /** Samples ship as SVG stand-ins; rasterize them through a canvas into real PNG files so decode always succeeds. */
  const useSample = useCallback((id: PortraitId) => {
    void (async () => {
      try {
        const res = await fetch(portrait(id));
        const blob = await res.blob();
        const img = new Image();
        img.onload = async () => {
          const source = img.src;
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 128;
          canvas.height = img.naturalHeight || 128;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const png = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
          if (png) picker.current?.selectFile(new File([png], `${id}.png`, { type: "image/png" }));
          URL.revokeObjectURL(source);
        };
        img.src = URL.createObjectURL(blob);
      } catch {
        // Media unavailable in this build: ignore.
      }
    })();
  }, []);

  const twelveMb = useCallback(() => {
    picker.current?.selectFile(new File([readBytes(12_400_000)], "summer-trip.png", { type: "image/png" }));
  }, []);

  const pdfFile = useCallback(() => {
    picker.current?.selectFile(new File(["%PDF-1.4\n% invoice"], "invoice.pdf", { type: "application/pdf" }));
  }, []);

  return (
    <section className={styles.card} aria-labelledby="avatar-upload-demo-title">
      <header className={styles.header}>
        <h3 id="avatar-upload-demo-title" className={styles.title}>Profile</h3>
        <p className={styles.lede}>Click or drop a photo on the avatar. Uploads are simulated.</p>
      </header>

      <AvatarUpload
        ref={picker}
        name="Chloe Nguyen"
        src={photo}
        onUpload={onUpload}
        onRemove={() => setPhoto(null)}
      />

      <div className={styles.tools}>
        <div className={styles.group}>
          <span id="avatar-upload-samples" className={styles.groupLabel}>Sample photos</span>
          <div role="group" aria-labelledby="avatar-upload-samples" className={styles.samples}>
            {SAMPLES.map(sample => (
              <button
                key={sample.id}
                type="button"
                className={styles.sample}
                aria-label={`Use photo of ${sample.name}`}
                onClick={() => useSample(sample.id)}
              >
                <img src={portrait(sample.id)} alt="" width={32} height={32} />
              </button>
            ))}
          </div>
        </div>
        <div className={styles.group}>
          <span className={styles.groupLabel}>Try a failure</span>
          <div className={styles.chips}>
            <button type="button" className={styles.chip} onClick={twelveMb}>12 MB photo</button>
            <button type="button" className={styles.chip} onClick={pdfFile}>PDF file</button>
            <button
              type="button"
              className={styles.chip}
              aria-pressed={failArmed}
              onClick={() => setFailArmed(current => !current)}
            >
              <span className={styles.check} aria-hidden="true" />Fail next upload
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

## Referência da API

Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.

### `AvatarUpload`

Click or drop a photo onto the avatar to crop it in place with drag, pinch and zoom. It uploads through a progress ring and settles, with clear errors and retry. Phases: idle -> crop -> uploading -> (idle with the new photo | failed with retry/discard). A removed avatar shows its initials. The crop drags with a rubber band past its bounds, zooms toward the pointer, and exports a circular 512 px image (PNG for PNG input, JPEG q92 otherwise).

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `name` (obrigatória) | `string` | — | The person's name; its initials stand in when there is no photo. |
| `src` | `string \| null` | — | Current photo. Omit (or pass null) to start with initials. |
| `onUpload` | `( image: Blob, options: { report: (progress: number) => void; signal: AbortSignal; original: File }, ) => Promise<string \| void>` | — | Uploads the cropped result (PNG stays PNG, everything else exports as JPEG). Resolving with a URL makes it the new photo; resolving void uses the exported image itself. Rejecting lands on the retry state, aborting via `signal` cancels silently back to the previous photo. |
| `onRemove` | `() => void` | — | Removes the photo. Without it, the Remove action is hidden. |
| `onError` | `(error: AvatarUploadError) => void` | — | Reports a failure along with the message the component shows. |
| `accept` | `readonly string[]` | — | Accepted media types. Default: PNG, JPEG and WebP. |
| `maxSize` | `number` | — | Maximum file size in bytes. Default: 5 MB (5,000,000). |
| `size` | `number` | — | Idle avatar diameter in px. Default: 88. |
| `outputSize` | `number` | — | Square pixel size of the exported crop. Default: 512. |
| `label` | `string` | — | Heading beside the avatar. Default: "Profile photo". |
| `hint` | `string` | — | Quiet hint under the heading. Default: "PNG, JPG or WebP, up to 5 MB". |
| `disabled` | `boolean` | — | Ignores the picker, drops and the actions. |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | — | Também aceita as props deste tipo, menos `onError`, `onUpload` e `onChange`. |

### Tipos exportados

| Tipo | Definição |
| --- | --- |
| `AvatarUploadErrorCode`: Reasons a chosen file can be rejected before it reaches the uploader. | `"type" \| "size" \| "decode" \| "upload"` |

#### `AvatarUploadError`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` (obrigatória) | `"type" \| "size" \| "decode" \| "upload"` | — |
| `message` (obrigatória) | `string` | The message the component is showing, so a host can mirror it elsewhere. |

#### `AvatarUploadHandle`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `open` (obrigatória) | `(): void;` | Opens the native file picker. |
| `selectFile` (obrigatória) | `(file: File): void;` | Validates and takes a file the same way a picked one is treated (type, size, decode). |

### Outras exportações

- `readBytes` (função)

## Teclado

| Teclas | O que fazem |
| --- | --- |
| `Tab` | No modo ocioso percorre o gatilho redondo, o botão principal e Remove. Na tela de ajuste o foco entra direto na área de recorte e dali segue para os controles de zoom e as ações. |
| `Setas` | Na área de recorte, movem a foto em passos de 2% (10% com Shift), respeitando os limites do enquadramento com efeito elástico. |
| `+` ou `−` ou `0` | Aumentam/diminuem o zoom em 0,25 (de 1× a 4×); 0 devolve a foto ao centro com zoom 1×. |
| `Enter` | Conclui o ajuste e inicia o upload. |
| `Esc` | Cancela o recorte; o foco volta para o gatilho. |

## Acessibilidade

- O raiz é um role=group rotulado pelo título; a área de recorte aberta é um group com aria-roledescription "crop area" e um rótulo dinâmico com o zoom atual e as instruções de navegação.
- A linha de status vive numa região aria-live polite (dica padrão, erros de tipo/tamanho/arquivo/envio e "Photo updated"); um span status separado anuncia as fases (ajuste, envio, cancelamento, remoção) aos leitores de tela.
- O gatilho redondo tem aria-label contextual ("Change profile photo" com foto, "Upload profile photo" sem); os ícones de câmera, alerta e check são decorativos.
- Foco por ponteiro não desenha anel (decisão da fundação); o anel de teclado vem do outline global.

## Movimento

- Ao abrir o recorte, o círculo cresce da medida ociosa para o dobro mais 8 px sobre um fundo quadrado que desvanece (mola smooth), e a altura da linha acompanha o conteúdo lateral medido, sem salto.
- O arraste é elástico: além do limite o movimento continua a 35% e assenta com mola snappy ao soltar; zoom pela roda (listener não-passivo) e pinça mantêm o ponto sob o dedo parado.
- Durante o envio, um anel gira em espera e vira o progresso real (arco contra o relógio a partir das 12h); ao concluir, o anel verde expande e desvanece em 700 ms; na falha ele congela na porcentagem onde quebrou, em vermelho.
- O conteúdo lateral troca com fade e blur(4px) na duração standard; com movimento reduzido as molas viram pulos, o giro fica mais lento e o flash final some.

## Comportamento responsivo

- Abaixo de 480 px de largura no contêiner, o estágio sobe para o topo e a coluna lateral ocupa a largura toda (container query), empilhando o card.
- O diâmetro ocioso é a prop size (padrão 88 px); o recorte abre como círculo de size × 2 + 8 sobre um fundo de size × 2 + 72, ambos animados.
- No palco do demo, o card a 560 px de largura faz o estado de recorte caber sem rolagem.

## Desempenho

- A decodificação usa um único <img> com object URL (aceita até SVG); a exportação desenha num canvas de 512 px com clip circular e encoda PNG para entrada PNG ou JPEG 92% para o resto, preenchendo os cantos com --surface-muted quando opaco.
- Os offsets do arraste vivem em motion values atualizados a cada frame, sem re-renderizar o React; apenas zoom e fases são estado.
- Todo object URL criado pelo componente é revogado (unmount, candidato descartado, cancelamento), e o abort do upload limpa timers e listeners.

## Notas para IA

- onUpload resolve com uma URL para adotá-la como nova foto ou com void para usar a imagem exportada; rejeitar cai no estado falho (Try again/Discard), e abortar pelo signal volta silenciosamente à foto anterior.
- selectFile expõe pelo ref a mesma validação (tipo → tamanho → decodificação) do seletor nativo, então demos podem injetar arquivos programaticamente — como o chip Fail next upload, que consome o armamento uma única vez.
- label/hint personalizam o cabeçalho e a dica do modo ocioso; os textos de erro já vêm prontos, com apóstrofo U+2019, e onError espelha exatamente o que aparece na tela.
- Sem onRemove, o botão Remove não renderiza; sem onUpload, o componente simula um envio de ~1,2 s e adota a imagem exportada.

---

ryan-ui · https://ryanoliveiragit.github.io/arc-ui/#/c/avatar-upload · índice para assistentes: https://ryanoliveiragit.github.io/arc-ui/llms.txt
