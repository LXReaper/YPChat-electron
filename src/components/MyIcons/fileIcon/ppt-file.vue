<template>
  <svg t="1731852669836" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18342" :width="props.width" :height="props.height">
    <path d="M145.6 0C100.8 0 64 36.8 64 81.6v860.8C64 987.2 100.8 1024 145.6 1024h732.8c44.8 0 81.6-36.8 81.6-81.6V324.8L657.6 0h-512z" fill="#E34221" p-id="18343">
    </path>
    <path d="M960 326.4v16H755.2s-100.8-20.8-99.2-108.8c0 0 4.8 92.8 97.6 92.8H960z" fill="#DC3119" p-id="18344">
    </path>
    <path d="M657.6 0v233.6c0 25.6 17.6 92.8 97.6 92.8H960L657.6 0z" fill="#FFFFFF" p-id="18345">
    </path>
    <path d="M304 784h-54.4v67.2c0 6.4-4.8 11.2-11.2 11.2-6.4 0-12.8-4.8-12.8-11.2V686.4c0-9.6 8-17.6 17.6-17.6H304c38.4 0 59.2 25.6 59.2 57.6S340.8 784 304 784z m-3.2-94.4h-51.2v73.6h51.2c22.4 0 38.4-16 38.4-36.8 0-22.4-16-36.8-38.4-36.8zM480 784h-54.4v67.2c0 6.4-4.8 11.2-11.2 11.2-6.4 0-11.2-4.8-11.2-11.2V686.4c0-9.6 6.4-17.6 16-17.6H480c38.4 0 59.2 25.6 59.2 57.6S518.4 784 480 784z m-3.2-94.4h-49.6v73.6h49.6c22.4 0 38.4-16 38.4-36.8 0-22.4-16-36.8-38.4-36.8z m225.6 0h-52.8v161.6c0 6.4-4.8 11.2-11.2 11.2-6.4 0-12.8-4.8-12.8-11.2V689.6h-51.2c-6.4 0-11.2-4.8-11.2-11.2 0-4.8 4.8-9.6 11.2-9.6h128c6.4 0 11.2 4.8 11.2 11.2 0 4.8-4.8 9.6-11.2 9.6z" fill="#FFFFFF" p-id="18346">
    </path>
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
  width: 48,
  height: 48,
  fill_color: "#EA5454",//填充颜色
  stroke: "#333"//边缘颜色
})
</script>
<style scoped>

</style>
