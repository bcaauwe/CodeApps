import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { powerApps } from "@microsoft/power-apps-vite/plugin"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), powerApps()],
  build: {
    assetsInlineLimit: 200 * 1024, // Inline assets < 200KB as base64 so they work when deployed to Power Apps
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kB to suppress the warning
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom'],
          // Combine Fluent UI packages to avoid circular dependencies
          'fluent-ui': ['@fluentui/react-components', '@fluentui/react-icons', '@fluentui/tokens'],
        }
      }
    }
  },
});
