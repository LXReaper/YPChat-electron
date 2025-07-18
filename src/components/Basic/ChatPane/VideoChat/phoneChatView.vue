<template>
<!--  背景-->
  <div :style="{
    backgroundImage: `url(${(curContactor as any).contactHeadImgUrl})`,
    backgroundRepeat: 'no-repeat',
    position: 'absolute',
    backgroundSize: 'cover',
    width: '100%',
    height: '100vh',
    zIndex: -1,
    filter: 'blur(10px)'
  }"/>
<!--  主体内容-->
  <el-container :style="{
        height: '100vh',
        minHeight: winHeight,
        background: 'rgba(0,0,0,0.5)'
  }">
    <el-header class="top-menu">
      <div style="text-align: right;color: #1e1e1e;filter: none">
        <!--            最小化-->
        <el-icon class="tab1" @click="minimize" v-if="isElectron">
          <Minus/>
        </el-icon>
        <!--            关闭-->
        <el-icon class="tab2" @click="close" v-if="isElectron">
          <Close/>
        </el-icon>
      </div>
    </el-header>
    <el-main :style="{
          height: (winHeight - (93 + 32)) + 'px',
          padding: '0 30px',
        }">
      <div class="avatar">
        <el-image
            :src="(curContactor as any).contactHeadImgUrl"
            style="border-radius: 20px"
        />
      </div>
      <div class="description">
        <div>{{(curContactor as any).alias}}</div>
        <div v-if="!isWaiting">
          通话中...
        </div>
        <div v-if="isWaiting">
          <div v-if="(curContactor as any).msgType === MsgTypeConstant.JOIN_ROOM">
            等待对方接受邀请
            <text v-for="i in loadingPointIconNum" :key="i">.</text>
          </div>
          <div v-else>
            邀请你语音通话
            <text v-for="i in loadingPointIconNum" :key="i">.</text>
          </div>
        </div>
      </div>
      <audio ref="remoteAudio" style="display: none" autoplay />
      <audio ref="localCallBackgroundAudio" style="display: none"
             autoplay loop="true">
        <source :src="'../../../../../public/audio/wechat_video_phone.mp3'" type="audio/mpeg" />
      </audio>
      <audio ref="localHangupBackgroundAudio" :src="'../../../../../public/audio/wechat_phone_hangup.mp3'" style="display: none" />
      <div class="phoneButton" v-if="isCalling">
        <div class="button-item" @click="voiceCtl">
          <div v-if="isOpenVoice">
            <div class="button-item-icon">
              <voice/>
            </div>
            <div>麦克风已开</div>
          </div>
          <div v-if="!isOpenVoice">
            <div class="button-item-icon" style="background-color: rgb(35,36,34)">
              <voice-off :stroke="'#fff'" />
            </div>
            <div>麦克风已关</div>
          </div>
        </div>
        <div class="button-item" @click="closePhoneChat">
          <div class="button-item-icon" style="background-color: rgb(250,81,81)">
            <phone-off />
          </div>
          <div>取消</div>
        </div>
        <div class="button-item" @click="volumeCtl">
          <div v-if="isOpenVolume">
            <div class="button-item-icon">
              <volume-notice/>
            </div>
            <div>扬声器已开</div>
          </div>
          <div v-if="!isOpenVolume">
            <div class="button-item-icon" style="background-color: rgb(35,36,34)">
              <volume-mute :stroke="'#fff'" />
            </div>
            <div>扬声器已关</div>
          </div>
        </div>
      </div>
      <div class="phoneButton" v-if="!isCalling">
        <div class="button-item" @click="hangup">
          <div class="button-item-icon" style="background-color: rgb(250,81,81)">
            <phone-off/>
          </div>
          <div>挂断</div>
        </div>
        <div class="button-item" @click="catchCall">
          <div class="button-item-icon" style="background-color: rgb(7,193,96)">
            <phone-telephone />
          </div>
          <div>接听</div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import {Close, Minus} from "@element-plus/icons-vue";
