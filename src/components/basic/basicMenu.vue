<template>
  <div id="basicMenu">
    <el-menu
        :default-active="activeIndex"
        :background-color="'#e0e0df'"
        :text-color="'#868686A6'"
        :style="{height: props.height + 'px'}"
        :collapse="true"
        :router="true"
    >
      <div style="text-align: center">
        <div class="user-avatar-image" @click="showDetailInfo">
          <el-image
              class="avatar-item"
              :src="loginUser.userAvatar"
          />
        </div>
        <div
            class="user-info-card"
            :style="{left: 64 + 'px',top: 45 + 'px'}"
            v-if="isShowDetailInfo"
        >
          <div class="user-title-info">
            <el-image class="user-avatar" :src="(loginUser as any).userAvatar"></el-image>
            <div class="user-title-content">
              <div style="font-size: 18pt;font-weight: bolder" class="user-name">{{ (loginUser as any).userName }}</div>
              <div class="user-id">{{ (loginUser as any).id }}</div>
            </div>
          </div>
          <div class="user-level">
            <text class="user-info-label">等级</text>
            <text></text>
          </div>
          <div class="user-info">
            <text class="user-info-label">邮箱</text>
            <div class="user-info-value">{{(loginUser as any).address || "无"}}</div>
          </div>
          <div class="user-info">
            <text class="user-info-label">简介</text>
            <div class="user-info-value">{{(loginUser as any).userProfile || "无"}}</div>
          </div>
          <div class="user-info-opt">
            <el-button class="editor-user-info" plain
                       @click="showEditorUserInfo">编辑资料</el-button>
            <el-button type="primary" plain>发消息</el-button>
          </div>
        </div>
      </div>
      <el-menu-item title="聊天" index="/chat">
        <el-icon>
          <ChatRound/>
        </el-icon>
      </el-menu-item>
      <el-menu-item title="通讯录" index="/communication">
        <el-icon>
          <Notebook/>
        </el-icon>
      </el-menu-item>
      <el-menu-item title="视频会议" index="/conference/video">
        <el-icon>
          <VideoCamera/>
        </el-icon>
      </el-menu-item>
      <el-menu-item title="设置" index="/settings" class="bottom-item">
        <el-icon>
          <Tools/>
        </el-icon>
      </el-menu-item>
    </el-menu>

    <!--    编辑资料-->
    <el-dialog
        v-model="isShowEditorUserInfo"
        style="
          height: 75vh;
          backdrop-filter: blur(5px);
          background: rgba(255,255,255,0);
          border-radius: 5%;
          padding: 2% 3.5%;
        "
        :show-close="false"
        destroy-on-close
        center
    >
      <template #title>
        <span class="dialog-text">编辑资料</span>
      </template>
      <div class="dialog-content">
        <div class="dialog-content-row">
          <div class="dialog-content-avatar">
            <el-image class="user-avatar" :src="curUserInfo.userAvatar"></el-image>
          </div>
        </div>
        <div class="dialog-content-row">
          <el-input
              v-model="curUserInfo.userName"
              :maxlength="36"
              placeholder="我的昵称"
              size="large"
              show-word-limit
          >
            <template #prefix>
              <span class="dialog-content-input-prefix">昵称</span>
            </template>
          </el-input>
        </div>
        <div class="dialog-content-row">
          <el-input
              v-model="curUserInfo.userProfile"
              placeholder="编辑个签，展示我的独特态度"
              :maxlength="80"
              size="large"
              show-word-limit
          >
            <template #prefix>
              <span class="dialog-content-input-prefix">个签</span>
            </template>
          </el-input>
        </div>
        <div class="dialog-content-row">
          <el-input @change="addressChange" placeholder="请输入邮箱"
                    maxlength="20" size="large" v-model="curUserInfo.address">
            <template #prefix>
              <span class="dialog-content-input-prefix">邮箱</span>
            </template>
          </el-input>
        </div>
        <div class="dialog-content-row" v-if="isShowAddressVerifyCode">
          <el-input size="large" maxlength="6"
                    placeholder="请输入邮箱验证码"
                    v-model="curUserInfo.addressVerifyCode">
            <template #prefix>
              <span class="dialog-content-input-prefix">验证码</span>
            </template>
            <template #suffix>
              <text class="dialog-content-input-prefix" style="cursor: pointer" v-if="isTimeOut"
                >{{ cnt }}后重新获取验证码
              </text>
              <el-button class="dialog-content-input-prefix" v-if="!isTimeOut" @click="getVerifyCode">
                获取验证码
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
        <template #footer>
          <div style="display: flex;gap: 10px;justify-content: right">
            <button class="enter-btn" @click="saveUserInfo">保存</button>
            <button class="cancel-btn" @click="isShowEditorUserInfo = false">取消</button>
          </div>
        </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ChatRound, Notebook, Tools, VideoCamera} from "@element-plus/icons-vue";
