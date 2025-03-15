<template>
  <!--  通过搜索得到的联系对象信息页-->
  <div class="userDetailInfo">
    <div
        class="header_info"
        :style="{borderBottom: `${(store.state as any).noteBookPanelData.userInfo.isFriend ? '#ddd solid 1px' : 'none'}`}"
    >
      <el-image
          :src="(store.state as any).noteBookPanelData.userInfo.userAvatar"
      />
      <div class="header_description">
        <div class="user_name" v-if="!(store.state as any).noteBookPanelData.userInfo.isFriend">
          {{ (store.state as any).noteBookPanelData.userInfo.userName }}
        </div>
        <div class="user_name" v-if="(store.state as any).noteBookPanelData.userInfo.isFriend">
          {{ (store.state as any).noteBookPanelData.userInfo.friend.alias }}
        </div>
        <div class="detail_info" v-if="(store.state as any).noteBookPanelData.userInfo.isFriend">
          昵称：{{ (store.state as any).noteBookPanelData.userInfo.userName }}
        </div>
        <div class="detail_info">地区： 中国</div>
      </div>
    </div>

    <div class="set_alias" @click="setAliasLabel" v-if="!(store.state as any).noteBookPanelData.userInfo.isFriend">
      <text class="alias_button">设置备注和标签</text>
      <right-icon :stroke="'#aaa'"/>
    </div>
    <!--      start---好友信息-->
    <div
        class="descriptions_info"
        :style="{borderBottom: `${!(store.state as any).noteBookPanelData.userInfo.isFriend ? 'none' : '#ddd solid 1px'}`}"
        v-if="(store.state as any).noteBookPanelData.userInfo.isFriend"
    >
      <div style="display: flex;">
        <span class="descriptions_info_label">备注：</span>
        <span class="descriptions_info_content">{{ (store.state as any).noteBookPanelData.userInfo.friend.alias }}</span>
      </div>
      <div style="display: flex;">
        <span class="descriptions_info_label">简介：</span>
        <span class="descriptions_info_content">
          {{
            !(store.state as any).noteBookPanelData.userInfo.userProfile ? '未填写' : (store.state as any).noteBookPanelData.userInfo.userProfile
          }}
        </span>
      </div>
    </div>
    <!--      ---好友信息---end-->

    <!--      ---好友操作---start-->
    <div
        style="
            padding: 2% 0;
            display: flex;
            column-gap: 10%;
            justify-content: center;
      ">
      <button
          class="opt-button"
          @click="chatWithFriend"
          v-if="(store.state as any).noteBookPanelData.userInfo.isFriend"
      >
        <el-icon size="25">
          <ChatRound/>
        </el-icon>
        <br>
        发送消息
      </button>
      <button
          class="opt-button"
          @click="phoneChatWithFriend"
          v-if="(store.state as any).noteBookPanelData.userInfo.isFriend"
      >
        <el-icon size="25">
          <Phone/>
        </el-icon>
        <br>
        语音聊天
      </button>
      <button
          class="opt-button"
          @click="phoneVideoChatWithFriend"
          v-if="(store.state as any).noteBookPanelData.userInfo.isFriend"
      >
        <el-icon size="25">
          <VideoCamera/>
        </el-icon>
        <br>
        视频聊天
      </button>
      <button
          class="opt-button"
          @click="friendApply"
          v-else>
        添加到通讯录
      </button>
    </div>
    <!--      ---好友操作---end-->

    <!--    设置备注和标签表单-->
    <el-dialog
        v-model="isSettingAlias"
        style="
          height: 70vh;
          backdrop-filter: blur(5px);
          background: rgba(255,255,255,0);
          border-radius: 5%;
        "
        :show-close="false"
    >
      <template #header="{ close }">
        <div style="display: flex;justify-content: space-between">
          <div/>
          <button
              :class="`${friendApplyForm.isFriend ? 'save-button' : 'close-button'}`"
              @click="closeSetting(close)"
          >
            {{ friendApplyForm.isFriend ? '保存' : '取消' }}
          </button>
        </div>
      </template>
      <div style="color: black;padding: 0 8%">
        <div class="dialog_title_style">
          <div class="dialog_title_style_item">设</div>
          <div class="dialog_title_style_item">置</div>
          <div class="dialog_title_style_item">备</div>
          <div class="dialog_title_style_item">注</div>
          <div class="dialog_title_style_item">和</div>
          <div class="dialog_title_style_item">标</div>
          <div class="dialog_title_style_item">签</div>
        </div>
        <el-form>
          <el-form-item class="yp-form-item">
            <template #label>
              <h3 class="dialog_form_label">备注</h3>
            </template>
            <el-input
                v-model="friendApplyForm.alias"
                size="large"
            >
              <template #suffix>
                <el-icon style="cursor: default" @click="friendApplyForm.alias = ''">
                  <Close/>
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item class="yp-form-item">
            <template #label>
              <h3 class="dialog_form_label">标签</h3>
            </template>
            <el-input
                v-model="tag"
                size="large"
                @keydown.enter="enterTag"
                @keydown.delete="clearTag"
            >
              <template #prefix>
                <el-tag
                    v-for="(tag, i) in friendApplyForm.tags"
                    :key="i"
                    round
                    closable
                    @close="deleteTag(i)"
                    class="input-tag-style"
                >
                  {{ tag }}
                </el-tag>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item class="yp-form-item" v-if="!(store.state as any).noteBookPanelData.userInfo.isFriend">
            <template #label>
              <h3 class="dialog_form_label">发送添加朋友申请</h3>
            </template>
            <el-input
                type="textarea"
                maxlength="50"
                style="max-height: 30%"
                v-model="friendApplyForm.add_method"
                size="large"
            />
          </el-form-item>
          <el-form-item class="yp-form-item">
            <template #label>
              <h3 class="dialog_form_label">消息免打扰</h3>
            </template>
            <el-switch v-model="friendApplyForm.isIgnore"/>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import RightIcon from "../../MyIcons/right_icon.vue";
