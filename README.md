# ryan-ui

Componentes e blocos React com movimento, prontos para copiar: CSS modules, tokens de design e `motion`. Cada item tem página própria com demo ao vivo, guia escrito, código, tabela de props e instalação pela CLI do shadcn.

- **221 itens**: 179 componentes e 42 blocos (ações, entradas, revelação, feedback, dados e gráficos, texto, interfaces de IA, jogos e blocos de página).
- **Página de item como documento**: preview ao vivo, Quando usar e Quando não usar, Instalação (CLI e manual), Uso, Referência da API, Teclado, Acessibilidade, Movimento, Comportamento responsivo, Desempenho, Notas para IA, Relacionados, e o índice "Nesta página".
- **Barra lateral em árvore** com busca, filtros (Todos, Novos, Versões), Salvos e grupos por categoria.
- **Para assistentes de código**: cada item tem um Markdown em `md/<item>.md`, e `llms.txt` lista todos.
- **Tema escuro e claro**, com nove cores de destaque; a padrão é a lima `#DDFC74`, sempre como preenchimento sólido.
- **Versões**: Toast, Hero section e Theme switch têm mais de uma versão, e a página do item deixa escolher.

## Instalar um item

```bash
npx shadcn@latest add https://ryanoliveiragit.github.io/arc-ui/r/button.json
```

Troque `button` pelo nome do item. A página de cada item mostra o comando pronto; `Docs › Instalação` explica como instalar os tokens (`foundation.css`) na primeira vez.

## O que há neste repositório

- **Raiz**: o site já compilado, servido pelo GitHub Pages (`index.html`, `assets/`, `r/` com o registro de cada item, `api/`, `docs/` com os guias, `md/`, `llms.txt`, `thumbs/`, `media/`).
- **`source/`**: o código-fonte do site e da biblioteca (Vite + React 19 + TypeScript).
  - `source/registry/`: os componentes (`components/`) e blocos (`blocks/`), mais `foundation.css` (tokens) e `motion-tokens.ts`.
  - `source/site/`: o site (páginas, demos em `site/demos/<item>.tsx`, textos em `site/content/`; os guias de cada item ficam em `site/content/docs/`).
  - `source/scripts/`: geração do catálogo, da API, do registro, dos guias, do Markdown e das miniaturas, e o teste dos demos.

## Rodar e publicar

```bash
cd source
npm install
npm run dev          # http://127.0.0.1:5199
npm run typecheck
npm run build        # gera source/dist (catálogo, API, registro, guias, Markdown e o site)
```

Para publicar, copie o conteúdo de `source/dist/` para a raiz do repositório, mantendo `.nojekyll`, `README.md`, `LICENSE` e `source/`.

As miniaturas da galeria não são geradas pelo build. Com o `npm run dev` no ar, rode `node scripts/build-thumbs.mjs` (usa o Chromium do Playwright) antes do build, ou copie a pasta `thumbs/` da raiz para `source/public/thumbs/`.

`node scripts/test-demos.mjs --poke` abre o demo de todos os itens nos dois temas e falha se algum quebrar.

## Licença e créditos

MIT (veja `LICENSE`). O ryan-ui parte do núcleo de código aberto (MIT) do Arc, de Elia Kuratli; o repositório e o commit de origem estão em `source/UPSTREAM.json`, e o aviso de copyright original é mantido. Os demais itens, os guias e o site foram escritos para o ryan-ui e seguem a mesma licença.
