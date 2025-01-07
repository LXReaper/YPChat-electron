<template>
  <!--点击听语音时的语音波浪特效-->
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" :transform="`rotate(${props.transformRotate} 24 24)`">
    <path d="M38 25.799C30.268 18.067 17.732 18.067 10 25.799" :stroke="outRoundStroke" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32 32.3137C27.5817 27.8954 20.4183 27.8954 16 32.3137" :stroke="inRoundStroke" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M24 40C25.3807 40 26.5 38.8807 26.5 37.5C26.5 36.1193 25.3807 35 24 35C22.6193 35 21.5 36.1193 21.5 37.5C21.5 38.8807 22.6193 40 24 40Z" fill="#333"/>
  </svg>
</template>

<script setup lang="ts">
import {withDefaults, defineProps, ref, onMounted} from 'vue';
interface Props{
  transformRotate: number;// 波浪动画旋转角度
}

const props = withDefaults(defineProps<Props>(), {
  transformRotate: -90,
});

const interval = ref();
const outRoundStroke = ref("#333");// 最外圈的波浪
const inRoundStroke = ref("#333");// 最里圈的波浪
// 开启动画
const startAnimation = () => {
  outRoundStroke.value = 'none';
  inRoundStroke.value = 'none';

  // 设置interval
  interval.value = setInterval(() => {
    inRoundStroke.value = '#333';
    new Promise((resolve) => {
      setTimeout(() => {
        outRoundStroke.value = '#333';
        resolve("Done");
      }, 500);
    }).then(() => {
      setTimeout(() => {
        outRoundStroke.value = 'none';
        inRoundStroke.value = 'none';
      }, 500);
    })

  },1500);
}
onMounted(() => {
  startAnimation();
})
// 关闭动画
const endAnimation = () => {
  clearInterval(interval.value);
  outRoundStroke.value = '#333';
  inRoundStroke.value = '#333';
}
</script>

<style scoped>

</style>
