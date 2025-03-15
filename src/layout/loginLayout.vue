<template>
  <div id="container" ref="container">
    <div class="basicTab1" style="right: 120px;" v-if="isElectron">
      <Setting />
      <div class="tooltip" style="right: -18px;width: 60px;user-select: none;">设置</div>
    </div>
    <div class="basicTab1" style="right: 70px;" @click="minimize" v-if="isElectron">
      <Minus />
      <div class="tooltip" style="right: -23px;width: 70px;user-select: none;">最小化</div>
    </div>
    <div @click="closeWin" class="basicTab2" v-if="isElectron">
      <Close />
      <div class="tooltip" style="right: -18px;width: 60px;user-select: none;">关闭</div>
    </div>
    <div class="form-box login">
      <div class="form">
        <h1>登 录</h1>
        <div class="input-box">
          <el-input
              placeholder="请输入账号"
              v-model="loginInfo.account"
              maxlength="20"
              @keydown.enter="()=>{
              if(isLogin) handleLoginDebounce();
            }"
              v-if="!isMailLogin"
          >
            <template #prefix>
              <el-icon>
                <Avatar/>
              </el-icon>
            </template>
          </el-input>
          <el-input
              placeholder="请输入邮箱"
              v-model="loginInfo.address"
              maxlength="20"
              @keydown.enter="()=>{
              if(isLogin) handleLoginDebounce();
            }"
              v-if="isMailLogin"
          >
            <template #prefix>
              <el-icon>
                <mail/>
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="input-box">
          <el-input
              placeholder="请输入密码"
              type="password"
              v-model="loginInfo.password"
              maxlength="20"
              show-password
              @keydown.enter="()=>{
                  if(isLogin) handleLoginDebounce();
              }"
              v-if="!isMailLogin"
          >
            <template #prefix>
              <el-icon>
                <Key/>
              </el-icon>
            </template>
          </el-input>
          <el-input
              placeholder="请输入邮箱验证码"
              v-model="loginInfo.addressVerifyCode"
              maxlength="6"
              @keydown.enter="()=>{
                  if(isLogin) handleLoginDebounce();
              }"
              v-if="isMailLogin"
          >
            <template #prefix>
              <el-icon>
                <Key/>
              </el-icon>
            </template>
            <template #suffix>
              <text style="cursor: pointer" v-if="isTimeOut"
              >{{ cnt }}后重新获取验证码
              </text>
              <el-button v-if="!isTimeOut" @click="getVerifyCode">
                获取验证码
              </el-button>
            </template>
          </el-input>
        </div>
        <div class="i-link-group">
          <span class="i-link">
            忘记密码?
          </span>
          <span class="i-link" v-if="isMailLogin" @click="returnNormalLogin">
            返回
          </span>
        </div>
        <button class="btn btn-action" @click="handleLoginDebounce">登录</button>
        <p style="user-select: none;">其他平台账号登录</p>
        <div class="social-icons">
          <github class="social-icon" />
          <gitlab class="social-icon" />
          <mail class="social-icon" @click="startMailLogin" />
          <instagram class="social-icon" />
        </div>
      </div>
    </div>

    <div class="form-box register">
      <div class="form">
        <h1>注 册</h1>
        <div class="input-box">
          <el-input placeholder="请输入昵称" v-model="loginInfo.userName" maxlength="20">
            <template #prefix>
              <el-icon>
                <User/>
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="input-box">
          <el-input
              placeholder="请输入账号"
              v-model="loginInfo.account"
              maxlength="20"
              @keydown.enter="()=>{
                  if(isLogin) handleLoginDebounce();
               }"
          >
            <template #prefix>
              <el-icon>
                <Avatar/>
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="input-box">
          <el-input
              placeholder="请输入密码"
              type="password"
              v-model="loginInfo.password"
              maxlength="20"
              show-password
              @keydown.enter="()=>{
                  if(isLogin) handleLoginDebounce();
              }"
          >
            <template #prefix>
              <el-icon>
                <Key/>
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="input-box">
          <el-input placeholder="请再次输入密码" type="password" v-model="loginInfo.reInPassword" maxlength="20"
                    show-password>
            <template #prefix>
              <el-icon>
                <Key/>
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="i-link-group">
          <span class="i-link">
            忘记密码?
          </span>
          <span class="i-link" v-if="isMailRegister">
            返回
          </span>
        </div>
        <button class="btn btn-action" @click="handelRegisterDebounce">注册</button>
        <p style="user-select: none;">其他平台账号注册</p>
        <div class="social-icons">
          <github class="social-icon" />
          <gitlab class="social-icon" />
          <mail class="social-icon" />
          <instagram class="social-icon" />
        </div>
      </div>
    </div>

    <div class="toggle-box">
      <div class="toggle-panel toggle-left">
        <h1>Welcome to MineChat!</h1>
        <p>没有账号?</p>
        <button class="btn register-btn" @click="switchRegisterPage">注册</button>
      </div>

      <div class="toggle-panel toggle-right">
        <h1>Welcome Back!</h1>
        <p>已经有一个账号?</p>
        <button class="btn login-btn" @click="switchLoginPage">登录</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {Avatar, Close, Key, Minus, Setting, User} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";
