<template>
  <div id="notebookPanel" :style="{height: (curWinHeight - 60) + 'px'}">
    <el-empty style="height: 100%" v-if="!store.state.noteBookPanelData.isShow">
      <template #image>
        <el-image src="minecraftDragon.gif" style="user-select: none;pointer-events: none;" />
      </template>
      <template #description>
        <text style="color: #ccc;user-select: none">MineChat</text>
      </template>
    </el-empty>
    <!--    用户信息-->
    <!--    搜索得到的联系对象信息页面-->
    <contactors-by-search-page v-if="store.state.noteBookPanelData.isShow === 1"/>

    <!--    本人联系对象信息页面-->
    <my-contactors-page v-if="store.state.noteBookPanelData.isShow === 11" />

    <!--  新朋友申请页面-->
    <new-friend-apply-page v-if="store.state.noteBookPanelData.isShow === 3"/>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import store from "../store";
import NewFriendApplyPage from "../components/Basic/NoteBookPane/newFriendApplyPage.vue";
import ContactorsBySearchPage from "../components/Basic/NoteBookPane/contactorsBySearchPage.vue";
import MyContactorsPage from "../components/Basic/NoteBookPane/myContactorsPage.vue";

const isElectron = ref(store.state.basicData.isElectron);

// 当前最外层窗口的高度
const curWinHeight = ref(window.outerHeight);
window.addEventListener('resize', () => {
  curWinHeight.value = isElectron.value ? window.outerHeight : window.innerHeight;
});

onMounted(() => {
  isElectron.value = store.state.basicData.isElectron;
  if (!isElectron.value) {
    curWinHeight.value = window.innerHeight;
  }
})
</script>

<style scoped>
#notebookPanel {
  color: #1e1e1e;
  background: rgb(245, 245, 245);
}
</style>
