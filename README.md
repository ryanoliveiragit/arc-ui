# ryan-ui

Componentes e blocos React com movimento, prontos para copiar: CSS modules, tokens de design e `motion`. Cada item tem demo ao vivo, código, tabela de props e instalação pela CLI do shadcn.

- **221 itens**: 179 componentes e 42 blocos (ações, entradas, revelação, feedback, dados e gráficos, texto, interfaces de IA, jogos e blocos de página).
- **Tema escuro e claro**, com nove cores de destaque; a padrão é a lima `#DDFC74`, sempre como preenchimento sólido.
- **Versões**: alguns itens têm mais de uma versão (Toast, Hero section, Theme switch) e a página do item deixa escolher.
- **Sem pacote para manter**: a CLI copia o código para o seu projeto.

## Instalar um item

```bash
npx shadcn@latest add https://<endereço-do-site>/r/button.json
```

Troque `button` pelo nome do item. A página de cada item mostra o comando pronto, e `Instalação` no menu explica como instalar os tokens (`foundation.css`) na primeira vez.

## O que há neste repositório

- **Raiz**: o site já compilado, servido pelo GitHub Pages (`index.html`, `assets/`, `r/` com o registro de cada item, `api/`, `thumbs/`, `media/`).
- **`source/`**: o código-fonte do site e da biblioteca (Vite + React 19 + TypeScript).
  - `source/registry/` — os componentes (`components/`) e blocos (`blocks/`), mais `foundation.css` (tokens) e `motion-tokens.ts`.
  - `source/site/` — o site: páginas, demos (`site/demos/<item>.tsx`) e textos.
  - `source/scripts/` — geração do catálogo, da API, do registro e das miniaturas, e o teste dos demos.

## Rodar e publicar

```bash
cd source
npm install
npm run dev          # http://127.0.0.1:5199
npm run typecheck
npm run build        # gera source/dist
```

Para publicar, copie o conteúdo de `source/dist/` para a raiz do repositório (mantendo `.nojekyll`, `README.md`, `LICENSE` e `source/`).

As miniaturas da galeria não são geradas pelo build. Com o `npm run dev` no ar, rode `node scripts/build-thumbs.mjs` (usa o Chromium do Playwright) antes do build, ou copie a pasta `thumbs/` da raiz para `source/public/thumbs/`.

`node scripts/test-demos.mjs --poke` abre o demo de todos os itens nos dois temas e falha se algum quebrar.

## Licença e créditos

MIT (veja `LICENSE`). O ryan-ui parte do núcleo de código aberto (MIT) do Arc, de Elia Kuratli — repositório e commit de origem em `source/UPSTREAM.json`; o aviso de copyright original é mantido. Os demais itens e o site foram escritos para o ryan-ui e seguem a mesma licença.