import {UserService} from "../api/Services/UserService.ts";
import {ElMessage, ElNotification} from "element-plus";
import {initWs} from '../utils/network/wsClient.ts'
import {getUserInfoStorage, setUserInfoStorage} from '../utils/storageUtil.ts'
import store from "../store";
import Github from "../components/MyIcons/github.vue";
import Gitlab from "../components/MyIcons/gitlab.vue";
import Instagram from "../components/MyIcons/instagram.vue";
import {debounce} from "../utils/debounceThrottle.ts";
import Mail from "../components/MyIcons/mail.vue";
import {MailService} from "../api/Services/mailService.ts";
import AuthorityCtrl from "../access/authorityCtrl.ts";

//是否为登录界面
const isLogin = ref(true);
const isMailLogin = ref(false);// 是否使用邮箱登录
const isMailRegister = ref(false);// 是否使用邮箱注册
//获取自定义electronAPI上下文
let electron = (window as any).electronAPI;
const isElectron = ref(store.state.basicData.isElectron);

const router = useRouter();

//表单信息
const loginInfo = ref({
  userName: "",
  account: "",
  password: "",
  reInPassword: "",
  address: "",// 邮箱
  addressVerifyCode: "",// 邮箱验证码
})

//重置表单信息
const reset = () => {
  loginInfo.value = {
    userName: "",
    account: "",
    password: "",
    reInPassword: "",
    address: "",
    addressVerifyCode: "",
  };
}

// 最小化窗口
const minimize = () => {
  electron.sendMessage('minimize-window', "最小化窗口");
}
//关闭窗口
const closeWin = () => {
  electron.sendMessage('closeWin', '关闭窗口');
}

onMounted(() => {
  let isElectronApp = !!(window as any).electronAPI;
  if (!isElectronApp) {
    ElNotification({
      title: '建议使用最新版客户端，体验会更佳!!!',
      message: `
            <a
                style="color: #0066FF"
                href='https://ypchat-1326794969.cos.ap-guangzhou.myqcloud.com/app_release/MineChat%20Setup%200.0.1.exe'>
                点击下载最新客户端
            </a>`,
      type: "warning",
      duration: 5000,
      dangerouslyUseHTMLString: true, // 允许使用 HTML
    });
  }
  store.dispatch("basicData/setIsElectron", isElectronApp);
  isElectron.value = isElectronApp;

  // 获取当前登录用户信息
  console.log("正在检测本地是否登录过...");
  store.dispatch("user/getLoginUser").then(() => {
    let userInfo = store.state.user.loginUser;
    if (userInfo.userRole && userInfo.userRole != AuthorityCtrl.NOT_LOGIN) {
      ElMessage.success("登录成功");
      if (isElectron.value) {
        // 窗口中页面跳转
        electron.sendMessage('switchPage', {
          x: 300,
          y: 150,
          width: 1300,
          height: 840,
          maximizable: true,
          enableResizable: true,//登录成功后的界面允许窗口缩放
        });
      }
      router.push({
        path: "/chat",
      }).then(() => {
        let curUserInfo = getUserInfoStorage();
        if (isElectron.value) {
          electron.sendMessage('completeLogin', {
            ...curUserInfo
          });
        }
        initWs(curUserInfo);// 连接服务器
      });
    }else console.log("获取用户信息失败，请先进行登录");
  });
})

