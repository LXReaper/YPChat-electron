<template>
  <!--  远程协助-->
  <svg
      t="1732021363184" class="icon" viewBox="0 0 1024 1024" version="1.1"
      xmlns="http://www.w3.org/2000/svg" p-id="30897" :width="props.width" :height="props.height"
      @mouseover="fillColor = '#535bf2'"
      @mouseout="fillColor = '#4C4C4C'"
  >
    <path d="M240.6 384.6v45.1h-85.4c-6.3 0-11.4 7.7-11.4 17.1v5.8c0 9.5 5.1 17.1 11.4 17.1h208.1c6.3 0 11.4-7.7 11.4-17.1v-5.8c0-9.5-5.1-17.1-11.4-17.1h-82.7v-45.1h140.6c32.8 0 59.6-28.8 59.6-64.3v-190c0-35.4-26.7-64.3-59.6-64.3H126.5c-32.8 0-59.6 28.8-59.6 64.3v190.1c0 35.4 26.7 64.3 59.6 64.3h114.1v-0.1z m-133.7-64.2V130.3c0-13.4 8.8-24.3 19.6-24.3h294.7c10.8 0 19.6 10.9 19.6 24.3v190.1c0 13.4-8.8 24.3-19.6 24.3H126.5c-10.8-0.1-19.6-11-19.6-24.3z m800 225.8H559.3c-25.8 0-46.7 23.1-46.7 51.7v221.8c0 28.5 20.9 51.7 46.7 51.7h154.1v47.3h-85.9c-6 0-10.9 7.3-10.9 16.3v7.3c0 9 4.9 16.3 10.9 16.3h209.2c6 0 10.9-7.3 10.9-16.3V935c0-9-4.9-16.3-10.9-16.3h-83.2v-47.3H907c25.8 0 46.7-23.1 46.7-51.7V597.9c-0.2-28.5-21.1-51.7-46.8-51.7zM532.3 147.7h331V431c0 11 9 20 20 20s20-9 20-20V107.7h-371c-11 0-20 9-20 20s9 20 20 20z m-58.6 742.1h-331V606.5c0-11-9-20-20-20s-20 9-20 20v323.4h371c11 0 20-9 20-20s-8.9-20.1-20-20.1z" :fill="fillColor" p-id="30898">
    </path>
    <path d="M396 313H153c-11 0-20-9-20-20V153c0-11 9-20 20-20h243c11 0 20 9 20 20v140c0 11-9 20-20 20z" :fill="fillColor" p-id="30899">
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
