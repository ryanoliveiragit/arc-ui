var e=`import { useState } from "react";
import { Pagination } from "@/registry/components/pagination/pagination";
import { Caption, Stack, Surface } from "./_kit";

const orders = Array.from({ length: 240 }, (_, i) => i + 1);
const perPage = 10;

export default function PaginationDemo() {
  const [page, setPage] = useState(1);
  const [short, setShort] = useState(2);
  const count = orders.length / perPage;
  const first = (page - 1) * perPage + 1;
  return (
    <Stack width={560} gap={6} align="center">
      <Stack gap={3} align="center">
        <Pagination page={page} pageCount={count} onPageChange={setPage} />
        <Caption>Showing orders {first} to {first + perPage - 1} of {orders.length}</Caption>
      </Stack>
      <Surface padding={3}>
        <Pagination page={short} pageCount={5} onPageChange={setShort} label="Search results pages" />
      </Surface>
    </Stack>
  );
}
`;export{e as default};