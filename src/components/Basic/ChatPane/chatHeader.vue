<template>
  <!--  联系人名称-->
  <div class="contactor" v-if="isShow">
    <div class="contactor-name" @click="showContactorInfoCard">{{ (contactorInfo as any).nick_name }}</div>
    <div class="contactor-info-card" v-if="isShowDetailInfo">
      <div class="contactor-title-info">
        <el-image class="contactor-avatar" :src="(contactorInfo as any).contactHeadImgUrl"></el-image>
        <div class="contactor-title-content">
          <div style="font-size: 18pt;font-weight: bolder">
            <el-tooltip
                class="box-item"
                effect="dark"
                :content="(contactorInfo as any).nick_name"
                placement="top-start"
                :disabled="(contactorInfo as any).nick_name.length <= 15"
            >
              {{ (contactorInfo as any).nick_name.substring(0, 15) +
            ((contactorInfo as any).nick_name.length > 15 ? '...' : '')
              }}
            </el-tooltip>
          </div>
          <div class="contactor-id">{{ (contactorInfo as any).contact_info_id }}</div>
        </div>
      </div>
      <div class="contactor-level">
        <text class="contactor-info-label">等级</text>
        <text></text>
      </div>
      <div class="contactor-alias">
        <text class="contactor-info-label">备注</text>
        <input
            v-model="(contactorInfo as any).nick_name"
            @change="updateContactorInfoDebounce"
            maxlength="20" class="contactor-alias-value"/>
      </div>
    </div>
  </div>
  <!--  操作项目-->
  <div class="opt-items" v-if="isShow">
    <!--    屏幕共享-->
    <div class="opt-item" style="right: 140px" v-if="isElectron">
      <screen-share @click="selectScreen"/>
      <div class="opt-toolTip" style="right: -18px;">屏幕共享</div>
    </div>
    <!--    远程协助-->
    <div class="opt-item" style="right: 90px" v-if="isElectron">
      <remote-assist/>
      <div class="opt-toolTip" style="right: -18px;">远程协助</div>
    </div>
    <!--    发起群聊-->
    <div class="opt-item" style="right: 40px;">
      <initiate-group-chat @click="handleInitiateGroupChat" />
      <div class="opt-toolTip" style="right: -18px;">发起群聊</div>
    </div>
    <!--    更多关于联系信息-->
    <div class="opt-item" style="right: 0;" @click="showMoreInfo">
      <more/>
    </div>
  </div>

  <!--  屏幕共享对话框-->
  <el-dialog
      v-model="isShowScreenShare"
      style="
          height: 70vh;
          backdrop-filter: blur(5px);
          background: rgba(255,255,255,0);
          border-radius: 5%;
          padding: 2% 3.5%;
        "
      :show-close="false"
      destroy-on-close
  >
    <h3 class="dialog-text">选择你想共享的屏幕</h3>
    <el-scrollbar :height="'50vh'">
      <!--      桌面-->
      <div>
        <h3 class="dialog-text">桌面</h3>
        <div class="screen-item">
          <div v-for="(item, i) in deskSources" :key="i">
            <div>
              <el-image
                  fit="cover"
                  :class="`${item.id === selectScreenId ? 'select-screen' : 'screen-img'}`"
                  :src="item.thumbnail.toDataURL()"
                  @click="selectScreenId = item.id"
              />
              <div style="display: flex;justify-content: center">
                <text class="dialog-text">桌面{{ (i + 1) }}</text>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--      应用-->
      <div v-if="appSources && appSources.length">
        <h3 class="dialog-text">应用</h3>
        <div class="screen-item">
          <div v-for="(item, i) in appSources" :key="i">
            <div>
              <el-image
                  fit="cover"
                  :class="`${item.id === selectScreenId ? 'select-screen' : 'screen-img'}`"
                  :src="item.thumbnail.toDataURL()"
                  @click="selectScreenId = item.id"
              />
              <div style="display: flex;justify-content: center">
                <el-tooltip placement="top" effect="dark" :disabled="item.name.length <= 15">
                  <template #content>
                    <text class="dialog-text">{{ item.name }}</text>
                  </template>
                  <text class="dialog-text">{{ item.name.substring(0, 15) + (item.name.length > 15 ? "..." : "") }}
                  </text>
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <template #footer>
      <div style="display: flex;gap: 10px;justify-content: right">
        <button class="enter-btn" @click="shareScreen">确定</button>
        <button class="cancel-btn" @click="isShowScreenShare = false">取消</button>
      </div>
    </template>
  </el-dialog>

  <!--  显示联系对象信息弹窗-->
  <div class="drawer-style">
    <el-drawer
        v-model="isShowMoreContactorInfo"
        :with-header="false"
    >
      <div class="drawer-items">
        <div class="drawer-item">
          <span class="dialog_form_label">设为置顶</span>
          <el-switch
              style="--el-switch-on-color: #535bf2; --el-switch-off-color: #ccc"
              v-model="contactorInfo.isTop"
              @click="updateIsTopDebounce"
          />
        </div>
        <div class="drawer-item">
          <span class="dialog_form_label">消息免打扰</span>
          <el-switch
              style="--el-switch-on-color: #535bf2; --el-switch-off-color: #ccc"
              v-model="contactorInfo.isIgnore"
              @click="updateIsIgnoreDebounce"
          />
        </div>
        <div class="drawer-item chat-history-info" @click="showHistoryMessageInfo">
          <span class="dialog_form_label">查找聊天记录</span>
          <el-icon><ArrowRight /></el-icon>
        </div>
        <div class="drawer-item file-upload-list" @click="showMoreFilesInfo">
          <span class="dialog_form_label">文件传输列表</span>
          <el-icon><ArrowRight /></el-icon>
        </div>
        <div class="drawer-item delete-btn" style="justify-content: center">
          <span>删除好友</span>
        </div>
      </div>
    </el-drawer>
    <el-drawer
        v-model="isShowMoreFilesInfo"
        :with-header="false"
    >
      <div class="drawer-items">
        <div class="files-drawer-header">
          <el-button
              :type="`${isSelectFilesOptIndex === 0 ? 'primary' : ''}`"
              :class="`${isSelectFilesOptIndex === 0 ? 'file-opt-btn' : ''}`"
              @click="isSelectFilesOptIndex = 0"
              text
          >
            接收文件
          </el-button>
          <el-button
              :type="`${isSelectFilesOptIndex === 1 ? 'primary' : ''}`"
              :class="`${isSelectFilesOptIndex === 1 ? 'file-opt-btn' : ''}`"
              @click="isSelectFilesOptIndex = 1"
              text
          >
            发送文件
          </el-button>
        </div>
        <div class="files-drawer-main">
          <div v-if="isSelectFilesOptIndex === 0">
            <div>
              接收文件
            </div>
          </div>
          <div v-if="isSelectFilesOptIndex === 1">
            <div>
              <div
                  class="el-upload el-upload--text is-drag"
                  @click="fileUploadBlockClick"
                  @dragover.prevent="handleDragOver"
                  @drop="handleDrop"
              >
                <div class="el-upload-dragger">
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text">
                    拖拽文件到此处或者<em>点击此处上传</em>
                  </div>
                </div>
                <input
                    type="file" ref="elUploadInput"
                    class="el-upload__input" multiple
                    @change="handleFilesSelect"
                ></input>
              </div>
              <div class="el-upload__tip">
                文件上传大小不超过1GB
              </div>
            </div>
            <el-scrollbar :height="'45vh'">
              <div v-for="(fileInfo, i) in filesUploadList" :key="i" style="display: flex;flex-direction: column">
                <div class="file_info">
                  <div class="file_image">
                    <component :is="fileInfo.type"/>
                  </div>
                  <div class="file_description">
                    <div style="font-weight: bolder;font-size: 11pt">
                      <el-tooltip
                          class="box-item"
                          effect="dark"
                          :content="fileInfo.name"
                          placement="bottom-start"
                          :disabled="fileInfo.name.length <= 11"
                      >
                        {{ fileInfo.name.substring(0, 11) + (fileInfo.name.length > 11 ? '...' : '')}}
                      </el-tooltip>
                    </div>
                    <div style="color: #bbb">{{ fileInfo.size }}</div>
                  </div>
                  <div class="file_upload_status" @click="reUploadFile(fileInfo.uploadResult, i)">
                    <loading-status-icon v-if="fileInfo.uploadResult === FileUploadResult.LOADING" />
                    <uploading-status-icon v-if="fileInfo.uploadResult === FileUploadResult.UPLOADING" />
                    <success-status-icon v-if="fileInfo.uploadResult === FileUploadResult.SUCCESS" />
                    <error-status-icon v-if="fileInfo.uploadResult === FileUploadResult.ERROR" />
                  </div>
                </div>
                <div
                    class="i-progress"
                    :style="{
                      width: fileInfo.uploadProgress + '%',
                      backgroundColor: fileInfo.uploadResult === FileUploadResult.ERROR ? '#ff0000' :
                      (fileInfo.uploadProgress < 10 ? '#ff0000' : (
                          fileInfo.uploadProgress < 25 ? '#ff7f00' : (
                              fileInfo.uploadProgress < 50 ? '#ffff00' : (
                                  fileInfo.uploadProgress < 75 ? '#7fff00' : (
                                      fileInfo.uploadProgress < 90 ? '#00ff00' : '#4caf50'
                                  )
                              )
                          )
                      ))
                    }">
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
  <!--  加载动画-->
  <loading-view :is-show="isGotScreen" />
