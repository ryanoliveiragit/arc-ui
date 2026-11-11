var e=`import { useState } from "react";
import { AdaptiveStepper } from "@/registry/components/adaptive-stepper/adaptive-stepper";
import { Caption, Stack, Surface } from "./_kit";
import styles from "./adaptive-stepper.module.css";

const NIGHTLY = 184;

export default function AdaptiveStepperDemo() {
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(3);
  const [pets, setPets] = useState(0);

  return (
    <Surface width={380} padding={6}>
      <Stack gap={4}>
        <div className={styles.row}>
          <div><p className={styles.name}>Guests</p><p className={styles.hint}>Sleeps up to 6</p></div>
          <AdaptiveStepper label="Guests" value={guests} onValueChange={setGuests} min={1} max={6} formatValueText={value => \`\${value} guests\`} />
        </div>
        <div className={styles.row}>
          <div><p className={styles.name}>Nights</p><p className={styles.hint}>Hold a button to run</p></div>
          <AdaptiveStepper label="Nights" value={nights} onValueChange={setNights} min={1} max={28} formatValueText={value => \`\${value} nights\`} />
        </div>
        <div className={styles.row}>
          <div><p className={styles.name}>Pets</p><p className={styles.hint}>Two at most</p></div>
          <AdaptiveStepper label="Pets" value={pets} onValueChange={setPets} min={0} max={2} size="sm" />
        </div>
        <div className={styles.total}>
          <span>Total for {nights} {nights === 1 ? "night" : "nights"}</span>
          <strong>\${(NIGHTLY * nights + pets * 25).toLocaleString("en-US")}</strong>
        </div>
        <Caption>At a limit the button folds away and the number slides over. The control keeps its size.</Caption>
      </Stack>
    </Surface>
  );
}
`;export{e as default};