<template>
  <svg t="1735465686839" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10358" width="48" height="48">
    <path d="M905.6 771.2l-254.4-62.4c-4.8-1.6-9.6-1.6-12.8-1.6C603.2 704 576 673.6 576 640v-67.2c0-35.2 27.2-64 62.4-67.2 4.8 0 9.6-1.6 12.8-1.6l254.4-62.4c25.6-6.4 54.4 1.6 70.4 20.8 9.6 11.2 16 25.6 16 41.6v203.2c0 16-6.4 30.4-16 41.6-16 20.8-44.8 28.8-70.4 22.4z" fill="#E1E1DF" p-id="10359">
    </path>
    <path d="M392 198.4a121.6 118.4 0 1 0 243.2 0 121.6 118.4 0 1 0-243.2 0Z" :fill="props.fill_color" p-id="10360">
    </path>
    <path d="M222.4 235.2a86.4 84.8 0 1 0 172.8 0 86.4 84.8 0 1 0-172.8 0Z" :fill="props.fill_color" p-id="10361">
    </path>
    <path d="M705.6 944H160c-70.4 0-128-57.6-128-128V436.8c0-70.4 57.6-128 128-128h545.6c70.4 0 128 57.6 128 128V816c0 70.4-57.6 128-128 128z" fill="#4E8DF6" p-id="10362">
    </path>
    <path d="M526.4 612.8l-172.8-97.6c-11.2-6.4-24 1.6-24 14.4v195.2c0 12.8 12.8 19.2 24 14.4L526.4 640c11.2-6.4 11.2-20.8 0-27.2z" fill="#FFFFFF" p-id="10363">
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
  fill_color: "#2166CC",//填充颜色
  stroke: "#333"//边缘颜色
})
</script>
<style scoped>

</style>
