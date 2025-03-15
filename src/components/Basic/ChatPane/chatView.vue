<template>
  <div :style="{minHeight: props.curWinHeight - 60,position: 'relative'}">
    <!--    消息面板-->
    <normal-message
        :cur-win-height="props.curWinHeight"
        :output-message="outputMessage"
        @dragover.prevent="handleDragOver"
    />
    <!--    输入框-->
    <my-editor
        style="border-left: none;border-right: none"
        :height="((props.curWinHeight - 75) * 0.3 - 50) + 'px'"
        :width="'100%'"
        :placeholder="'按Enter键发送，Shift+Enter回车'"
        :handle-change-html="(v: any) => chatContentInfo.curHtml = v"
        :handle-change-text="(v: any) => chatContentInfo.curText = v"
        :handle-output-html="handleOutputHtml"
        :handle-output-status="(v: any) => chatContentInfo.enterStatus = v"
        :handle-is-focus="(v: any) => {
          isFocusEditor = v;
          if (v) outputMessage = !outputMessage;// 聚焦也提供信号
        }"
        @dragover.prevent="handleDragOver"
    />
    <!--        :handle-output-text="v => chatContentInfo.outputTextContent = v"-->

    <!--    显示掩膜-->
    <div
        v-if="showMask"
        class="mask"
        :style="{minHeight: props.curWinHeight - 60}"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
    >
      拖到此处以文件形式发送
    </div>
    <!--    发送文件对话框-->
    <el-dialog
        v-model="isShowDialog"
        style="
          height: 75vh;
          backdrop-filter: blur(5px);
          background: rgba(255,255,255,0);
          border-radius: 5%;
        "
        width="550"
        destroy-on-close
    >
      <div style="color: black;padding: 0 3%">
        <div class="dialog_title_style">
          <div class="dialog_title_style_item">发</div>
          <div class="dialog_title_style_item">送</div>
          <div class="dialog_title_style_item">给</div>
          <div
              class="dialog_title_style_item"
              v-for="(item, i) in chatName.split('')"
              :key="i"
          >
            {{ item }}
          </div>
        </div>
        <hr style="opacity: 0.3"/>
        <el-scrollbar :height="'53vh'">
          <div v-for="(fileInfo, i) in fileInfoList" :key="i" style="display: flex;" @click="fileEventHandle(fileInfo)">
            <div class="file_info">
              <div class="file_image">
                <component :is="fileInfo.type"/>
              </div>
              <div class="file_description">
                <div style="font-weight: bolder;font-size: 13pt">
                  <el-tooltip
                      class="box-item"
                      effect="dark"
                      :content="fileInfo.name"
                      placement="bottom-start"
                      :disabled="fileInfo.name.length <= 21"
                  >
                    {{ fileInfo.name.substring(0, 21) + (fileInfo.name.length > 21 ? '...' : '')}}
                  </el-tooltip>
                </div>
                <div style="color: #bbb">{{ fileInfo.size }}</div>
              </div>
            </div>
          </div>
        </el-scrollbar>
        <hr style="opacity: 0.3"/>
      </div>
      <template #footer>
        <div style="display: flex;gap: 10px;justify-content: right">
          <button class="enter-btn" @click="fileListPost">发送({{ fileInfoList.length }})</button>
          <button class="cancel-btn" @click="isShowDialog = false">取消</button>
        </div>
      </template>
    </el-dialog>
  </div>
  <!--  图片预览-->
  <el-image-viewer
      hide-on-click-modal
      @close="showImageViewer = false"
      v-if="showImageViewer"
      :url-list="imagePreviewList"
  />
</template>

