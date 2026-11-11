import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import { loadDemo, type DemoModule } from "@/site/demos/_registry";

export type DemoStatus = "loading" | "ready" | "error";

interface BoundaryProps { children: ReactNode; onError: (error: Error) => void; resetKey: string }

/** Um demo que quebra não derruba a página: o erro fica contido no palco. */
class DemoBoundary extends Component<BoundaryProps, { error: Error | null; resetKey: string }> {
  state = { error: null as Error | null, resetKey: this.props.resetKey };
  static getDerivedStateFromError(error: Error) { return { error }; }
  static getDerivedStateFromProps(props: BoundaryProps, state: { error: Error | null; resetKey: string }) {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null;
  }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error(error, info.componentStack); this.props.onError(error); }
  render() { return this.state.error ? null : this.props.children; }
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => { onReady(); }, [onReady]);
  return null;
}

export interface DemoMountProps {
  name: string;
  /** Mudar este número remonta o demo (botão "reiniciar"). */
  run?: number;
  /** Versão do item a mostrar, para demos que têm mais de uma. */
  variant?: string;
  onStatus?: (status: DemoStatus, error?: Error) => void;
  /** Recebe o módulo quando ele carrega, para a página ler `stage`. */
  onModule?: (module: DemoModule) => void;
  fallback?: ReactNode;
  renderError?: (error: Error, retry: () => void) => ReactNode;
}

/** Baixa o demo de um item e o monta, avisando quando ficou pronto ou quebrou. */
export function DemoMount({ name, run = 0, variant, onStatus, onModule, fallback = null, renderError }: DemoMountProps) {
  const [loaded, setLoaded] = useState<{ name: string; module: DemoModule } | null>(null);
  const [failure, setFailure] = useState<{ key: string; error: Error } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = `${name}:${variant ?? ""}:${run}:${attempt}`;

  useEffect(() => {
    let alive = true;
    onStatus?.("loading");
    loadDemo(name).then(module => {
      if (!alive) return;
      setLoaded({ name, module });
      onModule?.(module);
    }).catch((error: unknown) => {
      if (!alive) return;
      const failed = error instanceof Error ? error : new Error(String(error));
      setFailure({ key, error: failed });
      onStatus?.("error", failed);
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recarrega só quando o item ou a tentativa muda
  }, [name, attempt]);

  const error = failure?.key === key ? failure.error : null;
  if (error) return renderError ? renderError(error, () => { setFailure(null); setAttempt(value => value + 1); }) : null;
  if (!loaded || loaded.name !== name) return fallback;
  const Demo = loaded.module.default;
  return (
    <DemoBoundary resetKey={key} onError={failed => { setFailure({ key, error: failed }); onStatus?.("error", failed); }}>
      <Demo key={key} variant={variant} />
      <Ready key={`ready:${key}`} onReady={() => onStatus?.("ready")} />
    </DemoBoundary>
  );
}