</template>
<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import store from "../../../store";
import {useRoute} from "vue-router";
import More from "../../MyIcons/chatHeader/more.vue";
import InitiateGroupChat from "../../MyIcons/chatHeader/initiate-group-chat.vue";
import RemoteAssist from "../../MyIcons/chatHeader/remote-assist.vue";
import ScreenShare from "../../MyIcons/chatHeader/screen-share.vue";
import {MsgTypeConstant} from "../../../constant/MsgTypeConstant.ts";
import LoadingView from "../../Loading/loadingView.vue";
import {debounce} from "../../../utils/debounceThrottle.ts";
import {ArrowRight, UploadFilled} from "@element-plus/icons-vue";
import {FileUploadResult} from "../../../constant/FileUploadConstant.ts";
import SuccessStatusIcon from "../../MyIcons/statusIcon/success-status-icon.vue";
import ErrorStatusIcon from "../../MyIcons/statusIcon/error-status-icon.vue";
import LoadingStatusIcon from "../../MyIcons/statusIcon/loading-status-icon.vue";
import UploadingStatusIcon from "../../MyIcons/statusIcon/uploading-status-icon.vue";
import {IFileFormat} from "../../../common/FileCommon.ts";
import {ReUploadFileRequest} from "../../../store/basicData/basicData.ts";
import {
  formatFileSize,
  getIconComponent,
  getIconComponentByFile,
  isDirectory,
  isFolder
} from "../../../utils/fileUtil.ts";

