import { useRef, useState } from "react";
import { ArrowUp, SmilePlus } from "lucide-react";
import EmojiPicker from "@/registry/components/emoji-picker/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/components/popover/popover";
import { Room, demoStage, useQuietFirstOpen } from "./_kit";
import type { DemoStage } from "./_kit";
import styles from "./emoji-picker.module.css";

export const stage: DemoStage = { height: 560 };

const MESSAGES = [
  { name: "Jordan Reyes", body: "Launch checklist is green. Shipping the pricing page at 3pm unless anyone objects.", from: "var(--tone-orchid)", to: "var(--tone-sky)" },
  { name: "Chloe Nguyen", body: "Copy is final and the screenshots are swapped in.", from: "var(--tone-green)", to: "var(--tone-violet)" },
] as const;

export default function EmojiPickerDemo() {
  // O preview já abre o picker sobre o composer, contido no palco: dá para ver o gatilho e o painel juntos.
  const quiet = useQuietFirstOpen();
  const [open, setOpen] = useState(true);
  const [text, setText] = useState("Looks great, ship it");
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (emoji: string, shift: boolean) => {
    const el = inputRef.current;
    if (el && typeof el.selectionStart === "number") {
      const start = el.selectionStart ?? text.length;
      const end = el.selectionEnd ?? text.length;
      setText(text.slice(0, start) + emoji + text.slice(end));
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + emoji.length, start + emoji.length);
      });
    } else {
      setText(text + emoji);
    }
    // Sem Shift o picker fecha; com Shift ele fica aberto para escolher vários.
    if (!shift) setOpen(false);
  };

  return (
    <Room above={232} below={8}>
      <div className={styles.chat}>
        {MESSAGES.map(m => (
          <div key={m.name} className={styles.msg}>
            <span className={styles.avatar} style={{ backgroundImage: `linear-gradient(135deg, ${m.from}, ${m.to})` }} aria-hidden="true" />
            <div className={styles.bubble}>
              <strong>{m.name}</strong>
              <p>{m.body}</p>
            </div>
          </div>
        ))}

        <div className={styles.composer}>
          <input ref={inputRef} className={styles.input} value={text} onChange={e => setText(e.target.value)} aria-label="Message" />
          <div className={styles.row}>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button type="button" className={styles.emojiBtn} aria-label="Add emoji">
                  <SmilePlus size={18} aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                container={demoStage()}
                side="top"
                align="start"
                sideOffset={8}
                onOpenAutoFocus={quiet}
                style={{ padding: 0, width: 352, height: 410 }}
              >
                <EmojiPicker storageKey="demo-emoji-picker" onSelect={(s, e) => pick(s.emoji, e.shiftKey)} />
              </PopoverContent>
            </Popover>
            <span className={styles.hint}>Shift picks several</span>
            <button type="button" className={styles.send} aria-label="Send">
              <ArrowUp size={16} strokeWidth={2.25} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Room>
  );
}
