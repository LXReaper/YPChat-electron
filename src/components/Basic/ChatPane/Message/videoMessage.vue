<template>
  <div
      @click="showVideo"
      class="message-view-item"
      :style="{
        flexDirection: `${props.message.from_id !== props.loginUserId ? 'row' : 'row-reverse'}`
      }">
    <div class="chatter-icon">
      <!--添加头像-->
      <el-image class="chatter-icon"
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
                style="
                  border: #ddd solid 1px;
                  background: none;
                "
                v-if="props.message.from_id !== props.loginUserId"
            >
              <div
                  :style="{
                    width: (getStyleByVideo(props.message.content) as any).width,
                    height: (getStyleByVideo(props.message.content) as any).height,
                  }"
                  v-html="props.message.content"
              >
              </div>
              <div class="video-play-icon">
                <video-play-icon/>
              </div>
              <div class="video-time">
                {{ videTime }}
              </div>
            </div>
            <!--        我方消息-->
            <div
                class="text-reverse-message-container"
                style="
                  word-wrap: break-word;
                  display: block;
                  border: #ddd solid 1px;
                  background: none;
                "
                v-else
            >
              <div
                  :style="{
                    width: (getStyleByVideo(props.message.content) as any).width,
                    height: (getStyleByVideo(props.message.content) as any).height,
                  }"
                  v-html="props.message.content"
              >
              </div>
              <div class="video-play-icon">
                <video-play-icon/>
              </div>
              <div class="video-time">
                {{ videTime }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!--  显示视频对话框-->
  <div class="el-overlay" @click="isShowVideo = false" v-if="isShowVideo">
    <my-art-player
        @click="(event: any) => event.stopPropagation()"
        :video-url="getSrcByVideo(props.message.content)"
    />
  </div>
</template>

<script setup lang="ts">
import {defineProps, onMounted, ref, withDefaults} from "vue";
import {getUserInfoStorage} from "../../../../utils/storageUtil.ts";
import VideoPlayIcon from "../../../MyIcons/chatMessage/video-play-icon.vue";
import MyArtPlayer from "./videoPlayer/myArtPlayer.vue";

interface Props {
  message: any;
  loginUserId: any;
}

const props = withDefaults(defineProps<Props>(), {
  message: {},
  loginUserId: getUserInfoStorage()?.id ?? "",
})

// 视频时长
const videTime = ref("00:00");

// 根据video标签获取视频路径
const getSrcByVideo = (video: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = video;
  const videoElement = tempDiv.querySelector('video');
  return videoElement ? videoElement.src : '';
}
// 根据video标签获取视频的style
const getStyleByVideo = (video: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = video;
  const videoElement = tempDiv.querySelector('video');
  return videoElement ? videoElement.style : null;
}
// 根据video标签获取视频的时长
const getVideoTime = (video: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = video;
  const videoElement = tempDiv.querySelector('video');
  videoElement?.addEventListener('loadedmetadata', () => {
    // 获取视频时长（单位是秒）
    const duration = videoElement?.duration;
    // 分钟
    const minutes = Math.floor(duration / 60);
    // 剩余秒数
    const seconds = Math.ceil(duration % 60);

    videTime.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });
}
onMounted(() => {
  // getVideoTime(props.message.content);
})


// 是否显示视频播放
const isShowVideo = ref(false);
// 显示播放视频
const showVideo = () => {
  isShowVideo.value = true;
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
        width: 100%;
        display: flex;
        padding: 0 20px 4px 20px;
        justify-content: space-between;
        align-items: center;
        position: relative;

        .text-message-container {
          word-break: break-all;

          user-select: text;
          cursor: pointer;
          margin: 0 10px;
          background-color: #fff;
          position: relative;
          border-radius: 5px;
          align-items: center;
        }

        .text-reverse-message-container {
          word-break: break-all;

          user-select: text;
          cursor: pointer;
          margin: 0 10px;
          background-color: lawngreen;
          position: relative;
          border-radius: 5px;
          align-items: center;
        }

        /*视频播放icon*/

        .video-play-icon {
          position: absolute;
          top: 25%;
          left: 37.5%;
          z-index: 2;
        }

        /*视频播放时长*/

        .video-time {
          user-select: none;
          position: absolute;
          color: #fff;
          top: 75%;
          right: 6%;
          z-index: 2;
        }
      }
    }
  }
}

.el-overlay {
  background-color: var(--el-overlay-color-lighter);
  bottom: 0;
  height: 100%;
  left: 0;
  overflow: auto;
  position: fixed;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  z-index: 2000;
}
</style>
