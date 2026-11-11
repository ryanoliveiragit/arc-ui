import Drawer, { DrawerClose, DrawerContent, DrawerTrigger } from "@/registry/components/drawer/drawer";
import { Button } from "@/registry/components/button/button";
import { Caption, Field, Row, Stack } from "./_kit";

const input: React.CSSProperties = { height: 36, padding: "0 var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-control)", background: "var(--surface)", color: "var(--text-primary)", font: "inherit", width: "100%" };

export default function DrawerDemo() {
  return (
    <Stack align="center" gap={4}>
      <Row justify="center">
        <Drawer>
          <DrawerTrigger asChild><Button variant="secondary">Edit profile</Button></DrawerTrigger>
          <DrawerContent title="Edit profile" description="Update how you appear to your team.">
            <Stack gap={4}>
              <Field label="Display name"><input style={input} defaultValue="Emma Collins" /></Field>
              <Field label="Role"><input style={input} defaultValue="Product designer" /></Field>
              <Row justify="flex-end"><DrawerClose asChild><Button variant="ghost">Cancel</Button></DrawerClose><DrawerClose asChild><Button>Save</Button></DrawerClose></Row>
            </Stack>
          </DrawerContent>
        </Drawer>
        <Drawer>
          <DrawerTrigger asChild><Button variant="ghost">Filters (left)</Button></DrawerTrigger>
          <DrawerContent side="left" title="Filters" description="Narrow the list of invoices.">
            <Stack gap={3}><Caption>Status: Paid, Pending, Overdue</Caption><DrawerClose asChild><Button>Apply filters</Button></DrawerClose></Stack>
          </DrawerContent>
        </Drawer>
      </Row>
      <Caption>Opens as a side surface; Escape or the close button dismisses it.</Caption>
    </Stack>
  );
}