const route = useRoute();
// 是否显示所有控件图标，包括联系对象名称
const isShow = computed(() => route.path === '/chat' && store.state.chatPanelData.isShow);
let electron = (window as any).electronAPI;
const isElectron = ref(store.state.basicData.isElectron);

// 点击除了联系对象详情信息卡片之外其他地方
const handleClickOutside = (event: any) => {
  if (event.target.classList.contains("contactor-name") || event.target.classList.contains("contactor-info-card") ||
      event.target.closest('.contactor-info-card')) {
    isShowDetailInfo.value = true;
  } else isShowDetailInfo.value = false;
};
const handleScreenSourcesGet = () => {// 监听本地屏幕窗口信息获取返回结果
  if (isElectron.value) {
    // 监听本地屏幕窗口信息（屏幕共享）
    electron.onReceiveMessage('screenShot-sources', (args: any) => {
      // 返回一个可以获取到的屏幕信息数组，默认第一个是整个屏幕
      console.log("获取到所有可用屏幕信息：\n" + JSON.stringify(args));
      screenSources.value = args;

      deskSources.value = [];// 置空
      appSources.value = [];// 置空
      screenSources.value.forEach((sc: any) => {
        let scName = sc.name;
        let scId = sc.id;
        if (scName === '整个屏幕' || scName === 'Entire Screen' || scId.includes('screen')) {
          // 桌面屏幕
          deskSources.value.push(sc);
        } else {
          // 应用屏幕
          appSources.value.push(sc);
        }
      })

      if (screenSources.value && screenSources.value.length) {// 获取到信息才给显示
        selectScreenId.value = "";// 选中的屏幕id初始为
        isShowScreenShare.value = true;// 显示屏幕分享选取对话框
      }

      isGotScreen.value = false;// 关闭加载动画
    });
  }
}
// 绑定事件
onMounted(() => {
  isElectron.value = store.state.basicData.isElectron;
  window.addEventListener('click', handleClickOutside);
  handleScreenSourcesGet();
});
// 清理事件
onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});

