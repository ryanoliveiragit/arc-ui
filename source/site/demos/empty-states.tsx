import EmptyStates from "@/registry/blocks/empty-states/empty-states";

export default function EmptyStatesDemo() {
  // The card is a panel inside a page: give it a page margin and center it in the frame instead of gluing it to the top edge.
  return (
    <div style={{ display: "grid", minHeight: "100dvh", alignContent: "center", justifyItems: "center", padding: "var(--space-6)" }}>
      <div style={{ width: "min(100%, 40rem)" }}><EmptyStates /></div>
    </div>
  );
}