import {ChatRound, Close, Phone, VideoCamera} from "@element-plus/icons-vue";
import {UserService} from "../../../api/Services/UserService.ts";
import {ElNotification} from "element-plus";
import {getUserInfoStorage, setCurContactorInfoStorage} from "../../../utils/storageUtil.ts";
import store from "../../../store";
import router from "../../../router";
import {CommonConstant} from "../../../constant/CommonConstant.ts";
import {MsgTypeConstant} from "../../../constant/MsgTypeConstant.ts";

const isElectron = ref(store.state.basicData.isElectron);

// 当前最外层窗口的高度
const curWinHeight = ref(window.outerHeight);
window.addEventListener('resize', () => {
  curWinHeight.value = isElectron.value ? window.outerHeight : window.innerHeight;
});

onMounted(() => {
  isElectron.value = store.state.basicData.isElectron;
  if (!isElectron.value) {
    curWinHeight.value = window.innerHeight;
  }
})

// 监听用户数据变化
watch(() => store.state.noteBookPanelData.update,
    () => {
      let userInfo = store.state.noteBookPanelData.userInfo;
      friendApplyForm.value = {
        alias: !userInfo.isFriend ? userInfo.userName : userInfo.friend.alias,
        tags: !userInfo.isFriend ? [] : JSON.parse(userInfo.friend.tags),
        add_method: !userInfo.isFriend ?
            `我是${getUserInfoStorage().userName}` : userInfo.friend.add_method,
        isFriend: userInfo.isFriend,
        isIgnore: 0,
      }
    }
)

/*还不是好友时，申请添加好友*/
const isSettingAlias = ref(false);//正在设置备注
const friendApplyForm = ref({
  alias: "",
  tags: [] as Array<string>,
  add_method: "",
  isFriend: false,
  isIgnore: 0,
});
const tag = ref("");// 输入框当前输入的标签
const setAliasLabel = () => {
  tag.value = "";
  //开始设置备注和标签
  isSettingAlias.value = true;
}
/*输入框中的标签*/
// 输入标签内容进数组
const enterTag = () => {
  if (!tag.value) return;// 不能为空
  friendApplyForm.value.tags.push(tag.value);
  tag.value = "";
}
// 清空数组中的标签内容
const clearTag = () => {
  friendApplyForm.value.tags.pop();
}
// 标签数据删除操作
const deleteTag = (id: number) => {
  friendApplyForm.value.tags = friendApplyForm.value.tags.filter((_, index) => index !== id);
}

