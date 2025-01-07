<template>
  <!--  &lt;!&ndash;  屏幕共享请求窗口&ndash;&gt;-->
  <!--  <div v-if="!isConnected">-->
  <!--    <div style="display: flex;gap: 10px;justify-content: right">-->
  <!--      <button class="cancel-btn">拒绝</button>-->
  <!--      <button @click="accept" class="enter-btn">加入</button>-->
  <!--    </div>-->
  <!--  </div>-->

  <!--屏幕共享窗口-->
  <el-container
      :style="{
        height: '100vh',
        minHeight: winHeight,
        background: 'rgba(0,0,0,0.5)'
      }"
  >
    <el-header class="top-menu">
      <!--      时间信息-->
      <div class="time-info">
        {{ shareUser.name }}共享中
      </div>
      <div style="text-align: right;color: #eee;filter: none">
        <!--            最小化-->
        <el-icon class="tab1" @click="minimize">
          <Minus/>
        </el-icon>
        <!--        最大化-->
        <el-icon class="tab1" @click="maximize">
          <FullScreen/>
        </el-icon>
        <!--            关闭-->
        <el-icon class="tab2" @click="close">
          <Close/>
        </el-icon>
      </div>
    </el-header>
    <el-main :style="{
          height: (winHeight - (93 + 32)) + 'px',
          padding: '5px',
          background: 'rgb(26, 26, 26)'
        }">
      <div class="content">
        <div class="video-bg">
          <video
              ref="remoteVideo"
              autoplay="true"
              object-fit="cover"
              style="width: 100%; height: 90%;"
          />
        </div>
        <el-scrollbar :height="'100%'" class="user-info-items">
          <div class="user-info-item" v-for="(onlineUser, i) in onlineUserList" :key="i">
            <div class="user-avatar">
              <el-image class="avatar" :src="onlineUser.userAvatar"/>
            </div>
            <div class="user-info">
              <div class="first-info">
                <voice :stroke="'#eee'" v-if="onlineUser.isOpenVoice"/>
                <voice-off :stroke="'#eee'" v-else/>
                {{ onlineUser.userName }}
              </div>
              <div class="last-info">
                <screen-share
                    :fill_color="'#eee'"
                    :mouseover-fill-color="'#eee'"
                    v-if="onlineUser.isShareUser"
                />
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <div class="footer">
        <div class="button-item">
          <div v-if="isOpenVoice">
            <div class="button-item-icon" @click="voiceCtl">
              <voice/>
            </div>
            <div>麦克风已开</div>
          </div>
          <div v-if="!isOpenVoice">
            <div class="button-item-icon" style="background-color: rgb(35,36,34)">
              <voice-off :stroke="'#fff'" @click="voiceCtl" />
            </div>
            <div>麦克风已关</div>
          </div>
        </div>
        <div class="button-item">
          <div v-if="isOpenVideo">
            <div class="button-item-icon">
              <video_on/>
            </div>
            <div>摄像头已开</div>
          </div>
          <div v-if="!isOpenVideo">
            <div class="button-item-icon" style="background-color: rgb(35,36,34)">
              <video_off :fill_color="'#fff'"/>
            </div>
            <div>摄像头已关</div>
          </div>
        </div>
        <div class="button-item">
          <div @click="hangup">
            <div class="button-item-icon" style="background-color: rgb(250,81,81);padding: 32% 0">
              <phone-off />
            </div>
            <div>退出通话</div>
          </div>
        </div>
      </div>
    </el-main>
  </el-container>

  <!--  本人不是屏幕共享的用户， 才有-->
  <stream-data-controller
      :x="10"
      :y="10"
      :offer-user-id="shareUser.id"
      :cur-user-id="curUser.id"
      :basic-settings="{
        maxBitrate: currentMaxBitrate,
        maxFramerate: currentMaxFramerate,
        resolutionRatio: currentResolutionRatio,
        videoContentHint: currentVideoContentHint,
        audioContentHint: currentAudioContentHint,
      }"
      v-if="shareUser.id !== curUser.id"
  />
