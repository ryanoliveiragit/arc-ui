import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Alert } from "@/registry/components/alert/alert";
import { Badge } from "@/registry/components/badge/badge";
import { Breadcrumb } from "@/registry/components/breadcrumb/breadcrumb";
import { CodeBlock } from "@/registry/components/code-block/code-block";
import { Skeleton } from "@/registry/components/skeleton/skeleton";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/components/tabs/tabs";
import { DemoStage } from "@/site/components/demo-stage";
import { CategoryTag } from "@/site/components/item-card";
import { Sidebar } from "@/site/components/sidebar";
import { categoryLabel, describe, findItem, neighbours, versionsOf, type CatalogItem, type ItemVersion } from "@/site/lib/catalog";
import { useTheme } from "@/site/lib/theme";
import { href, itemPath, navigate, type Route } from "@/site/lib/router";
import { asset, registryUrl } from "@/site/lib/site-config";
import { useJson, useText } from "@/site/lib/use-json";
import styles from "./item.module.css";

const tabs = [
  { value: "demo", label: "Preview" },
  { value: "codigo", label: "Código" },
  { value: "api", label: "API" },
  { value: "instalar", label: "Instalação" },
] as const;
type TabValue = (typeof tabs)[number]["value"];

interface RegistryFile { path: string; target: string; type: string; content: string }
interface RegistryItem { name: string; dependencies?: string[]; registryDependencies?: string[]; files: RegistryFile[] }
interface ApiMember { name: string; optional: boolean; type: string; doc: string }
interface ApiType { name: string; exported: boolean; kind: "interface" | "type"; doc: string; extends?: string[]; members?: ApiMember[]; text?: string }
interface ApiComponent { name: string; doc: string; props: string; defaults: Record<string, string> }
interface ApiData { exports: { name: string; kind: string; default?: boolean }[]; components: ApiComponent[]; types: ApiType[] }

const demoSources = import.meta.glob<string>("/site/demos/*.tsx", { query: "?raw", import: "default" });
const languageOf = (file: string) => (file.endsWith(".css") ? "css" : file.endsWith(".tsx") ? "tsx" : file.endsWith(".json") ? "json" : "ts");
const baseName = (file: string) => file.split("/").pop() ?? file;
/** Onde o arquivo fica depois de instalado pela CLI. */
const installedPath = (target: string) => target.replace("@components/", "components/");

function Loading() {
  return <div className={styles.loading}><Skeleton label="Carregando" lines={4} /></div>;
}

