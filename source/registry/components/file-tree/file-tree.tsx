"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { ChevronRight, File, FileCode, FileCog, FileImage, FileJson, FileLock, FileTerminal, FileText, Folder, FolderOpen, Paintbrush } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./file-tree.module.css";

export type FileTreeStatus = "modified" | "added" | "deleted" | "untracked";

export interface FileTreeNode {
  /** File or folder name, with its extension. The extension picks the icon. */
  name: string;
  /** Unique id. Defaults to the path from the root, such as `src/app/page.tsx`. */
  id?: string;
  /** Present on folders (use an empty array for an empty folder); absent on files. */
  children?: FileTreeNode[];
  /** Version control state, shown as a letter at the end of the row. A folder shows a dot when anything inside it changed. */
  status?: FileTreeStatus;
  /** Keeps the row visible but skips it for selection and keyboard focus. */
  disabled?: boolean;
  /** Replaces the icon picked from the extension. */
  icon?: ReactNode;
}

/**
 * A file explorer tree. Folders open on a height spring while their rows arrive one after another; files carry an icon for their type.
 * Keyboard: arrows move and open or close, Home and End jump, Enter or Space activates, typing a name jumps to it, and * opens sibling folders.
 */
export interface FileTreeProps {
  /** The root level of files and folders. */
  nodes: FileTreeNode[];
  /** Id of the selected file (controlled). Pass null for none. */
  value?: string | null;
  /** Selected file when uncontrolled. */
  defaultValue?: string | null;
  /** Called when a row is selected. */
  onValueChange?: (id: string, node: FileTreeNode) => void;
  /** Ids of the open folders (controlled). */
  expandedIds?: string[];
  /** Open folders when uncontrolled. */
  defaultExpandedIds?: string[];
  /** Called with the next list of open folder ids. */
  onExpandedChange?: (expandedIds: string[]) => void;
  /** Called when a file is opened with Enter or a double click. */
  onOpen?: (id: string, node: FileTreeNode) => void;
  /** Lets folders be selected as well as opened. */
  selectFolders?: boolean;
  /** Accessible name of the tree. */
  label?: string;
  /** Extra class for the tree. */
  className?: string;
}

interface FlatNode {
  node: FileTreeNode;
  id: string;
  depth: number;
  parentId?: string;
  isFolder: boolean;
}

type FileKind = "code" | "data" | "style" | "doc" | "image" | "config" | "lock" | "shell" | "file";
const kinds: Record<string, FileKind> = {
  ts: "code", tsx: "code", js: "code", jsx: "code", mjs: "code", cjs: "code", py: "code", go: "code", rs: "code", html: "code", vue: "code", svelte: "code",
  json: "data", csv: "data", xml: "data", sql: "data",
  css: "style", scss: "style", less: "style",
  md: "doc", mdx: "doc", txt: "doc", pdf: "doc",
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", avif: "image", svg: "image", ico: "image",
  yml: "config", yaml: "config", toml: "config", ini: "config",
  lock: "lock", env: "lock", pem: "lock", key: "lock",
  sh: "shell", bash: "shell", zsh: "shell",
};
const kindIcons = { code: FileCode, data: FileJson, style: Paintbrush, doc: FileText, image: FileImage, config: FileCog, lock: FileLock, shell: FileTerminal, file: File };
const statusLetters: Record<FileTreeStatus, string> = { modified: "M", added: "A", deleted: "D", untracked: "U" };

function kindOf(name: string): FileKind {
  const lower = name.toLowerCase();
  if (lower.startsWith(".env")) return "lock";
  if (/\.config\.[a-z]+$/.test(lower) || lower.startsWith("tsconfig")) return "config";
  return kinds[lower.slice(lower.lastIndexOf(".") + 1)] ?? "file";
}

const idOf = (node: FileTreeNode, parentPath: string) => node.id ?? (parentPath ? `${parentPath}/${node.name}` : node.name);
const pathOf = (node: FileTreeNode, parentPath: string) => (parentPath ? `${parentPath}/${node.name}` : node.name);
const hasChanges = (node: FileTreeNode): boolean => !!node.status || !!node.children?.some(hasChanges);

