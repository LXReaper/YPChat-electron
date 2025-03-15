<template>
  <el-scrollbar
      :height="props.curWinHeight * 0.7 + 30"
      @scroll="handleScroll"
      ref="scrollbar"
      style="background: rgb(245, 245, 245);"
  >
    <!--      <div style="display: flex">-->
    <!--        <VEmojiPicker-->
    <!--            id="emoji"-->
    <!--            ref="emojiPicker"-->
    <!--            labelSearch="Search"-->
    <!--            lang="pt-BR"-->
    <!--            :customEmojis="emojisDefault"-->
    <!--            :customCategories="categoriesDefault"-->
    <!--        />-->
    <!--      </div>-->
    <div ref="messageView" class="message-view">
      <div v-for="(item, i) in messageData" :key="i">
        <!--        消息上方显示的时间-->
        <div class="message-view-tip-item" v-if="!(item as any).isOnSameTime && (item as any).post_time">
          <span style="background-color: #ddd;color: #fff;padding: 3px">
            {{ (item as any).post_time }}
          </span>
        </div>
        <!--        文字消息-->
        <word-message
            :message="item"
            :login-user-id="loginUserId"
            v-if="(item as any).type === ChatMsgTypeConstant.WORD_MESSAGE"
        />
        <!--        图片消息-->
        <image-message
            :message="item"
            :login-user-id="loginUserId"
            v-if="(item as any).type === ChatMsgTypeConstant.IMAGE_MESSAGE"
        />
        <!--        视频消息-->
        <video-message
            :message="item"
            :login-user-id="loginUserId"
            v-if="(item as any).type === ChatMsgTypeConstant.VIDEO_MESSAGE"
        />
        <!--        文件消息-->
        <file-message
            :message="item"
            :login-user-id="loginUserId"
            v-if="(item as any).type === ChatMsgTypeConstant.FILE_MESSAGE"
        />
        <!--        语音消息-->
        <recording-message
            :message="item"
            :login-user-id="loginUserId"
            v-if="(item as any).type === ChatMsgTypeConstant.VOICE_MESSAGE"
        />
        <!--        音频通话消息-->
        <phone-message
            :message="item"
            :login-user-id="loginUserId"
            v-if="(item as any).type === ChatMsgTypeConstant.PHONE_MESSAGE"
        />
        <!--        视频通话消息-->
        <phone-video-message
            :message="item"
            :login-user-id="loginUserId"
            v-if="(item as any).type === ChatMsgTypeConstant.VIDEO_PHONE_MESSAGE"
        />

      </div>
      <div
          class="message-view-tip-item"
          style="color: #535bf2;height: 30px"
          v-if="messageTotal > messagePageSize"
          @click="showMoreMessage"
      >
        <round-spin-animation :dot-background-color="'#1e1e1e'" v-if="isLoadingMessage"/>
        <span v-else>查看更多消息</span>
      </div>
      <div class="message-view-tip-item" v-else>
        <span style="background-color: #ddd;color: #fff;padding: 3px">
          没有更多消息
        </span>
      </div>
    </div>
    <!--    消息底部按钮列表-->
    <div class="message-bottom-items">
      <div class="flex-items">
        <div class="message-bottom-item" v-if="showScrollToBottom" @click="scrollToBottom">
          <el-icon>
            <Bottom style="color: #06F"/>
          </el-icon>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
// 监听聊天内容面板的高度变化
import store from "../../../../store";
import {computed, defineProps, onBeforeUnmount, onMounted, ref, watch, withDefaults} from "vue";
import moment from "moment"
import {getUserInfoStorage} from "../../../../utils/storageUtil.ts";
import {debounce} from "../../../../utils/debounceThrottle.ts";
import {ChatMsgTypeConstant} from "../../../../constant/ChatMsgTypeConstant.ts"
import WordMessage from "./wordMessage.vue";
import ImageMessage from "./ImageMessage.vue";
import RecordingMessage from "./recordingMessage.vue";
import {Bottom} from "@element-plus/icons-vue";
import RoundSpinAnimation from "../../../Loading/round-spin-animation.vue";
import VideoMessage from "./videoMessage.vue";
import FileMessage from "./fileMessage.vue";
import PhoneMessage from "./phoneMessage.vue";
import PhoneVideoMessage from "./phoneVideoMessage.vue";

