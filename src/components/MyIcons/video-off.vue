<template>
  <!--  关闭摄像头-->
  <svg t="1731590083045" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
       p-id="26453" :width="props.width" :height="props.height">
    <path
        d="M873.770667 314.922667c19.797333-12.202667 37.632-2.048 37.632 18.304v335.232c0 24.362667-15.872 32.512-37.632 18.261333l-112.938667-67.029333c-19.797333-12.202667-37.632-26.453333-37.632-46.72V424.618667c0-18.261333 17.834667-30.464 37.632-42.666667l112.938667-67.029333zM385.152 288h214.016c43.562667 0 79.232 32 79.232 71.125333v222.122667L385.152 288z m256.042667 437.077333a85.333333 85.333333 0 0 1-42.026667 10.922667H207.232C163.669333 736 128 704 128 664.874667V359.125333c0-38.186667 34.005333-69.632 76.16-71.082666l437.034667 437.034666zM145.28 183.893333l45.226667-45.226666 678.826666 678.826666-45.226666 45.226667z"
        :fill="props.fill_color" p-id="26454"></path>
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
  fill_color: "#333",//填充颜色
  stroke: "#333"//边缘颜色
})
</script>
