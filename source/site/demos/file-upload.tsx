import { FileUpload } from "@/registry/components/file-upload/file-upload";
import { Stack } from "./_kit";
import type { DemoStage } from "./_kit";

export const stage: DemoStage = { layout: "center", height: 520 };

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function FileUploadDemo() {
  return (
    <Stack width={480}>
      <FileUpload
        label="Project files"
        description="Drop images or PDFs here, or browse. Up to 5 MB each."
        accept="image/*,application/pdf"
        maxSize={5 * 1024 * 1024}
        onUpload={async (file, { onProgress, signal }) => {
          for (let percent = 0; percent <= 100; percent += 10) {
            if (signal.aborted) return;
            onProgress(percent);
            await wait(180);
          }
        }}
      />
    </Stack>
  );
}
