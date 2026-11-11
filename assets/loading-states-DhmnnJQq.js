var e=`import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ThinkingDots, ThinkingPhrases, ThinkingShimmer, ThinkingSteps } from "@/registry/components/loading-states/loading-states";
import { Caption } from "./_kit";
import styles from "./loading-states.module.css";

const plan = ["Reading the brief", "Searching 12 sources", "Comparing prices", "Drafting the summary", "Checking the numbers"];

function Panel({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className={styles.panel}>
      <div className={styles.stage}>{children}</div>
      <Caption>{name}</Caption>
    </div>
  );
}

export default function LoadingStatesDemo() {
  const [step, setStep] = useState(1);
  useEffect(() => {
    const timer = window.setInterval(() => setStep(current => (current % plan.length) + 1), 1900);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className={styles.grid}>
      <Panel name="Shimmer: a reply is about to start">
        <ThinkingShimmer />
      </Panel>
      <Panel name="Dots: someone is typing">
        <span className={styles.bubble}><ThinkingDots /></span>
      </Panel>
      <Panel name="Phrases: a longer wait">
        <ThinkingPhrases phrases={["Thinking", "Reading your files", "Comparing three approaches", "Writing the answer"]} interval={2000} />
      </Panel>
      <Panel name="Steps: a plan with a known length">
        <ThinkingSteps className={styles.fill} current={step} total={plan.length} label={plan[step - 1]} />
      </Panel>
    </div>
  );
}
`;export{e as default};