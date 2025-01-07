<template>
  <el-container :style="{
        height: winHeight,
        minHeight: winHeight
      }">
    <el-header class="top-menu">
      <div style="text-align: right;color: #1e1e1e">
        <text style="margin-right: 25%;user-select: none">加入会议</text>
        <!--            最小化-->
        <el-icon class="tab1" @click="minimize">
          <Minus/>
        </el-icon>
        <!--            关闭-->
        <el-icon class="tab2" @click="close">
          <Close/>
        </el-icon>
      </div>
    </el-header>
    <el-main :style="{
          height: (winHeight - (93 + 32)) + 'px',
          padding: '0 30px',
        }">
      <el-form>
        <el-form-item class="yp-form-item">
          <template #label>
            <h3 class="input-label">会议号</h3>
          </template>
          <el-input v-model="joinParam.roomId">
            <template #suffix>
              <el-icon style="cursor: default;color: #1e1e1e">
                <ArrowDown/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="yp-form-item">
          <template #label>
            <h3 class="input-label">您的名称</h3>
          </template>
          <el-input></el-input>
        </el-form-item>
        <el-form-item class="yp-form-item">
          <template #label>
            <h3 class="input-label">会议设置</h3>
          </template>
          <el-checkbox-group style="display: flex;flex-direction: column">
            <el-checkbox>自动连接音频</el-checkbox>
            <el-checkbox>入会开启摄像头</el-checkbox>
            <el-checkbox>入会开启麦克风</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <el-button
          type="primary"
          size="large"
          :disabled="false"
          style="margin-top: 20vh;width: 100%"
          @click="joinRoom"
      >
        加入会议
      </el-button>
    </el-main>
  </el-container>
</template>
<script setup lang="ts">
import {ArrowDown, Close, Minus} from "@element-plus/icons-vue";
import {ref} from "vue";
import store from "../../store";
import router from "../../router";

// 窗口缩放前后的高度
const preWinHeight = ref(window.outerHeight);
const winHeight = ref(window.outerHeight);

//获取自定义electronAPI上下文
let electron = (window as any).electronAPI;
const minimize = () => {
  electron.sendMessage('minimize-window', "最小化窗口");
}
const close = () => {
  electron.sendMessage('closeWin', "关闭窗口");
}

window.addEventListener('resize', () => {
  preWinHeight.value = winHeight.value;
  winHeight.value = window.outerHeight;
});

// 输入框内容
const joinParam = ref({
  roomId: "",
})

// 加入一个聊天室
const joinRoom = () => {
  store.dispatch("websocketMessageData/setRTCJoinInfo", joinParam.value).then(() => {
    if (!electron) router.push({
      path: "/view/video/Conference",
    });// 网页端使用
    electron.sendMessage('openChildWindow', {
      winName: "conference_view",
      path: "/view/video/Conference",
      resizable: true,
      x: 300,
      y: 150,
      width: 1300,
      height: 840,
    });
    close();// 关闭当前窗口
  })
}
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


/*主界面*/
.yp-form-item{
  /*表单样式修改*/
  display: block;
}
.input-label{
  /*输入框的标签*/
  user-select: none;
}
</style>
