<template>
  <svg :width="props.width" :height="props.height" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M31 36L19 24L31 12" :stroke="props.stroke" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
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
