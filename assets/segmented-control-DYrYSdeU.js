var e=`import { useState } from "react";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";

export default function SegmentedControlDemo() {
  const [view, setView] = useState("Review");
  return (
    <SegmentedControl
      label="Project view"
      value={view}
      onValueChange={setView}
      options={[
        { value: "Review", label: "Review" },
        { value: "Activity", label: "Activity" },
        { value: "Files", label: "Files" },
      ]}
    />
  );
}
`;export{e as default};