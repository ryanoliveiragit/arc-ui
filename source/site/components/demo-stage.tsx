import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";
import { Alert } from "@/registry/components/alert/alert";
import { Button } from "@/registry/components/button/button";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Skeleton } from "@/registry/components/skeleton/skeleton";
import { Tooltip } from "@/registry/components/tooltip/tooltip";
import { DemoMount, type DemoStatus } from "@/site/components/demo-mount";
import { loadDemo, resolveStage, type DemoModule } from "@/site/demos/_registry";
import type { CatalogItem } from "@/site/lib/catalog";
import { href } from "@/site/lib/router";
import { useTheme } from "@/site/lib/theme";
import styles from "./demo-stage.module.css";

const widths = [
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Celular" },
];
const widthPx: Record<string, number | null> = { desktop: null, tablet: 820, mobile: 390 };

/**
 * O palco do demo na página de item. Componentes rodam na própria página; blocos (e o que pedir `frame`) rodam num iframe,
 * para que media queries e position: fixed se comportem como numa página de verdade, em qualquer largura.
 */
export function DemoStage({ item, variant }: { item: CatalogItem; variant?: string }) {
  const { theme, accent } = useTheme();
  const [module, setModule] = useState<DemoModule | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [status, setStatus] = useState<DemoStatus>("loading");
  const [run, setRun] = useState(0);
  const [width, setWidth] = useState("desktop");
  const frameRef = useRef<HTMLIFrameElement>(null);
  /** Tema e cor com que o iframe foi aberto. Mudanças depois disso vão por mensagem, sem recarregar. */
  const opened = useRef({ theme, accent });

  useEffect(() => {
    let alive = true;
    setModule(null); setLoadError(null); setStatus("loading"); setRun(0); setWidth("desktop");
    opened.current = { theme, accent };
    loadDemo(item.name).then(loaded => { if (alive) setModule(loaded); }).catch((error: unknown) => { if (alive) { setLoadError(error instanceof Error ? error : new Error(String(error))); setStatus("error"); } });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só ao trocar de item
  }, [item.name]);

  const stage = resolveStage(item.kind, module?.stage);
  const framed = Boolean(module) && stage.frame;

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

  const onInlineStatus = useCallback((next: DemoStatus) => setStatus(next), []);
  const previewHref = href(`/preview/${item.name}`, { theme, accent, v: variant });
  const frameSrc = `${window.location.pathname}${window.location.search}${href(`/preview/${item.name}`, { theme: opened.current.theme, accent: opened.current.accent, v: variant, run: run ? String(run) : undefined })}`;
  const maxWidth = widthPx[width] ?? null;

  return (
    <section className={styles.stage} aria-label={`Demo de ${item.title}`} data-status={status}>
      <div className={styles.toolbar}>
        <span className={styles.status} role="status">{status === "loading" ? "Carregando demo…" : status === "error" ? "O demo não abriu" : "Demo ao vivo"}</span>
        <div className={styles.tools}>
          {framed ? <SegmentedControl className={styles.widths} label="Largura do preview" options={widths} value={width} onValueChange={setWidth} /> : null}
          <Tooltip content="Reiniciar o demo">
            <Button variant="ghost" size="sm" className={styles.tool} aria-label="Reiniciar o demo" onClick={() => { setStatus("loading"); setRun(value => value + 1); }}><RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" /></Button>
          </Tooltip>
          <Tooltip content="Abrir sozinho em outra aba">
            <a className={styles.toolLink} href={previewHref} target="_blank" rel="noreferrer" aria-label="Abrir o demo sozinho em outra aba"><ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" /></a>
          </Tooltip>
        </div>
      </div>

      <div className={styles.canvas} data-layout={framed ? "frame" : stage.layout} style={{ minHeight: framed ? undefined : stage.height }}>
        {loadError ? (
          <div className={styles.notice}>
            <Alert tone="danger" title="O demo não carregou">{loadError.message}</Alert>
          </div>
        ) : !module ? (
          <div className={styles.loading}><Skeleton label="Carregando demo" lines={3} /></div>
        ) : framed ? (
          <div className={styles.frameWrap} style={{ maxWidth: maxWidth ?? undefined }} data-narrow={maxWidth ? "true" : undefined}>
            <iframe ref={frameRef} key={`${item.name}:${variant ?? ""}`} className={styles.frame} title={`Demo de ${item.title}`} src={frameSrc} style={{ height: stage.height }} />
          </div>
        ) : (
          <DemoMount
            name={item.name}
            run={run}
            variant={variant}
            onStatus={onInlineStatus}
            fallback={<div className={styles.loading}><Skeleton label="Carregando demo" lines={3} /></div>}
            renderError={(error, retry) => (
              <div className={styles.notice}>
                <Alert tone="danger" title="O demo quebrou ao abrir">{error.message}</Alert>
                <Button variant="secondary" size="sm" onClick={retry}>Tentar de novo</Button>
              </div>
            )}
          />
        )}
      </div>
    </section>
  );
}