<script setup lang="ts">
import MyEditor from "../../WangEditor/myEditor.vue";
import {withDefaults, defineProps, ref, watch, onMounted} from "vue";
import {ElMessage} from "element-plus";
import store from "../../../store";
import {getUserInfoStorage} from "../../../utils/storageUtil.ts";
import NormalMessage from "./Message/normalMessage.vue";
import {P2PMessageAddRequest} from "../../../api/Model/Request/MessageRequest/P2PMessageAddRequest.ts";
import {
  base64ToBlob,
  base64ToFile,
  getFileSeparator,
  isBase64,
  processHTMLContent
} from "../../../utils/StringUtils.js";
import {FileUploadConstant, FileUploadResult} from "../../../constant/FileUploadConstant.ts"
import {FileService} from "../../../api/Services/FileService.ts";
import {formatFileSize, getIconComponent, isFolder} from "../../../utils/fileUtil.ts";
import {IFileFormat} from "../../../common/FileCommon.ts";

interface Props {
  width: string;
  curWinHeight: number;// 当前窗口高度
  preWinHeight: number;// 窗口缩放前高度
}

const props = withDefaults(defineProps<Props>(), {
  width: "",
  curWinHeight: 0,
  preWinHeight: 0
})

const chatContentInfo = ref({
  outputTextContent: "",
  outputHtmlContent: "",
  curText: "",
  curHtml: "",
  // 当前按下回车键，编辑器内部对应的状态值会发生变化，此状态也会发生变化
  // 如果发生变化则表示按下了回车键
  enterStatus: false,
});

// 编辑器是否聚焦
const isFocusEditor = ref(false);

// 输出消息信号
const outputMessage = ref(true);

// 输出html文本内容
const handleOutputHtml = (v: string) => {
  outputMessage.value = !outputMessage.value;
  chatContentInfo.value.outputHtmlContent = v;
  // console.log(chatContentInfo.value.outputHtmlContent)
}

/*electron主进程响应*/
let electron = (window as any).electronAPI;
const isElectron = ref(store.state.basicData.isElectron);

const curNode = ref();// 当前正在处理的节点
const curImgSrc = ref();// 当前处理的图片src属性
// 监听图片保存成功响应
const handleSaveImage = () => {
  if (isElectron.value) {
    electron.onReceiveMessage("saveImage-ok", (filePath: any) => {// 图片保存成功
      console.log(filePath);// 本地文件路径
      let blob = base64ToBlob(curImgSrc.value);
      let file = new File([blob], filePath.substring(filePath.lastIndexOf(getFileSeparator()) + 1),
          {type: blob.type, lastModified: Date.now()});

      let formData = new FormData();
      formData.append("file", file);
      formData.append("biz", FileUploadConstant.MESSAGE_IMAGE);

      FileService.uploadFile(formData).then((res: any) => {
        if (res.code === 0) {
          curNode.value.src = res.data;
          curNode.value.alt = "图片已过期或被清除";// 设置图片新的alt
          postMessage({
            from_id: getUserInfoStorage().id,
            to_id: store.state.chatPanelData.userInfo.contact_info_id,
            status: 0,
            type: 1,// 是图片消息
            content: curNode.value.outerHTML,
          });
        } else ElMessage.error("图片发送失败")
      }).catch((error: any) => {
        console.error("图片发送失败" + error);
      })
    });
  }
}

onMounted(() => {
  isElectron.value = store.state.basicData.isElectron;
  handleSaveImage();
})

