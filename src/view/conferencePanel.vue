<template>
  <div
      id="conferencePanel"
      :style="{height: (winHeight - 60) + 'px'}"
  >
    <div class="add_conference">
      <div class="conference-button-item" @click="joinConference">
        <div class="conference-button-icon" @mouseover="hover_button_index = 1" @mouseout="hover_button_index = -1">
          <chat-icon v-if="hover_button_index == 1" :width="48" :height="48"/>
          <add-icon v-else :width="48" :height="48" :stroke="'#fff'" :fill_color="'#fff'"/>
        </div>
        <div class="conference-label">加入会议</div>
      </div>
      <div class="conference-button-item" @click="quickConference">
        <div class="conference-button-icon" @mouseover="hover_button_index = 2" @mouseout="hover_button_index = -1">
          <video-conference-icon v-if="hover_button_index == 2" :width="48" :height="48"/>
          <lighting-icon v-else :width="48" :height="48"/>
        </div>
        <div class="conference-label">快速会议</div>
      </div>
      <div class="conference-button-item">
        <div class="conference-button-icon" @mouseover="hover_button_index = 3" @mouseout="hover_button_index = -1">
          <plan-icon v-if="hover_button_index == 3" :width="48" :height="48"/>
          <correct-icon v-else :width="48" :height="48"/>
        </div>
        <div class="conference-label">预定会议</div>
      </div>
      <div class="conference-button-item">
        <div class="conference-button-icon" @mouseover="hover_button_index = 4" @mouseout="hover_button_index = -1">
          <computer-icon v-if="hover_button_index == 4" :width="48" :height="48"/>
          <full-screen-play-icon v-else :width="48" :height="48"/>
        </div>
        <div class="conference-label">共享屏幕</div>
      </div>
    </div>
    <div class="record_info">
      <video ref="localVideo"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import AddIcon from "../components/MyIcons/add-icon.vue";
import ChatIcon from "../components/MyIcons/chat-icon.vue";
import LightingIcon from "../components/MyIcons/lighting-icon.vue";
import VideoConferenceIcon from "../components/MyIcons/video-conference-icon.vue";
import CorrectIcon from "../components/MyIcons/correct-icon.vue";
import PlanIcon from "../components/MyIcons/plan-icon.vue";
import FullScreenPlayIcon from "../components/MyIcons/full-screen-play-icon.vue";
import ComputerIcon from "../components/MyIcons/computer-icon.vue";
import router from "../router";
import store from "../store";

const isElectron = ref(store.state.basicData.isElectron);

//获取自定义electronAPI上下文
let electron = (window as any).electronAPI;
// 本地视频
const localVideo = ref<HTMLVideoElement>();

// 当前hover的按钮
const hover_button_index = ref(-1);
// 当前最外层窗口的高度
const winHeight = ref(window.outerHeight);

window.addEventListener('resize', () => {
  winHeight.value = isElectron.value ? window.outerHeight : window.innerHeight;
});

onMounted(() => {
  isElectron.value = store.state.basicData.isElectron;
  if (!isElectron.value) {
    winHeight.value = window.innerHeight;
  }
})

/**
 * 加入会议
 */
const joinConference = () => {
  if (isElectron.value) {
    electron.sendMessage('openChildWindow',{
      winName: "conference_join",
      path: "/dialog/video/Conference/join",
      resizable: false,
      x: 300,
      y: 150,
      width: 380,
      height: 660,
      maximizable: false //不允许放大
    })
  }else {// 网页端使用
    router.push({
      path: "/dialog/video/Conference/join",
    });
  }

}

/**
 * 快速会议
 */
const quickConference = () => {
  if (isElectron.value) {
    electron.sendMessage('openChildWindow', {
      winName: "conference_view",
      path: "/view/video/Conference",
      resizable: true,
      x: 300,
      y: 150,
      width: 1300,
      height: 840,
    })
  }else {// 网页端使用
    router.push({
      path: "/view/video/Conference",
    });
  }
}
</script>

<style scoped>
#conferencePanel {
  display: flex;
}

/*新建会议按钮组*/
.add_conference {
  width: 45%;
  display: grid;
  padding: 15% 5%;
  box-sizing: border-box;
  gap: 10px;
  /*最小宽度40%,一列放1份*/
  grid-template-columns: repeat(auto-fill, minmax(40%, 1fr));


  .conference-button-item {
    /*--按钮样式--*/
    height: 30%;
    box-sizing: border-box;


    .conference-button-icon {
      /*按钮图标*/
      width: 100px;
      height: 100px;
      margin: 0 auto;
      padding: 25px 25px;
      box-sizing: border-box;
      background: linear-gradient(135deg, #add8e6, #4a90e2);
      border-radius: 20px;
    }

    .conference-button-icon:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 8px rgba(0, 0, 0, 0.3);
    }

    .conference-label {
      /*按钮下方标签信息*/
      color: #1e1e1e;
      text-align: center;
      user-select: none;
    }
  }
}

/*历史会议记录*/
.record_info {
  width: 55%;
  padding: 15% 5%;
  box-sizing: border-box;
  border-left: #e0e0df solid 1px;
}
</style>
