<template>
  <!--  音视频流控制面板-->
  <div
      id="video-audio-ctl"
      :style="{
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: props.buttonBackground,
      }"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
      @click="showStreamController"
  >
    <transition name="ctl-panel">
      <div
          class="ctl-panel"
          :style="{
            top: `${ctlPosition.top}px`,
            left: `${ctlPosition.left}px`,
            width: `${ctlSize.width}px`,
            height: `${ctlSize.height}px`,
            background: props.panelBackground,
          }"
          v-if="isShowStreamController"
          @click.stop
          @mousedown.stop
      >
        <div class="ctl-row">
          <div class="ctl-item-label">最大码率：</div>
          <el-radio-group v-model="currentMaxBitrate">
            <el-radio
              v-for="(item, i) in maxBitrate"
              :key="i"
              :value="item.value"
            >
              {{item.label}}
            </el-radio>
          </el-radio-group>
        </div>
        <div class="ctl-row">
          <div class="ctl-item-label">最大帧数：</div>
          <el-radio-group v-model="currentMaxFramerate">
            <el-radio
                v-for="(item, i) in maxFramerate"
                :key="i"
                :value="item.value"
            >
              {{item.label}}
            </el-radio>
          </el-radio-group>
        </div>
        <div class="ctl-row">
          <div class="ctl-item-label">视频分辨率：</div>
          <el-radio-group v-model="currentResolutionRatio">
            <el-radio
                v-for="(item, i) in resolutionRatio"
                :key="i"
                :value="item.value"
            >
              {{item.label}}
            </el-radio>
          </el-radio-group>
        </div>
        <div class="ctl-row">
          <div class="ctl-item-label">视频内容：</div>
          <el-radio-group v-model="currentVideoContentHint">
            <el-radio
                v-for="(item, i) in videoContentHint"
                :key="i"
                :value="item.value"
            >
              {{item.label}}
            </el-radio>
          </el-radio-group>
        </div>
        <div class="ctl-row">
          <div class="ctl-item-label">音频内容：</div>
          <el-radio-group v-model="currentAudioContentHint">
            <el-radio
                v-for="(item, i) in audioContentHint"
                :key="i"
                :value="item.value"
            >
              {{item.label}}
            </el-radio>
          </el-radio-group>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
import {ref, withDefaults, defineProps, watch} from "vue";
import {useRTCParams} from "../../../hooks/webrtc/rtcParams.ts";
import store from "../../../store";
import {MsgTypeConstant} from "../../../constant/MsgTypeConstant.ts";
import {
  WsChangeAudioContentHintType, WsChangeBasicSettingsType,
  WsChangeMaxBitrateType,
  WsChangeMaxFramerateType,
  WsChangeResolutionRatioType, WsChangeVideoContentHintType
} from "../../../common/websocket.ts";

interface Props{
  x: number;
  y: number;
  buttonBackground: string;
  panelBackground: string;
  offerUserId: string;// 传输音视频流的用户id
  curUserId: string;// 当前用户
  isConnected: boolean;// 是否完成连接

  basicSettings: WsChangeBasicSettingsType;// 设置基本配置信息
}

const props = withDefaults(defineProps<Props>(), {
  x: 50,
  y: 50,
  buttonBackground: '#42b983',
  panelBackground: 'rgba(172, 172, 172, 0.5)',
  offerUserId: "-1",
  curUserId: "-2",
  isConnected: false,

  basicSettings: {}
})

/*控制台显示按钮*/
const isShowStreamController = ref(false);// 是否显示音视频流控制台
const isDragging = ref(false);// 是否正在拖拽
const position = ref({
  x: props.x,
  y: props.y,
});
/*控制台*/
const defaultOption = ref({
  width: 700,
  height: 320,
  top: 50,
  left: 10,
});// 默认参数
const ctlSize = ref({
  width: defaultOption.value.width,
  height: defaultOption.value.height,
})
const ctlPosition = ref({
  top: defaultOption.value.top,
  left: defaultOption.value.left,
});

/*控制台配置信息*/
const {
  maxBitrate,
  maxFramerate,
  resolutionRatio,
  videoContentHint,
  audioContentHint
} = useRTCParams();
const currentMaxBitrate = ref(props.basicSettings.maxBitrate);
const currentMaxFramerate = ref(props.basicSettings.maxFramerate);
const currentResolutionRatio = ref(props.basicSettings.resolutionRatio);
const currentVideoContentHint = ref(props.basicSettings.videoContentHint);
const currentAudioContentHint = ref(props.basicSettings.audioContentHint);