</template>
<script setup lang="ts">
import {getSnowflake} from "../../../../utils/StringUtils.js";
import {MsgTypeConstant} from "../../../../constant/MsgTypeConstant.ts";
import {onMounted, ref, watch} from "vue";
import {getUserInfoStorage} from "../../../../utils/storageUtil.js";
import {Close, FullScreen, Minus} from "@element-plus/icons-vue";
import {useWebRtcHandle} from "../../../../hooks/webRTCHandle.ts";
import store from "../../../../store";
import Voice from "../../../MyIcons/voice.vue";
import Video_on from "../../../MyIcons/video_on.vue";
import Video_off from "../../../MyIcons/video_off.vue";
import VoiceOff from "../../../MyIcons/voice-off.vue";
import PhoneOff from "../../../MyIcons/phone-off.vue";
import ScreenShare from "../../../MyIcons/chatHeader/screen-share.vue";
import StreamDataController from "../streamDataController.vue";
import {
  handleConstraints,
  setAudioTrackContentHints,
  setVideoTrackContentHints
} from "../../../../utils/localStreamUtil.ts";
import {useRTCParams} from "../../../../hooks/webrtc/rtcParams.ts";
import {useWebRtcRemoteDesk} from "../../../../hooks/webrtc/remoteDesk.ts";
import {WebSocketClass} from "../../../../utils/network/WebSocket.ts";


/*软件窗口*/
// 窗口缩放前后的高度
const preWinHeight = ref(window.outerHeight);
const winHeight = ref(window.outerHeight);

//获取自定义electronAPI上下文
let electron = (window as any).electronAPI;
const minimize = () => {
  electron.sendMessage('minimize-window', "最小化窗口");
}
const maximize = () => {
  // 传入原始窗口大小和位置
  electron.sendMessage('maximize-window', {
    tag: '最大化窗口',
  });
}
const close = () => {
  console.log()
}

window.addEventListener('resize', () => {
  preWinHeight.value = winHeight.value;
  winHeight.value = window.outerHeight;
});

/*基本信息*/
// 是否正在通话（发送共享方）
const isCalling = ref(true);
// 是否开启麦克风
const isOpenVoice = ref(true);
// 是否开启摄像头
const isOpenVideo = ref(false);
// 谁共享屏幕
const shareUser = ref({
  id: "",
  name: "",
});
// 当前用户信息
const curUser = ref(getUserInfoStorage());
// 当前屏幕共享的联系人
const curContactor = ref({
  contactHeadImgUrl: getUserInfoStorage().userAvatar,// 默认先显示自己的头像，等待加载出对方头像
});
// 在线用户list
const onlineUserList = ref<Array<{
  userId: string;
  userAvatar: string;
  userName: string;
  isShareUser: boolean;// 是否是分享屏幕的用户
  isOpenVoice: boolean;// 是否开启声音
}>>([]);

watch(() => {
      let rtc = store.state.useNetworkStore.rtcMap.get((curContactor.value as any).contact_info_id);
      return rtc || null;
    },
    (rtc) => {
      if (rtc && !isCalling.value) accept();// 被邀请加入房间 => 完成rtc连接建立
    }
);

const getMainProcessMessage = () => {
  electron.onReceiveMessage("fromMain", (args: any) => {
    curContactor.value = JSON.parse(args);
    console.log("通信信息：" + args);
    console.log("加入的房间号：" + (curContactor.value as any).roomId);

    (curContactor.value as any).roomId = (curContactor.value as any).roomId || getSnowflake();
    isCalling.value = (curContactor.value as any).msgType === MsgTypeConstant.JOIN_ROOM;

    onlineUserList.value = [];// 先初始化参数
    // 本人移入在线用户列表
    onlineUserList.value.push({
      userId: curUser.value.id,
      userAvatar: curUser.value.userAvatar,
      userName: curUser.value.userName,
      isShareUser: shareUser.value.id === curUser.value.id,
      isOpenVoice: isOpenVoice.value,
    });
    joinRoom();
  });
}
onMounted(() => {
  getMainProcessMessage();
})

/*桌面流配置部分*/
const {webRtcHandle} = useWebRtcHandle();
const {webRtcRemoteDesk} = useWebRtcRemoteDesk();
// 远程桌面视频实例
const remoteVideo = ref();

// 麦克风控制
const voiceCtl = () => {
  isOpenVoice.value = !isOpenVoice.value;
  onlineUserList.value = onlineUserList.value.filter(onlineUser => {
    if (onlineUser.userId === curUser.value.id) {
      onlineUser.isOpenVoice = isOpenVoice.value;
    }
    return true;
  })
  if (isOpenVoice.value) {
    webRtcRemoteDesk.restoreAudioTrack({
      receiver: (curContactor.value as any).contact_info_id,
    });
  }else {
    webRtcRemoteDesk.removeAudioTrack({
      receiver: (curContactor.value as any).contact_info_id,
    })
  }
}