import {onMounted, ref, watch} from "vue";
import PhoneOff from "../../../MyIcons/phone-off.vue";
import VolumeNotice from "../../../MyIcons/volume-notice.vue";
import Voice from "../../../MyIcons/voice.vue";
import {getCurContactorInfoStorage, getUserInfoStorage} from "../../../../utils/storageUtil.ts";
import {useWebRtcHandle} from "../../../../hooks/webRTCHandle.ts";
import {MsgTypeConstant} from "../../../../constant/MsgTypeConstant.ts";
import store from "../../../../store";
import VoiceOff from "../../../MyIcons/voice-off.vue";
import {useWebRtcChatTwo} from "../../../../hooks/webrtc/chatTwo.ts";
import PhoneTelephone from "../../../MyIcons/phone-telephone.vue";
import VolumeMute from "../../../MyIcons/volume-mute.vue";
import {WebSocketClass} from "../../../../utils/network/WebSocket.ts";
import {getSnowflake} from "../../../../utils/StringUtils.js";
import {ChatMsgTypeConstant} from "../../../../constant/ChatMsgTypeConstant.ts";
import {createPhoneMessage} from "../../../../utils/nodeCreatorUtil.ts"

/*软件窗口*/
// 窗口缩放前后的高度
const preWinHeight = ref(window.outerHeight);
const winHeight = ref(window.outerHeight);

//获取自定义electronAPI上下文
let electron = (window as any).electronAPI;
const isElectron = ref(store.state.basicData.isElectron);

const minimize = () => {
  if (isElectron.value) {
    electron.sendMessage('minimize-window', "最小化窗口");
  }
}
const close = () => {
  if (isCalling.value) {
    closePhoneChat();
  }else hangup();
}

window.addEventListener('resize', () => {
  preWinHeight.value = winHeight.value;
  winHeight.value = window.outerHeight;
});

/*基本信息*/
const { webRtcChatTwo } = useWebRtcChatTwo();
// 当前电话聊天的联系人
const curContactor = ref({
  contactHeadImgUrl: getUserInfoStorage().userAvatar,// 默认先显示自己的头像，等待加载出对方头像
});
// 是否正在通话
const isCalling = ref(true);
// 当前用户是否是邀请者
const isInviter = ref(false);
// 是否连接上对方
const isConnected = ref(false);

// 设备开关
const isOpenVoice = ref(true);// 默认开启了麦克风
const isOpenVolume = ref(true);// 默认开启了扬声器

const voiceCtl = () => {// 麦克风控制
  isOpenVoice.value = !isOpenVoice.value;
  if (isOpenVoice.value) {
    webRtcChatTwo.restoreAudioTrack({
      receiver: (curContactor.value as any).contact_info_id,
    });
  }else {
    webRtcChatTwo.removeAudioTrack({
      receiver: (curContactor.value as any).contact_info_id,
    })
  }
}
const volumeCtl = () => {// 扬声器控制
  isOpenVolume.value = !isOpenVolume.value;
  if (isOpenVolume.value) {
    remoteAudio.value.play();
  }else {
    remoteAudio.value.pause();
  }
}

//正在等待对方接收邀请
const isWaiting = ref(true);// 正在等待
const loadInterval = ref();// 加载interval
const loadingPointIconNum = ref(3);// 加载动画中的点的个数

