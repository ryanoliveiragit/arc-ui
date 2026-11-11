import { useEffect } from "react";
import { CodeBlock } from "@/registry/components/code-block/code-block";
import ThemeSwitch from "@/registry/components/theme-switch/theme-switch";
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
        <ThemeSwitch theme={theme} iconOnly label="Mudar tema" onThemeChange={(next, _variant, trigger) => switchTheme(next, trigger, "reveal")} />
      </div>
      <div className={styles.playgroundRow}>
        <span className={styles.playgroundLabel}>Cor de destaque</span>
        <div className={styles.swatches} role="radiogroup" aria-label="Cor de destaque">
          {accents.map(name => (
            <button key={name} type="button" role="radio" aria-checked={accent === name} title={accentNames[name]} className={styles.swatch} style={{ background: accentSwatch[name] }} onClick={() => setAccent(name)} />
          ))}
        </div>
      </div>
    </div>
  );
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

export function DocsPage({ page }: { page: DocsPageId }) {
  useEffect(() => {
    const titles: Record<DocsPageId, string> = { instalacao: "Instalação", temas: "Temas e tokens", licenca: "Licença e créditos" };
    document.title = `${titles[page]} · ryan-ui`;
  }, [page]);

  if (page === "instalacao") {
    return (
      <article className={styles.page}>
        <header className={styles.header}>
          <h1>Instalação</h1>
          <p className={styles.lead}>O ryan-ui não é um pacote para importar: é um registro de código. Cada item copia os arquivos para o seu projeto — depois são seus, sem versão para acompanhar.</p>
        </header>

        <section className={styles.section}>
          <h2>Pré-requisitos</h2>
          <ul className={styles.list}>
            <li><code>React 19</code> com TypeScript.</li>
            <li>Um bundler com o alias <code>@/</code> apontando para a raiz do projeto (Vite e Next.js: padrão).</li>
            <li>Node 20.19 ou mais recente para a CLI.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>1 · Os tokens, uma vez</h2>
          <p>Os tokens de design e de movimento vão primeiro. O comando instala <code>foundation.css</code> e <code>motion-tokens.ts</code> juntos.</p>
          <CodeBlock code={`npx shadcn@latest add ${registryUrl("ryan-foundation")}`} filename="Terminal" language="bash" />
          <p>Depois importe o CSS uma única vez na raiz do app:</p>
          <CodeBlock code={`import "@/components/ryan-ui/foundation.css";`} filename="main.tsx" language="tsx" />
          <p className={styles.note}>Sem esta importação os componentes renderizam sem cor, raio ou espaço. É o único passo global — cada item não pede mais nada.</p>
        </section>

        <section className={styles.section}>
          <h2>2 · Adicione itens</h2>
          <p>Cada página do site tem o comando do próprio item na aba <strong>Instalação</strong>. Exemplo, para o botão:</p>
          <CodeBlock code={`npx shadcn@latest add ${registryUrl("button")}`} filename="Terminal" language="bash" />
          <p>Depois importe no componente que usar:</p>
          <CodeBlock code={`import { Button } from "@/components/ryan-ui/button/button";`} filename="App.tsx" language="tsx" />
          <p className={styles.note}>Itens que usam outros itens trazem os arquivos deles junto — não é preciso instalar dependência interna uma a uma.</p>
        </section>

        <section className={styles.section}>
          <h2>Manual</h2>
          <ol className={styles.steps}>
            <li><p>Instale os pacotes npm que o item lista na aba Instalação.</p></li>
            <li><p>Copie os arquivos da aba <strong>Código</strong> para os caminhos indicados nela.</p></li>
            <li><p>Garanta que <code>foundation.css</code> e <code>motion-tokens.ts</code> já estão no projeto (passo 1).</p></li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2>Mídia dos demos</h2>
          <p>Avatares e fotos dos exemplos ficam em <code>public/media/</code>, todos SVGs gerados por script, sem terceiros. Se o seu site vive em subpasta, defina antes dos componentes carregarem:</p>
          <CodeBlock code={`window.__RYAN_UI_MEDIA__ = "./media";`} filename="index.html" language="js" />
        </section>
      </article>
    );
  }

  if (page === "temas") {
    return (
      <article className={styles.page}>
        <header className={styles.header}>
          <h1>Temas e tokens</h1>
          <p className={styles.lead}>Dois temas e nove cores de destaque, trocados por dois atributos no <code>&lt;html&gt;</code>. Nada de classe por tela: todo o valor vem de tokens.</p>
        </header>

        <ThemePlayground />

        <section className={styles.section}>
          <h2>Tema claro e escuro</h2>
          <p>O tema é o atributo <code>data-theme</code> na raiz do documento. Para não piscar na primeira pintura, aplique antes do CSS carregar — o script que o site usa, adaptado ao seu app:</p>
          <CodeBlock code={`<script>
  (function () {
    var theme = localStorage.getItem("theme") || "system";
    if (theme !== "light" && theme !== "dark") {
      theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.dataset.theme = theme;
  })();
</script>`} filename="index.html" language="html" />
          <p className={styles.note}>Também vale por partes: qualquer elemento aceita <code>data-theme="dark"</code> e herda os valores escuros dentro dele.</p>
        </section>

        <section className={styles.section}>
          <h2>Cor de destaque</h2>
          <p>O atributo <code>data-accent</code> escolhe entre nove paletas calibradas nos dois temas. A padrão é a lima (<code>#DDFC74</code>), sempre como preenchimento sólido com texto escuro; a neutra segue o cinza da página:</p>
          <p>
            {accents.map((name, index) => <span key={name}><code>{name}</code>{index < accents.length - 1 ? " · " : ""}</span>)}
          </p>
          <p className={styles.note}>Teste aí em cima: a mudança cobre o site inteiro, incluindo os demos. Componentes só leem <code>--accent</code> e o que dele deriva — nunca uma cor fixa.</p>
        </section>

        <section className={styles.section}>
          <h2>Tokens de design</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th scope="col">Token</th><th scope="col">Para quê</th></tr></thead>
              <tbody>
                {designTokens.map(([token, use]) => (
                  <tr key={token}><th scope="row"><code>{token}</code></th><td>{use}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.note}>O movimento tem casa própria: <code>motion-tokens.ts</code> exporta durações, curvas e molas nomeadas que todos os componentes usam. E tudo respeita <code>prefers-reduced-motion</code>: com a preferência ligada, o movimento vira troca direta.</p>
        </section>
      </article>
    );
  }

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <h1>Licença e créditos</h1>
        <p className={styles.lead}>O ryan-ui é distribuído como MIT: use, mude e distribua, inclusive comercialmente, mantendo este aviso.</p>
      </header>

      <section className={styles.section}>
        <h2>Licença MIT</h2>
        <div className={styles.licenseBox}>
          <p><strong>MIT License</strong></p>
          <p>Copyright (c) 2026 Elia Kuratli</p>
          <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
          <p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
          <p className={styles.noWrap}>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Créditos</h2>
        <ul className={styles.list}>
          <li>O núcleo deste projeto — componentes, blocos, tokens e movimento — vem do <a href={site.upstream.repository} target="_blank" rel="noreferrer">Arc</a>, de Elia Kuratli. Este site reúne apenas os itens liberados sob MIT, e o aviso de copyright original é mantido aqui por exigência da licença.</li>
          <li>A mídia dos demos (avatares e fotos) é gerada por script a partir de sementes fixas: não há fotografia nem imagem de terceiro.</li>
          <li>Tipografia: Geist e Inter, de Google Fonts, via <code>@fontsource-variable</code> (OFL/Apache).</li>
        </ul>
      </section>
    </article>
  );
}
