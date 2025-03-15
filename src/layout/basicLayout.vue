<template>
  <div id="basicLayout">
    <el-container :style="{
        height: winHeight,
        minHeight: winHeight
      }">
      <!--      侧边栏-->
      <el-aside
          :style="{
            width: (route.path === '/chat' || route.path === '/communication') ? '28%' : '64px'
      }">
        <div style="display: flex;">
          <basic-menu :height="winHeight" />
          <message-history-page :height="winHeight" v-if="route.path === '/chat'" />
          <note-book-page :height="winHeight" v-if="route.path === '/communication'" />
        </div>
      </el-aside>
      <!--      内容面板-->
      <el-container :style="{
        height: winHeight,
        minHeight: winHeight
      }">
        <el-header style="padding: 0 0;border-bottom: rgb(237, 237, 237) solid 1px">
          <!--            分屏-->
          <div class="basicTab1" style="right: 120px;" v-if="isElectron">
            <win-split />
          </div>
          <!--            最小化-->
          <div class="basicTab1" style="right: 80px;" @click="minimize" v-if="isElectron">
            <Minus/>
          </div>
          <!--            最大化-->
          <div class="basicTab1" style="right: 40px;" @click="maximize" v-if="isElectron">
            <FullScreen/>
          </div>
          <!--            关闭-->
          <div @click="close" class="basicTab2" v-if="isElectron">
            <Close/>
          </div>
          <!--            聊天头部信息-->
          <chat-header />
        </el-header>
        <el-main :style="{
          height: '100%',
          padding: 0,
        }">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import BasicMenu from "../components/Basic/basicMenu.vue";
import MessageHistoryPage from "../components/Basic/messageHistoryPage.vue";
import {Close, FullScreen, Minus} from "@element-plus/icons-vue";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import NoteBookPage from "../components/Basic/NoteBookPane/noteBookPage.vue";
import WinSplit from "../components/MyIcons/win-split.vue";
import ChatHeader from "../components/Basic/ChatPane/chatHeader.vue";
import store from "../store";

const route = useRoute();

// 窗口缩放前后的高度
const preWinHeight = ref(window.outerHeight);
const winHeight = ref(window.outerHeight);
//获取自定义electronAPI上下文
let electron = (window as any).electronAPI;
const isElectron = ref(store.state.basicData.isElectron);

const minimize = () => {
  if (isElectron.value) {
    electron.sendMessage('minimize-window', "最小化窗口");
  }
}
const maximize = () => {
  if (isElectron.value) {
    // 传入原始窗口大小和位置
    electron.sendMessage('maximize-window', {
      tag: '最大化窗口',
    });
  }
}
const close = () => {
  if (isElectron.value) {
    electron.sendMessage('closeWin', "关闭窗口");
  }
}

window.addEventListener('resize', ()=>{
  preWinHeight.value = winHeight.value;
  winHeight.value = isElectron.value ? window.outerHeight : window.innerHeight;
});

onMounted(() => {
  isElectron.value = store.state.basicData.isElectron;
  if (!isElectron.value) {
    preWinHeight.value = window.innerHeight;
    winHeight.value = window.innerHeight;
  }
})
</script>

<style scoped>
#basicLayout {
  width: 100%;
  height: 100%;
}

/*窗口顶部按钮*/
.basicTab1 {
  color: #1e1e1e;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  z-index: 3;
  width: 14px;
  height: 14px;
  padding: 8px;
  -webkit-app-region: no-drag;
}
.basicTab1:hover {
  background-color: #bbbbbb;
}
.basicTab2 {
  color: #1e1e1e;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 1px;
  z-index: 3;
  width: 14px;
  height: 14px;
  padding: 8px;
  -webkit-app-region: no-drag;
}
.basicTab2:hover {
  background-color: rgb(251, 115, 115);
}
.tooltip {
  visibility: hidden;
  position: absolute;
  top: 40px;
  transform: scale(0) translateZ(0);

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 10pt;
  color: #fff;
  background-color: #bbb;
  border: 1px solid #ccc;
  padding: 3px;
  box-sizing: border-box;
  border-radius: 5px;
  z-index: 4;
  white-space: nowrap;
  transition: visibility 0.6s ease-in-out;
}

.content-pane {
  height: 100%;
}

/*内容部分*/
.chat-input {
  -webkit-app-region: no-drag;
  position: fixed;
  top: 93%;
}
</style>
