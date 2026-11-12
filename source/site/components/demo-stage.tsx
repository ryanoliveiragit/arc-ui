import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Maximize2, Monitor, RotateCcw, Smartphone, Tablet } from "lucide-react";
import { Alert } from "@/registry/components/alert/alert";
import { Button } from "@/registry/components/button/button";
import { Skeleton } from "@/registry/components/skeleton/skeleton";
import { Tooltip } from "@/registry/components/tooltip/tooltip";
import { DemoMount, type DemoStatus } from "@/site/components/demo-mount";
import { IconButton, IconLink, Segmented } from "@/site/components/item-ui";
import { loadDemo, resolveStage, type DemoModule } from "@/site/demos/_registry";
import type { CatalogItem } from "@/site/lib/catalog";
import { href } from "@/site/lib/router";
import { useTheme } from "@/site/lib/theme";
import styles from "./demo-stage.module.css";

/**
 * O palco do demo na página de item, em duas partes que a página põe em lugares diferentes: as ferramentas (estado,
 * largura, reiniciar, abrir sozinho), que ficam na linha das abas, e o painel grande com o demo.
 *
 * Componentes rodam na própria página; blocos (e o que pedir `frame`) rodam num iframe, para que media queries e
 * position: fixed se comportem como numa página de verdade. Escolher uma largura menor põe qualquer demo num iframe
 * dessa largura: é assim que um componente mostra o layout de celular sem a janela mudar de tamanho.
 */

type StageWidth = "desktop" | "tablet" | "mobile";
const widthPx: Record<StageWidth, number | null> = { desktop: null, tablet: 820, mobile: 390 };
const widthOptions: { value: StageWidth; label: string; icon: ReactNode }[] = [
  { value: "desktop", label: "Largura de computador", icon: <Monitor size={15} strokeWidth={1.75} aria-hidden="true" /> },
  { value: "tablet", label: "Largura de tablet (820 px)", icon: <Tablet size={15} strokeWidth={1.75} aria-hidden="true" /> },
  { value: "mobile", label: "Largura de celular (390 px)", icon: <Smartphone size={15} strokeWidth={1.75} aria-hidden="true" /> },
];
/** Altura mínima do painel, em px. */
const MIN_HEIGHT = 520;

export interface StageController {
  item: CatalogItem;
  variant?: string;
  status: DemoStatus;
  module: DemoModule | null;
  loadError: Error | null;
  /** O demo está num iframe (porque o item pede, ou porque a largura escolhida é menor que a do computador). */
  framed: boolean;
  /** O item sempre roda em iframe. */
  alwaysFramed: boolean;
  layout: "center" | "fill";
  height: number;
  width: StageWidth;
  setWidth: (width: StageWidth) => void;
  run: number;
  restart: () => void;
  frameRef: RefObject<HTMLIFrameElement | null>;
  frameSrc: string;
  /** Endereço do demo sozinho, para abrir em outra aba. */
  previewHref: string;
  onInlineStatus: (status: DemoStatus) => void;
}

