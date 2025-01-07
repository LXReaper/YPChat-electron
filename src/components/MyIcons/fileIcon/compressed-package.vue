<template>
  <svg t="1732001824939" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
       p-id="23974" :width="props.width" :height="props.height">
    <path
        d="M102.4 0h819.2c56.896 0 102.4 45.504 102.4 102.4v819.2c0 56.896-45.504 102.4-102.4 102.4H102.4C45.504 1024 0 978.496 0 921.6V102.4C0 45.504 45.504 0 102.4 0z"
        fill="#F7B825" p-id="23975"></path>
    <path
        d="M364.096 585.984H512v147.84H364.096v-147.84zM512 438.016h147.904v147.968H512V438.016z m0-290.112h147.904v147.904H512v-147.84zM364.096 290.112H512v147.904H364.096v-147.84z m0-290.112H512v147.904H364.096V0z"
        fill="#FFFFFF" p-id="23976"></path>
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
