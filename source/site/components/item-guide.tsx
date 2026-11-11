import { Fragment } from "react";
import { FileText } from "lucide-react";
import { Bullets, CopyButton, Kbd, Rich, Section, TableCard } from "@/site/components/item-ui";
import type { GuideKey } from "@/site/lib/guide";
import { asset, siteBase } from "@/site/lib/site-config";
import styles from "./item-guide.module.css";

/** As seções que vêm do guia escrito do item (docs/<nome>.json). Cada uma só aparece quando tem conteúdo. */

/** Uma seção que é só uma lista de frases. Sem frases, não renderiza (e não entra no índice). */
export function ListSection({ id, title, items, linkItems, current }: { id: string; title: string; items?: string[]; linkItems?: boolean; current?: string }) {
  if (!items?.length) return null;
  return <Section id={id} title={title}><Bullets items={items} linkItems={linkItems} current={current} /></Section>;
}

/** "Alt + ←" numa tecla só vira dois chips com o sinal de mais entre eles. */
function Keys({ value }: { value: string }) {
  const parts = value.length > 1 && value.includes("+") ? value.split(/\s*\+\s*/).filter(Boolean) : [value];
  return <>{parts.map((part, index) => <Fragment key={index}>{index > 0 ? <span className={styles.join} aria-hidden="true">+</span> : null}<Kbd>{part}</Kbd></Fragment>)}</>;
}

export function KeyboardSection({ rows }: { rows?: GuideKey[] }) {
  if (!rows?.length) return null;
  return (
    <Section id="teclado" title="Teclado">
      <TableCard label="Atalhos de teclado">
        {/* Os papéis vão escritos porque no celular a tabela vira blocos (teclas em cima, texto embaixo) e não pode perder a semântica. */}
        <table className={styles.keys} role="table">
          <tbody role="rowgroup">
            {rows.map((row, index) => (
              <tr key={index} role="row">
                <th role="rowheader" scope="row"><span className={styles.combo}>{row.teclas.map((key, at) => <Fragment key={at}>{at > 0 ? <span className={styles.join}>ou</span> : null}<Keys value={key} /></Fragment>)}</span></th>
                <td role="cell"><Rich text={row.acao} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </Section>
  );
}

/** Caminho e endereço completo do arquivo Markdown de um item (public/md/<nome>.md, ver scripts/build-markdown.mjs). */
export const markdownHref = (name: string) => asset(`md/${name}.md`);
export const markdownUrl = (name: string) => `${siteBase()}md/${name}.md`;

export function AiNotesSection({ name, notes }: { name: string; notes?: string[] }) {
  const url = markdownUrl(name);
  return (
    <Section id="notas-ia" title="Notas para IA" intro="Dê ao seu assistente de código a referência em Markdown, em vez de capturas de tela.">
      {notes?.length ? <Bullets items={notes} /> : null}
      <div className={styles.file} data-alone={notes?.length ? undefined : "true"}>
        <FileText size={15} strokeWidth={1.75} aria-hidden="true" />
        <a className={styles.path} href={markdownHref(name)} target="_blank" rel="noreferrer">{new URL(url).pathname}</a>
        <CopyButton value={url} label="Copiar URL" />
      </div>
      <p className={styles.index}>O índice completo da biblioteca para assistentes está em <a href={asset("llms.txt")} target="_blank" rel="noreferrer">llms.txt</a>.</p>
    </Section>
  );
}