// 监听编辑器是否被按下enter键
watch(() => chatContentInfo.value.enterStatus,
    () => {
      // 首先当前html文本不能为<p><br></p>
      if (chatContentInfo.value.outputHtmlContent === '<p><br></p>') {
        ElMessage({
          message: "请输入对话内容",
          type: "warning",
          plain: true,
          customClass: ".el-Message-box__btns > .el-button"
        })
        return;
      }

      // 内部的所有标签内容数组,按照从上到下顺序排放
      let contentTagArray = processHTMLContent(chatContentInfo.value.outputHtmlContent);
      contentTagArray.forEach((node: any) => {// 处理每个html内容
        /*2、开始处理*/
        // 设置当前正在处理的节点
        curNode.value = node;
        if (curNode.value.nodeName === 'IMG') {// 判断节点是否为img标签
          // 获取img标签的src属性
          curImgSrc.value = curNode.value.getAttribute('src');// 设置当前正在处理的图片src
          if (isBase64(curImgSrc.value)) { //是base64数据
            // electron.sendMessage("saveImage", curImgSrc.value);// 保存图片文件
            let file = base64ToFile(curImgSrc.value);

            let formData = new FormData();
            formData.append("file", file);
            formData.append("biz", FileUploadConstant.MESSAGE_IMAGE);

            FileService.uploadFile(formData).then((res: any) => {
              if (res.code === 0) {
                curNode.value.src = res.data;
                curNode.value.alt = "图片已过期或被清除";// 设置图片新的alt
                postMessage({
                  from_id: getUserInfoStorage().id,
                  to_id: store.state.chatPanelData.userInfo.contact_info_id,
                  status: 0,
                  type: 1,// 是图片消息
                  content: curNode.value.outerHTML,
                });
              } else ElMessage.error("图片发送失败")
            }).catch((error: any) => {
              console.error("图片发送失败" + error);
            })
          }
        } else if (curNode.value.includes('<p>')) {// 是文本内容
          postMessage({
            from_id: getUserInfoStorage().id,
            to_id: store.state.chatPanelData.userInfo.contact_info_id,
            status: 0,
            type: 0,// 是文本消息
            content: curNode.value,
          });
        }
        // 对于其他类型的节点，你可以进行类似的判断和处理
      });

    }
)
// 发送消息
const postMessage = (postMessage: P2PMessageAddRequest) => {
  store.dispatch("chatPanelData/postChatMessage", postMessage);
}

/*----------处理拖拽事件*/
// 是否显示发送文件对话框
const isShowDialog = ref(false);
// 是否显示掩膜，提示以文件方式发送
const showMask = ref(false);
// 对话框显示发送对象名称
const chatName = ref("");
// 发送的文件数据信息
const fileInfoList = ref<Array<IFileFormat>>([]);
// 文件同时上传上限
const fileUploadMaxLimitation = ref(50);
const handleDragOver = (event: any) => {// 拖拽文件移进区域
  event.preventDefault();
  let len = event.dataTransfer.items.length;
  for (let i = 0; i < len; i++) {
    let item = event.dataTransfer.items[i];
    if (item.kind === 'file' && !isFolder(item)) {// 是文件但不是文件夹
      showMask.value = true; // 显示掩膜
      break;
    }
  }
}
const handleDragLeave = (event: any) => {// 拖拽文件移出区域
  if (event.target.classList.contains("mask"))
    showMask.value = false;// 隐藏掩膜
}
const handleDrop = (event: any) => {// 拖拽文件在某区域释放
  event.preventDefault();
  showMask.value = false;// 隐藏掩膜
  fileInfoList.value = [] as any;

  let isExistFileData = false;// 拖拽事件中是否存在文件数据
  const items = event.dataTransfer.items;
  let curContactInfoId = store.state.chatPanelData.userInfo.contact_info_id;
  for (let i = 0; i < items.length; i++) {
    if (i === fileUploadMaxLimitation.value) break ;// 达到文件同时上传上限

    const item = items[i];
    if (item.kind === 'file' && !isFolder(item)) {// 是文件但不是文件夹
      isExistFileData = true;
      const file = item.getAsFile();
      fileInfoList.value.push({
        MsgTo: curContactInfoId,
        name: file.name,// 文件名称
        type: getIconComponent(item),
        size: formatFileSize(file.size),// 文件大小
        file: file,// 文件
        uploadProgress: 0,// 上传进度
        uploadResult: FileUploadResult.LOADING,// 上传结果，FileUploadResult
      });
      console.log(file);

      // 图片文件
      // if (file && file.type.startsWith('image/')) {
      //   const reader = new FileReader();
      //   reader.onload = (e: any) => {
      //
      //     console.log(e.target.result);
      //   };
      //   reader.readAsDataURL(file); // 读取为 Data URL
      // }
    }
  }

  chatName.value = store.getters["basicData/getCurContactor"]?.nick_name || "";
  if (chatName.value && isExistFileData) isShowDialog.value = true;
}

