import { defineConfig } from "vite"

export default defineConfig({
  optimizeDeps: {
    // Zudoku provides this module at runtime, after Vite's initial dependency scan.
    exclude: ["virtual:zudoku-markdown-files"],
  },
})
