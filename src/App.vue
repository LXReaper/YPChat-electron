<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import {onMounted} from "vue";
import store from "./store";
import {ElNotification} from "element-plus";

onMounted(() => {
  console.log(`%c YPChat %c v0.0.1 %c https://github.com/pyj1234`, "color: #fff; background: #5f5f5f", "color: #fff; background: #4bc729", "");
  let isElectronApp = !!(window as any).electronAPI;
  if (!isElectronApp) {
    ElNotification({
      title: '建议使用最新版客户端，体验会更佳!!!',
      message: `
            <a
                style="color: #0066FF"
                href='https://ypchat-1326794969.cos.ap-guangzhou.myqcloud.com/app_release/MineChat%20Setup%200.0.1.exe'>
                点击下载最新客户端
            </a>`,
      type: "warning",
      duration: 5000,
      dangerouslyUseHTMLString: true, // 允许使用 HTML
    });
  }
  store.dispatch("basicData/setIsElectron", isElectronApp);
})

</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
