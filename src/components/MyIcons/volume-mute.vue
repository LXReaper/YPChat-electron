<template>
  <!--  静音-->
  <svg :width="props.width" :height="props.height" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect opacity="0.01" x="30" y="18" width="13" height="13" fill="#333"/>
    <mask id="icon-dd1a834e6a0e536" maskUnits="userSpaceOnUse" x="30" y="18" width="13" height="13"
          style="mask-type: alpha">
      <rect x="30" y="18" width="13" height="13" fill="#333"/>
    </mask>
    <g mask="url(#icon-dd1a834e6a0e536)">
      <path d="M40.7348 20.2858L32.2495 28.7711" :stroke="props.stroke" stroke-width="3" stroke-linecap="round"
            stroke-linejoin="round"/>
      <path d="M32.2496 20.2858L40.7349 28.7711" :stroke="props.stroke" stroke-width="3" stroke-linecap="round"
            stroke-linejoin="round"/>
    </g>
    <path
        d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.0108C4 15.9062 4.89543 15.0108 6 15.0108H11.7985C11.7985 15.0108 17 6 24 6Z"
        fill="none" :stroke="props.stroke" stroke-width="3" stroke-linejoin="round"/>
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