// 开始拖拽
const startDrag = () => {
  isDragging.value = true;
}
const onDrag = (event: any) => {
  let mousePos = {
    x: event.clientX,
    y: event.clientY,
    offsetX: 55,// 偏移量X
    offsetY: 55,// 偏移量Y
  };
  let newX = mousePos.x - 15;
  let newY = mousePos.y - 15;

  if (newX + mousePos.offsetX >= window.outerWidth ||
      newX <= 0 ||
      newY <= 0 ||
      newY + mousePos.offsetY >= window.outerHeight)
    return ;
  if (isDragging.value) {
    // 更新按钮位置
    position.value.x = newX;
    position.value.y = newY;
    // 更新控制面板位置
    ctlPosition.value.left = ctlSize.value.width + mousePos.x + mousePos.offsetX >= window.outerWidth ?
        3.6 * defaultOption.value.left - ctlSize.value.width : defaultOption.value.left;
    ctlPosition.value.top = ctlSize.value.height + mousePos.y + mousePos.offsetY >= window.outerHeight ?
        -ctlSize.value.height : defaultOption.value.top;
  }
}
const stopDrag = () => {
  isDragging.value = false;
};

// 显示音视频流的控制台
const showStreamController = (event: any) => {
  isShowStreamController.value = !isShowStreamController.value;
  let mousePos = {
    x: event.clientX,
    y: event.clientY,
    offsetX: 0,// 偏移量X
    offsetY: 50,// 偏移量Y
  };
  ctlPosition.value.left = ctlSize.value.width + mousePos.x + mousePos.offsetX >= window.outerWidth ?
      3.6 * defaultOption.value.left - ctlSize.value.width : defaultOption.value.left;
  ctlPosition.value.top = ctlSize.value.height + mousePos.y + mousePos.offsetY >= window.outerHeight ?
      -ctlSize.value.height : defaultOption.value.top;
}

/*监听控制台参数修改事件*/
// 当前最大码率
watch(() => currentMaxBitrate.value,
    (curMaxBitrate) => {
      let rtc = store.state.useNetworkStore.rtcMap.get(props.offerUserId);
      if (!rtc) return;
      rtc.sendDataChannel<WsChangeMaxBitrateType['message']>({
        msgType: MsgTypeConstant.changeMaxBitrate,
        message: {
          roomId: rtc.roomId,
          val: curMaxBitrate as number,
        }
      });
    }
);
// 当前最大帧率
watch(() => currentMaxFramerate.value,
    (curMaxFramerate) => {
      let rtc = store.state.useNetworkStore.rtcMap.get(props.offerUserId);
      if (!rtc) return;
      rtc.sendDataChannel<WsChangeMaxFramerateType['message']>({
        msgType: MsgTypeConstant.changeMaxFramerate,
        message: {
          roomId: rtc.roomId,
          val: curMaxFramerate as number,
        }
      });
    }
);
// 当前最大分辨率
watch(() => currentResolutionRatio.value,
    (curResolutionRatio) => {
      let rtc = store.state.useNetworkStore.rtcMap.get(props.offerUserId);
      if (!rtc) return;
      rtc.sendDataChannel<WsChangeResolutionRatioType['message']>({
        msgType: MsgTypeConstant.changeResolutionRatio,
        message: {
          roomId: rtc.roomId,
          val: curResolutionRatio as number,
        }
      });
    }
);
// 当前视频内容
watch(() => currentVideoContentHint.value,
    (curVideoContentHint) => {
      let rtc = store.state.useNetworkStore.rtcMap.get(props.offerUserId);
      if (!rtc) return;
      rtc.sendDataChannel<WsChangeVideoContentHintType['message']>({
        msgType: MsgTypeConstant.changeVideoContentHint,
        message: {
          roomId: rtc.roomId,
          val: curVideoContentHint as string,
        }
      });
    }
);
// 当前音频内容
watch(() => currentAudioContentHint.value,
    (curAudioContentHint) => {
      let rtc = store.state.useNetworkStore.rtcMap.get(props.offerUserId);
      if (!rtc) return;
      rtc.sendDataChannel<WsChangeAudioContentHintType['message']>({
        msgType: MsgTypeConstant.changeAudioContentHint,
        message: {
          roomId: rtc.roomId,
          val: curAudioContentHint as string,
        }
      });
    }
);

</script>
<style scoped>
#video-audio-ctl {
  width: 50px;
  height: 50px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 25px;
  position: absolute;
  z-index: 3030;
  -webkit-app-region: no-drag;
}
.ctl-panel-enter-active, .ctl-panel-leave-active {
  transition: opacity 0.25s;
}
.ctl-panel-enter, .ctl-panel-leave-to {
  opacity: 0;
}
.ctl-panel {
  box-sizing: border-box;
  border-radius: 25px;
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: 50%;
  gap: 10%;
  cursor: default;
  user-select: none;
  .ctl-row {
    display: flex;
    flex-direction: row;
    .ctl-item-label {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .ctl-row ::v-deep .el-radio__label{
    color: white;
  }
}
</style>
