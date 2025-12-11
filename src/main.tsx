import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";

// Get Convex URL from environment variable
const convexUrl = import.meta.env.VITE_CONVEX_URL;

// Validate Convex URL
if (!convexUrl) {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #111827; color: #f3f4f6; padding: 2rem; font-family: system-ui, -apple-system, sans-serif;">
        <h1 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #ef4444;">Configuration Error</h1>
        <p style="margin-bottom: 0.5rem;">VITE_CONVEX_URL environment variable is not set.</p>
        <p style="font-size: 0.875rem; color: #9ca3af; margin-top: 1rem;">Please set VITE_CONVEX_URL in your Vercel environment variables.</p>
        <pre style="background: #1f2937; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; font-size: 0.875rem; overflow-x: auto;">
VITE_CONVEX_URL=https://your-project.convex.cloud</pre>
      </div>
    `;
  }
  throw new Error("VITE_CONVEX_URL environment variable is not set");
}

// Initialize Convex client
const convex = new ConvexReactClient(convexUrl);

// Render app
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <ConvexAuthProvider client={convex}>
    <App />
  </ConvexAuthProvider>,
);
