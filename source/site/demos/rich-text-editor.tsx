import { useState } from "react";
import RichTextEditor, { type RichTextValue } from "@/registry/components/rich-text-editor/rich-text-editor";
import { Caption, Stack, Surface } from "./_kit";

const intro = `# Release notes

Version 2.4 makes **search** noticeably faster and adds *saved filters*.

- Faster indexing for large workspaces
- Saved filters on every list
- Fewer layout jumps while loading

Select text for the toolbar, or type / on an empty line for blocks.`;

export default function RichTextEditorDemo() {
  const [words, setWords] = useState(0);
  const onChange = (v: RichTextValue) => setWords(v.text.trim() ? v.text.trim().split(/\s+/).length : 0);
  return (
    <Stack width={560} gap={3}>
      <Surface padding={4}>
        <RichTextEditor defaultMarkdown={intro} onChange={onChange} aria-label="Release notes" />
      </Surface>
      <Caption>Markdown shortcuts work as you type (## , - , 1. , &gt; ). {words > 0 ? `${words} words.` : ""}</Caption>
    </Stack>
  );
}
export const stage = { height: 520 };
