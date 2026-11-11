var e=`import { useState } from "react";
import { SearchField } from "@/registry/components/search-field/search-field";
import { Caption, Stack } from "./_kit";

const cities = ["Lisbon", "Porto", "Barcelona", "Berlin", "Amsterdam", "Copenhagen", "Vienna", "Prague", "Kyoto", "Osaka"];

export default function SearchFieldDemo() {
  const [q, setQ] = useState("");
  const hits = cities.filter((c) => c.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Stack width={360} gap={4}>
      <SearchField label="Search destinations" placeholder="Search destinations" value={q} onValueChange={setQ} />
      <Caption>{hits.length ? hits.join(", ") : "No destinations match."}</Caption>
    </Stack>
  );
}
`;export{e as default};