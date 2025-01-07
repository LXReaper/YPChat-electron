<template>
  <!--  当前视频会议-->
  <div id="conferenceView">
    <el-container :style="{
        height: winHeight,
        minHeight: winHeight
      }">
      <el-header class="top-menu">
        <div style="text-align: right;color: #1e1e1e">
          <text style="margin-right: 40%;user-select: none">YP会议</text>
          <!--            最小化-->
          <el-icon class="tab1" @click="minimize">
            <Minus/>
          </el-icon>
          <!--            最大化-->
          <el-icon class="tab1" @click="maximize">
            <FullScreen/>
          </el-icon>
          <!--            关闭-->
          <el-icon class="tab2" @click="close">
            <Close/>
          </el-icon>
        </div>
      </el-header>
      <div class="second-menu">
        <div>
          <el-button type="text" dark="dark">
            <template #icon>
              <el-icon size="20">
                <WarningFilled/>
              </el-icon>
            </template>
            会议详情
          </el-button>
        </div>
        <div></div>
      </div>
      <el-main :style="{
          height: (winHeight - (93 + 32)) + 'px',
          padding: 0,
          display: 'flex',
        }">
        <video
            :style="{width: '50%',height: '99%'}"
            ref="localVideo"
            autoplay="true"
        />
        <div
            :style="{width: '50%'}"
            ref="remoteVideos"
        ></div>
      </el-main>
      <el-footer style="display: flex;gap: 1%">
        <el-icon size="35" class="tab1" @click="localVideoSwitch">
          <monitor-off v-if="!isOpenLocalVideo" />
          <VideoCamera v-else style="color: #1e1e1e;"/>
        </el-icon>
        <el-button type="danger" plain>
          结束会议
        </el-button>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import {Close, FullScreen, Minus, VideoCamera, WarningFilled} from "@element-plus/icons-vue";
import {onMounted, ref} from "vue";
import MonitorOff from "../MyIcons/monitor-off.vue";
import {initPeerConnect, setLocalStream} from "../../utils/network/WebRTCHandleUtil.js"
import {getLocalStream} from "../../utils/localStreamUtil.ts"
import store from "../../store";

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
  localVideoSwitch();
  electron.sendMessage('closeWin', "关闭窗口");
}

window.addEventListener('resize', () => {
  preWinHeight.value = winHeight.value;
  winHeight.value = window.outerHeight;
});


/*视频聊天*/
// 是否加入了房间
const isJoinRoom = ref(false);
// 加入信息
const joinInfo = ref({
  localRoom: "",// 加入的房间号
})
// 本地视频
const localVideo = ref<HTMLVideoElement>();// 视频对象
const localStream = ref();// 本地音视频流
const isOpenLocalVideo = ref(false);//本地视频是否已经开启
// 远程视频列表div
const remoteVideos = ref();
// 1、处理本地视频流
const localVideoSwitch = async () => {
  // 控制调用本地视频开和关
  console.log(isOpenLocalVideo.value);
  if (!isOpenLocalVideo.value || localVideo.value!.paused){
    // 视频实例为空、实例的srcObject参数为空 或者 视频暂停都会重新获取视频流并重新播放视频
    localStream.value = await getLocalStream({video: true, audio: true}).then((stream: any) => {
      isOpenLocalVideo.value = true;
      let oldStream = localVideo.value!.srcObject as any;
      if (oldStream) {
        oldStream.getTracks().forEach((track: any) => {
          oldStream.removeTrack(track);
        })
      }
      localVideo.value!.srcObject = stream;
      setLocalStream(stream);// 设置本地的音视频流

      if (!isJoinRoom.value) {
        isJoinRoom.value = true;
        initPeerConnect({
          roomId: joinInfo.value.localRoom,
        }, stream);// 初始化peerConnect
      }
    });
  }else {
    // 正在播放的视频先暂停，再停止媒体流中的所有媒体轨道，最后设置视频实例中的数据源为null
    localVideo.value?.pause();
    (localVideo.value!.srcObject as any).getTracks().forEach((track: any) => {
      track.stop(); // 停止每个轨道
    });
    localVideo.value!.srcObject = null;

    isOpenLocalVideo.value = false;//本地视频已经关闭
  }
}

onMounted(() => {
  isJoinRoom.value = false;
  joinInfo.value = store.state.websocketMessageData.RTCData;
  localVideoSwitch();// 一进去就调用本地的音视频流
})
</script>

<style scoped>
#conferenceView {
}

/*窗口菜单*/
.top-menu {
  padding: 0 0;
  border-bottom: rgb(237, 237, 237) solid 1px
}

/*窗口顶部按钮*/
.tab1 {
  cursor: pointer;
  padding: 2px 3px;
  width: 2.5vw;
  height: 4vh;
}

.tab1:hover {
  background-color: #bbbbbb;
}

.tab2 {
  cursor: pointer;
  padding: 2px 2px;
  width: 2.5vw;
  height: 4vh;
}

.tab2:hover {
  background-color: rgb(251, 115, 115);
}

/*窗口第二层菜单*/
.second-menu {
  border-bottom: #eee solid 1px;
  padding: 0 1%;
  display: flex;
  gap: 20%;
}
</style>
