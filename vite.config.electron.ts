import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import electron from "vite-plugin-electron";
import {serverConfig} from "./config/serverConfig";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        electron([
            {
                entry: "./electron/main.js",
                // preload: {
                // // Shortcut of `build.rollupOptions.input`
                // input: "electron/preload.js",
                // },
                // // Optional: Use Node.js API in the Renderer process
                // renderer: {},
                vite: { build: { outDir: "dist_electron" } },
            },
            {
                entry: "./electron/preload.js",
                vite: { build: { outDir: "dist_electron" } },
            },
        ]),
    ],
    server: {
        host: serverConfig.host,
        port: serverConfig.port,
        strictPort: serverConfig.strictPort,
    },
});
