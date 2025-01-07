<template>
  <!--  录音-->
  <svg :width="props.width" :height="props.height" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="17" y="4" width="14" height="27" rx="7" fill="none" :stroke="props.stroke" stroke-width="4"
          stroke-linejoin="round"/>
    <path d="M9 23C9 31.2843 15.7157 38 24 38C32.2843 38 39 31.2843 39 23" :stroke="props.stroke" stroke-width="4"
          stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24 38V44" :stroke="props.stroke" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
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
