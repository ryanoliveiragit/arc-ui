import FileDropzone, { type FileDropzoneUpload } from "@/registry/components/file-dropzone/file-dropzone";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { height: 520 };

const upload: FileDropzoneUpload = (_item, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    let p = 0;
    const id = window.setInterval(() => {
      p += 12 + Math.random() * 10;
      if (p >= 100) { window.clearInterval(id); onProgress(100); resolve(); } else onProgress(Math.round(p));
    }, 220);
    signal.addEventListener("abort", () => { window.clearInterval(id); reject(new DOMException("Aborted", "AbortError")); });
  });

export default function FileDropzoneDemo() {
  return (
    <Stack width={440}>
      <FileDropzone
        label="Upload project files"
        description="Drop files here or choose from your device"
        note="PNG, JPG or PDF up to 10 MB"
        accept="image/*,.pdf"
        maxSize={10 * 1024 * 1024}
        maxFiles={5}
        onUpload={upload}
        defaultItems={[{ id: "earlier", name: "brand-guidelines.pdf", size: 2_400_000, status: "uploaded" }]}
      />
    </Stack>
  );
}
