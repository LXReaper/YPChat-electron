<template>
  <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M18 6H8C6.89543 6 6 6.89543 6 8V18C6 19.1046 6.89543 20 8 20H18C19.1046 20 20 19.1046 20 18V8C20 6.89543 19.1046 6 18 6Z"
        fill="none" :stroke="props.color" :stroke-width="props.width" stroke-linejoin="round"/>
    <path
        d="M18 28H8C6.89543 28 6 28.8954 6 30V40C6 41.1046 6.89543 42 8 42H18C19.1046 42 20 41.1046 20 40V30C20 28.8954 19.1046 28 18 28Z"
        fill="none" :stroke="props.color" :stroke-width="props.width" stroke-linejoin="round"/>
    <path
        d="M40 6H30C28.8954 6 28 6.89543 28 8V18C28 19.1046 28.8954 20 30 20H40C41.1046 20 42 19.1046 42 18V8C42 6.89543 41.1046 6 40 6Z"
        fill="none" :stroke="props.color" :stroke-width="props.width" stroke-linejoin="round"/>
    <path
        d="M40 28H30C28.8954 28 28 28.8954 28 30V40C28 41.1046 28.8954 42 30 42H40C41.1046 42 42 41.1046 42 40V30C42 28.8954 41.1046 28 40 28Z"
        fill="none" :stroke="props.color" :stroke-width="props.width" stroke-linejoin="round"/>
  </svg>
</template>
<script setup lang="ts">
import {defineProps, withDefaults} from "vue";

interface Props {
  color: string;
  width: number;
}

const props = withDefaults(defineProps<Props>(), {
  color: "#333",
  width: 4
})
</script>
