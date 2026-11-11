import { Fragment, useId, useState, useSyncExternalStore, type ReactNode } from "react";
import { CodeCard } from "@/site/components/item-code-card";
import { CopyButton, InlineCode, Section, TabList, panelId, tabId } from "@/site/components/item-ui";
import { findItem, type CatalogItem } from "@/site/lib/catalog";
import { href, itemPath } from "@/site/lib/router";
import { registryUrl } from "@/site/lib/site-config";
import styles from "./item-install.module.css";

/** O comando de instalação: o chip no topo da página de item e a seção "Instalação" (CLI ou manual). */

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";
const managers: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];
/** Como cada gerenciador roda um pacote sem instalar, e como instala. */
const runner: Record<PackageManager, string> = { pnpm: "pnpm dlx", npm: "npx", yarn: "yarn dlx", bun: "bunx --bun" };
const adder: Record<PackageManager, string> = { pnpm: "pnpm add", npm: "npm install", yarn: "yarn add", bun: "bun add" };

// O gerenciador escolhido vale para a página inteira (chip e seção) e fica guardado neste navegador.
const KEY = "ryan-ui:pm";
const isManager = (value: unknown): value is PackageManager => managers.includes(value as PackageManager);
function stored(): PackageManager {
  try { const value = window.localStorage.getItem(KEY); return isManager(value) ? value : "pnpm"; } catch { return "pnpm"; }
}
let manager: PackageManager = stored();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const snapshot = () => manager;
function setManager(next: PackageManager) {
  manager = next;
  try { window.localStorage.setItem(KEY, next); } catch { /* armazenamento bloqueado: vale só nesta visita */ }
  listeners.forEach(listener => listener());
}
export const usePackageManager = () => useSyncExternalStore(subscribe, snapshot, snapshot);

export const installCommand = (pm: PackageManager, name: string) => `${runner[pm]} shadcn@latest add ${registryUrl(name)}`;
/** Onde o arquivo fica depois de instalado pela CLI. */
export const installedPath = (target: string) => target.replace("@components/", "components/");

/**
 * O chip do topo: o comando numa linha só e o botão de copiar. Quando falta espaço o corte é no meio do endereço, com
 * reticências, e o fim (`/<nome>.json`) continua à vista: é a parte que diz qual item o comando instala.
 */
export function InstallChip({ item }: { item: CatalogItem }) {
  const command = installCommand(usePackageManager(), item.name);
  const cut = command.lastIndexOf("/");
  return (
    <div className={styles.chip}>
      <span className={styles.prompt} aria-hidden="true">$</span>
      <code className={styles.command} title={command}><span className={styles.head}>{command.slice(0, cut)}</span><span className={styles.tail}>{command.slice(cut)}</span></code>
      <CopyButton iconOnly className={styles.chipCopy} value={command} label="Copiar o comando de instalação" />
    </div>
  );
}

/** As pílulas pnpm / npm / yarn / bun no cabeçalho de um cartão de comando. */
function ManagerTabs({ base, panel }: { base: string; panel: string }) {
  const pm = usePackageManager();
  return <TabList variant="pill" base={base} label="Gerenciador de pacotes" items={managers.map(value => ({ value, label: value }))} value={pm} onChange={setManager} panel={panel} />;
}

function CommandCard({ label, command }: { label: string; command: (pm: PackageManager) => string }) {
  const pm = usePackageManager();
  const base = useId();
  const panel = `${base}-comando`;
  return <CodeCard label={label} language="bash" gutter="prompt" code={command(pm)} header={<ManagerTabs base={base} panel={panel} />} body={{ id: panel, role: "tabpanel", "aria-labelledby": tabId(base, pm) }} />;
}

/** "a, b e c": junta nomes numa frase. */
function sentence(parts: ReactNode[]) {
  return parts.map((part, index) => <Fragment key={index}>{index === 0 ? "" : index === parts.length - 1 ? " e " : ", "}{part}</Fragment>);
}

interface InstallSectionProps {
  item: CatalogItem;
  /** Caminhos de destino dos arquivos, do registro; `null` enquanto carrega, `"error"` se não veio. */
  targets: string[] | null | "error";
  /** Abre a aba "Código" lá em cima (o passo manual manda copiar de lá). */
  onOpenCode: () => void;
}

type Mode = "cli" | "manual";

export function InstallSection({ item, targets, onOpenCode }: InstallSectionProps) {
  const [mode, setMode] = useState<Mode>("cli");
  const base = useId();
  const packages = item.dependencies;
  const requires = item.requires.map(findItem).filter((entry): entry is CatalogItem => Boolean(entry));
  const shownRequires = requires.slice(0, 3);

  return (
    <Section id="instalacao" title="Instalação" intro={<>Adicione {item.title} com a CLI do shadcn, ou copie o código à mão.</>}>
      <TabList className={styles.modes} base={base} label="Forma de instalar" hairline items={[{ value: "cli", label: "CLI" }, { value: "manual", label: "Manual" }]} value={mode} onChange={setMode} />
      <div role="tabpanel" id={panelId(base, mode)} aria-labelledby={tabId(base, mode)} className={styles.panel}>
        {mode === "cli" ? (
          <>
            <CommandCard label={`Comando para instalar ${item.title}`} command={pm => installCommand(pm, item.name)} />
            <p className={styles.note}>
              Copia o código do item para o seu projeto
              {packages.length ? <> e instala {sentence(packages.map(name => <InlineCode key={name}>{name}</InlineCode>))}</> : null}.
              {requires.length ? <> Traz junto {sentence([...shownRequires.map(entry => <a key={entry.name} href={href(itemPath(entry))}>{entry.title}</a>), ...(requires.length > shownRequires.length ? [`mais ${requires.length - shownRequires.length}`] : [])])}.</> : null}
              {" "}Primeira vez? <a href={href("/docs/instalacao")}>Instale a base</a> (os tokens e o CSS) antes; é uma vez só.
            </p>
          </>
        ) : (
          <ol className={styles.steps}>
            <li>
              {packages.length ? (
                <>
                  <p>Instale os pacotes que o item usa.</p>
                  <CommandCard label="Comando para instalar os pacotes" command={pm => `${adder[pm]} ${packages.join(" ")}`} />
                </>
              ) : <p>Este item não usa nenhum pacote além do React: não há nada para instalar.</p>}
            </li>
            <li>
              <p>Copie os arquivos da aba <button type="button" className={styles.inlineButton} onClick={onOpenCode}>Código</button>, no topo da página, para estes caminhos:</p>
              {targets === "error" ? <p className={styles.muted}>A lista de arquivos não carregou. Os caminhos aparecem na aba Código.</p>
                : targets === null ? <p className={styles.muted}>Carregando a lista de arquivos…</p>
                : <ul className={styles.files}>{targets.map(target => <li key={target}><InlineCode>{installedPath(target)}</InlineCode></li>)}</ul>}
            </li>
            <li>
              <p>Garanta que <InlineCode>foundation.css</InlineCode> (os tokens) e <InlineCode>motion-tokens.ts</InlineCode> já estão no projeto. <a href={href("/docs/instalacao")}>Como instalar a base</a>.</p>
            </li>
          </ol>
        )}
      </div>
    </Section>
  );
}
