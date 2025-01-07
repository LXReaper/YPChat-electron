<template>
  <!--  电脑-->
  <svg :width="props.width" :height="props.height" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="19" y="32" width="10" height="9" stroke="#fff" stroke-width="4" stroke-linecap="round"
          stroke-linejoin="round"/>
    <rect x="5" y="8" width="38" height="24" rx="2" fill="#fff" stroke="#fff" stroke-width="4"/>
    <path d="M22 27H26" stroke="#4a90e2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 41L34 41" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
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
