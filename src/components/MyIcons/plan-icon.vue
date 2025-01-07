<template>
  <!--  计划-->
  <svg :width="props.width" :height="props.height" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 19H43V41C43 42.1046 42.1046 43 41 43H7C5.89543 43 5 42.1046 5 41V19Z" fill="#fff" stroke="#fff"
          stroke-width="4" stroke-linejoin="round"/>
    <path d="M5 10C5 8.89543 5.89543 8 7 8H41C42.1046 8 43 8.89543 43 10V19H5V10Z" stroke="#fff" stroke-width="4"
          stroke-linejoin="round"/>
    <path d="M16 31L22 37L34 25" stroke="#4a90e2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 5V13" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <path d="M32 5V13" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
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