const getMainProcessMessage = () => {
  if (isElectron.value) {
    electron.onReceiveMessage("fromMain", (args: any) => {
      curContactor.value = JSON.parse(args);
      console.log("通信信息：" + args);
      console.log("加入的房间号：" + (curContactor.value as any).roomId);

      (curContactor.value as any).roomId = (curContactor.value as any).roomId || getSnowflake();
      isCalling.value = (curContactor.value as any).msgType === MsgTypeConstant.JOIN_ROOM;
      isInviter.value = (curContactor.value as any).msgType === MsgTypeConstant.JOIN_ROOM;
      joinRoom();
    });
  }else {
    curContactor.value = getCurContactorInfoStorage();
    console.log("通信信息：" + JSON.stringify(curContactor.value));
    console.log("加入的房间号：" + (curContactor.value as any).roomId);

    (curContactor.value as any).roomId = (curContactor.value as any).roomId || getSnowflake();
    isCalling.value = (curContactor.value as any).msgType === MsgTypeConstant.JOIN_ROOM;
    isInviter.value = (curContactor.value as any).msgType === MsgTypeConstant.JOIN_ROOM;
    joinRoom();
  }
}

onMounted(() => {
  isElectron.value = store.state.basicData.isElectron;
  isWaiting.value = true;// 正在等待
  setCallBackgroundMusicStatus(true);// 开启拨电话背景音乐
  getMainProcessMessage();
  loadInterval.value = setInterval(() => {
    loadingPointIconNum.value = (loadingPointIconNum.value + 1) > 3 ? 1 : loadingPointIconNum.value + 1;
    if ((curContactor.value as any).contact_info_id && store.state.useNetworkStore.rtcMap.get(
        (curContactor.value as any).contact_info_id
    ) && store.state.useNetworkStore.rtcMap.get(
        (curContactor.value as any).contact_info_id
    ).isConnected) {
      isWaiting.value = false;// 完成连接
      clearInterval(loadInterval.value);
    }
  },500);
});

/*音视频配置部分*/
const { webRtcHandle } = useWebRtcHandle();
// 远程音频实例
const remoteAudio = ref();
// 本地拨电话背景音频
const localCallBackgroundAudio = ref();
// 本地挂电话背景音频
const localHangupBackgroundAudio = ref();
// 设置一个interval来计算最后的接通电话的时间
const callInterval = ref();
// 计算打电话的时间
const callTime = ref(0);

// 设置播电话背景音乐的状态，是否播放背景音乐
const setCallBackgroundMusicStatus = (status: boolean) => {
  if (status) {// 开启背景音乐
    localCallBackgroundAudio.value.play();
  }else localCallBackgroundAudio.value.pause();
}

