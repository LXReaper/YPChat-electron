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
                  background: none;
                "
                v-if="props.message.from_id !== props.loginUserId"
            >
              <div
                  :style="{
                    width: (getStyleByFile(props.message.content) as any).width,
                    height: (getStyleByFile(props.message.content) as any).height,
                    background: '#fff',
                  }"
              >
                <div class="file_info">
                  <div class="file_description">
                    <div style="font-weight: bolder;font-size: 10pt">
                      <el-tooltip
                          class="box-item"
                          effect="dark"
                          :content="getNameByFile(props.message.content)"
                          placement="bottom-start"
                          :disabled="getNameByFile(props.message.content).length <= 21"
                      >
                        {{ getNameByFile(props.message.content).substring(0, 21) +
                      (getNameByFile(props.message.content).length > 21 ? '...' : '') }}
                      </el-tooltip>
                    </div>
                    <div style="color: #bbb">{{ getSizeByFile(props.message.content) }}</div>
                  </div>
                  <div class="file_image">
                    <component :is="getTypeByFile(props.message.content)"/>
                  </div>
                </div>
              </div>
            </div>
            <!--        我方消息-->
            <div
                class="text-reverse-message-container"
                style="
                  word-wrap: break-word;
                  display: block;
                  background: none;
                "
                v-else
            >
              <div
                  :style="{
                    width: (getStyleByFile(props.message.content) as any).width,
                    height: (getStyleByFile(props.message.content) as any).height,
                    background: '#fff',
                  }"
              >
                <div class="file_info">
                  <div class="file_description">
                    <div style="font-weight: bolder;font-size: 10pt">
                      <el-tooltip
                          class="box-item"
                          effect="dark"
                          :content="getNameByFile(props.message.content)"
                          placement="bottom-start"
                          :disabled="getNameByFile(props.message.content).length <= 21"
                      >
                        {{ getNameByFile(props.message.content).substring(0, 21) +
                      (getNameByFile(props.message.content).length > 21 ? '...' : '') }}
                      </el-tooltip>
                    </div>
                    <div style="color: #bbb">{{ getSizeByFile(props.message.content) }}</div>
                  </div>
                  <div class="file_image">
                    <component :is="getTypeByFile(props.message.content)"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, withDefaults} from "vue";
import {getUserInfoStorage} from "../../../../utils/storageUtil.js";
import {getIconComponentByFileType} from "../../../../utils/fileUtil.ts";
interface Props{
  message: any;
  loginUserId: any;
}
const props = withDefaults(defineProps<Props>(), {
  message: {},
  loginUserId: getUserInfoStorage()?.id ?? "",
})


// 根据file标签获取文件路径
const getHrefByFile = (file: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = file;
  const fileElement = tempDiv.querySelector('a');
  return fileElement ? fileElement.href : null;
}
// 根据file标签获取文件的style
const getStyleByFile = (file: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = file;
  const fileElement = tempDiv.querySelector('a');
  return fileElement ? fileElement.style : null;
}
// 根据file标签获取文件的名称
const getNameByFile = (file: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = file;
  const fileElement = tempDiv.querySelector('a');
  return fileElement ? fileElement.innerText : '';
}
// 根据file标签获取文件的类型
const getTypeByFile = (file: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = file;
  const fileElement = tempDiv.querySelector('a');
  return fileElement ? getIconComponentByFileType(fileElement.dataset.fileType || '') : '';
}
// 根据file标签获取文件的大小
const getSizeByFile = (file: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = file;
  const fileElement = tempDiv.querySelector('a');
  return fileElement ? fileElement.dataset.fileSize : '0B';
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
          cursor: pointer;
          margin: 0 10px;
          background-color: #fff;
          position: relative;
          border-radius: 5px;
          align-items: center;
        }

        .text-reverse-message-container {
          word-break: break-all;

          user-select: text;
          cursor: pointer;
          margin: 0 10px;
          background-color: lawngreen;
          position: relative;
          border-radius: 5px;
          align-items: center;
        }
        /*文件*/
        .file_info {
          gap: 5px;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          padding: 0 20px;
          box-sizing: border-box;
          user-select: none;


          .file_description {
            gap: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .file_image {
            padding: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
          }
        }
        .file_info:hover {
          background: rgba(50, 50, 50, 0.1);
        }
        .file_info:active {
          background: rgba(50, 50, 50, 0.2);
        }
      }
    }
  }
}
</style>
