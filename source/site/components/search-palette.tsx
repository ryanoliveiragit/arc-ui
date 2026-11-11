import { useMemo } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { BookOpen, Box, Component, Home, LayoutTemplate, Moon, Paintbrush, Scale, Sun } from "lucide-react";
import { CommandPalette, type CommandItem } from "@/registry/components/command-palette/command-palette";
import { categoryLabel, describe, items } from "@/site/lib/catalog";
import { itemPath, navigate } from "@/site/lib/router";
import { useTheme } from "@/site/lib/theme";
import { switchTheme } from "@/site/lib/theme-transition";
import styles from "./search-palette.module.css";

const pages = [
  { id: "page:/", label: "Início", path: "/", icon: <Home size={16} aria-hidden="true" /> },
  { id: "page:/componentes", label: "Todos os componentes", path: "/componentes", icon: <Component size={16} aria-hidden="true" /> },
  { id: "page:/blocos", label: "Todos os blocos", path: "/blocos", icon: <LayoutTemplate size={16} aria-hidden="true" /> },
  { id: "page:/docs/instalacao", label: "Instalação", path: "/docs/instalacao", icon: <BookOpen size={16} aria-hidden="true" /> },
  { id: "page:/docs/temas", label: "Temas e tokens", path: "/docs/temas", icon: <Paintbrush size={16} aria-hidden="true" /> },
  { id: "page:/docs/licenca", label: "Licença e créditos", path: "/docs/licenca", icon: <Scale size={16} aria-hidden="true" /> },
];

/** A busca do site: a paleta de comandos da própria biblioteca dentro de um diálogo. Abre com ⌘K, Ctrl+K ou "/". */
export default function SearchPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { theme } = useTheme();

  const commands = useMemo<CommandItem[]>(() => [
    ...pages.map(page => ({ id: page.id, label: page.label, group: "Páginas", icon: page.icon })),
    { id: "action:theme", label: theme === "dark" ? "Mudar para o tema claro" : "Mudar para o tema escuro", group: "Ações", keywords: ["tema", "dark", "light", "escuro", "claro"], icon: theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" /> },
    ...items.map(item => ({
      id: `item:${item.name}`,
      label: item.title,
      description: describe(item),
      group: categoryLabel(item.category),
      keywords: [item.name, ...item.name.split("-"), ...item.tags, item.kind === "block" ? "bloco" : "componente"],
      icon: item.kind === "block" ? <LayoutTemplate size={16} aria-hidden="true" /> : <Box size={16} aria-hidden="true" />,
    })),
  ], [theme]);

  function run(command: CommandItem) {
    onOpenChange(false);
    if (command.id === "action:theme") { switchTheme(theme === "dark" ? "light" : "dark", null, "rise"); return; }
    const page = pages.find(entry => entry.id === command.id);
    if (page) { navigate(page.path); return; }
    const item = items.find(entry => `item:${entry.name}` === command.id);
    if (item) navigate(itemPath(item));
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        {/* Esc é da paleta: primeiro limpa a busca, depois fecha. */}
        <DialogPrimitive.Content className={styles.content} aria-describedby={undefined} onEscapeKeyDown={event => event.preventDefault()}>
          <DialogPrimitive.Title className={styles.visuallyHidden}>Buscar no ryan-ui</DialogPrimitive.Title>
          <CommandPalette items={commands} autoFocus label="Buscar componentes, blocos e páginas" placeholder="Buscar componentes, blocos e páginas" onSelect={run} onClose={() => onOpenChange(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