export function useDemoStage(item: CatalogItem, variant?: string): StageController {
  const { theme, accent } = useTheme();
  const [module, setModule] = useState<DemoModule | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [status, setStatus] = useState<DemoStatus>("loading");
  const [run, setRun] = useState(0);
  const [width, setWidthState] = useState<StageWidth>("desktop");
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let alive = true;
    setModule(null); setLoadError(null); setStatus("loading"); setRun(0); setWidthState("desktop");
    loadDemo(item.name).then(loaded => { if (alive) setModule(loaded); }).catch((error: unknown) => { if (alive) { setLoadError(error instanceof Error ? error : new Error(String(error))); setStatus("error"); } });
    return () => { alive = false; };
  }, [item.name]);

  const stage = resolveStage(item.kind, module?.stage);
  const alwaysFramed = Boolean(module) && stage.frame;
  const framed = Boolean(module) && (stage.frame || width !== "desktop");

  // O iframe avisa quando o demo ficou pronto ou quebrou.
  useEffect(() => {
    if (!framed) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      const data = event.data as { type?: string; name?: string; status?: DemoStatus } | null;
      if (data?.type === "ryan-ui:demo-status" && data.name === item.name && data.status) setStatus(data.status);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [framed, item.name]);

  // Tema e cor de destaque seguem o site sem recarregar o iframe.
  useEffect(() => {
    if (framed) frameRef.current?.contentWindow?.postMessage({ type: "ryan-ui:theme", theme, accent }, window.location.origin);
  }, [framed, theme, accent, status]);

  const setWidth = useCallback((next: StageWidth) => {
    // Entrar ou sair do iframe remonta o demo: o estado volta a "carregando" até ele avisar.
    if (!stage.frame && (width === "desktop") !== (next === "desktop")) setStatus("loading");
    setWidthState(next);
  }, [stage.frame, width]);

  const restart = useCallback(() => { setStatus("loading"); setRun(value => value + 1); }, []);
  const onInlineStatus = useCallback((next: DemoStatus) => setStatus(next), []);

  // O iframe abre com o tema e a cor do momento em que é criado; mudanças depois disso vão por mensagem, sem recarregar.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- tema e cor só entram quando o iframe é recriado
  const opened = useMemo(() => ({ theme, accent }), [item.name, variant, framed, run]);
  const frameSrc = `${window.location.pathname}${window.location.search}${href(`/preview/${item.name}`, { theme: opened.theme, accent: opened.accent, v: variant, run: run ? String(run) : undefined })}`;
  const previewHref = href(`/preview/${item.name}`, { theme, accent, v: variant });

  return { item, variant, status, module, loadError, framed, alwaysFramed, layout: stage.layout, height: Math.max(stage.height, MIN_HEIGHT), width, setWidth, run, restart, frameRef, frameSrc, previewHref, onInlineStatus };
}

const statusText: Record<DemoStatus, string> = { loading: "Carregando…", ready: "Ao vivo", error: "O demo não abriu" };

/** As ferramentas do palco, para a linha das abas: estado, larguras, reiniciar e abrir sozinho. */
export function StageTools({ stage }: { stage: StageController }) {
  // Tablet só faz sentido para o que já roda em iframe (blocos); um componente alterna entre computador e celular.
  const options = stage.alwaysFramed ? widthOptions : widthOptions.filter(option => option.value !== "tablet");
  return (
    <div className={styles.tools}>
      <span className={styles.status} role="status" data-status={stage.status}>{statusText[stage.status]}</span>
      <Segmented label="Largura do palco" iconOnly options={options} value={stage.width} onChange={stage.setWidth} />
      <Tooltip content="Reiniciar o demo">
        <IconButton aria-label="Reiniciar o demo" onClick={stage.restart}><RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" /></IconButton>
      </Tooltip>
      <Tooltip content="Abrir sozinho em outra aba">
        <IconLink aria-label="Abrir o demo sozinho em outra aba" href={stage.previewHref} target="_blank" rel="noreferrer"><Maximize2 size={15} strokeWidth={1.75} aria-hidden="true" /></IconLink>
      </Tooltip>
    </div>
  );
}

/** O painel grande com o demo. */
export function StagePanel({ stage }: { stage: StageController }) {
  const { item, variant, module, loadError, framed } = stage;
  const maxWidth = widthPx[stage.width];
  const loading = <div className={styles.loading}><Skeleton label="Carregando demo" lines={3} /></div>;
  return (
    <div className={styles.panel} data-demo-stage="1" data-status={stage.status} data-layout={framed ? "frame" : stage.layout} style={{ minHeight: framed ? undefined : stage.height }}>
      {loadError ? (
        <div className={styles.notice}><Alert tone="danger" title="O demo não carregou">{loadError.message}</Alert></div>
      ) : !module ? loading : framed ? (
        <div className={styles.frameWrap} style={{ maxWidth: maxWidth ?? undefined }} data-narrow={maxWidth ? "true" : undefined}>
          <iframe ref={stage.frameRef} key={`${item.name}:${variant ?? ""}`} className={styles.frame} title={`Demo de ${item.title}`} src={stage.frameSrc} style={{ height: stage.height }} />
        </div>
      ) : (
        <DemoMount
          name={item.name}
          run={stage.run}
          variant={variant}
          onStatus={stage.onInlineStatus}
          fallback={loading}
          renderError={(error, retry) => (
            <div className={styles.notice}>
              <Alert tone="danger" title="O demo quebrou ao abrir">{error.message}</Alert>
              <Button variant="secondary" size="sm" onClick={retry}>Tentar de novo</Button>
            </div>
          )}
        />
      )}
    </div>
  );
}
