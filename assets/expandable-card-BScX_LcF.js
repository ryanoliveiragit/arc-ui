var e=`import ExpandableCard from "@/registry/components/expandable-card/expandable-card";
import { Caption, Stack } from "./_kit";

export default function ExpandableCardDemo() {
  return (
    <Stack gap={4} width={460} align="center">
      <ExpandableCard title="Q3 roadmap review" description="Thursday, 2:00 PM, Room 4B" width={360} expandedWidth={460}>
        <Stack gap={3}>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" }}>We will walk through shipped work, the revised launch date for the mobile app, and staffing for the payments migration.</p>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" }}>Attendees: Emma Collins, Marcus Johnson, Jasmine Brooks, Olivia Bennett.</p>
        </Stack>
      </ExpandableCard>
      <Caption>Open the card to see it grow in height and width.</Caption>
    </Stack>
  );
}
`;export{e as default};