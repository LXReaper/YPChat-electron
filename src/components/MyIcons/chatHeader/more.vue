<template>
  <!--  更多联系信息-->
  <svg
      t="1732019573884" class="icon" viewBox="0 0 1024 1024" version="1.1"
      xmlns="http://www.w3.org/2000/svg" p-id="25198" :width="props.width" :height="props.height"
      @mouseover="fillColor = '#535bf2'"
      @mouseout="fillColor = '#4C4C4C'"
  >
    <path d="M253.44 491.52m-74.24 0a74.24 74.24 0 1 0 148.48 0 74.24 74.24 0 1 0-148.48 0Z" :fill="fillColor" p-id="25199">
    </path>
    <path d="M537.6 491.52m-74.24 0a74.24 74.24 0 1 0 148.48 0 74.24 74.24 0 1 0-148.48 0Z" :fill="fillColor" p-id="25200">
    </path>
    <path d="M821.76 491.52m-74.24 0a74.24 74.24 0 1 0 148.48 0 74.24 74.24 0 1 0-148.48 0Z" :fill="fillColor" p-id="25201">
    </path>
  </svg>
</template>
<script setup lang="ts">
import {defineProps, ref, withDefaults} from "vue";

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

const fillColor = ref("#4C4C4C");
</script>
<style scoped>
</style>
