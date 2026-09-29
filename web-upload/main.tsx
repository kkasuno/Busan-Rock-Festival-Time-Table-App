import React from "react";
import { createRoot } from "react-dom/client";
import Home from "../app/page";
import { OfflineStatus } from "../app/offline-status";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(<><Home />{!import.meta.env.DEV && <OfflineStatus />}</>);
