import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = [react()];

  // Carrega o plugin 'lovable-tagger' apenas em modo de desenvolvimento
  if (mode === 'development') {
    try {
      const { componentTagger } = await import('lovable-tagger');
      plugins.push(componentTagger());
    } catch (e) {
      console.error("Failed to load lovable-tagger:", e);
    }
  }

  return {
    server: {
      host: "::",
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001', // Backend está na porta 3001
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});