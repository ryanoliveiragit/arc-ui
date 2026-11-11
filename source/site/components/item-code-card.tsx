import { useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDown, FileCode2 } from "lucide-react";
import { CopyButton, useScrollableFocus } from "@/site/components/item-ui";
import styles from "./item-code-card.module.css";

/**
 * O cartão de código da página de item: cabeçalho (nome do arquivo ou abas em pílula, e "Copiar") e o código com números de
 * linha e cores leves. É do site, não a peça `code-block` da biblioteca: o desenho segue o resto da página.
 */

export type CodeLanguage = "tsx" | "ts" | "css" | "json" | "bash" | "text";
export const languageOf = (file: string): CodeLanguage => (file.endsWith(".css") ? "css" : file.endsWith(".tsx") ? "tsx" : file.endsWith(".json") ? "json" : /\.[cm]?[jt]s$/.test(file) ? "ts" : "text");

type Kind = "comment" | "string" | "keyword" | "number" | "tag" | "prop";
interface Token { kind?: Kind; text: string }

const keywords = new Set("as async await break case catch class const continue default delete do else enum export extends finally for from function if implements import in instanceof interface let new of return satisfies static switch throw try type typeof var void while yield true false null undefined".split(" "));
/** Palavras que em código aparecem entre dois nomes (`chave in objeto`). As outras, depois de um nome, quase sempre são texto de interface ("Search for items"). */
const joining = new Set(["as", "in", "instanceof", "of", "extends", "from", "satisfies", "implements"]);

const scriptPattern = /\/\*[\s\S]*?\*\/|\/\/[^\n]*|`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?n?\b|[A-Za-z_$][\w$]*|<\/?(?=[A-Za-z])|[^\s\w$]/g;
const stylePattern = /\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|@[\w-]+|--[\w-]+|#[0-9a-fA-F]{3,8}\b|-?\d*\.?\d+(?:[a-z%]+)?|![a-z]+|[A-Za-z_][\w-]*|[^\s\w]/g;
const jsonPattern = /"(?:\\.|[^"\\\n])*"|-?\d+(?:\.\d+)?(?:e[+-]?\d+)?|\b(?:true|false|null)\b/g;

/** Separa o código em pedaços com um papel (palavra-chave, texto, etiqueta…). É leitura por padrão de texto, não um parser. */
function tokenize(code: string, language: CodeLanguage): Token[] {
  if (language === "bash" || language === "text") return [{ text: code }];
  const pattern = language === "css" ? stylePattern : language === "json" ? jsonPattern : scriptPattern;
  const tokens: Token[] = [];
  let cursor = 0;
  /** Último pedaço que não é espaço, e se houve quebra de linha desde ele. */
  let previous: Token | null = null, lineBroke = true, afterOpen = false;
  for (const match of code.matchAll(pattern)) {
    const text = match[0], index = match.index;
    if (index > cursor) { const gap = code.slice(cursor, index); tokens.push({ text: gap }); if (gap.includes("\n")) lineBroke = true; }
    const rest = code.slice(index + text.length);
    let kind: Kind | undefined;
    if (language === "json") kind = text.startsWith('"') ? (/^\s*:/.test(rest) ? "prop" : "string") : /^[-\d]/.test(text) ? "number" : "keyword";
    else if (text.startsWith("/*") || text.startsWith("//")) kind = "comment";
    else if (/^["'`]/.test(text)) kind = "string";
    else if (language === "css") {
      if (text.startsWith("@") || text.startsWith("!")) kind = "keyword";
      else if (text.startsWith("--")) kind = "prop";
      else if (/^[#\d.-]/.test(text) && /\d|^#/.test(text)) kind = "number";
      else if (/^[A-Za-z_]/.test(text) && /^\s*:/.test(rest) && (previous?.text === "{" || previous?.text === ";")) kind = "tag";
    } else if (text === "<" || text === "</") kind = "tag";
    else if (/^\d/.test(text)) kind = "number";
    else if (/^[A-Za-z_$]/.test(text)) {
      if (afterOpen) kind = "tag";
      else if (keywords.has(text)) {
        // `type="button"` é atributo e `{ type: "x" }` é chave: nesses lugares a palavra não é da linguagem.
        const assigned = /^\s*=(?![=>])/.test(rest);
        const key = /^\s*\??:/.test(rest) && (!previous || lineBroke || previous.text === "{" || previous.text === ",");
        const prose = !joining.has(text) && !lineBroke && previous != null && previous.kind !== "keyword" && /^[A-Za-z_$]/.test(previous.text);
        if (!assigned && !key && !prose && previous?.text !== ".") kind = "keyword";
      }
    }
    const token = { kind, text };
    tokens.push(token);
    afterOpen = text === "<" || text === "</";
    // No CSS um comentário não muda o que vem antes de uma propriedade.
    if (kind !== "comment") { previous = token; lineBroke = false; }
    cursor = index + text.length;
  }
  if (cursor < code.length) tokens.push({ text: code.slice(cursor) });
  return tokens;
}