import {withDefaults, defineProps, computed, ref, onMounted, onBeforeUnmount} from 'vue';
import {getUserInfoStorage} from "../../utils/storageUtil.js";
import store from "../../store";
import {ElMessage, ElNotification} from "element-plus";
import {MailService} from "../../api/Services/mailService.ts";

interface Props {
  height: number;// 当前窗口高度
}

const props = withDefaults(defineProps<Props>(), {
  height: 0,
})

const loginUser = ref(getUserInfoStorage());// 登录用户信息
const activeIndex = computed(() => store.state.basicData.activeIndex);

const isShowDetailInfo = ref(false);// 是否显示当前用户详情信息

// 点击除了用户详情信息卡片之外其他地方
const handleClickOutside = (event: any) => {
  if (event.target.innerText === "编辑资料") {
    isShowDetailInfo.value = false;
    return ;
  }
  if (event.target.classList.contains("user-info-card") ||
      event.target.closest('.user-info-card')) {
    isShowDetailInfo.value = true;
  } else if (!event.target.classList.contains("user-avatar-image"))
    isShowDetailInfo.value = false;
};
onMounted(() => {
  window.addEventListener('click', handleClickOutside);
})
onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});

// 显示当前登录用户详情信息
const showDetailInfo = () => {
  isShowDetailInfo.value = !isShowDetailInfo.value;
}

/*编辑用户资料*/
const isShowEditorUserInfo = ref(false);
const isShowAddressVerifyCode = ref(false);// 显示邮箱验证码
const isTimeOut = ref(false); //验证码是否倒计时
const cnt = ref(60); //邮箱获取验证码倒计时
const curUserInfo = ref({
  id: "",
  userAvatar: "",
  userName: "",
  userProfile: "",
  address: "",
  addressVerifyCode: "",// 邮箱验证码
});
const showEditorUserInfo = () => {
  curUserInfo.value = {
    id: loginUser.value.id,
    userAvatar: loginUser.value.userAvatar,
    userName: loginUser.value.userName,
    userProfile: loginUser.value.userProfile,
    address: loginUser.value.address,
    addressVerifyCode: "",
  };
  isShowAddressVerifyCode.value = false;// 初始默认不修改邮箱号码
  isShowEditorUserInfo.value = true;
}
const addressChange = () => {// 邮箱参数变化
  if (curUserInfo.value.address === loginUser.value.address) {
    isShowAddressVerifyCode.value = false;
    return ;
  }
  isShowAddressVerifyCode.value = true;
}
const getVerifyCode = () => {// 获取验证码
  MailService.sendMailCodeUsingGet(
      curUserInfo.value.address,
  ).then((res: any) => {
    if (res.code === 0) {
      ElNotification.success("邮箱验证码已发送，请注意查收");
      isTimeOut.value = true;
      cnt.value = 60;
      const timeout = setInterval(() => {
        --cnt.value;
        if (cnt.value === 0) {
          isTimeOut.value = false;
          cnt.value = 60; //重置
          clearInterval(timeout); // 倒计时结束时清除定时器
        }
      }, 1000);
    } else {
      ElNotification.error("邮箱验证码发送失败");
      console.error("邮箱验证码发送失败，" + res.message);
    }
  }).catch((error) => {
    ElNotification.error("邮箱验证码发送失败");
    console.error("邮箱验证码发送失败，" + error);
  });
};
const saveUserInfo = () => {// 修改用户信息
  if (curUserInfo.value.address !== loginUser.value.address &&
      !curUserInfo.value.addressVerifyCode) {
    ElMessage.warning("邮箱验证码不能为空");
    return ;
  }
  if (curUserInfo.value.address !== loginUser.value.address &&
      curUserInfo.value.addressVerifyCode) {// 存在要修改邮箱
    MailService.bindMailUsingPost({
      mail: curUserInfo.value.address,
      mailVerifyCode: curUserInfo.value.addressVerifyCode,
      user_id: curUserInfo.value.id as any,
    }).then((res: any) => {
      if (res.code === 0) {
        console.log("邮箱绑定成功");
        //设置展示的邮箱信息
        store.dispatch("user/updateMyUserInfo", {
          userName: curUserInfo.value.userName,
          userAvatar: curUserInfo.value.userAvatar,
          address: curUserInfo.value.address,
          userProfile: curUserInfo.value.userProfile,
        }).then(() => {
          isShowEditorUserInfo.value = false;
          loginUser.value = {
            ...loginUser.value,
            ...curUserInfo.value
          };
        });
      } else {
        ElNotification.error("用户信息修改失败，" + res.message);
        console.error("邮箱绑定失败，" + res.message);
      }
    }).catch(() => {
      console.error("邮箱绑定失败");
    });
  }else {
    store.dispatch("user/updateMyUserInfo", {
      userName: curUserInfo.value.userName,
      userAvatar: curUserInfo.value.userAvatar,
      address: curUserInfo.value.address,
      userProfile: curUserInfo.value.userProfile,
    }).then(() => {
      isShowEditorUserInfo.value = false;
      loginUser.value = {
        ...loginUser.value,
        ...curUserInfo.value
      };
    });
  }
}
</script>

