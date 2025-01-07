import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { serverConfig } from './config/serverConfig'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: serverConfig.host,
    port: serverConfig.port,
    strictPort: serverConfig.strictPort, // 严格指定在当前配置的端口运行
  },
  // experimental: [
  //     ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
  // ]
})
