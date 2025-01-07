import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router/index.ts";
import store from "./store"

/* IconPack*/
// vue3版本
// https://github.com/bytedance/IconPark/blob/master/packages/vue-next/README.md
import { install } from '@icon-park/vue-next/es/all';
import '@icon-park/vue-next/styles/index.css';

//Element plus设置
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// import "element-plus/theme-chalk/src/index.scss";

// 图片预览

// 剪切板
import { VueClipboard } from '@soerenmartius/vue3-clipboard';

createApp(App).use(router)
    .use(ElementPlus, {locale: zhCn})
    .use(VueClipboard)
    .use(store)
    .mount('#app')

const app = createApp(App);
install(app); // 代码使用 h-edit
install(app, 'h'); // 自定义前缀 h-edit
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
