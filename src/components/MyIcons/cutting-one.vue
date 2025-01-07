<template>
  <!--  剪切-->
  <svg :width="props.width" :height="props.height" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" fill="white" fill-opacity="0.01"/>
    <path
        d="M11 42C13.7614 42 16 39.7614 16 37C16 34.2386 13.7614 32 11 32C8.23858 32 6 34.2386 6 37C6 39.7614 8.23858 42 11 42Z"
        fill="none" :stroke="props.stroke" stroke-width="4" stroke-linejoin="round"/>
    <path
        d="M37 42C39.7614 42 42 39.7614 42 37C42 34.2386 39.7614 32 37 32C34.2386 32 32 34.2386 32 37C32 39.7614 34.2386 42 37 42Z"
        fill="none" :stroke="props.stroke" stroke-width="4" stroke-linejoin="round"/>
    <path d="M15.3774 39.4131L17.5 35.8162L34.5 6.37138" :stroke="props.stroke" stroke-width="4"
          stroke-linecap="round"/>
    <path d="M13.4957 6.17518L30.4957 35.62L32.6265 39.4131" :stroke="props.stroke" stroke-width="4"
          stroke-linecap="round"/>
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

<style scoped>

</style>
