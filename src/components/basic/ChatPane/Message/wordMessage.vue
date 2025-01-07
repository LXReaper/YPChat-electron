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
                v-html="props.message.content"
                v-if="props.message.from_id !== props.loginUserId"
            >
            </div>
            <!--        我方消息-->
            <div
                class="text-reverse-message-container"
                style="word-wrap: break-word;display: block;"
                @contextmenu.prevent="(event) => showMenu(event)"
                v-html="props.message.content"
                v-else
            >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--      右键弹出菜单-->
  <div
      v-if="menuVisible"
      @mouseleave="menuVisible = false"
      :style="{ top: `${menuY}px` , left: `${menuX}px` }"
      class="context-menu"
  >
    <ul>
      <li @click="menuAction('copy')">
        复制
      </li>
      <li @click="menuAction('forward')">
        转发
      </li>
      <li @click="menuAction('multiple_choice')">
        多选
      </li>
      <li @click="menuAction('quote')">
        引用
      </li>
      <li @click="menuAction('delete')">删除</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {defineProps, ref, withDefaults} from "vue";
import {getUserInfoStorage} from "../../../../utils/storageUtil.js";
interface Props{
  message: any;
  loginUserId: any;
}
const props = withDefaults(defineProps<Props>(), {
  message: {},
  loginUserId: getUserInfoStorage()?.id ?? "",
})

/*右键联系对象弹出菜单*/
// 弹出菜单是否可见
const menuVisible = ref(false);
// 菜单的x和y坐标参数
const menuX = ref(0);
const menuY = ref(0);
// 菜单显示事件
const showMenu = (event: any) => {
  menuX.value = event.clientX - 370;
  menuY.value = event.clientY - 65;
  menuVisible.value = true;
}
// 某个菜单触发事件
const menuAction = (type: string) => {
  switch (type) {
    case 'copy' :// 复制
      break;
    case 'forward' :// 转发
      break;
    case 'multiple_choice' :// 多选
      break;
    case 'quote' :// 引用
      break;
    case 'delete' :// 删除消息

      break;
  }
  menuVisible.value = false;
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
          cursor: text;
          margin: 0 10px;
          padding: 10px;
          background-color: #fff;
          position: relative;
          border-radius: 5px;
          align-items: center;
        }

        .text-message-container:after {
          content: '';
          position: absolute;
          left: -25px; /* 调整位置 */
          top: 10px; /* 调整位置 */
          border-width: 13px; /* 三角形大小 */
          border-style: solid;
          border-color: transparent #fff transparent transparent; /* 三角形颜色 */
        }

        .text-reverse-message-container {
          word-break: break-all;

          user-select: text;
          cursor: text;
          margin: 0 10px;
          padding: 10px;
          background-color: lawngreen;
          position: relative;
          border-radius: 5px;
          align-items: center;
        }

        .text-reverse-message-container:after {
          content: '';
          position: absolute;
          right: -25px; /* 调整位置 */
          top: 10px; /* 调整位置 */
          border-width: 13px; /* 三角形大小 */
          border-style: solid;
          border-color: transparent transparent transparent lawngreen; /* 三角形颜色 */
        }

      }
    }
  }
}

/*右键弹出菜单样式*/
.context-menu {
  width: 60px;
  position: absolute;
  background-color: #fff;
  color: #1e1e1e;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.context-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.context-menu li {
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  user-select: none;
}

.context-menu li:hover {
  background-color: #f0f0f0;
}
</style>