function flatten(nodes: FileTreeNode[], expanded: ReadonlySet<string>, depth = 0, parentPath = "", parentId?: string): FlatNode[] {
  return nodes.flatMap(node => {
    const id = idOf(node, parentPath);
    const isFolder = node.children !== undefined;
    return [{ node, id, depth, parentId, isFolder }, ...(isFolder && expanded.has(id) ? flatten(node.children ?? [], expanded, depth + 1, pathOf(node, parentPath), id) : [])];
  });
}

const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const groupVariants: Variants = {
  closed: { height: 0, opacity: 0, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: standard } } },
  open: { height: "auto", opacity: 1, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: standard } } },
};
/** Rows trail in behind the opening folder. The delay is capped, so a folder with fifty files still settles quickly. */
const rowVariants: Variants = {
  closed: { opacity: 0, x: -8 },
  open: (index: number) => ({ opacity: 1, x: 0, transition: { ...motionTokens.spring.snappy, delay: Math.min(index * .022, .2) } }),
};
const stillGroup: Variants = { closed: { height: 0, opacity: 0, transition: { duration: 0 } }, open: { height: "auto", opacity: 1, transition: { duration: 0 } } };
const stillRow: Variants = { closed: { opacity: 1 }, open: { opacity: 1 } };

export function FileTree({ nodes, value, defaultValue = null, onValueChange, expandedIds, defaultExpandedIds = [], onExpandedChange, onOpen, selectFolders = false, label = "Files", className }: FileTreeProps) {
  const reduce = useReducedMotion();
  const treeRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState<string | null>(defaultValue);
  const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpandedIds);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const typed = useRef({ text: "", at: 0 });
  const selected = value !== undefined ? value : internalValue;
  const expandedList = expandedIds ?? internalExpanded;
  const expanded = useMemo(() => new Set(expandedList), [expandedList]);
  const visible = useMemo(() => flatten(nodes, expanded), [nodes, expanded]);
  const reachable = visible.filter(entry => !entry.node.disabled);
  // One row is in the tab order: the focused one, else the selected one, else the first.
  const tabbable = (reachable.find(entry => entry.id === focusedId) ?? reachable.find(entry => entry.id === selected) ?? reachable[0])?.id;

  function setExpanded(ids: string[], open: boolean) {
    const next = open ? [...new Set([...expandedList, ...ids])] : expandedList.filter(id => !ids.includes(id));
    if (expandedIds === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  }

  function select(entry: FlatNode) {
    if (value === undefined) setInternalValue(entry.id);
    onValueChange?.(entry.id, entry.node);
  }

  function focusRow(id: string | undefined) {
    if (id === undefined) return;
    setFocusedId(id);
    Array.from(treeRef.current?.querySelectorAll<HTMLElement>("[data-tree-id]") ?? []).find(row => row.dataset.treeId === id)?.focus();
  }

  function activate(entry: FlatNode, open: boolean) {
    if (entry.node.disabled) return;
    if (entry.isFolder) {
      setExpanded([entry.id], !expanded.has(entry.id));
      if (selectFolders) select(entry);
      return;
    }
    select(entry);
    if (open) onOpen?.(entry.id, entry.node);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const at = reachable.findIndex(entry => entry.id === (event.target as HTMLElement).dataset?.treeId);
    const current = reachable[at];
    if (!current) return;
    const { key } = event;
    let handled = true;
    if (key === "ArrowDown") focusRow(reachable[Math.min(at + 1, reachable.length - 1)]?.id);
    else if (key === "ArrowUp") focusRow(reachable[Math.max(at - 1, 0)]?.id);
    else if (key === "Home") focusRow(reachable[0]?.id);
    else if (key === "End") focusRow(reachable[reachable.length - 1]?.id);
    else if (key === "ArrowRight") {
      if (current.isFolder && !expanded.has(current.id)) setExpanded([current.id], true);
      else if (current.isFolder) focusRow(reachable.find((entry, index) => index > at && entry.parentId === current.id)?.id);
    } else if (key === "ArrowLeft") {
      if (current.isFolder && expanded.has(current.id)) setExpanded([current.id], false);
      else focusRow(current.parentId);
    } else if (key === "Enter") activate(current, true);
    else if (key === " ") activate(current, false);
    else if (key === "*") setExpanded(visible.filter(entry => entry.isFolder && entry.parentId === current.parentId).map(entry => entry.id), true);
    else if (key.length === 1 && key.trim()) {
      // Type-ahead: letters typed in quick succession build a prefix; a single letter cycles through the matches after the current row.
      const now = performance.now();
      const text = now - typed.current.at < 600 ? typed.current.text + key.toLowerCase() : key.toLowerCase();
      typed.current = { text, at: now };
      // The same letter pressed again keeps cycling instead of looking for "pp".
      const cycling = [...text].every(letter => letter === text[0]);
      const prefix = cycling ? text[0]! : text;
      const from = at + (cycling ? 1 : 0);
      focusRow([...reachable.slice(from), ...reachable.slice(0, from)].find(entry => entry.node.name.toLowerCase().startsWith(prefix))?.id);
    } else handled = false;
    if (handled) event.preventDefault();
  }

  function renderLevel(level: FileTreeNode[], depth: number, parentPath: string): ReactNode {
    return level.map((node, index) => {
      const id = idOf(node, parentPath);
      const isFolder = node.children !== undefined;
      const isOpen = isFolder && expanded.has(id);
      const isSelected = id === selected;
      const kind = kindOf(node.name);
      const KindIcon = kindIcons[kind];
      const entry: FlatNode = { node, id, depth, isFolder };
      const changed = isFolder && !node.status && hasChanges(node);
      return (
        <Fragment key={id}>
          <motion.div
            role="treeitem"
            className={styles.row}
            style={{ "--tree-depth": depth } as CSSProperties}
            variants={reduce ? stillRow : rowVariants}
            custom={index}
            data-tree-id={id}
            data-selected={isSelected || undefined}
            data-status={node.status}
            aria-level={depth + 1}
            aria-setsize={level.length}
            aria-posinset={index + 1}
            aria-expanded={isFolder ? isOpen : undefined}
            aria-selected={isFolder && !selectFolders ? undefined : isSelected}
            aria-disabled={node.disabled || undefined}
            tabIndex={id === tabbable ? 0 : -1}
            onFocus={() => setFocusedId(id)}
            onClick={() => { if (!node.disabled) { setFocusedId(id); activate(entry, false); } }}
            onDoubleClick={() => { if (!node.disabled && !isFolder) onOpen?.(id, node); }}
          >
            <span className={styles.chevron} data-open={isOpen} aria-hidden="true">{isFolder ? <ChevronRight size={14} strokeWidth={2} /> : null}</span>
            <span className={styles.icon} data-kind={isFolder ? "folder" : kind} data-open={isOpen} aria-hidden="true">
              {node.icon ?? (isFolder ? (isOpen ? <FolderOpen size={16} strokeWidth={1.75} /> : <Folder size={16} strokeWidth={1.75} />) : <KindIcon size={16} strokeWidth={1.75} />)}
            </span>
            <span className={styles.name}>{node.name}</span>
            {node.status ? <span className={styles.status} title={node.status}>{statusLetters[node.status]}<span className={styles.srOnly}> ({node.status})</span></span> : null}
            {changed ? <span className={styles.changed}><span className={styles.srOnly}>contains changes</span></span> : null}
          </motion.div>
          {isFolder ? (
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div key="group" role="group" className={styles.group} style={{ "--tree-depth": depth } as CSSProperties} variants={reduce ? stillGroup : groupVariants} initial="closed" animate="open" exit="closed">
                  {node.children?.length ? renderLevel(node.children, depth + 1, pathOf(node, parentPath)) : <div className={styles.empty} style={{ "--tree-depth": depth + 1 } as CSSProperties}>Empty folder</div>}
                </motion.div>
              ) : null}
            </AnimatePresence>
          ) : null}
        </Fragment>
      );
    });
  }

  return (
    <motion.div ref={treeRef} role="tree" aria-label={label} className={[styles.tree, className].filter(Boolean).join(" ")} initial="closed" animate="open" onKeyDown={onKeyDown}>
      {renderLevel(nodes, 0, "")}
    </motion.div>
  );
}

export default FileTree;
