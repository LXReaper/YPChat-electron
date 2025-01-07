<template>
  <!--  语音消息-->
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
                v-if="props.message.from_id !== props.loginUserId"
            >
              <recording-wave-animation :transform-rotate="90" class="wave-animation" style="left: -50px" />"2
            </div>
            <!--        我方消息-->
            <div
                class="text-reverse-message-container"
                style="word-wrap: break-word;display: block;"
                v-else
            >
              1"<recording-wave-animation :transform-rotate="-90" class="wave-animation" style="top: -43.5px;" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, withDefaults} from "vue";
import {getUserInfoStorage} from "../../../../utils/storageUtil.js";
import RecordingWaveAnimation from "./recordingMessage/recordingWaveAnimation.vue";
interface Props{
  message: any;
  loginUserId: any;
}
const props = withDefaults(defineProps<Props>(), {
  message: {},
  loginUserId: getUserInfoStorage()?.id ?? "",
})
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
          background-color: #fff;
          position: relative;
          display: flex;
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
          border-color: transparent #fff transparent transparent; /* 三角形颜色 */
        }
        .text-message-container:hover {
          background-color: #ddd;
        }
        .text-message-container:hover:after {
          border-color: transparent #ddd transparent transparent;
        }

        .text-reverse-message-container {
          word-break: break-all;

          user-select: none;
          cursor: pointer;
          margin: 0 10px;
          padding: 10px;
          background-color: lawngreen;
          display: flex;
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
          border-color: transparent transparent transparent lawngreen; /* 三角形颜色 */
        }
        .text-reverse-message-container:hover{
          background-color: #4caf50 ;
        }
        .text-reverse-message-container:hover:after {
          border-color: transparent transparent transparent #4caf50 ;
        }

        .wave-animation{
          /*波浪动画样式*/
          position: relative;
        }
      }
    }
  }
}
</style>