/*联系对象名称*/
// 是否显示详细信息卡片
const isShowDetailInfo = ref(false);
const contactorInfo = computed(() => {
  let contactor = store.getters["basicData/getCurContactor"];
  contactor.isTop = !!contactor.isTop;
  contactor.isIgnore = !!contactor.isIgnore;
  return contactor;
});// 可以使个人或群聊 todo
// 判断contactorInfo里面的参数是否都为空
const isValidContactorInfo = () => {
  return contactorInfo.value && contactorInfo.value.nick_name &&
      contactorInfo.value.contact_info_id && contactorInfo.value.contactHeadImgUrl;
}
// 显示联系对象详细信息卡片
const showContactorInfoCard = () => {
  if (isValidContactorInfo()) isShowDetailInfo.value = true;// 联系对象的数据有效才显示信息卡片
}
// 修改联系对象信息
const updateContactorInfo = () => {
  store.dispatch("basicData/updateContactorNameInfo", {
    id: contactorInfo.value.id,
    nick_name: contactorInfo.value.nick_name,
  })
}
const updateContactorInfoDebounce = debounce(updateContactorInfo, 100);

/**操作按钮*/
/* 屏幕共享*/
// 屏幕是否获取成功
const isGotScreen = ref(false);
// 屏幕共享
const isShowScreenShare = ref(false);// 屏幕分享选取对话框是否显示
const selectScreenId = ref('');// 选中要分享的屏幕id
const screenSources = ref([]);// 所有可获取的屏幕信息
const deskSources = ref([] as any);// 桌面屏幕信息
const appSources = ref([] as any);// 应用屏幕信息
// 选择屏幕
const selectScreen = () => {
  isGotScreen.value = true;
  if (isElectron.value) {
    electron.sendMessage('desktop-capture', {});
  }
}
// 屏幕共享
const shareScreen = () => {
  console.log(selectScreenId.value);
  if (selectScreenId.value) {
    isShowScreenShare.value = false;
    if (isElectron.value) {
      electron.sendMessage('openChildWindow', {
        winName: "desk_share",
        path: "/desk/share",
        resizable: false,
        x: 200,
        y: 150,
        width: 1300,
        height: 850,
        transportObj: JSON.stringify({
          ...store.getters["basicData/getCurContactor"],
          msgType: MsgTypeConstant.JOIN_ROOM,
          screenId: selectScreenId.value,
        }),
      })
    }
  }
}

/*发起群聊*/

const handleInitiateGroupChat = () => {// 发起群聊
  console.log()
}

/*显示联系对象更多信息*/
const isShowMoreContactorInfo = ref(false);// 是否显示联系对象更多信息
const isShowMoreFilesInfo = ref(false);// 是否显示当前联系中文件传输相关操作信息
const isSelectFilesOptIndex = ref(1);// 默认选择 "发送文件" 按钮
const showMoreInfo = () => {
  isShowMoreContactorInfo.value = !isShowMoreContactorInfo.value;
}
const updateIsTop = () => {// 更新是否置顶
  if (isShowMoreContactorInfo.value) {
    store.dispatch("basicData/setContactorIsTop", {
      id: contactorInfo.value.id,
      isTop: contactorInfo.value.isTop ? 1 : 0,
    });
  }
}
const updateIsTopDebounce = debounce(updateIsTop, 100);
const updateIsIgnore = () => {// 更新是否忽视
  if (isShowMoreContactorInfo.value) {
    store.dispatch("basicData/setIsIgnoreContactorMsg", {
      id: contactorInfo.value.id,
      isIgnore: contactorInfo.value.isIgnore ? 1 : 0,
    });
  }
}
const updateIsIgnoreDebounce = debounce(updateIsIgnore, 100);
const showHistoryMessageInfo = () => {// 显示历史消息记录
  isShowMoreContactorInfo.value = false;
}
const showMoreFilesInfo = () => {// 显示更多文件传输相关操作信息抽屉
  isSelectFilesOptIndex.value = 1;// 默认选择 "发送文件" 按钮
  isShowMoreContactorInfo.value = false;
  isShowMoreFilesInfo.value = true;
}

