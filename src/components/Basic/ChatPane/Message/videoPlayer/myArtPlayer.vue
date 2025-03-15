<template>
  <div ref="art" class="artPlayer"></div>
</template>
<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";
import Artplayer from 'artplayer';

interface Props {
  videoUrl: string;
}
const props = withDefaults(defineProps<Props>(), {
  videoUrl: 'https://artplayer.org/assets/sample/video.mp4',// 默认视频
})

const artPlayer = ref();

const createArtPlayer = () => {
  artPlayer.value = new Artplayer({
    container: '.artPlayer',
    // container: document.querySelector('.artPlayer'),
    url: props.videoUrl,
    id: 'your-url-id', // 只用于记忆播放
    poster: './videoPreview.jpg', //视频的海报，只会出现在播放器初始化且未播放的状态下
    theme: '#23ade5', // 主题色
    volume: 0.7, // 默认音量
    autoplay: false,  // 自动播放
    autoSize: true, // 自动调整播放器尺寸以隐藏黑边
    autoMini: true, // 当播放器滚动到浏览器视口以外时，自动进入 迷你播放 模式
    // 设置面板
    setting: true, // 设置面板
    flip: true, // 显示视频翻转功能
    playbackRate: true, // 显示视频播放速度功能
    aspectRatio: true, // 显示视频长宽比功能

    screenshot: true, // 在底部控制栏里显示 视频截图 功能 提示由于浏览器安全机制，假如视频源地址和网站是跨域的，可能会出现截图失败
    hotkey: true, // 使用快捷键
    pip: true, // 在底部控制栏里显示 画中画 的开关按钮
    // pip: true, // 只能让一个播放器播放
    fullscreen: true, // 在底部控制栏里显示播放器 窗口全屏 按钮
    miniProgressBar: true, // 迷你进度条
    playsInline: true, // 移动端 playsInline 模式

    // 设置 预览图
    // 在线生成预览图
    // https://artplayer.org/?libs=./uncompiled/artplayer-tool-thumbnail/index.js&example=thumbnail

    // thumbnails: {
    //   url: 'https://artplayer.org/assets/sample/thumbnails.png',
    //   number: 60,
    //   column: 10,
    // },
    // 替换默认图标
    icons: {
      loading: '<img src="https://artplayer.org/assets/img/ploading.gif">',
      state: '<img width="150" heigth="150" src="https://artplayer.org/assets/img/state.svg">',
      indicator: '<img width="16" heigth="16" src="https://artplayer.org/assets/img/indicator.svg">',
    },
    lock: true, // 移动端显示一个 锁定按钮 ，用于隐藏底部 控制栏
    fastForward: true, // 移动端添加长按视频快进功能
    autoOrientation: true,  // 是否在移动端的网页全屏时，根据视频尺寸和视口尺寸，旋转播放器
    airplay: true, // 显示 airplay 按钮
  });
}

onMounted(() => {
  createArtPlayer();
})
onBeforeUnmount(() => {
  if (artPlayer.value) {
    artPlayer.value.destroy();
  }
});
</script>
<style scoped>
.artPlayer {
  width: 50%;
  height: 400px;
}

.artPlayer ::v-deep .art-video-player {
  width: 100% !important;
}
</style>