// 加入房间
const joinRoom = () => {
  webRtcHandle.joinRoom({
    roomId: (curContactor.value as any).roomId,
    joinReason: (curContactor.value as any).msgType,
    msgType: MsgTypeConstant.CHAT_TWO_WEBRTC,
    sender: (curContactor.value as any).user_id,
    receiver: (curContactor.value as any).contact_info_id || "",
  });
}
// 接电话
const catchCall = () => {
  webRtcHandle.call({
    roomId: (curContactor.value as any).roomId,
    msgType: MsgTypeConstant.CHAT_TWO_WEBRTC,
    sender: (curContactor.value as any).user_id,
    receiver: (curContactor.value as any).contact_info_id || "",
  });
}
// 关闭电话通讯
const closePhoneChat = () => {
  if (callInterval.value) {// 清除interval
    clearInterval(callInterval.value);
  }
  localHangupBackgroundAudio.value.play();
  WebSocketClass.send(store.state.useNetworkStore.wsMap.get((curContactor.value as any).roomId), JSON.stringify({
    type: MsgTypeConstant.HANGUP,
    room: (curContactor.value as any).roomId,
    from: (curContactor.value as any).user_id,
    to: (curContactor.value as any).contact_info_id,
  }));

  let content = '已取消';
  if (isConnected.value) {// 连接上对方了
    const minutes = Math.floor(callTime.value / 60);// 分钟
    const seconds = Math.ceil(callTime.value % 60);// 剩余秒数
    content = `通话时长 ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  let curNode = createPhoneMessage({
    content: content,
  });
  store.dispatch("chatPanelData/postChatMessage", {
    from_id: getUserInfoStorage().id,
    to_id: (curContactor.value as any).contact_info_id,
    status: 0,
    type: ChatMsgTypeConstant.PHONE_MESSAGE,
    content: curNode.outerHTML,
  }).then(() => {
    if (isElectron.value) {
      electron.sendMessage('closeWin', "关闭窗口");
    }
  })
}
// 挂断电话 或 拒接加入房间
const hangup = () => {
  localHangupBackgroundAudio.value.play();
  WebSocketClass.send(store.state.useNetworkStore.wsMap.get((curContactor.value as any).roomId), JSON.stringify({
    type: MsgTypeConstant.REJECT_JOIN_ROOM,
    room: (curContactor.value as any).roomId,
    from: (curContactor.value as any).user_id,
    to: (curContactor.value as any).contact_info_id,
  }));

  let curNode = createPhoneMessage({
    content: `${isInviter.value ? '已取消' : '已拒绝'}`,
  });
  store.dispatch("chatPanelData/postChatMessage", {
    from_id: isInviter.value ? getUserInfoStorage().id : (curContactor.value as any).contact_info_id,
    to_id: isInviter.value ? (curContactor.value as any).contact_info_id : getUserInfoStorage().id,
    status: 0,
    type: ChatMsgTypeConstant.PHONE_MESSAGE,
    content: curNode.outerHTML,
  }).then(() => {
    if (isElectron.value) {
      electron.sendMessage('closeWin', "关闭窗口");
    }
  });
}
// 监听是否连接上对方
watch(() => {
      let rtc = store.state.useNetworkStore.rtcMap.get((curContactor.value as any).contact_info_id);
      if (rtc) return rtc.isConnected;
      return null;
    },
    (curConnectedStatus) => {
      console.log(curConnectedStatus ? '已经连上对方' : '当前断开连接')// 是否连接上对方
      if (curConnectedStatus) {
        isConnected.value = curConnectedStatus;
        callInterval.value = setInterval(() => {// 开始计时
          ++callTime.value;
        }, 1000);
      }
    }
)
// 监听是否收到对方的音视频流
watch(() =>
      store.state.useNetworkStore.rtcMap.get((curContactor.value as any).contact_info_id),
    () => {
      if (store.state.useNetworkStore.rtcMap.get((curContactor.value as any).contact_info_id) &&
          store.state.useNetworkStore.rtcMap.get((curContactor.value as any).contact_info_id).videoEl.srcObject
      ) {
        setCallBackgroundMusicStatus(false);// 关闭拨电话背景音乐
        isCalling.value = true;
        remoteAudio.value.srcObject = store.state.useNetworkStore.rtcMap.get((curContactor.value as any).contact_info_id).videoEl.srcObject;
      }
    }
)
</script>

<style scoped>
/*窗口菜单*/
.top-menu {
  padding: 0 0;
}

/*窗口顶部按钮*/
.tab1 {
  cursor: pointer;
  padding: 2px 8px;
  width: 5vw;
  height: 4vh;
}

.tab1:hover {
  background-color: #bbbbbb;
}

.tab2 {
  cursor: pointer;
  padding: 2px 8px;
  width: 5vw;
  height: 4vh;
}

.tab2:hover {
  background-color: rgb(251, 115, 115);
}

.avatar{
  pointer-events: none;
  user-select: none;
  text-align: center;
  margin: 10vh auto 0 auto;
  width: 100px;
  height: 100px;
}
.description{
  color: #ccc;
  user-select: none;
  margin: 1vh auto;
  text-align: center;
  font-size: 15pt;
}
.phoneButton{
  display: flex;
  flex-direction: row;
  justify-content: center;
  column-gap: 45px;
  margin-top: 40vh;
  color: #ccc;
  .button-item{
    user-select: none;
    text-align: center;
    .button-item-icon{
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: white;
      display: inline-block;
      cursor: pointer;
      padding: 3.1vh 0;
      box-sizing: border-box;
    }
    .button-item-icon:hover{
      filter: brightness(0.8);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }
  }
}
</style>
