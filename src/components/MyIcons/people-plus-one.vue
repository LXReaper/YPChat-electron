<template>
  <!--  添加人群-->
  <svg :width="props.width" :height="props.height" viewBox="0 0 48 48" fill="none"
       xmlns="http://www.w3.org/2000/svg">
    <path
        d="M19 20C22.866 20 26 16.866 26 13C26 9.13401 22.866 6 19 6C15.134 6 12 9.13401 12 13C12 16.866 15.134 20 19 20Z"
        :fill="props.fill_color" :stroke="props.stroke" stroke-width="4" stroke-linecap="round"
        stroke-linejoin="round"/>
    <path
        d="M4 40.8V42H34V40.8C34 36.3196 34 34.0794 33.1281 32.3681C32.3611 30.8628 31.1372 29.6389 29.6319 28.8719C27.9206 28 25.6804 28 21.2 28H16.8C12.3196 28 10.0794 28 8.36808 28.8719C6.86278 29.6389 5.63893 30.8628 4.87195 32.3681C4 34.0794 4 36.3196 4 40.8Z"
        :fill="props.fill_color" :stroke="props.stroke" stroke-width="4" stroke-linecap="round"
        stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M38 13V25V13Z" :fill="props.fill_color"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M32 19H44H32Z" :fill="props.fill_color"/>
    <path d="M38 13V25M32 19H44" :stroke="props.stroke" stroke-width="4" stroke-linecap="round"
          stroke-linejoin="round"/>
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
