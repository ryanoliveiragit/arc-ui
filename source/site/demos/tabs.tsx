import type { CSSProperties } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/components/tabs/tabs";
import { Stack } from "./_kit";

const p: CSSProperties = { margin: 0 };

export default function TabsDemo() {
  return (
    <Stack width={420} style={{ textAlign: "center" }}>
      <Tabs defaultValue="overview">
        <TabsList aria-label="Workspace views">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><p style={p}>A calm summary of this workspace and its current health.</p></TabsContent>
        <TabsContent value="activity"><p style={p}>Emma reviewed the latest changes a few minutes ago.</p></TabsContent>
        <TabsContent value="settings"><p style={p}>Choose who can publish and receive notifications.</p></TabsContent>
      </Tabs>
    </Stack>
  );
}
