import { useCallback, useEffect, useId, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { ArrowUp, ChevronRight } from "lucide-react";
import ThemeSwitch from "@/registry/components/theme-switch/theme-switch";
import { CodeCard, type CodeLanguage } from "@/site/components/item-code-card";
import { PageFooter } from "@/site/components/site-footer";
import { href } from "@/site/lib/router";
import { setAccent, useTheme, accents, type Accent } from "@/site/lib/theme";
import { switchTheme } from "@/site/lib/theme-transition";
import { registryUrl, site } from "@/site/lib/site-config";
import styles from "./docs.module.css";

export type DocsPageId = "instalacao" | "temas" | "licenca";

const accentNames: Record<Accent, string> = { lime: "Lima", neutral: "Neutro", violet: "Violeta", blue: "Azul", green: "Verde", amber: "Âmbar", orange: "Laranja", coral: "Coral", rose: "Rosa" };
const accentSwatch: Record<Accent, string> = { lime: "#ddfc74", neutral: "var(--neutral-9)", violet: "#7747ff", blue: "#0562ef", green: "#0db879", amber: "#f3ad20", orange: "#f48120", coral: "#f15f55", rose: "#ed4e9d" };

/** Playground ao vivo: o mesmo <html data-theme data-accent> que o site inteiro usa. */
function ThemePlayground() {
  const { theme, accent } = useTheme();
  return (
    <div className={styles.playground}>
      <div className={styles.playgroundRow}>
        <span className={styles.playgroundLabel}>Tema</span>
        <ThemeSwitch theme={theme} iconOnly label={theme === "dark" ? "Mudar para o tema claro" : "Mudar para o tema escuro"} onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "reveal")} />
      </div>
      <div className={styles.playgroundRow}>
        <span className={styles.playgroundLabel}>Cor de destaque</span>
        <div className={styles.swatches} role="radiogroup" aria-label="Cor de destaque">
          {accents.map(name => (
            <button key={name} type="button" role="radio" aria-checked={accent === name} aria-label={accentNames[name]} title={accentNames[name]} className={styles.swatch} style={{ background: accentSwatch[name] }} onClick={() => setAccent(name)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Um comando de terminal e um trecho de código, no mesmo cartão de código da página de item. */
function Command({ code, label }: { code: string; label: string }) {
  return <CodeCard label={label} code={code} language="bash" filename="Terminal" gutter="prompt" />;
}
function Snippet({ code, filename, language }: { code: string; filename: string; language: CodeLanguage }) {
  return <CodeCard label={`Código de ${filename}`} code={code} language={language} filename={filename} gutter={code.includes("\n") ? "lines" : "none"} />;
}

const designTokens: [string, string][] = [
  ["--background, --surface, --surface-raised, --surface-muted", "Fundo da página e dos painéis, em quatro níveis de elevação sem sombra."],
  ["--foreground, --text-secondary, --text-muted", "Texto principal, apoio e discreto."],
  ["--border, --border-subtle, --border-strong", "Três intensidades de borda, do divisor ao foco."],
  ["--accent, --accent-strong, --accent-subtle, --accent-foreground", "A cor de destaque: o texto sobre ela nunca perde contraste nos dois temas."],
  ["--success, --warning, --danger, --info", "Estados, sempre acima de 4,5:1 sobre a superfície."],
  ["--radius-control, --radius-panel, --radius-surface, --radius-pill", "Raios de botões, cartões, páginas e pílulas."],
  ["--shadow-resting, --shadow-raised, --shadow-floating", "Sombras de repouso, hover e overlays."],
  ["--space-1 … --space-24", "Escala de espaçamento em rem; é o que separa todos os layouts."],
  ["--text-xs … --text-5xl", "Escala tipográfica, com --tracking-display e --leading-* para cada contexto."],
  ["--duration-*, --ease-*", "Durações e curvas; --ease-spring é um mola críticamente amortecida, sem overshoot."],
];

interface DocSection { id: string; title: string; body: ReactNode }
interface DocPage { title: string; documentTitle: string; lead: ReactNode; intro?: ReactNode; sections: DocSection[] }

const pages: Record<DocsPageId, () => DocPage> = {
  instalacao: () => ({
    title: "Instalação",
    documentTitle: "Instalação",
    lead: <>O ryan-ui não é um pacote para importar: é um registro de código. Cada item copia os arquivos para o seu projeto — depois são seus, sem versão para acompanhar.</>,
    sections: [
      { id: "pre-requisitos", title: "Pré-requisitos", body: (
        <ul className={styles.list}>
          <li><code>React 19</code> com TypeScript.</li>
          <li>Um bundler com o alias <code>@/</code> apontando para a raiz do projeto (Vite e Next.js: padrão).</li>
          <li>Node 20.19 ou mais recente para a CLI.</li>
        </ul>
      ) },
      { id: "tokens", title: "1 · Os tokens, uma vez", body: <>
        <p>Os tokens de design e de movimento vão primeiro. O comando instala <code>foundation.css</code> e <code>motion-tokens.ts</code> juntos.</p>
        <Command label="Comando que instala os tokens" code={`npx shadcn@latest add ${registryUrl("ryan-foundation")}`} />
        <p>Depois importe o CSS uma única vez na raiz do app:</p>
        <Snippet code={`import "@/components/ryan-ui/foundation.css";`} filename="main.tsx" language="tsx" />
        <p className={styles.note}>Sem esta importação os componentes renderizam sem cor, raio ou espaço. É o único passo global — cada item não pede mais nada.</p>
      </> },
      { id: "itens", title: "2 · Adicione itens", body: <>
        <p>Cada página do site tem o comando do próprio item na seção <strong>Instalação</strong>. Exemplo, para o botão:</p>
        <Command label="Comando que instala o botão" code={`npx shadcn@latest add ${registryUrl("button")}`} />
        <p>Depois importe no componente que usar:</p>
        <Snippet code={`import { Button } from "@/components/ryan-ui/button/button";`} filename="App.tsx" language="tsx" />
        <p className={styles.note}>Itens que usam outros itens trazem os arquivos deles junto — não é preciso instalar dependência interna uma a uma.</p>
      </> },
      { id: "manual", title: "Manual", body: (
        <ol className={styles.steps}>
          <li><p>Instale os pacotes npm que o item lista na seção Instalação.</p></li>
          <li><p>Copie os arquivos da aba <strong>Código</strong> para os caminhos indicados nela.</p></li>
          <li><p>Garanta que <code>foundation.css</code> e <code>motion-tokens.ts</code> já estão no projeto (passo 1).</p></li>
        </ol>
      ) },
      { id: "midia", title: "Mídia dos demos", body: <>
        <p>Avatares e fotos dos exemplos ficam em <code>public/media/</code>, todos SVGs gerados por script, sem terceiros. Se o seu site vive em subpasta, defina antes dos componentes carregarem:</p>
        <Snippet code={`window.__RYAN_UI_MEDIA__ = "./media";`} filename="index.html" language="ts" />
      </> },
    ],
  }),
  temas: () => ({
    title: "Temas e tokens",
    documentTitle: "Temas e tokens",
    lead: <>Dois temas e nove cores de destaque, trocados por dois atributos no <code>&lt;html&gt;</code>. Nada de classe por tela: todo o valor vem de tokens.</>,
    intro: <ThemePlayground />,
    sections: [
      { id: "tema", title: "Tema claro e escuro", body: <>
        <p>O tema é o atributo <code>data-theme</code> na raiz do documento. Para não piscar na primeira pintura, aplique antes do CSS carregar — o script que o site usa, adaptado ao seu app:</p>
        <Snippet code={`<script>
  (function () {
    var theme = localStorage.getItem("theme") || "system";
    if (theme !== "light" && theme !== "dark") {
      theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.dataset.theme = theme;
  })();
</script>`} filename="index.html" language="tsx" />
        <p className={styles.note}>Também vale por partes: qualquer elemento aceita <code>data-theme="dark"</code> e herda os valores escuros dentro dele.</p>
      </> },
      { id: "cor", title: "Cor de destaque", body: <>
        <p>O atributo <code>data-accent</code> escolhe entre nove paletas calibradas nos dois temas. A padrão é a lima (<code>#DDFC74</code>), sempre como preenchimento sólido com texto escuro; a neutra segue o cinza da página:</p>
        <p>{accents.map((name, index) => <span key={name}><code>{name}</code>{index < accents.length - 1 ? " · " : ""}</span>)}</p>
        <p className={styles.note}>Teste aí em cima: a mudança cobre o site inteiro, incluindo os demos. Componentes só leem <code>--accent</code> e o que dele deriva — nunca uma cor fixa.</p>
      </> },
      { id: "tokens", title: "Tokens de design", body: <>
        <div className={styles.tableWrap} role="group" aria-label="Tokens de design" tabIndex={0}>
          <table className={styles.table}>
            <thead><tr><th scope="col">Token</th><th scope="col">Para quê</th></tr></thead>
            <tbody>
              {designTokens.map(([token, use]) => <tr key={token}><th scope="row"><span className={styles.tokens}>{token.split(", ").map(name => <code key={name}>{name}</code>)}</span></th><td>{use}</td></tr>)}
            </tbody>
          </table>
        </div>
        <p className={styles.note}>O movimento tem casa própria: <code>motion-tokens.ts</code> exporta durações, curvas e molas nomeadas que todos os componentes usam. E tudo respeita <code>prefers-reduced-motion</code>: com a preferência ligada, o movimento vira troca direta.</p>
      </> },
    ],
  }),
  licenca: () => ({
    title: "Licença e créditos",
    documentTitle: "Licença e créditos",
    lead: <>O ryan-ui é distribuído como MIT: use, mude e distribua, inclusive comercialmente, mantendo este aviso.</>,
    sections: [
      { id: "licenca", title: "Licença MIT", body: (
        <div className={styles.licenseBox}>
          <p><strong>MIT License</strong></p>
          <p>Copyright (c) 2026 Elia Kuratli</p>
          <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
          <p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
          <p className={styles.noWrap}>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
        </div>
      ) },
      { id: "creditos", title: "Créditos", body: (
        <ul className={styles.list}>
          <li>O núcleo deste projeto — componentes, blocos, tokens e movimento — vem do <a href={site.upstream.repository} target="_blank" rel="noreferrer">Arc</a>, de Elia Kuratli. Este site reúne apenas os itens liberados sob MIT, e o aviso de copyright original é mantido aqui por exigência da licença.</li>
          <li>A mídia dos demos (avatares e fotos) é gerada por script a partir de sementes fixas: não há fotografia nem imagem de terceiro.</li>
          <li>Tipografia: Geist e Inter, de Google Fonts, via <code>@fontsource-variable</code> (OFL/Apache).</li>
        </ul>
      ) },
    ],
  }),
};

/** Distância do topo da janela em que uma seção passa a contar como "a atual": onde ela para ao ser escolhida no índice, mais uma folga. */
const spyOffset = (section: HTMLElement) => (parseFloat(getComputedStyle(section).scrollMarginTop) || 0) + 72;

/** O índice "Nesta página": um link por seção, com a seção à vista marcada. */
function Rail({ page, sections }: { page: DocsPageId; sections: DocSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const titleId = useId();
  /*
   * Depois de um clique no índice, a seção escolhida fica marcada enquanto a página rola até ela, mesmo que a página acabe
   * antes de o título chegar ao topo (as últimas seções). A marca volta a seguir a rolagem quando ela para, ou quando a pessoa
   * mexe (roda, toque, tecla, clique).
   */
  const locked = useRef(false);
  const lockTimer = useRef(0);
  const settle = useCallback(() => { window.clearTimeout(lockTimer.current); lockTimer.current = window.setTimeout(() => { locked.current = false; }, 160); }, []);

  useEffect(() => {
    let frame = 0;
    const unlock = () => { locked.current = false; window.clearTimeout(lockTimer.current); };
    const sync = () => {
      let current = sections[0]?.id ?? "";
      for (const section of sections) { const node = document.getElementById(section.id); if (node && node.getBoundingClientRect().top <= spyOffset(node)) current = section.id; }
      // No fim da página a última seção pode não alcançar o topo: ela vale mesmo assim.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2 && window.scrollY > 0) current = sections[sections.length - 1]?.id ?? current;
      setActive(current);
    };
    const onScroll = () => {
      if (locked.current) { settle(); return; }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };
    const intents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    intents.forEach(type => window.addEventListener(type, unlock, { passive: true, capture: true }));
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(lockTimer.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      intents.forEach(type => window.removeEventListener(type, unlock, { capture: true }));
    };
  }, [sections, settle]);

  // O link aponta para a própria página (as rotas usam o hash); o clique rola até a seção.
  const jump = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const node = document.getElementById(id);
    if (!node) return;
    // O clique e a tecla que acionaram o link já passaram pelos ouvintes acima; a trava vale a partir daqui.
    locked.current = true;
    settle();
    node.scrollIntoView({ block: "start" });
    node.focus({ preventScroll: true });
    setActive(id);
  };

  return (
    <aside className={styles.rail}>
      <nav aria-labelledby={titleId}>
        <p id={titleId} className={styles.railTitle}>Nesta página</p>
        <ul className={styles.railList}>
          {sections.map(section => <li key={section.id}><a href={href(`/docs/${page}`)} aria-current={active === section.id ? "location" : undefined} onClick={jump(section.id)}>{section.title}</a></li>)}
        </ul>
      </nav>
      <div className={styles.railExtra}>
        <button type="button" className={styles.railTop} onClick={() => window.scrollTo({ top: 0 })}><span>Voltar ao topo</span><ArrowUp size={13} strokeWidth={1.75} aria-hidden="true" /></button>
      </div>
    </aside>
  );
}

export function DocsPage({ page }: { page: DocsPageId }) {
  const { title, documentTitle, lead, intro, sections } = useMemo(() => pages[page](), [page]);
  useEffect(() => { document.title = `${documentTitle} · ${site.name}`; }, [documentTitle]);

  return (
    <div className={styles.page}>
      <article className={styles.content}>
        <nav className={styles.crumbs} aria-label="Você está em">
          <ol>
            <li><a href={href("/docs/instalacao")}>Docs</a></li>
            <li aria-hidden="true"><ChevronRight size={14} strokeWidth={1.75} /></li>
            <li aria-current="page">{title}</li>
          </ol>
        </nav>
        <header className={styles.header}>
          <h1>{title}</h1>
          <p className={styles.lead}>{lead}</p>
        </header>
        {intro}
        {sections.map(section => (
          <section key={section.id} id={section.id} className={styles.section} tabIndex={-1} aria-labelledby={`${section.id}-titulo`}>
            <h2 id={`${section.id}-titulo`}>{section.title}</h2>
            {section.body}
          </section>
        ))}
        <PageFooter />
      </article>
      <Rail key={page} page={page} sections={sections} />
    </div>
  );
}
