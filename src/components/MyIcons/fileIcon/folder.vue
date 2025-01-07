<template>
  <svg t="1731858288871" class="icon" viewBox="0 0 1260 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="22829" :width="props.width" :height="props.height">
    <path d="M1171.561 157.538H601.797L570.814 61.44A88.222 88.222 0 0 0 486.794 0H88.747A88.747 88.747 0 0 0 0 88.747v846.506A88.747 88.747 0 0 0 88.747 1024H1171.56a88.747 88.747 0 0 0 88.747-88.747V246.285a88.747 88.747 0 0 0-88.747-88.747z m-1082.814 0V88.747h398.047l22.055 68.791z" fill="#ffd96f" p-id="22830">
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
  fill_color: "#fff",//填充颜色
  stroke: "#333"//边缘颜色
})
</script>
<style scoped>

</style>