// 本地的屏幕流数据
watch(() => {
      let rtc = store.state.useNetworkStore.rtcMap.get((curContactor.value as any).contact_info_id);
      if (rtc) {
        return rtc.localScreenStream;
      }
      return null;
    },
    (localScreenStream) => {
      if (localScreenStream) {// 获取到本地的屏幕流
        remoteVideo.value.srcObject = localScreenStream;
        shareUser.value = {
          id: curUser.value.id,
          name: "正在",
        }
        onlineUserList.value = onlineUserList.value.filter(onlineUser => {
          if (onlineUser.userId === shareUser.value.id) {// 本人修改为正在分享屏幕的用户
            onlineUser.isShareUser = true;
          }
          return true;
        })
      }
    }
);

// 远程的屏幕流数据
watch(() => {
      let rtc = store.state.useNetworkStore.rtcMap.get((curContactor.value as any).contact_info_id);
      if (rtc) {
        return rtc.remoteStream;
      }
      return null;
    },
    (remoteScreenStream) => {
      if (remoteScreenStream) {// 获取到远端的屏幕流
        remoteVideo.value.srcObject = remoteScreenStream;
        shareUser.value = {
          id: (curContactor.value as any).contact_info_id,
          name: (curContactor.value as any).nick_name,
        }
      }
    }
);
// 监听是否连接上对方
watch(() => {
      let rtc = store.state.useNetworkStore.rtcMap.get((curContactor.value as any).contact_info_id);
      if (rtc) return rtc.isConnected;
      return null;
    },
    (isConnected) => {
      let rtc = store.state.useNetworkStore.rtcMap.get((curContactor.value as any).contact_info_id);
      if (isConnected) {// 连接上对方
        onlineUserList.value.push({
          userId: (curContactor.value as any).contact_info_id,
          userAvatar: curContactor.value.contactHeadImgUrl,
          userName: (curContactor.value as any).nick_name,
          isShareUser: shareUser.value.id === (curContactor.value as any).contact_info_id,
          isOpenVoice: rtc.isConnectedAudio,
        });
      }
    }
)
// 监听对方是否关闭麦克风
watch(() => {
      let rtc = store.state.useNetworkStore.rtcMap.get((curContactor.value as any).contact_info_id);
      if (rtc) return rtc.isConnectedAudio;
      return null;
    },
    (isConnectedAudio) => {
      // 更新对方声音是否开启状态
      onlineUserList.value = onlineUserList.value.filter(onlineUser => {
        if (onlineUser.userId === (curContactor.value as any).contact_info_id) {
          onlineUser.isOpenVoice = isConnectedAudio;
        }
        return true;
      })
    }
)

/*控制台配置信息*/
const {
  maxBitrate,
  maxFramerate,
  resolutionRatio,
  videoContentHint,
  audioContentHint
} = useRTCParams();
const currentMaxBitrate = ref(maxBitrate.value[3].value);
const currentMaxFramerate = ref(maxFramerate.value[4].value);
const currentResolutionRatio = ref(resolutionRatio.value[3].value);
const currentVideoContentHint = ref(videoContentHint.value[3].value);
const currentAudioContentHint = ref(audioContentHint.value[0].value);
// 监听对方发送的数据通道
watch(() => store.state.useNetworkStore.rtcMap.get((curContactor.value as any).contact_info_id),
    (rtc) => {
      if (shareUser.value.id === curUser.value.id) {// 本人是屏幕共享的用户，才有用
        if (!rtc || !rtc.osDataChannel) return;
        console.log("开始修改音视频相关参数");
        // 接收对方音视频调节请求
        rtc.osDataChannel.onmessage = (event: any) => {
          const data = JSON.parse(event.data);
          const msgType = data.msgType;// 数据通道传输消息类型
          let msgData = data.message;
          switch (msgType) {
            case MsgTypeConstant.changeMaxBitrate:
              // currentMaxBitrate.value = msgData.val;
              rtc.setMaxBitrate(msgData.val);
              break;
            case MsgTypeConstant.changeMaxFramerate:
              if (remoteVideo.value.srcObject) {
                // currentMaxFramerate.value = msgData.val;
                handleConstraints({
                  frameRate: msgData.val,
                  height: currentResolutionRatio.value,
                  stream: remoteVideo.value.srcObject,
                });
              }
              break;
            case MsgTypeConstant.changeResolutionRatio:
              if (remoteVideo.value.srcObject) {
                // currentResolutionRatio.value = msgData.val;
                handleConstraints({
                  frameRate: currentMaxFramerate.value,
                  height: msgData.val,
                  stream: remoteVideo.value.srcObject,
                });
              }
              break;
            case MsgTypeConstant.changeVideoContentHint:
              if (remoteVideo.value.srcObject) {
                // currentVideoContentHint.value = msgData.val;
                setVideoTrackContentHints(remoteVideo.value.srcObject, msgData.val);
              }
              break;
            case MsgTypeConstant.changeAudioContentHint:
              if (remoteVideo.value.srcObject) {
                // currentAudioContentHint.value = msgData.val;
                setAudioTrackContentHints(remoteVideo.value.srcObject, msgData.val);
              }
              break;
          }
        }
      }
    }
);