/* 登录*/
const isTimeOut = ref(false); //验证码是否倒计时
const cnt = ref(60); //邮箱获取验证码倒计时
// 开启邮箱登录
const startMailLogin = () => {
  reset();
  isMailLogin.value = true;
}
const returnNormalLogin = () => {// 返回正常登录
  reset();
  isMailLogin.value = false;
}
const loginSuccessHandle = (res: any) => {// 登录成功处理
  setUserInfoStorage({
    userAccount: loginInfo.value.account,
    userPassword: loginInfo.value.password,
    loginTime: new Date().getTime(),
    expire: 24 * 60 * 60 * 1000,
    ...res.data,
  });
  store.dispatch("user/getLoginUser").then(() => {
    ElMessage.success("登录成功");
    if (isElectron.value) {
      // 窗口中页面跳转
      electron.sendMessage('switchPage', {
        x: 300,
        y: 150,
        width: 1300,
        height: 840,
        maximizable: true,
        enableResizable: true,//登录成功后的界面允许窗口缩放
      });
    }
    router.push({
      path: "/chat",
    }).then(() => {
      if (isElectron.value) {
        electron.sendMessage('completeLogin', {
          ...res.data,
          userAccount: loginInfo.value.account,
          userPassword: loginInfo.value.password,
        });
      }
      initWs(getUserInfoStorage());// 连接服务器
    });
  });
}
const getVerifyCode = () => {// 获取验证码
  MailService.sendMailCodeUsingGet(
      loginInfo.value.address,
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
const mailLogin = () => {// 邮箱登录
  if (!loginInfo.value.address) {
    ElMessage.warning("邮箱不能为空");
    return ;
  }else if (!loginInfo.value.addressVerifyCode) {
    ElMessage.warning("邮箱验证码不能为空");
    return ;
  }else if (loginInfo.value.addressVerifyCode.length < 6) {
    ElMessage.error("邮箱验证码错误");
    return ;
  }
  MailService.userLoginByMailUsingPost({
    mail: loginInfo.value.address,
    mailVerifyCode: loginInfo.value.addressVerifyCode,
  }).then((res: any) => {
    if (res.code === 0){
      loginSuccessHandle(res);
    }else {
      ElMessage.error("邮箱登录失败");
    }
  }).catch(error => {
    ElMessage.error("邮箱登录失败");
    console.error("邮箱登录失败，" + error);
  });
}
const handleLogin = () => {// 账号密码登录
  if (isMailLogin.value) {
    mailLogin();
    return ;
  }

  if (!loginInfo.value.account || loginInfo.value.account === "") {
    if (!loginInfo.value.password || loginInfo.value.password === "") {
      ElMessage.warning("账号密码为空")
      return;
    }
    ElMessage.warning("账号为空");
    return;
  } else if (!loginInfo.value.password || loginInfo.value.password === "") {
    ElMessage.warning("密码为空");
    return;
  }

  UserService.userLoginUsingPost({
    userAccount: loginInfo.value.account,
    userPassword: loginInfo.value.password
  })
      .then((res: any) => {
        if (res.code === 0) {
          loginSuccessHandle(res);
        } else {
          ElMessage.error("登录失败，" + res.message);
        }
      }).catch(() => {
    // 登录请求没发送成功
    ElMessage.error("登录失败")
  })
}
const handleLoginDebounce = debounce(handleLogin, 500);

/* 注册*/
// 账号密码注册
const handelRegister = () => {
  if (!loginInfo.value.userName) {
    ElMessage.warning("用户名为空");
    return;
  }
  if (!loginInfo.value.account || loginInfo.value.account === "") {
    if (!loginInfo.value.password || loginInfo.value.password === "") {
      ElMessage.warning("账号密码为空")
      return;
    }
    ElMessage.warning("账号为空");
    return;
  } else if (!loginInfo.value.password || loginInfo.value.password === "") {
    ElMessage.warning("密码为空");
    return;
  }

  UserService.userRegisterUsingPost({
    userName: loginInfo.value.userName,
    userAccount: loginInfo.value.account,
    userPassword: loginInfo.value.password,
    checkPassword: loginInfo.value.reInPassword,
  })
      .then((res: any) => {
        if (res.code === 0) {
          ElMessage.success("注册成功");
          isLogin.value = true;
          reset();
        } else ElMessage.error("注册失败，" + res.message);
      }).catch(() => {
    // 注册请求没发送成功
    ElMessage.error("注册失败")
  })
}
const handelRegisterDebounce = debounce(handelRegister, 500);


/*特效按钮事件*/
const container = ref();
const switchLoginPage = () => {
  container.value.classList.remove('active');
  isLogin.value = !isLogin.value;
  reset();
}
const switchRegisterPage = () => {
  container.value.classList.add('active');
  isLogin.value = !isLogin.value;
  reset();
}
</script>

<style scoped>
/*窗口顶部布局*/
.basicTab1 {
  color: #1e1e1e;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 15px;
  z-index: 3;
  width: 25px;
  height: 25px;
  -webkit-app-region: no-drag;
}

.basicTab1 ::v-deep svg {
  margin: 3px 0;
  border-radius: 5px;
  width: 90%;
  height: 90%;
}

.basicTab1:hover ::v-deep svg {
  background-color: #bbbbbb;
}

.basicTab2 {
  color: #1e1e1e;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 15px;
  right: 20px;
  z-index: 3;
  width: 25px;
  height: 25px;
  -webkit-app-region: no-drag;
}

.basicTab2 ::v-deep svg {
  margin: 3px 0 2px 1px;
  border-radius: 5px;
  width: 90%;
  height: 90%;
}

.basicTab2:hover ::v-deep svg {
  background-color: rgb(251, 115, 115);
}

.tooltip {
  visibility: hidden;
  position: absolute;
  top: 40px;
  transform: scale(0) translateZ(0);

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
  transition: visibility 0.6s ease-in-out;
}
.tooltip::before {
  content: '';
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px;
  border-style: solid;
  border-color:  transparent transparent #bbb transparent;
  border-radius: 3px;
}
.basicTab1:hover .tooltip {
  transform: scale(1) translateY(0) translateZ(0);
  visibility: visible;
  transition: transform 0.3s cubic-bezier(0.5, 0, 0.5, 1),
  visibility 0.3s cubic-bezier(0.5, 0, 0.5, 1);
}
.basicTab1:not(:hover) .tooltip {
  transform: scale(0) translateY(-80px) translateZ(0);
  visibility: hidden;
  transition: transform 0.3s cubic-bezier(0.5, 0, 0.5, 1),
  visibility 0.3s cubic-bezier(0.5, 0, 0.5, 1);
}
.basicTab2:hover .tooltip {
  transform: scale(1) translateY(0) translateZ(0);
  visibility: visible;
  transition: transform 0.3s cubic-bezier(0.5, 0, 0.5, 1),
  visibility 0.3s cubic-bezier(0.5, 0, 0.5, 1);
}
.basicTab2:not(:hover) .tooltip {
  transform: scale(0) translateY(-80px) translateZ(0);
  visibility: hidden;
  transition: transform 0.3s cubic-bezier(0.5, 0, 0.5, 1),
  visibility 0.3s cubic-bezier(0.5, 0, 0.5, 1);
}

/*主要内容*/
#container ::v-deep .el-input__wrapper {
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  box-sizing: border-box;
  backface-visibility: hidden;
  z-index: 1;
}
#container ::v-deep .el-input__wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid #535bf2;
  border-radius: 15px;
  transform: scaleX(0);
  transition: transform 0.2s ease-in-out;
  z-index: 1;
  pointer-events: none;
}
#container ::v-deep .el-input__wrapper:hover::before {
  transform: scaleX(1);
}
#container ::v-deep .el-input__wrapper:hover {
  transform: scale(1.1) translateZ(0);
  transition: transform 0.5s ease, border 0.5s ease;
  filter: none;
  backface-visibility: hidden;
}
#container ::v-deep .el-input__wrapper:not(:hover) {
  transform: scale(1) translateZ(0);
  transition: transform 0.5s ease;
  filter: none;
  backface-visibility: hidden;
}
#container ::v-deep .el-input__inner::selection {
  background-color: rgba(173, 216, 230, 0.6);
}

