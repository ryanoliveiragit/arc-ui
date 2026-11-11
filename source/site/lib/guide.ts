/**
 * O guia escrito de um item (site/content/docs/*.json → public/docs/<nome>.json, ver scripts/build-docs.mjs).
 * Existe só quando o catálogo diz `hasGuide`. Toda lista é opcional: vazia ou ausente, a seção não aparece.
 */
export interface GuideKey { teclas: string[]; acao: string }
export interface Guide {
  /** Quando o item é a escolha certa. */
  quandoUsar?: string[];
  /** Quando escolher outra coisa. Outros itens aparecem pelo nome entre crases (`split-button`), e a página os transforma em link. */
  quandoEvitar?: string[];
  teclado?: GuideKey[];
  acessibilidade?: string[];
  movimento?: string[];
  responsivo?: string[];
  desempenho?: string[];
  /** Dicas para quem pede este item a um assistente de código. */
  notasIA?: string[];
}
