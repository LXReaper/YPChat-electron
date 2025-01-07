<template>
  <!--  屏幕共享-->
  <svg
      t="1732021676357" class="icon" viewBox="0 0 1024 1024" version="1.1"
      xmlns="http://www.w3.org/2000/svg" p-id="31937" :width="props.width" :height="props.height"
      @mouseover="fillColor = props.mouseoverFillColor"
      @mouseout="fillColor = props.fill_color"
  >
    <path d="M713.216 943.616h-399.36c-16.896 0-30.72-13.824-30.72-30.72s13.824-30.72 30.72-30.72h399.36c16.896 0 30.72 13.824 30.72 30.72s-13.824 30.72-30.72 30.72z m222.72-794.112c13.824 0 25.088 11.264 25.088 25.088v550.4c0 13.824-11.264 25.088-25.088 25.088H90.624c-13.824 0-25.088-11.264-25.088-25.088V175.104c0-13.824 11.264-25.088 25.088-25.088h845.312m0-61.952H90.624c-47.616 0-86.528 38.912-86.528 86.528v550.4c0 47.616 38.912 86.528 86.528 86.528h845.312c47.616 0 86.528-38.912 86.528-86.528V175.104c0.512-48.128-38.4-87.04-86.528-87.04z" :fill="fillColor" p-id="31938">
    </path>
    <path d="M540.672 348.672v50.176h-2.048c-76.8 0-207.872 89.088-209.408 167.936 0 6.144 5.12 8.192 10.24 0C364.544 522.24 468.992 499.2 522.24 499.2h18.432v52.736c0 15.872 11.776 26.624 25.088 15.872l121.856-97.792c13.312-10.752 13.312-27.648 0-38.4L564.736 332.8c-13.312-10.752-24.064-3.072-24.064 15.872z" :fill="fillColor" p-id="31939">
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
  mouseoverFillColor: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 24,
  height: 24,
  fill_color: "#4C4C4C",//填充颜色
  stroke: "#333",//边缘颜色
  mouseoverFillColor: '#535bf2',//鼠标移入显示颜色
})

const fillColor = ref(props.fill_color);
</script>
<style scoped>

</style>