#container {
  position: relative;
  margin: 0 auto;
  width: 850px;
  height: 550px;
  background-color: #fff;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

#container.active .toggle-box::before {
  left: 50%;
}

.form-box {
  position: absolute;
  right: 0;
  width: 45%;
  height: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  color: #333;
  text-align: center;
  padding: 40px;
  z-index: 1;
  transition: visibility -0.6s ease-in-out 1.2s;
}

#container.active .form-box {
  right: 50%;
}

.form-box.login {
  padding-right: 20px;
}

.form-box.register {
  padding-right: 20px;
  visibility: hidden;
}

#container.active .form-box.register {
  visibility: visible;
}

.form-box .form {
  width: 100%;
}

#container h1 {
  user-select: none;
  font-size: 36px;
  margin: -10px 0;
}

.input-box {
  position: relative;
  margin: 20px 0 15px 0;
}
.input-box > div{
  height: 36px;
}
.btn-action {
  user-select: none;
  background: linear-gradient(135deg, #7494ec, #7ab7e7, #86b3ef, #9ccff3);
}
.btn-action:hover {
  background: linear-gradient(135deg, #6283ce, #6aafe5, #78c4e1, #8fd9f4);
}

.i-link-group {
  display: flex;
  justify-content: center;
  gap: 25px;
}
.i-link {
  cursor: pointer;
  user-select: none;
  margin-bottom: 10px;
  position: relative;
  display: inline-block;
  -webkit-app-region: no-drag;
}
.i-link:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px; /* 线条高度 */
  background: #6283ce; /* 线条颜色 */
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}
.i-link:hover::after {
  transform: scaleX(1);
}

.btn {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #fff;
  font-weight: 600;
  -webkit-app-region: no-drag;
}

#container p {
  font-size: 18px;
  margin: 10px 0;
}