<style scoped>
#basicMenu {
  -webkit-app-region: drag;
}

.avatar-item {
  margin-top: 50%;
  height: 5%;
  width: 65%;
  border-radius: 5vw;
  user-select: none;
  pointer-events: none;
  -webkit-app-region: no-drag;
}

.bottom-item {
  text-align: center;
  position: absolute;
  bottom: 0;
}

/*当前登录用户信息卡片*/
.user-info-card {
  color: #1e1e1e;
  position: fixed;
  user-select: none;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 5px 8px 2px rgba(0, 0, 0, 0.1);
  width: 380px;
  height: 350px;
  z-index: 2030;
  padding: 30px;
  border-radius: 25px;

  .user-title-info {
    display: flex;
    flex-direction: row;
    gap: 20px;

    .user-avatar {
      pointer-events: none;
      user-select: none;
      text-align: center;
      border-radius: 50px;
      width: 100px;
      height: 100px;
    }

    .user-title-content {
      display: flex;
      flex-direction: column;
      width: 200px;

      .user-name {
        display: flex;
        justify-content: left;
      }
      .user-id {
        display: flex;
        justify-content: left;
        color: #666;
        font-family: 'Arial', sans-serif;
      }
    }
  }

  /*信息标签*/

  .user-info-label {
    color: #666;
    width: 100px;
    font-family: 'SimHei', 'Arial', sans-serif;
  }

  .user-level {
    margin-top: 20px;
    height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .user-info {
    margin-top: 20px;
    height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;

    .user-info-value {
      border: none;
      background: none;
    }
  }
  .user-info-opt {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    height: 50px;
    gap: 20px;
  }
}


.dialog-text {
  color: #bbb;
  user-select: none;
  font-size: 15pt;
}
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
  .dialog-content-row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    .dialog-content-avatar {
      cursor: pointer;
      width: 80px;
      height: 80px;
      .user-avatar {
        pointer-events: none;
        user-select: none;
        text-align: center;
        border-radius: 50px;
        width: 80px;
        height: 80px;
      }
    }
    .dialog-content-input-prefix {
      color: #888;
      user-select: none;
      cursor: pointer;
      z-index: 1;
    }
  }
}
.dialog-content ::v-deep .el-input__wrapper {
  /*输入框中标签超出输入框区域时隐藏部分标签*/
  overflow: hidden;
  min-width: 100%;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  will-change: transform;
  backface-visibility: hidden;
  z-index: 1;
}
.dialog-content ::v-deep .el-input__wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid #535bf2;
  border-radius: 15px;
  transform: scaleX(0);
  transition: transform 0.2s ease-in-out;
  z-index: 1;
  pointer-events: none;
}
.dialog-content ::v-deep .el-input__wrapper:hover::before {
  transform: scaleX(1);
}
.dialog-content ::v-deep .el-input__inner::selection {
  background-color: rgba(173, 216, 230, 0.6);
}
.dialog-content ::v-deep .el-input__inner{
  color: #1e1e1e;
}
.dialog-content ::v-deep .el-input__inner::placeholder{
  color: #888;
}
.dialog-content ::v-deep .el-input .el-input__count .el-input__count-inner{
  color: #888;
  background: none;
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