interface Props {
  curWinHeight: number;// 当前窗口高度
  outputMessage: boolean;// 聊天框输出消息信号
}

const props = withDefaults(defineProps<Props>(), {
  curWinHeight: 0,
  outputMessage: false,
})

// 获取聊天消息栏中的元素属性
const scrollbar = ref();// 滚动面板
const messageView = ref();// 消息面

// 当前登录的用户id
const loginUserId = ref(getUserInfoStorage().id);

// 是否观察滚轮
const isObserveScroller = ref(true);

// 监视输出消息信号是否有变化
watch(() => [props.outputMessage, store.state.basicData.selectContactorIndex],
    () => {
      isObserveScroller.value = true;// 可以观察滚轮
    }
)
const resizeObserver = new ResizeObserver(entries => {
  if (isObserveScroller.value) {// 是否可以观察滚轮
    for (let entry of entries) {
      let curMessageViewHeight = entry.contentRect.height;
      // 当前聊天内容面板的高度已经超出，则要将滚轮往下滑动
      if (curMessageViewHeight > props.curWinHeight * 0.7 + 30) {
        // 滚动到底部，即滚动到最新消息的位置
        scrollbar.value.scrollTo({
          top: curMessageViewHeight, // 距离顶部多少像素
          behavior: 'smooth' // 平滑滚动
        })
      }
    }
    isObserveScroller.value = false;// 观察完设置不能观察
  }
});
// 处理滚轮事件
const handleScroll = () => {
  const scrollTop = scrollbar.value.wrapRef.scrollTop;// 离顶部的距离
  const clientHeight = scrollbar.value.wrapRef.clientHeight;// 当前滚轮条的高度
  scrollBottom.value = messageView.value.offsetHeight - (scrollTop + clientHeight);// 重新计算滚轮离底部的距离

  // 判断有无滑到底部
  if (scrollTop && scrollTop + clientHeight < messageView.value.offsetHeight)
    showScrollToBottom.value = true;// 显示滑到底部的按钮
  else if (scrollTop && scrollTop + clientHeight >= messageView.value.offsetHeight)
    showScrollToBottom.value = false;// 隐藏滑到底部的按钮

  // 判断有无滑到顶部
  if (scrollTop === 0 && messageTotal.value > messagePageSize.value) {
    isLoadingMessage.value = true;// 开始刷新旧消息
    showMoreMessage();// 滑到顶部就刷新
  }
}
onMounted(() => {
  isObserveScroller.value = true;
  loginUserId.value = getUserInfoStorage().id;// 获取当前登录用户id
  searchMessageDataDebounce();
  if (messageView.value) {
    resizeObserver.observe(messageView.value); // 开始观察
  }
});

onBeforeUnmount(() => {
  resizeObserver.disconnect(); // 组件卸载时停止观察
});

