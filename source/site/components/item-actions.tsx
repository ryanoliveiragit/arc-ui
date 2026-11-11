import { useState } from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { Bookmark, Check, ChevronDown, CircleAlert, Copy, FileText, Link2, Maximize2 } from "lucide-react";
import { useCopy } from "@/site/components/item-ui";
import { markdownHref } from "@/site/components/item-guide";
import type { CatalogItem } from "@/site/lib/catalog";
import { toggleSaved, useSaved } from "@/site/lib/saved";
import styles from "./item-actions.module.css";

/** As ações do topo da página de item: "Salvar" e o botão duplo "Copiar página" com o menu. */

/** Salva o item neste navegador (lista "Salvos" da barra lateral). */
export function SaveButton({ item }: { item: CatalogItem }) {
  const saved = useSaved().includes(item.name);
  return (
    <button type="button" className={styles.button} aria-pressed={saved} title={saved ? "Tirar dos salvos" : "Guardar na lista Salvos, neste navegador"} onClick={() => toggleSaved(item.name)}>
      <Bookmark size={15} strokeWidth={1.75} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
      {/* "Salvar" guarda o lugar para o botão não encolher quando vira "Salvo". */}
      <span className={styles.swap}><span className={styles.ghost} aria-hidden="true">Salvar</span><span>{saved ? "Salvo" : "Salvar"}</span></span>
    </button>
  );
}

/** Busca o Markdown do item. O servidor de desenvolvimento devolve a página do site para um arquivo que não existe: isso conta como erro. */
async function loadMarkdown(name: string): Promise<string> {
  const response = await fetch(markdownHref(name));
  if (!response.ok) throw new Error(`${response.status} ao buscar o Markdown`);
  const text = await response.text();
  if (/^\s*<(?:!doctype|html)/i.test(text)) throw new Error("Markdown do item não encontrado");
  return text;
}

interface CopyPageProps {
  item: CatalogItem;
  /** Endereço desta página (com a versão escolhida), para "Copiar link". */
  pageUrl: string;
  /** Endereço do demo sozinho. */
  previewHref: string;
}

export function CopyPageButton({ item, pageUrl, previewHref }: CopyPageProps) {
  const { state, copy } = useCopy();
  /** O que foi copiado por último, para o texto de retorno. */
  const [what, setWhat] = useState<"page" | "link">("page");
  const copyPage = () => { setWhat("page"); void copy(() => loadMarkdown(item.name)); };
  const copyLink = () => { setWhat("link"); void copy(pageUrl); };
  const label = state === "copied" ? (what === "link" ? "Link copiado" : "Copiado") : state === "error" ? "Não copiou" : "Copiar página";

  return (
    <div className={styles.split}>
      <button type="button" className={styles.splitMain} data-state={state} title="Copiar esta página em Markdown, para colar num assistente de código" onClick={copyPage}>
        {state === "copied" ? <Check size={15} strokeWidth={2} aria-hidden="true" /> : state === "error" ? <CircleAlert size={15} strokeWidth={1.75} aria-hidden="true" /> : <Copy size={15} strokeWidth={1.75} aria-hidden="true" />}
        {/* O texto mais largo guarda o lugar: o botão não muda de tamanho quando o rótulo troca. */}
        <span className={styles.swap}>
          <span className={styles.ghost} aria-hidden="true">Copiar página</span>
          <span className={styles.ghost} aria-hidden="true">Link copiado</span>
          <span aria-live="polite">{label}</span>
        </span>
      </button>
      <Menu.Root>
        <Menu.Trigger className={styles.splitMore} aria-label="Mais formas de copiar e abrir"><ChevronDown size={15} strokeWidth={1.75} aria-hidden="true" /></Menu.Trigger>
        <Menu.Portal>
          <Menu.Content className={styles.menu} align="end" sideOffset={6} collisionPadding={12}>
            <Menu.Item className={styles.menuItem} onSelect={copyPage}><Copy size={15} strokeWidth={1.75} aria-hidden="true" />Copiar página em Markdown</Menu.Item>
            <Menu.Item className={styles.menuItem} asChild><a href={markdownHref(item.name)} target="_blank" rel="noreferrer"><FileText size={15} strokeWidth={1.75} aria-hidden="true" />Ver em Markdown</a></Menu.Item>
            <Menu.Item className={styles.menuItem} onSelect={copyLink}><Link2 size={15} strokeWidth={1.75} aria-hidden="true" />Copiar link</Menu.Item>
            <Menu.Item className={styles.menuItem} asChild><a href={previewHref} target="_blank" rel="noreferrer"><Maximize2 size={15} strokeWidth={1.75} aria-hidden="true" />Abrir o demo em nova aba</a></Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