/** O código do demo, com os imports como ficam num projeto que instalou o item pela CLI. */
function ExampleCode({ item }: { item: CatalogItem }) {
  const source = useText(demoSources[`/site/demos/${item.name}.tsx`], item.name);
  if (source.status !== "ready") return source.status === "loading" ? <Loading /> : null;
  const usesKit = /from "\.\/_kit"/.test(source.data);
  const code = source.data
    .replace(/from "@\/registry\/(?:components|blocks)\//g, match => (match.includes("/blocks/") ? 'from "@/components/ryan-ui/blocks/' : 'from "@/components/ryan-ui/'))
    .replace(/from "@\/lib\//g, 'from "@/components/ryan-ui/lib/');
  return (
    <section className={styles.section}>
      <h2>Código do exemplo</h2>
      <p className={styles.note}>O demo acima, com os imports como ficam depois de instalar pela CLI.{usesKit ? <> <code>Stack</code>, <code>Row</code>, <code>Caption</code>, <code>Field</code> e <code>Surface</code> são só auxiliares de layout deste site; troque pelo layout do seu projeto.</> : null}</p>
      <CodeBlock code={code.trimEnd()} filename={`${item.name}-demo.tsx`} language="tsx" maxLines={18} />
    </section>
  );
}

function CodeTab({ item }: { item: CatalogItem }) {
  const registry = useJson<RegistryItem>(asset(`r/${item.name}.json`));
  if (registry.status === "loading") return <Loading />;
  if (registry.status === "error") return <Alert tone="danger" title="Não deu para carregar o código">{registry.error.message}</Alert>;
  const own = registry.data.files.filter(file => item.ownFiles.includes(file.path));
  const shown = own.length ? own : registry.data.files;
  const others = registry.data.files.filter(file => !shown.includes(file));
  return (
    <div className={styles.stack}>
      <p className={styles.note}>O código-fonte do item: {shown.length} {shown.length === 1 ? "arquivo" : "arquivos"}. É seu para copiar e mudar.</p>
      {shown.map(file => <CodeBlock key={file.path} code={file.content.trimEnd()} filename={baseName(file.path)} language={languageOf(file.path)} maxLines={24} />)}
      {others.length ? (
        <section className={styles.section}>
          <h2>Também vem junto</h2>
          <p className={styles.note}>Arquivos de outros itens e auxiliares que este item usa. A CLI instala todos de uma vez.</p>
          <ul className={styles.fileList}>{others.map(file => <li key={file.path}><code>{installedPath(file.target)}</code></li>)}</ul>
        </section>
      ) : null}
    </div>
  );
}

function PropsTable({ type, defaults }: { type: ApiType; defaults: Record<string, string> }) {
  const members = type.members ?? [];
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead><tr><th scope="col">Prop</th><th scope="col">Tipo</th><th scope="col">Padrão</th><th scope="col">Descrição</th></tr></thead>
        <tbody>
          {members.map(member => (
            <tr key={member.name}>
              <th scope="row"><code>{member.name}</code>{member.optional ? null : <span className={styles.required} title="Obrigatória">*</span>}</th>
              <td><code className={styles.type}>{member.type}</code></td>
              <td>{defaults[member.name] ? <code>{defaults[member.name]}</code> : <span className={styles.dash}>—</span>}</td>
              <td>{member.doc || <span className={styles.dash}>—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApiTab({ item }: { item: CatalogItem }) {
  const api = useJson<ApiData>(asset(`api/${item.name}.json`));
  if (api.status === "loading") return <Loading />;
  if (api.status === "error") return <Alert tone="danger" title="Não deu para carregar a API">{api.error.message}</Alert>;
  const { components, types, exports } = api.data;
  const typeByName = new Map(types.map(type => [type.name, type]));
  const used = new Set<string>();
  const others = exports.filter(entry => entry.kind !== "component");
  return (
    <div className={styles.stack}>
      <p className={styles.note}>Extraído do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês. Props marcadas com <span className={styles.required}>*</span> são obrigatórias.</p>
      {components.map(component => {
        const type = typeByName.get(component.props);
        if (type) used.add(type.name);
        return (
          <section key={component.name} className={styles.section}>
            <h2><code>&lt;{component.name}&gt;</code></h2>
            {component.doc ? <p className={styles.note}>{component.doc}</p> : null}
            {type?.extends?.length ? <p className={styles.note}>Também aceita as props de <code>{type.extends.join(", ")}</code>.</p> : null}
            {type?.members?.length ? <PropsTable type={type} defaults={component.defaults} /> : type?.text ? <p className={styles.note}>Props: <code>{type.text}</code></p> : <p className={styles.note}>Sem props próprias: aceita as do elemento ou do primitivo que envolve.</p>}
          </section>
        );
      })}
      {types.filter(type => type.exported && !used.has(type.name)).length ? (
        <section className={styles.section}>
          <h2>Tipos</h2>
          {types.filter(type => type.exported && !used.has(type.name)).map(type => (
            <div key={type.name} className={styles.typeBlock}>
              <h3><code>{type.name}</code></h3>
              {type.doc ? <p className={styles.note}>{type.doc}</p> : null}
              {type.members?.length ? <PropsTable type={type} defaults={{}} /> : type.text ? <pre className={styles.typeText}><code>{type.text}</code></pre> : null}
            </div>
          ))}
        </section>
      ) : null}
      {others.length ? (
        <section className={styles.section}>
          <h2>Outras exportações</h2>
          <ul className={styles.fileList}>{others.map(entry => <li key={entry.name}><code>{entry.name}</code> <span className={styles.dash}>{entry.kind === "hook" ? "hook" : entry.kind === "function" ? "função" : "valor"}</span></li>)}</ul>
        </section>
      ) : null}
    </div>
  );
}

function InstallTab({ item }: { item: CatalogItem }) {
  const registry = useJson<RegistryItem>(asset(`r/${item.name}.json`));
  const packages = item.dependencies;
  const requires = item.requires.map(findItem).filter((entry): entry is CatalogItem => Boolean(entry));
  return (
    <div className={styles.stack}>
      <section className={styles.section}>
        <h2>Com a CLI do shadcn</h2>
        <p className={styles.note}>Um comando copia o código para o seu projeto, com as dependências. Precisa de React 19 e do alias <code>@/</code>.</p>
        <CodeBlock code={`npx shadcn@latest add ${registryUrl(item.name)}`} filename="Terminal" language="bash" />
        <p className={styles.note}>Na primeira vez, instale também os tokens de design e importe o CSS uma vez na raiz do app. <a href={href("/docs/instalacao")}>Ver o passo a passo</a>.</p>
      </section>
      <section className={styles.section}>
        <h2>Manual</h2>
        <ol className={styles.steps}>
          <li>
            <p>Instale os pacotes que o item usa.</p>
            <CodeBlock code={`npm install ${packages.length ? packages.join(" ") : "motion"}`} filename="Terminal" language="bash" />
          </li>
          <li>
            <p>Copie os arquivos da aba <a href={href(itemPath(item), { aba: "codigo" })}>Código</a> para estes caminhos:</p>
            {registry.status === "ready"
              ? <ul className={styles.fileList}>{registry.data.files.map(file => <li key={file.path}><code>{installedPath(file.target)}</code></li>)}</ul>
              : registry.status === "loading" ? <Loading /> : <Alert tone="warning" title="Lista de arquivos indisponível">{registry.error.message}</Alert>}
          </li>
          <li><p>Garanta que <code>foundation.css</code> (os tokens) e <code>motion-tokens.ts</code> já estão no projeto. <a href={href("/docs/instalacao")}>Como instalar a base</a>.</p></li>
        </ol>
      </section>
      {requires.length ? (
        <section className={styles.section}>
          <h2>Usa outros itens</h2>
          <p className={styles.note}>Eles vêm junto na instalação.</p>
          <ul className={styles.links}>{requires.map(entry => <li key={entry.name}><a href={href(itemPath(entry))}>{entry.title}</a></li>)}</ul>
        </section>
      ) : null}
    </div>
  );
}

const versionKey = (version: ItemVersion) => `${version.item.name}:${version.variant ?? ""}`;
/** Endereço de uma versão: outra página de item, ou a mesma com ?v=variante. */
const versionHref = (version: ItemVersion, tab?: string) => href(itemPath(version.item), { aba: tab && tab !== "demo" ? tab : undefined, v: version.variant });

/** As outras versões do item, em miniatura, abaixo do demo. */
function VersionStrip({ versions, active }: { versions: ItemVersion[]; active: ItemVersion }) {
  const { theme } = useTheme();
  const [missing, setMissing] = useState<string[]>([]);
  const others = versions.filter(version => versionKey(version) !== versionKey(active));
  if (!others.length) return null;
  return (
    <section className={styles.section} aria-labelledby="item-versions">
      <h2 id="item-versions">Outras versões</h2>
      <ul className={styles.versionGrid}>
        {others.map(version => {
          const source = asset(`thumbs/${version.item.name}${version.variant ? `--${version.variant}` : ""}-${theme}.webp`);
          return (
            <li key={versionKey(version)}>
              <a className={styles.versionCard} href={versionHref(version)}>
                <span className={styles.versionThumb}>
                  {missing.includes(source) ? <span aria-hidden="true">{version.label.slice(0, 1)}</span> : <img src={source} alt="" width={800} height={500} loading="lazy" decoding="async" onError={() => setMissing(list => [...list, source])} />}
                </span>
                <span className={styles.versionName}><strong>{version.label}</strong><small>{version.variant ? version.item.title : describe(version.item)}</small></span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ItemPage({ item, route }: { item: CatalogItem; route: Route }) {
  const requested = route.query.get("aba");
  const tab: TabValue = tabs.some(entry => entry.value === requested) ? (requested as TabValue) : "demo";
  const { previous, next } = neighbours(item);
  const versions = versionsOf(item);
  const own = versions.filter(version => version.item.name === item.name);
  const active = own.find(version => version.variant && version.variant === route.query.get("v")) ?? own[0] ?? versions[0]!;
  const kindLabel = item.kind === "block" ? "Blocos" : "Componentes";
  const kindPath = item.kind === "block" ? "/blocos" : "/componentes";

  useEffect(() => { document.title = `${item.title} · ryan-ui`; }, [item.title]);

  const crumbs = [
    { label: "Início", href: href("/") },
    { label: kindLabel, href: href(kindPath) },
    ...(item.kind === "component" ? [{ label: categoryLabel(item.category), href: href(kindPath, { cat: item.category }) }] : []),
    { label: item.title },
  ];

  return (
    <div className={styles.layout}>
      <Sidebar current={item} />
      <article className={styles.content}>
        <Breadcrumb ariaLabel="Você está em" items={crumbs} />
        <header className={styles.header}>
          <div className={styles.titleRow}><h1>{item.title}</h1><CategoryTag category={item.category} /></div>
          <p className={styles.lead}>{describe(item)}</p>
          <div className={styles.meta}>
            <span className={styles.metaLabel}>Dependências</span>
            {item.dependencies.map(dependency => <Badge key={dependency} size="sm" pill outline>{dependency}</Badge>)}
          </div>
        </header>

        {versions.length > 1 ? (
          <div className={styles.versionRow}>
            <span className={styles.metaLabel}>Versão</span>
            <SegmentedControl
              label="Versão"
              options={versions.map(version => ({ value: versionKey(version), label: version.label }))}
              value={versionKey(active)}
              onValueChange={value => {
                const target = versions.find(version => versionKey(version) === value);
                if (!target) return;
                const query = { aba: tab === "demo" ? undefined : tab, v: target.variant };
                if (target.item.name === item.name) navigate(itemPath(item), { replace: true, query }); else navigate(itemPath(target.item), { query });
              }}
            />
            <span className={styles.versionCount}>{versions.length} versões</span>
          </div>
        ) : null}

        <Tabs value={tab} onValueChange={value => navigate(itemPath(item), { replace: true, query: { aba: value === "demo" ? undefined : value, v: active.variant } })}>
          <TabsList aria-label={`Seções de ${item.title}`}>
            {tabs.map(entry => <TabsTrigger key={entry.value} value={entry.value}>{entry.label}</TabsTrigger>)}
          </TabsList>
          <TabsContent value="demo" className={styles.panel}>
            <div className={styles.stack}>
              <DemoStage item={item} variant={active.variant} />
              <VersionStrip versions={versions} active={active} />
              <ExampleCode item={item} />
            </div>
          </TabsContent>
          <TabsContent value="codigo" className={styles.panel}><CodeTab item={item} /></TabsContent>
          <TabsContent value="api" className={styles.panel}><ApiTab item={item} /></TabsContent>
          <TabsContent value="instalar" className={styles.panel}><InstallTab item={item} /></TabsContent>
        </Tabs>

        <nav className={styles.pager} aria-label="Outros itens">
          {previous ? <a href={href(itemPath(previous))} className={styles.pagerLink}><ArrowLeft size={16} aria-hidden="true" /><span><small>Anterior</small>{previous.title}</span></a> : <span />}
          {next ? <a href={href(itemPath(next))} className={`${styles.pagerLink} ${styles.pagerNext}`}><span><small>Próximo</small>{next.title}</span><ArrowRight size={16} aria-hidden="true" /></a> : <span />}
        </nav>
      </article>
    </div>
  );
}
