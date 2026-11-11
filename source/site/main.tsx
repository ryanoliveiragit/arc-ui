import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/geist";
import "@fontsource-variable/inter";
import "@fontsource-variable/geist-mono";
import "@/registry/foundation.css";
import "@/site/styles/base.css";
import { App } from "@/site/app";

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
