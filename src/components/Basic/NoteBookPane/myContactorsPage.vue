<template>
  <!--  本人联系对象页面-->
  <div class="userDetailInfo">
    <div class="header_info" style="border-bottom: #ddd solid 1px">
      <el-image
          :src="(store.state as any).noteBookPanelData.userInfo.userAvatar"
      />
      <div class="header_description">
        <div class="user_name">
          {{ (store.state as any).noteBookPanelData.userInfo.alias }}
        </div>
        <div class="detail_info">
          昵称：{{ (store.state as any).noteBookPanelData.userInfo.name }}
        </div>
        <div class="detail_info">地区： 中国</div>
      </div>
    </div>

    <!--      start---好友信息-->
    <div
        class="descriptions_info"
        style="border-bottom: #ddd solid 1px"
    >
      <div style="display: flex;">
        <span class="descriptions_info_label">备注：</span>
        <span class="descriptions_info_content">{{ (store.state as any).noteBookPanelData.userInfo.alias }}</span>
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

    <div
        style="
            padding: 2% 0;
            display: flex;
            column-gap: 10%;
            justify-content: center;
      ">
      <button class="opt-button" @click="chatWithFriend">
        <el-icon size="25">
          <ChatRound/>
        </el-icon>
        <br>
        发送消息
      </button>
      <button class="opt-button" @click="phoneChatWithFriend">
        <el-icon size="25">
          <Phone/>
        </el-icon>
        <br>
        语音聊天
      </button>
      <button class="opt-button" @click="phoneVideoChatWithFriend">
        <el-icon size="25">
          <VideoCamera/>
        </el-icon>
        <br>
        视频聊天
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import store from "../../../store";
import {ChatRound, Phone, VideoCamera} from "@element-plus/icons-vue";
import {getUserInfoStorage, setCurContactorInfoStorage} from "../../../utils/storageUtil.ts";
import router from "../../../router";
import {MsgTypeConstant} from "../../../constant/MsgTypeConstant.ts";
import {CommonConstant} from "../../../constant/CommonConstant.ts";
import {computed, onMounted, ref} from "vue";

const isElectron = ref(store.state.basicData.isElectron);

// 当前选中的好友id
const curFriendId = computed(() => store.state.noteBookPanelData.userInfo.user_id);

onMounted(() => {
  isElectron.value = store.state.basicData.isElectron;
})

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
</style>
