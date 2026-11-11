import { lazy, Suspense } from "react";
import { useRoute } from "@/site/lib/router";
import { PreviewPage } from "@/site/pages/preview";

/** O site em si fica num chunk à parte: o preview (iframe e teste automático) não precisa baixá-lo. */
const Shell = lazy(() => import("@/site/shell"));

export function App() {
  const route = useRoute();
  const [section, name] = route.segments;
  if (section === "preview" && name) return <PreviewPage name={name} run={Number(route.query.get("run") ?? 0)} variant={route.query.get("v") ?? undefined} />;
  return <Suspense fallback={null}><Shell /></Suspense>;
}