/** Os pedaços por linha: um texto ou comentário de várias linhas é repartido, e cada parte mantém o papel. */
function toLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const token of tokens) {
    const parts = token.text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1]!.push({ kind: token.kind, text: part });
    });
  }
  return lines;
}

interface CodeCardProps {
  /** Nome acessível da área de código, por exemplo "Código de button.tsx". */
  label: string;
  code: string;
  language?: CodeLanguage;
  /** Nome do arquivo no cabeçalho, com ícone… */
  filename?: string;
  /** …ou outro conteúdo no lugar dele (abas em pílula). */
  header?: ReactNode;
  /** Números de linha (padrão), o `$` de um comando de terminal, ou nada. */
  gutter?: "lines" | "prompt" | "none";
  /** Códigos mais longos que isto começam recolhidos, com "Mostrar tudo". */
  maxLines?: number;
  copyLabel?: string;
  /** Atributos do corpo, para ligá-lo às abas do cabeçalho. */
  body?: { id?: string; role?: "tabpanel"; "aria-labelledby"?: string };
}

export function CodeCard({ label, code, language = "tsx", filename, header, gutter = "lines", maxLines, copyLabel = "Copiar", body }: CodeCardProps) {
  const card = useRef<HTMLDivElement>(null);
  const scroller = useScrollableFocus<HTMLPreElement>();
  const preId = useId();
  const [expanded, setExpanded] = useState(false);
  const lines = useMemo(() => toLines(tokenize(code, language)), [code, language]);
  // Só recolhe quando sobra o bastante para valer o clique.
  const collapsible = maxLines != null && lines.length > maxLines + 4;
  const shown = collapsible && !expanded ? lines.slice(0, maxLines) : lines;
  const digits = Math.max(2, String(lines.length).length);

  function toggle() {
    setExpanded(value => !value);
    // Ao recolher, o topo do cartão pode ter ficado para cima da janela: traz de volta para a pessoa não se perder.
    if (expanded) requestAnimationFrame(() => { const top = card.current?.getBoundingClientRect().top ?? 0; if (top < 0) card.current?.scrollIntoView({ block: "start", behavior: "auto" }); });
  }

  return (
    <div ref={card} className={styles.card}>
      <div className={styles.header} data-plain={header ? undefined : "true"}>
        {header ?? <span className={styles.file}><FileCode2 size={14} strokeWidth={1.75} aria-hidden="true" /><span>{filename}</span></span>}
        <CopyButton value={code} label={copyLabel} />
      </div>
      <div className={styles.body} {...body}>
        <pre ref={scroller.ref} id={preId} className={styles.pre} role="group" aria-label={label} tabIndex={scroller.tabIndex} data-gutter={gutter} data-clipped={collapsible && !expanded ? "true" : undefined} style={{ "--digits": digits } as CSSProperties}>
          <code>
            {shown.map((line, index) => (
              <span key={index} className={styles.line}>{line.map((token, at) => (token.kind ? <span key={at} className={styles[token.kind]}>{token.text}</span> : token.text))}</span>
            ))}
          </code>
        </pre>
        {collapsible ? (
          <button type="button" className={styles.more} aria-expanded={expanded} aria-controls={preId} onClick={toggle}>
            <span>{expanded ? "Mostrar menos" : `Mostrar tudo · ${lines.length} linhas`}</span>
            <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
