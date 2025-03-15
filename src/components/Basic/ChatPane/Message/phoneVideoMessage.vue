<template>
  <div
      class="message-view-item"
      :style="{
        flexDirection: `${props.message.from_id !== props.loginUserId ? 'row' : 'row-reverse'}`
      }">
    <div class="chatter-icon">
      <!--添加头像-->
      <el-image  class="chatter-icon"
                 :src="props.message.from_avatar"/>
    </div>
    <div class="message-name-content-container">
      <div class="flex-column flex-align-start">
        <div class="flex-row">
          <div class="message-content-container">
            <!--添加聊天文本-->
            <!--      对方消息-->
            <div
                class="text-message-container"
                :style="{
                  '--text-message-container-color': textMessageContainerColor,
                }"
                v-if="props.message.from_id !== props.loginUserId"
                @click="initiateCall"
                @mouseover="textMessageContainerColor = '#eee'"
                @mouseleave="textMessageContainerColor = '#fff'"
            >
              <div class="message-content">
                <phone-video-left-icon />
                <span>{{curMessageContent}}</span>
              </div>
            </div>
            <!--        我方消息-->
            <div
                class="text-reverse-message-container"
                :style="{
                    wordWrap: 'break-word',
                    display: 'block',
                    '--text-reverse-message-container-color': textReverseMessageContainerColor,
                }"
                @click="initiateCall"
                @mouseover="textReverseMessageContainerColor = 'rgb(45%, 85%, 5%)'"
                @mouseleave="textReverseMessageContainerColor = 'lawngreen'"
                @contextmenu.prevent="(event) => showMenu(event)"
                v-else
            >
              <div class="message-content">
                <span>{{curMessageContent}}</span>
                <phone-video-right-icon />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--      右键弹出菜单-->
  <div
      v-if="menuVisible"
      @mouseleave="menuVisible = false"
      :style="{ top: `${menuY}px` , left: `${menuX}px` }"
      class="context-menu"
  >
    <ul>
      <li @click="menuAction('copy')">
        复制
      </li>
      <li @click="menuAction('forward')">
        转发
      </li>
      <li @click="menuAction('multiple_choice')">
        多选
      </li>
      <li @click="menuAction('quote')">
        引用
      </li>
      <li @click="menuAction('delete')">删除</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, onMounted, ref, withDefaults} from "vue";
import {getUserInfoStorage, setCurContactorInfoStorage} from "../../../../utils/storageUtil.ts";
import PhoneVideoRightIcon from "../../../MyIcons/chatMessage/phone-video-right-icon.vue";
import PhoneVideoLeftIcon from "../../../MyIcons/chatMessage/phone-video-left-icon.vue";
import store from "../../../../store";
import {MsgTypeConstant} from "../../../../constant/MsgTypeConstant.ts";
interface Props{
  message: any;
  loginUserId: any;
}
const props = withDefaults(defineProps<Props>(), {
  message: {},
  loginUserId: getUserInfoStorage()?.id ?? "",
})

const curMessageContent = computed(() => {
  let isMyMessage = props.message.from_id === props.loginUserId;
  let message = props.message.content;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = message;
  const curElement = tempDiv.querySelector('a');

  let resContent = curElement!.textContent || '';
  if (!isMyMessage && resContent.includes("已取消")) {
    resContent = "对方已取消";
  }else if (isMyMessage && resContent.includes("已拒绝")) {
    resContent = "对方已拒绝";
  }
  return resContent;
})

const isElectron = ref(store.state.basicData.isElectron);
onMounted(() => {
  isElectron.value = store.state.basicData.isElectron;
})

/*hover事件*/
const textMessageContainerColor = ref('#fff');
const textReverseMessageContainerColor = ref('lawngreen');

/*右键联系对象弹出菜单*/
// 弹出菜单是否可见
const menuVisible = ref(false);
// 菜单的x和y坐标参数
const menuX = ref(0);
const menuY = ref(0);
// 菜单显示事件
const showMenu = (event: any) => {
  menuX.value = event.clientX - 370;
  menuY.value = event.clientY - 65;
  menuVisible.value = true;
}
// 某个菜单触发事件
const menuAction = (type: string) => {
  switch (type) {
    case 'copy' :// 复制
      break;
    case 'forward' :// 转发
      break;
    case 'multiple_choice' :// 多选
      break;
    case 'quote' :// 引用
      break;
    case 'delete' :// 删除消息

      break;
  }
  menuVisible.value = false;
}

/*视频通话事件*/
// 视频通话
const initiateCall = () => {
  // 发起视频电话
  if (isElectron.value) {
    //获取自定义electronAPI上下文
    let electron = (window as any).electronAPI;
    electron.sendMessage('openChildWindow', {
      winName: "video_chat",
      path: "/video/chat",
      resizable: false,
      x: 300,
      y: 150,
      width: 400,
      height: 760,
      maximizable: false, //不允许放大
      transportObj: JSON.stringify({
        ...store.getters["basicData/getCurContactor"],
        msgType: MsgTypeConstant.JOIN_ROOM,
      }),
    })
  }else {
    setCurContactorInfoStorage({
      ...store.getters["basicData/getCurContactor"],
      msgType: MsgTypeConstant.JOIN_ROOM,
    });
    window.open("/#/video/chat", "_blank");
  }
}
</script>

<style scoped>
/*聊天面板*/
.message-view-item {
  color: #1e1e1e;
  display: flex;
  flex-direction: row;
  margin: 8px 0;
  position: relative;
  /*聊天者头像*/

  .chatter-icon {
    width: 42px;
    height: 42px;
    pointer-events: none; /*禁止鼠标选取图片*/
  }

  /*聊天内容*/

  .message-name-content-container {
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    .flex-column {
      display: flex;
      flex-direction: column;
    }

    .flex-align-start {
      align-items: flex-start;
    }

    .flex-row {
      display: flex;

      .message-content-container {
        --text-message-container-color: #fff;
        --text-reverse-message-container-color: lawngreen;
        width: 100%;
        display: flex;
        padding: 0 20px 4px 20px;
        justify-content: space-between;
        align-items: center;
        position: relative;

        .text-message-container {
          word-break: break-all;

          user-select: none;
          cursor: pointer;
          margin: 0 10px;
          padding: 10px;
          background-color: var(--text-message-container-color);
          position: relative;
          border-radius: 5px;
          align-items: center;
        }

        .text-message-container:after {
          content: '';
          position: absolute;
          left: -25px; /* 调整位置 */
          top: 10px; /* 调整位置 */
          border-width: 13px; /* 三角形大小 */
          border-style: solid;
          border-color: transparent var(--text-message-container-color) transparent transparent; /* 三角形颜色 */
        }

        .text-reverse-message-container {
          word-break: break-all;

          user-select: none;
          cursor: pointer;
          margin: 0 10px;
          padding: 10px;
          background-color: var(--text-reverse-message-container-color);
          position: relative;
          border-radius: 5px;
          align-items: center;
        }

        .text-reverse-message-container:after {
          content: '';
          position: absolute;
          right: -25px; /* 调整位置 */
          top: 10px; /* 调整位置 */
          border-width: 13px; /* 三角形大小 */
          border-style: solid;
          border-color: transparent transparent transparent var(--text-reverse-message-container-color); /* 三角形颜色 */
        }

        .message-content {
          gap: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }
    }
  }
}

/*右键弹出菜单样式*/
.context-menu {
  width: 60px;
  position: absolute;
  background-color: #fff;
  color: #1e1e1e;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.context-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.context-menu li {
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  user-select: none;
}

.context-menu li:hover {
  background-color: #f0f0f0;
}
</style>