// 查询数据
const messageData = computed(() => {
  const messages = store.state.chatPanelData.curChatMessage; // 获取当前聊天消息数组
  if (Array.isArray(messages)) { // 确保它是数组
    return messages.map(item => {
      if (moment((item as any).post_time).isSame(moment(), 'minute')) //同一分钟
        return {...item, post_time: ''};

      // 修改时间格式
      let formattedTime = '';
      let cur_time_moment = moment();
      let post_time_moment = moment((item as any).post_time);// 获取post_time的moment对象
      if (post_time_moment.isSame(cur_time_moment, 'hour')) {// 同一个小时
        formattedTime = cur_time_moment.diff(post_time_moment, 'minutes') + "分钟前";
      } else {// 不是同一个小时
        let timePeriod = '';// 时间段分类
        if (post_time_moment.isBetween(post_time_moment.clone().startOf('day'), post_time_moment.clone().startOf('day').add(6, 'hours'))) {
          timePeriod = '凌晨';
        } else if (post_time_moment.isBetween(post_time_moment.clone().startOf('day').add(6, 'hours'), post_time_moment.clone().startOf('day').add(12, 'hours'))) {
          timePeriod = '早上';
        } else if (post_time_moment.isBetween(post_time_moment.clone().startOf('day').add(12, 'hours'), post_time_moment.clone().startOf('day').add(13, 'hours'))) {
          timePeriod = '中午';
        } else if (post_time_moment.isBetween(post_time_moment.clone().startOf('day').add(13, 'hours'), post_time_moment.clone().startOf('day').add(18, 'hours'))) {
          timePeriod = '下午';
        } else if (post_time_moment.isBetween(post_time_moment.clone().startOf('day').add(18, 'hours'), post_time_moment.clone().startOf('day').add(20, 'hours'))) {
          timePeriod = '傍晚';
        } else {
          timePeriod = '晚上';
        }

        formattedTime = moment((item as any).post_time)
            .format(`
          ${
                    moment((item as any).post_time).isSame(moment(), 'day')
                        ? 'HH:mm'
                        : (
                            moment((item as any).post_time).isSame(moment(), 'year')
                                ? 'MM月DD日 HH:mm'
                                : 'YYYY年MM月DD日 HH:mm'
                        )
                }`
            );

        let index = formattedTime.indexOf(':');
        formattedTime = formattedTime.slice(0, index - 2) + timePeriod + formattedTime.slice(index - 2);
      }
      return {...item, post_time: formattedTime}; // 返回包含格式化时间的对象
    });
  } else {
    return [];// 不是数组则置空
  }
});
const messageTotal = computed(() => store.getters["basicData/getMessageTotal"]);// 消息总数
const messagePageSize = computed(() => store.getters["basicData/getChatMessageSearchPageSize"]);// 消息每页总数
const searchMessageData = () => {
  store.dispatch("chatPanelData/searchCurChatMessage", {
    user_id: loginUserId.value,
    friend_id: store.state.chatPanelData.userInfo.contact_info_id,
  }).then(() => {
    if (isLoadingMessage.value) {// 上滑到顶部刷新旧消息，并获取到消息后才会触发
      setTimeout(() => {
        isLoadingMessage.value = false;
        scrollbar.value.scrollTo({
          top: messageView.value.offsetHeight - scrollBottom.value + scrollbar.value.wrapRef.clientHeight, // 距离顶部多少像素
          behavior: 'instant' // 直接滚动
        });
      }, 100);
    }
  });
}
const searchMessageDataDebounce = debounce(searchMessageData, 500);

/*加载历史消息*/
const isLoadingMessage = ref(false);// 是否正在刷新消息
const scrollBottom = ref(0);// 滚轮离窗口底部的距离
// 点击显示更多消息
const showMoreMessage = () => {
  // todo 后续改用sqlite数据库时需要修改
  store.dispatch("basicData/addChatMessageSearchPageSize", 50).then(() => {
    searchMessageData();
  });
}

/*消息底部固定的按钮*/
// 是否显示滑动底部的按钮
const showScrollToBottom = ref(false);
const scrollToBottom = () => {
  // console.log(messageView);
  // console.log(messageView.value);
  scrollbar.value.scrollTo({
    top: messageView.value.offsetHeight, // 距离顶部多少像素
    behavior: 'smooth' // 平滑滚动
  })
}
</script>

<style scoped>
.el-scrollbar {
  -webkit-app-region: no-drag;
}

.message-view {
  cursor: default;
  display: flex;
  flex-direction: column-reverse; /*块的显示顺序上下反转*/
  height: 40%;
  overflow-y: hidden;
  overflow-x: hidden;
  padding: 0 16px 16px;
  box-sizing: border-box;

  /*聊天面板最顶部内容*/

  .message-view-tip-item {
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;

    width: 50%;
    margin: 5px auto;
    text-align: center;
    font-size: 10pt;
  }
}

/*消息列表中固定位于底部的按钮列表*/
.message-bottom-items {
  z-index: 12;
  width: 35px;
  bottom: 5px;
  display: flex;
  position: absolute;
  left: 50%;
  justify-content: center;
  align-items: center;

  .flex-items {
    display: flex;
    gap: 10px;

    .message-bottom-item {
      cursor: pointer;
      margin: 0 auto;
      display: flex;
      background: #fff;
      width: 35px;
      height: 35px;
      border-radius: 20px;
      padding: 10px 10px;
      box-sizing: border-box;
    }
  }
}
</style>