// --更多文件信息
// 上传结果映射
const uploadResultMap = {
  [FileUploadResult.LOADING]: 1,
  [FileUploadResult.UPLOADING]: 2,
  [FileUploadResult.ERROR]: 3,
  [FileUploadResult.SUCCESS]: 4
};
//上传给该联系对象的文件列表
const filesUploadList = computed(() => {
  let filesUploadOldList = store.getters["basicData/getUploadToCurContactorFilesList"];
  filesUploadOldList.sort((a: IFileFormat, b: IFileFormat) => {
    return uploadResultMap[a.uploadResult] - uploadResultMap[b.uploadResult];
  });
  return filesUploadOldList;
});
// --处理拖拽事件
// 发送的文件数据信息
const fileInfoList = ref<Array<IFileFormat>>([]);
// 文件同时上传上限
const fileUploadMaxLimitation = ref(50);
// 文件上传input
const elUploadInput = ref();
const fileUploadBlockClick = () => {// 点击文件上传
  elUploadInput.value.click();
}
const handleFilesSelect = (event: any) => {// 处理文件选择
  const files = event.target.files;
  // console.log(files);

  let isExistFileData = false;// 拖拽事件中是否存在文件数据
  let curContactInfoId = store.state.chatPanelData.userInfo.contact_info_id;
  for (let i = 0;i < files.length;++i) {
    if (i === fileUploadMaxLimitation.value) break ;// 达到文件同时上传上限

    let file = files[i];
    if (!isDirectory(file)) {
      isExistFileData = true;
      fileInfoList.value.push({
        MsgTo: curContactInfoId,
        name: file.name,// 文件名称
        type: getIconComponentByFile(file),
        size: formatFileSize(file.size),// 文件大小
        file: file,// 文件
        uploadProgress: 0,// 上传进度
        uploadResult: FileUploadResult.LOADING,// 上传结果，FileUploadResult
      });
      console.log(file);
    }
  }

  // 文件发送
  if (isExistFileData) {// 有文件才发送
    store.dispatch("basicData/addFilesUploadData", {
      contactorId: store.getters["basicData/getCurContactorId"],
      fileUploadList: fileInfoList.value,
    });
    fileInfoList.value = [] as any;// 清空文件数组
  }
}
const handleDragOver = (event: any) => {// 拖拽文件移进区域
  event.preventDefault();
  let len = event.dataTransfer.items.length;
  for (let i = 0; i < len; i++) {
    let item = event.dataTransfer.items[i];
    if (item.kind === 'file' && !isFolder(item)) {// 是文件但不是文件夹
      break;
    }
  }
}
const handleDrop = (event: any) => {// 拖拽文件在某区域释放
  event.preventDefault();
  fileInfoList.value = [] as any;

  let isExistFileData = false;// 拖拽事件中是否存在文件数据
  const items = event.dataTransfer.items;
  // console.log(items)
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

  // 文件发送
  if (isExistFileData) {// 有文件才发送
    store.dispatch("basicData/addFilesUploadData", {
      contactorId: store.getters["basicData/getCurContactorId"],
      fileUploadList: fileInfoList.value,
    });
    fileInfoList.value = [] as any;// 清空文件数组
  }
}

// 重新上传文件
const reUploadFile = (fileUploadResult: string, reUploadFileIndex: number) => {
  if (fileUploadResult === FileUploadResult.ERROR) {// 上传失败可以重新上传
    let reUploadFileRequest = {
      contactorId: store.getters["basicData/getCurContactorId"],
      reUploadFileIndex: reUploadFileIndex,
    } as ReUploadFileRequest;
    store.dispatch("basicData/reUploadFileData", reUploadFileRequest);
  }
}

</script>
<style scoped>
.contactor {
  color: #1e1e1e;
  cursor: default;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 29%;
  top: 30px;
  padding: 2px 10px;
  height: 20px;
  border-radius: 5px;
  -webkit-app-region: no-drag;

  .contactor-name {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2px 10px;
    height: 20px;
    border-radius: 5px;
  }
  .contactor-name:hover {
    background: #ccc;
  }

  .contactor-info-card {
    position: absolute;
    user-select: none;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.5);
    box-shadow: 0 5px 8px 2px rgba(0, 0, 0, 0.1);
    top: calc(100% + 5px);
    left: 0;
    width: 380px;
    height: 350px;
    z-index: 1;
    padding: 30px;
    border-radius: 25px;

    .contactor-title-info {
      display: flex;
      flex-direction: row;
      gap: 20px;

      .contactor-avatar {
        pointer-events: none;
        user-select: none;
        text-align: center;
        border-radius: 50px;
        width: 100px;
        height: 100px;
      }

      .contactor-title-content {
        display: flex;
        flex-direction: column;
        width: 200px;

        .contactor-id {
          color: #666;
          font-family: 'Arial', sans-serif;
        }
      }
    }

    /*信息标签*/

    .contactor-info-label {
      color: #666;
      width: 100px;
      font-family: 'SimHei', 'Arial', sans-serif;
    }

    .contactor-level {
      margin-top: 20px;
      height: 50px;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .contactor-alias {
      height: 100px;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 20px;

      .contactor-alias-value {
        border: none;
        background: none;
      }
    }
  }

}