.social-icons {
  -webkit-app-region: no-drag;
  display: flex;
  column-gap: 10px;
  justify-content: center;
  .social-icon {
    cursor: pointer;
    display: inline-flex;
    font-size: 24px;
    color: rgb(51, 51, 51);
    padding: 5px;
    border-width: 2px;
    border-style: solid;
    border-color: rgb(204, 204, 204);
    border-image: initial;
    border-radius: 8px;
    text-decoration: none;
    margin: 0 8px;
  }
}

.toggle-box {
  position: absolute;
  width: 100%;
  height: 100%;
}

.toggle-box::before {
  content: '';
  position: absolute;
  left: -250%;
  width: 300%;
  height: 100%;
  background-color: #7494ec;
  z-index: 2;
  border-radius: 150px;
  transition: 1.8s ease-in-out;
}

.toggle-panel {
  user-select: none;
  position: absolute;
  width: 50%;
  height: 100%;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
  transition: 0.6s ease-in-out;
}

.toggle-panel.toggle-left {
  left: 0;
  transition-delay: 1.2s;
}

#container.active .toggle-panel.toggle-left {
  left: -50%;
  transition-delay: 0.6s;
}

.toggle-panel.toggle-right {
  right: -50%;
  transition-delay: 0.6s;
}

#container.active .toggle-panel.toggle-right {
  right: 0;
  transition-delay: 1.2s;
}
.toggle-panel .btn {
  width: 160px;
  height: 46px;
  background-color: transparent;
  border: 2px solid #fff;
  box-shadow: none;

  position: relative;
}

@media screen and (max-width: 650px) {
  #container {
    height: calc(100vh - 40px);
  }

  .form-box {
    bottom: 0;
    width: 100%;
    height: 70%;
  }

  #container.active .form-box {
    right: 0;
    bottom: 30%;
  }

  .toggle-box::before {
    left: 0;
    width: 100%;
    top: -270%;
    height: 300%;
    border-radius: 20vw;
  }

  #container.active .toggle-box::before {
    left: 0;
    top: 70%;
  }

  .toggle-panel {
    user-select: none;
    width: 100%;
    height: 30%;
  }

  .toggle-panel.toggle-left {
    top: 0;
  }

  #container.active .toggle-panel.toggle-left {
    left: 0;
    top: -30%;
  }

  .toggle-panel.toggle-right {
    right: 0;
    bottom: -30%;
  }

  #container.active .toggle-panel.toggle-right {
    bottom: 0;
  }
}

@media screen and (max-width: 400px) {
  .form-box {
    padding: 20px;
  }

  .toggle-panel h1 {
    font-size: 30px;
  }
}
</style>