// 加入房间
const joinRoom = () => {
  webRtcHandle.updateRtcHandle({
    screenId: (curContactor.value as any).screenId,
  });
  webRtcHandle.joinRoom({
    roomId: (curContactor.value as any).roomId,
    joinReason: (curContactor.value as any).msgType,
    msgType: MsgTypeConstant.SCREEN_SHARE_TWO,
    sender: (curContactor.value as any).user_id,
    receiver: (curContactor.value as any).contact_info_id || "",
  });
}
// 接受
const accept = () => {
  webRtcHandle.call({
    roomId: (curContactor.value as any).roomId,
    msgType: MsgTypeConstant.SCREEN_SHARE_TWO,
    sender: (curContactor.value as any).user_id,
    receiver: (curContactor.value as any).contact_info_id || "",
  });
}
// 挂断
const hangup = () => {
  WebSocketClass.send(store.state.useNetworkStore.wsMap.get((curContactor.value as any).roomId), JSON.stringify({
    type: MsgTypeConstant.HANGUP,
    room: (curContactor.value as any).roomId,
    from: (curContactor.value as any).user_id,
    to: (curContactor.value as any).contact_info_id,
  }));
  electron.sendMessage('closeWin', "关闭窗口");
}
</script>
<style scoped>
.time-info {
  position: absolute;
  left: 50%;
  user-select: none;
  pointer-events: none;
}

/*窗口菜单*/
.top-menu {
  background: rgb(26, 26, 26);
  padding: 0 0;
}

/*窗口顶部按钮*/
.tab1 {
  cursor: pointer;
  padding: 2px 8px;
  width: 2vw;
  height: 2vh;
}

.tab1:hover {
  background-color: #bbbbbb;
}

.tab2 {
  cursor: pointer;
  padding: 2px 8px;
  width: 2vw;
  height: 2vh;
}

.tab2:hover {
  background-color: rgb(251, 115, 115);
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

.content {
  width: 100%;
  height: 80%;
  display: flex;
  flex-direction: row;

  .video-bg {
    width: 100%;
    border: #555 solid 1px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .user-info-items {
    gap: 5px;
    width: 25%;
    padding: 0 5px;
    border-radius: 15px;

    .user-info-item:first-of-type {
      margin-top: 0;
    }

    .user-info-item {
      width: 100%;
      margin-top: 5px;
      background: rgb(41, 41, 41);
      position: relative;
      border-radius: 15px;

      .user-avatar {
        width: 100%;
        padding: 15% 0;
        display: flex;
        align-items: center;
        justify-content: center;

        .avatar {
          position: relative;
          width: 45px;
          height: 45px;
          min-width: 45px;
          min-height: 45px;
          background: #d6d6d6;
          border-radius: 25px;
          user-select: none;
          pointer-events: none; /*禁止鼠标选取图片*/
        }
      }

      .user-info {
        width: 100%;
        display: flex;
        flex-direction: row;
        position: absolute;
        top: 75%;
        user-select: none;

        .first-info {
          width: 50%;
          gap: 5%;
          padding: 0 8px;
          display: flex;
          flex-direction: row;
        }

        .last-info {
          width: 50%;
          gap: 5%;
          padding: 0 8px;
          display: flex;
          justify-content: right;
        }
      }
    }
  }
}

.footer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5%;
  padding: 1% 0;

  .button-item {
    user-select: none;
    text-align: center;

    .button-item-icon {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: white;
      display: inline-block;
      cursor: pointer;
      padding: 30% 0;
      box-sizing: border-box;
    }

    .button-item-icon:hover {
      filter: brightness(0.8);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }
  }
}
</style>