// 取消对话框
const closeSetting = (close: any) => {
  let userInfo = store.state.noteBookPanelData.userInfo;
  if (userInfo.isFriend) {
    // todo 后端修改好友数据接口
  }
  close();
}
// 申请添加好友
const friendApply = () => {
  let userInfo = store.state.noteBookPanelData.userInfo;
  UserService.friendApplyUsingPost({
    user_id: getUserInfoStorage().id,
    friend_id: userInfo.id,
    alias: friendApplyForm.value.alias,
    add_method: friendApplyForm.value.add_method,
    tags: friendApplyForm.value.tags,
    isIgnore: !friendApplyForm.value.isIgnore ? 0 : 1,
  }).then((res: any) => {
    if (res.code === 0) {
      ElNotification.success("已发送好友申请");
    } else ElNotification.error("申请失败，" + res.message);
  })
}

/*已经是好友*/
// 当前选中的好友id
const curFriendId = computed(() => store.state.noteBookPanelData.userInfo.user_id);

// 与该好友聊天
const chatWithFriend = () => {
  store.dispatch("basicData/setChatWithCurFriend",
      curFriendId.value
  ).then(() => {
    let contact_info_id = store.getters["basicData/getCurContactor"].contact_info_id;
    // 1、将当前联系人信息保存下来
    store.dispatch("chatPanelData/setUserInfo", {
      contact_info_id: contact_info_id,
    }).then(() => {
      // 2、查询联系人消息
      store.dispatch("chatPanelData/searchCurChatMessage", {
        user_id: getUserInfoStorage().id,
        friend_id: contact_info_id,
      }).then(() => {
        // 3、设置聊天界面显示
        store.dispatch("chatPanelData/setIsShow", 1).then(() => {
          router.push({
            path: "/chat"
          })
        });
      });
    });

  });
}
// 与该好友语音聊天
const phoneChatWithFriend = () => {
  let contactorList = store.state.basicData.contactorList;
  if (!contactorList || !contactorList.length) return;

  let curPhoneChatContactor = {};
  for (let i = 0; i < contactorList.length; i++) {
    let contactor = contactorList[i];
    // 是联系人，且联系人的联系对象id 是 好友的用户id
    if (contactor.type === CommonConstant.CONTACTOR_PERSON_TYPE && contactor.contact_info_id === curFriendId.value){
      curPhoneChatContactor = contactor;
      break;
    }
  }
  // 发起电话
  if (isElectron.value) {
    //获取自定义electronAPI上下文
    let electron = (window as any).electronAPI;
    electron.sendMessage('openChildWindow', {
      winName: "phone_chat",
      path: "/phone/chat",
      resizable: false,
      x: 300,
      y: 150,
      width: 400,
      height: 760,
      maximizable: false, //不允许放大
      transportObj: JSON.stringify({
        ...curPhoneChatContactor,
        msgType: MsgTypeConstant.JOIN_ROOM,
      }),
    })
  }else {
    setCurContactorInfoStorage({
      ...curPhoneChatContactor as any,
      msgType: MsgTypeConstant.JOIN_ROOM,
    });
    window.open("/#/phone/chat", "_blank");
  }
}

// 与该好友视频聊天
const phoneVideoChatWithFriend = () => {
  let contactorList = store.state.basicData.contactorList;
  if (!contactorList || !contactorList.length) return;

  let curPhoneVideoChatContactor = {};
  for (let i = 0; i < contactorList.length; i++) {
    let contactor = contactorList[i];
    // 是联系人，且联系人的联系对象id 是 好友的用户id
    if (contactor.type === CommonConstant.CONTACTOR_PERSON_TYPE && contactor.contact_info_id === curFriendId.value){
      curPhoneVideoChatContactor = contactor;
      break;
    }
  }
  // 发起视频电话
  if (isElectron.value) {
    //获取自定义electronAPI上下文
    let electron = (window as any).electronAPI;
    electron.sendMessage('openChildWindow', {
      winName: "video_chat",
      path: "/video/chat",
      resizable: false,
      x: 300,
      y: 150,
      width: 400,
      height: 760,
      maximizable: false, //不允许放大
      transportObj: JSON.stringify({
        ...curPhoneVideoChatContactor,
        msgType: MsgTypeConstant.JOIN_ROOM,
      }),
    })
  }else {
    setCurContactorInfoStorage({
      ...curPhoneVideoChatContactor as any,
      msgType: MsgTypeConstant.JOIN_ROOM,
    });
    window.open("/#/video/chat", "_blank");
  }
}
</script>