// 文件对话框
const showImageViewer = ref(false);// 是否展示文件中的图片
const imagePreviewList = ref([] as any);// 图片展示列表
const fileEventHandle = (fileInfo: any) => {// 文件点击触发事件处理
  let file = fileInfo.file;
  // 图片文件
  if (file && file.type.includes('image')) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      imagePreviewList.value = [e.target.result];
      showImageViewer.value = true;
    };
    reader.readAsDataURL(file); // 读取为 Data URL
  }
}
const fileListPost = () => {// 文件发送
  store.dispatch("basicData/addFilesUploadData", {
    contactorId: store.getters["basicData/getCurContactorId"],
    fileUploadList: fileInfoList.value,
  });
  fileInfoList.value = [] as any;// 清空文件数组
  isShowDialog.value = false;
}
</script>

<style scoped>
/*掩膜样式*/
.mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(172, 172, 172, 0.5); /* 半透明黑色 */
  display: flex;
  justify-content: center;
  align-items: center;
  /*内字体颜色*/
  color: white;
  user-select: none;
  font-size: 24px;
  padding-bottom: 20px;
}

/*对话框样式*/
.dialog_title_style {
  display: flex;
  justify-content: center;
  letter-spacing: 5px;

  .dialog_title_style_item {
    font-weight: bolder;
    font-size: 20pt;
    color: #003366;
    user-select: none;
  }

  .dialog_title_style_item:hover {
    transform: translateY(-5px);
    transition: transform 0.5s ease;
  }

  .dialog_title_style_item:not(:hover) {
    transform: translateY(0) scale(1);
    transition: transform 0.5s ease;
  }
}

.file_info {
  gap: 5px;
  width: 100%;
  display: flex;
  flex-direction: row;
  user-select: none;
  margin: 10px 40px;

  .file_image {
    padding: 5px;
    box-sizing: border-box;
  }

  .file_description {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

.file_info:hover {
  background: rgba(255, 255, 255, 0.2);
}

.file_info:active {
  background: rgba(255, 255, 255, 0.3);
}

.enter-btn {
  background: rgba(135, 206, 250, 0.9);
  backdrop-filter: blur(10px);
  transition: background 0.3s cubic-bezier(0.5, 0, 0.5, 1), box-shadow 0.3s ease,
  transform 0.2s cubic-bezier(0.5, 0, 0.5, 1);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2),
  5px 5px 15px rgba(255, 255, 255, 0.7);
  width: 100px;
  border: none;
  color: white;
}

.enter-btn:hover {
  background: linear-gradient(145deg, #6a5acd, #836fff);
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2),
  -3px -3px 10px rgba(255, 255, 255, 0.7);
  transform: translateY(-3px);
}

.enter-btn:not(:hover) {
  background: rgba(135, 206, 250, 0.9);
  transform: translateY(0);
  transition: background 0.3s cubic-bezier(0.5, 0, 0.5, 1),
  transform 0.2s cubic-bezier(0.5, 0, 0.5, 1);
}

.enter-btn:active {
  background: linear-gradient(145deg, #6a5acd, #836fff);
  transform: translateY(2px);
  box-shadow: inset 5px 5px 15px rgba(0, 0, 0, 0.2),
  inset -5px -5px 15px rgba(255, 255, 255, 0.5);
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.5);
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 16px;
  color: #333;
  transition: background 0.3s cubic-bezier(0.5, 0, 0.5, 1);
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.cancel-btn:hover {
  background: rgba(230, 240, 255, 0.8);
  transform: translateY(-3px) scale(1.03);
  transition: transform 0.3s cubic-bezier(0.5, 0, 0.5, 1);
}

.cancel-btn:not(:hover) {
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(0) scale(1);
  transition: background 0.5s cubic-bezier(0.5, 0, 0.5, 1), transform 0.5s cubic-bezier(0.5, 0, 0.5, 1);
}

.cancel-btn:active {
  transform: translateY(2px);
}
</style>
