# Mídia de demonstração

- `people/`, `photos/*.jpg`, `specials/`: SVGs e fotos baixados de `uiarc.dev/media/*` em 2026-11-12
  (mesmos assets servidos pelos demos do arc-library, projeto MIT — ver `UPSTREAM.json` na raiz).
  Os avatares e as fotos substituem versões geradas localmente para que os demos fiquem idênticos ao site.
- `photos/*.svg`: versões abstratas geradas por `scripts/make-media.mjs`, mantidas como fallback.
  Nenhum arquivo daqui é carregado por padrão (`lib/media.ts` aponta para os `.jpg`).
- Licença: MIT, como o resto do projeto.
