<template>
  <div class="loading-container">
    <div class="square-container">
      <div
          v-for="(block, index) in filledBlocks"
          :key="index"
          class="square"
          :style="{
          width: blockSize + 'px',
          height: blockSize + 'px',
          left: block.x * blockSize + 'px',
          top: block.y * blockSize + 'px',
          backgroundColor: block.color
        }"
      ></div>
    </div>
    <div v-if="!isLoading" class="completed">加载完成</div>
  </div>
</template>

<script>
export default {
  props: {
    width: {
      type: Number,
      default: 300
    },
    height: {
      type: Number,
      default: 200
    },
    blockSize: {
      type: Number,
      default: 20
    },
    loadingDuration: {
      type: Number,
      default: 3000 // 单位为毫秒
    }
  },
  data() {
    return {
      filledBlocks: [],
      isLoading: true
    };
  },
  mounted() {
    this.loadAnimation();
  },
  methods: {
    loadAnimation() {
      const numBlocksX = Math.floor(this.width / this.blockSize);
      const numBlocksY = Math.floor(this.height / this.blockSize);
      const totalBlocks = numBlocksX * numBlocksY;

      const fillInterval = setInterval(() => {
        if (this.filledBlocks.length < totalBlocks) {
          let x, y, color;
          do {
            x = Math.floor(Math.random() * numBlocksX);
            y = Math.floor(Math.random() * numBlocksY);
          } while (this.filledBlocks.some(block => block.x === x && block.y === y));

          color = this.getRandomColor();
          this.filledBlocks.push({ x, y, color });
        } else {
          clearInterval(fillInterval);
          this.isLoading = false;
        }
      }, this.loadingDuration / totalBlocks);
    },
    getRandomColor() {
      return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
    }
  }
}
</script>

<style scoped>
.loading-container {
  position: relative;
  width: fit-content;
  margin: auto;
}

.square-container {
  position: relative;
  width: 300px;
  height: 200px;
  border: 2px solid #007bff;
  overflow: hidden;
  background-color: rgba(220, 220, 220, 0.5);
}

.square {
  position: absolute;
  transition: background-color 0.3s ease;
}

.completed {
  text-align: center;
  margin-top: 10px;
  color: #28a745;
  font-weight: bold;
}
</style>