<style scoped>
/*用户信息*/
.userDetailInfo {
  height: 100%;
  padding: 1% 8%;
  color: #1e1e1e;

  .header_info {
    padding: 5% 0;
    display: flex;
    box-sizing: border-box;

    .el-image {
      width: 12%;
      height: 12%;
      border-radius: 12px;
      user-select: none;
    }

    .header_description {
      /*用户描述信息，包括用户名称*/
      flex-direction: row;
      padding: 0 5%;
      user-select: none;
      flex: 1; /* 填充header_info剩下的部分区域*/

      .user_name {
        font-weight: bolder;
        font-size: 20pt;
      }

      .detail_info {
        color: #aaa;
      }
    }
  }

  .set_alias {
    border-top: #dcdfe6 solid 1px;
    height: 8%;
    display: flex;
    align-items: center;
    padding: 0 2%;
    justify-content: space-between;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.5);
    box-shadow: 0 5px 8px rgba(0, 0, 0, 0.1);
    border-radius: 15px;

    .alias_button {
      color: #000;
      letter-spacing: 2px;
      user-select: none;
      text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
    }
  }

  .set_alias:hover {
    background-color: #eee;
  }

  .descriptions_info {
    /*好友的描述信息*/
    color: #1e1e1e;
    display: grid;
    row-gap: 20px;
    padding: 3% 0;

    .descriptions_info_label {
      width: 12%;
      margin-right: 5%;
      color: #ccc;
      word-wrap: break-word;
      user-select: none;
    }

    .descriptions_info_content {
      font-weight: 545;
      line-height: 100%;
      font-size: 15pt;
    }
  }

  .opt-button {
    /*操作按钮*/
    border: none;
    outline: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 16px;
    color: white;
    background: linear-gradient(135deg, rgba(135, 206, 235, 0.8), rgba(70, 130, 180, 0.8));
    transition: background 0.5s ease;
    backdrop-filter: blur(10px);
  }

  .opt-button:hover {
    background: linear-gradient(135deg, rgba(70, 130, 180, 0.9), rgba(135, 206, 235, 0.9));
    transform: translateY(-2px) scale(1.03);
    transition: transform 0.5s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
}

/*对话框样式*/
.dialog_custom_class {
  border-radius: 10%;
}

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

.yp-form-item {
  /*表单样式修改*/
  display: block;
}

.yp-form-item ::v-deep .el-input__wrapper {
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
}

.yp-form-item ::v-deep .el-input__wrapper:hover {
  background: rgba(200, 230, 255, 0.6);
  transform: scale(1.05);
  transition: background 0.5s ease, transform 0.5s ease;
}

.yp-form-item ::v-deep .el-input__wrapper:not(:hover) {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1);
  transition: background 0.5s ease, transform 0.5s ease;
}

.yp-form-item ::v-deep .el-input__inner::selection {
  background-color: rgba(173, 216, 230, 0.6);
}

.yp-form-item ::v-deep .el-textarea__inner {
  font-size: 13pt;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  max-height: 100px;
}

.yp-form-item ::v-deep .el-textarea__inner:hover {
  background: rgba(200, 230, 255, 0.6);
  transform: scale(1.03);
  transition: background 0.5s ease, transform 0.5s ease;
}

.yp-form-item ::v-deep .el-textarea__inner:not(:hover) {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1);
  transition: background 0.5s ease, transform 0.5s ease;
}

.yp-form-item ::v-deep .el-textarea__inner::selection {
  background-color: rgba(173, 216, 230, 0.6);
}

.input-tag-style {
  /*输入框中标签样式*/
  color: #1e1e1e;
  margin-right: 5px;

  border: none;
}

.dialog_form_label {
  color: #aaa;
  user-select: none;
}
</style>
