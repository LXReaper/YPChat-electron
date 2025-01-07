<template>
  <!--  视频会议-->
  <svg :width="props.width" :height="props.height" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M4 10C4 8.89543 4.89543 8 6 8H34C35.1046 8 36 8.89543 36 10V19L44 13V36L36 30V38C36 39.1046 35.1046 40 34 40H6C4.89543 40 4 39.1046 4 38V10Z"
        fill="#fff" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 16V20" stroke="#4a90e2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15 14V22" stroke="#4a90e2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 16V20" stroke="#4a90e2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>
<script setup lang="ts">
import {defineProps, withDefaults} from "vue";

interface Props {
  width: number;
  height: number;
  fill_color: string;
  stroke: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 24,
  height: 24,
  fill_color: "none",//填充颜色
  stroke: "#333"//边缘颜色
})
</script>
