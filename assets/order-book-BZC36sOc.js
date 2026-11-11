var e=`import { useState } from "react";
import { Pause, Play } from "lucide-react";
import OrderBook, { useOrderBookFeed, type OrderLevel, type OrderSide } from "@/registry/components/order-book/order-book";
import { Button } from "@/registry/components/button/button";
import { Caption, Row, Stack, Surface } from "./_kit";

const price = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function OrderBookDemo() {
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState<(OrderLevel & { side: OrderSide }) | null>(null);
  const feed = useOrderBookFeed({ mid: 64_210, tick: 0.5, levels: 9, size: 0.42, seed: 23, paused });

  return (
    <Stack gap={4} width={560}>
      <Row justify="space-between">
        <Caption>BTC-USD, simulated ticks. {feed.running ? "Rows flash as sizes change." : "The feed is paused."}</Caption>
        <Button variant="secondary" size="sm" onClick={() => setPaused(value => !value)}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {paused ? "Resume feed" : "Pause feed"}
        </Button>
      </Row>
      <Surface padding={4}>
        <OrderBook label="BTC-USD order book" bids={feed.bids} asks={feed.asks} depth={9} baseSymbol="BTC" quoteSymbol="USD"
          selectedPrice={level?.price ?? null} onSelectLevel={setLevel} />
      </Surface>
      <Caption>
        {level
          ? \`Limit price set to \${price.format(level.price)} USD, taken from the \${level.side} side. Click the row again to clear it.\`
          : "Hover a row to see the cost of trading through to it, or click one to use its price. Arrow keys move between rows and sides."}
      </Caption>
    </Stack>
  );
}
`;export{e as default};