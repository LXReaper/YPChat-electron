<template>
  <div
      class="message-view-item"
      :style="{
        flexDirection: `${props.message.from_id !== props.loginUserId ? 'row' : 'row-reverse'}`
      }">
    <div class="chatter-icon">
      <!--添加头像-->
      <el-image  class="chatter-icon"
                 :src="props.message.from_avatar"/>
    </div>
    <div class="message-name-content-container">
      <div class="flex-column flex-align-start">
        <div class="flex-row">
          <div class="message-content-container">
            <!--添加聊天文本-->
            <!--      对方消息-->
            <div
                class="text-message-container"
                style="
                  border: #ddd solid 1px;
                  background: none;
                "
                v-if="props.message.from_id !== props.loginUserId"
            >
              <el-image
                  :src="getSrcByImg(props.message.content)"
                  :style="{
                    width: (getStyleByImg(props.message.content) as any).width,
                    height: (getStyleByImg(props.message.content) as any).height,
                  }"
                  :preview-src-list="[getSrcByImg(props.message.content)]"
                  alt="图片已过期或被清除"
                  fit="cover"
                  lazy
              />
            </div>
            <!--        我方消息-->
            <div
                class="text-reverse-message-container"
                style="
                  word-wrap: break-word;
                  display: block;
                  border: #ddd solid 1px;
                  background: none;
                "
                v-else
            >
              <el-image
                  :src="getSrcByImg(props.message.content)"
                  :style="{
                    width: (getStyleByImg(props.message.content) as any).width,
                    height: (getStyleByImg(props.message.content) as any).height,
                  }"
                  :preview-src-list="[getSrcByImg(props.message.content)]"
                  alt="图片已过期或被清除"
                  fit="cover"
                  lazy
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, withDefaults} from "vue";
import {getUserInfoStorage} from "../../../../utils/storageUtil.ts";
interface Props{
  message: any;
  loginUserId: any;
}
const props = withDefaults(defineProps<Props>(), {
  message: {},
  loginUserId: getUserInfoStorage()?.id ?? "",
})

// src属性


// 根据img标签获取图片路径
const getSrcByImg = (img: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = img;
  const imgElement = tempDiv.querySelector('img');
  return imgElement ? imgElement.src : null;
}
// 根据img标签获取图片的style
const getStyleByImg = (img: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = img;
  const imgElement = tempDiv.querySelector('img');
  return imgElement ? imgElement.style : null;
}
</script>

<style scoped>
/*聊天面板*/
.message-view-item {
  color: #1e1e1e;
  display: flex;
  flex-direction: row;
  margin: 8px 0;
  position: relative;
  /*聊天者头像*/

  .chatter-icon {
    width: 42px;
    height: 42px;
    pointer-events: none; /*禁止鼠标选取图片*/
  }

  /*聊天内容*/

  .message-name-content-container {
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    .flex-column {
      display: flex;
      flex-direction: column;
    }

    .flex-align-start {
      align-items: flex-start;
    }

    .flex-row {
      display: flex;

      .message-content-container {
        width: 100%;
        display: flex;
        padding: 0 20px 4px 20px;
        justify-content: space-between;
        align-items: center;
        position: relative;

        .text-message-container {
          word-break: break-all;

          user-select: text;
          cursor: default;
          margin: 0 10px;
          padding: 10px;
          background-color: #fff;
          position: relative;
          border-radius: 5px;
          align-items: center;
        }

        .text-reverse-message-container {
          word-break: break-all;

          user-select: text;
          cursor: default;
          margin: 0 10px;
          padding: 10px;
          background-color: lawngreen;
          position: relative;
          border-radius: 5px;
          align-items: center;
        }

      }
    }
  }
}
</style>
