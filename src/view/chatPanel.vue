<template>
  <chat-view
      :cur-win-height="winHeight - 60"
      :pre-win-height="preWinHeight - 60"
      style="background: hsla(0,0%,91.3%,0.5)"
      v-if="store.state.chatPanelData.isShow"
  />
  <el-empty
      :style="{
        height: winHeight - 60 + 'px'
      }"
      v-else
  >
    <template #image>
      <el-image src="../../public/minecraftDragon.gif" style="user-select: none;pointer-events: none;" />
    </template>
    <template #description>
      <span style="user-select: none;color: #ccc">WelCome To MineChat</span>
    </template>
  </el-empty>
</template>
<script setup lang="ts">
import ChatView from "../components/basic/ChatPane/chatView.vue";
import {ref} from "vue";
import store from "../store";
// 窗口缩放前后的高度
const preWinHeight = ref(window.outerHeight);
const winHeight = ref(window.outerHeight);

window.addEventListener('resize', ()=>{
  preWinHeight.value = winHeight.value;
  winHeight.value = window.outerHeight;
});
</script>


<style scoped>

</style>
