var e=`import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/components/tabs/tabs";
import { Stack } from "./_kit";

const p: React.CSSProperties = { margin: 0, color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" };

export default function TabsDemo() {
  return (
    <Stack width={480}>
      <Tabs defaultValue="overview">
        <TabsList aria-label="Project sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><p style={{ ...p, paddingTop: "var(--space-4)" }}>Atlas is on track for its March release. 38 of 46 tasks are complete and no blockers are open.</p></TabsContent>
        <TabsContent value="activity"><p style={{ ...p, paddingTop: "var(--space-4)" }}>Marcus merged “Offline sync” an hour ago. Jasmine commented on the checkout designs yesterday.</p><p style={{ ...p, paddingTop: "var(--space-3)" }}>Olivia closed 6 issues this week.</p></TabsContent>
        <TabsContent value="members"><p style={{ ...p, paddingTop: "var(--space-4)" }}>Eight people have access: 5 editors, 2 reviewers and 1 admin.</p></TabsContent>
        <TabsContent value="billing"><p style={{ ...p, paddingTop: "var(--space-4)" }}>Team plan, billed annually. Next invoice of $1,440 on March 3.</p></TabsContent>
      </Tabs>
    </Stack>
  );
}
`;export{e as default};