.opt-items {
  position: absolute;
  top: 30px;
  right: 20px;
  height: 25px;
  -webkit-app-region: no-drag;

  .opt-item {
    cursor: default;
    user-select: none;
    position: absolute;
    height: 25px;
    width: 25px;
    -webkit-app-region: no-drag;
  }
}

/*操作按钮提示信息*/
.opt-toolTip {
  --left: 50%; /*定义变量left为50%*/
  visibility: hidden;
  position: absolute;
  top: 40px;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 10pt;
  color: #fff;
  background-color: #bbb;
  border: 1px solid #ccc;
  padding: 3px;
  box-sizing: border-box;
  border-radius: 5px;
  z-index: 4;
  white-space: nowrap;
  transition: visibility 0.3s ease-in-out;
}

.opt-toolTip::before {
  content: '';
  position: absolute;
  top: -15px;
  left: var(--left);
  transform: translateX(-50%);
  border-width: 8px;
  border-style: solid;
  border-color: transparent transparent #bbb transparent;
  border-radius: 3px;
}

.opt-item:hover .opt-toolTip {
  visibility: visible;
  transition: visibility 0.3s cubic-bezier(0.5, 0, 0.5, 1);
}

.opt-item:not(:hover) .opt-toolTip {
  visibility: hidden;
  transition: visibility 0.3s cubic-bezier(0.5, 0, 0.5, 1);
}

/*对话框*/
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

.dialog-text {
  color: #bbb;
  user-select: none;
}

.screen-item {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 8%;
  row-gap: 20px;

  .screen-img {
    -webkit-user-drag: none;
    user-select: none;
    border: rgba(1, 1, 1, 0) solid 2px;
  }

  .screen-img:hover {
    border: #0066FF solid 2px;
  }

  .select-screen {
    border: #0066FF solid 2px;
  }
}

/*联系对象更多信息*/
.drawer-style ::v-deep .el-drawer {
  height: calc(100% - 60px);
  top: 60px;
  border-radius: 25px;
  background: rgb(245, 245, 245);
}
.drawer-items {
  width: 100%;
  height: 60%;
  padding: 10%;
  color: #aaa;
  user-select: none;
  backdrop-filter: blur(5px);
  .drawer-item{
    background: #eee;
    border-radius: 25px;
    padding: 15px;
    box-sizing: border-box;
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .dialog_form_label {
      color: #888;
      user-select: none;
    }
  }
  .drawer-item:hover {
    background: #ddd;
  }
  .chat-history-info {
    cursor: pointer;
  }
  .chat-history-info:active {
    background: #ccc;
  }
  .file-upload-list {
    cursor: pointer;
  }
  .file-upload-list:active {
    background: #ccc;
  }
  .delete-btn {
    color: rgba(255, 0, 0, 1);
    cursor: pointer;
  }
  .delete-btn:hover {
    color: rgba(255, 0, 0, 0.5);
  }

  /*文件传输抽屉*/
  .files-drawer-header {
    width: 65%;
    margin: 0 auto;
    background: #eee;
    border-radius: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    .file-opt-btn{
      background: #ddd;
    }
  }
  .files-drawer-main {
    margin-top: 10px;

    .file_info {
      gap: 15px;
      width: 100%;
      display: flex;
      flex-direction: row;
      padding: 5px;
      box-sizing: border-box;
      user-select: none;

      .file_image {
        padding: 5px;
        box-sizing: border-box;
      }

      .file_description {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .file_upload_status{
        display: flex;
        flex: 1;
        justify-content: right;
        align-items: center;
      }
    }
    .file_info:hover {
      background: rgba(50, 50, 50, 0.1);
    }
    .file_info:active {
      background: rgba(50, 50, 50, 0.2);
    }
    /*进度条*/
    .i-progress {
      height: 1px;
      display: inline-block;
      background-color: #4caf50;
      transition: width 0.4s ease;
    }
  }
}
</style>
