import { useCallback, useEffect, useState } from "react";
import { DemoMount, type DemoStatus } from "@/site/components/demo-mount";
import { resolveStage, type DemoModule } from "@/site/demos/_registry";
import { findItem } from "@/site/lib/catalog";
import { accents, applyTheme, type Accent } from "@/site/lib/theme";
import styles from "./preview.module.css";

/**
 * O demo sozinho, sem o resto do site: é o que roda dentro do iframe da página de item, o que o botão "abrir em nova aba"
 * mostra e o que o teste automático visita. O estado fica em <html data-demo-status> para o teste ler.
 */
export function PreviewPage({ name, run, variant }: { name: string; run: number; variant?: string }) {
  const item = findItem(name);
  const [module, setModule] = useState<DemoModule | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const onStatus = useCallback((status: DemoStatus, failed?: Error) => {
    const root = document.documentElement;
    root.dataset.demoStatus = status;
    if (failed) root.dataset.demoError = failed.message; else delete root.dataset.demoError;
    setError(failed ?? null);
    // A página que hospeda o iframe acompanha o estado.
    if (window.parent !== window) window.parent.postMessage({ type: "ryan-ui:demo-status", name, status, message: failed?.message }, window.location.origin);
  }, [name]);

  // A página que hospeda o iframe manda o tema e a cor quando mudam.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; theme?: string; accent?: string } | null;
      if (data?.type !== "ryan-ui:theme") return;
      applyTheme(data.theme === "dark" ? "dark" : "light", accents.includes(data.accent as Accent) ? (data.accent as Accent) : undefined);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => { document.title = item ? `${item.title} · preview · ryan-ui` : "preview · ryan-ui"; }, [item]);

  if (!item) {
    document.documentElement.dataset.demoStatus = "error";
    document.documentElement.dataset.demoError = `Item "${name}" não existe.`;
    return <main className={styles.message}><p>O item “{name}” não existe.</p></main>;
  }
  const stage = resolveStage(item.kind, module?.stage);
  return (
    <main className={styles.preview} data-demo-stage="1" data-layout={stage.layout}>
      <DemoMount name={name} run={run} variant={variant} onStatus={onStatus} onModule={setModule} renderError={() => null} />
      {error ? <div className={styles.message} role="alert"><p>O demo de {item.title} não abriu.</p><pre>{error.message}</pre></div> : null}
    </main>
  );
}
