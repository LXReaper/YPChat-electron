<template>
  <!--  关闭摄像-->
  <svg :width="props.width" :height="props.height" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12V38H20H28H30M18 10H20H36V24V27" stroke="#333" stroke-width="4" stroke-linecap="round"
          stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M44 14L36 20.75V27.25L44 34V14Z" stroke="#333" stroke-width="4"
          stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M44 44L4 4" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
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
