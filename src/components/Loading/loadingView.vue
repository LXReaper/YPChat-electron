<template>
  <div class="el-overlay" v-if="props.isShow">
    <slot name="animation">
      <block-split-animation :dot-background-color="'#1e1e1e'"/>
    </slot>
    <slot name="content">
      <div>玩命加载中</div>
    </slot>
  </div>
</template>
<script setup lang="ts">
import BlockSplitAnimation from "./block-split-animation.vue";

interface Props{
  isShow: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isShow: true,
})
</script>
<style scoped>
.el-overlay {
  background-color: var(--el-overlay-color-lighter);
  bottom: 0;
  height: 100%;
  left: 0;
  overflow: auto;
  position: fixed;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  z-index: 2000;
}
</style>
