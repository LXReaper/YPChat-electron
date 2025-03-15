import {createRouter, createWebHashHistory, RouteRecordRaw} from "vue-router";
import redirect from "../view/redirect.vue";
import loginLayout from "../layout/loginLayout.vue";
import basicLayout from "../layout/basicLayout.vue";
import chatPanel from "../view/chatPanel.vue";
import notebookPanel from "../view/notebookPanel.vue";
import conferencePanel from "../view/conferencePanel.vue";
import settingsPanel from "../view/settingsPanel.vue";
import conferenceView from "../components/Conference/conferenceView.vue";
import joinConference from "../components/Conference/joinConference.vue";
import phoneChatView from "../components/Basic/ChatPane/VideoChat/phoneChatView.vue";
import videoChatView from "../components/Basic/ChatPane/VideoChat/videoChatView.vue";
import deskShare from "../components/Basic/ChatPane/Desk/deskShare.vue";
import moment from "moment/moment";
import store from "../store";
import authorityCtrl from "../access/authorityCtrl.ts";
import checkAuthority from "../access/checkAuthority.ts";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/redirect",
    meta: {
      hidden: true,
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: redirect,
      },
    ],
  },
  {
    path: "/",
    name: "登录",
    component: loginLayout,
  },
  {
    path: "/home",
    name: "主界面",
    component: basicLayout,
    children: [
      {
        path: "/chat",
        name: "聊天",
        component: chatPanel,
      },
      {
        path: "/communication",
        name: "通讯录",
        component: notebookPanel,
      },
      {
        path: "/settings",
        name: "设置",
        component: settingsPanel,
      },
      {
        path: "/Conference/video",
        name: "视频会议",
        component: conferencePanel,
      }
    ]
  },
  {
    path: "/view/video/Conference",
    name: "当前视频会议",
    component: conferenceView
  },
  {
    path: "/dialog/video/Conference/join",
    name: "加入视频会议",
    component: joinConference
  },
  {
    path: "/phone/chat",
    name: "电话聊天",
    component: phoneChatView
  },
  {
    path: "/video/chat",
    name: "视频聊天",
    component: videoChatView,
  },
  {
    path: "/desk/share",
    name: "屏幕共享",
    component: deskShare,
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const now = moment(new Date()).format('YYYY年MM月DD日hh时mm分ss秒');
  console.log(`%c 路由来源路径： %c ${now} %c ${JSON.stringify(from)}`,
      "color: #fff; background: #5bc0de; border: 1px solid #5bc0de;",
      "color: #333; background: #fffef6; border: 1px solid #e0dcdc;",
      "color: #999; font-style: italic");
  console.log(`%c 路由目的路径： %c ${now} %c ${JSON.stringify(to)}`,
      "color: #fff; background: #5bc0de; border: 1px solid #5bc0de;",
      "color: #333; background: #fffef6; border: 1px solid #e0dcdc;",
      "color: #999; font-style: italic");

  let loginUser = store.state.user.loginUser; // 获取当前前端保存的登录用户信息
  // 如果之前没有登录,则自动登录
  if (!loginUser || !loginUser.userRole) {
    await store.dispatch("user/getLoginUser"); // 从后端获取登录用户信息
    loginUser = store.state.user.loginUser; // 更新存放在前端的登录用户信息
  }

  //获取当前页面需要的访问权限
  const needAccess = (to.meta?.access as string) ?? authorityCtrl.NOT_LOGIN;
  // const fromAccess = (from.meta?.access as string) ?? AuthorityCtrl.NOT_LOGIN;
  //当前页面必须登录才可以访问
  if (needAccess !== authorityCtrl.NOT_LOGIN) {
    //如果没登录,就跳转到登录页面
    if (
        !loginUser ||
        !loginUser.userRole ||
        loginUser.userRole === authorityCtrl.NOT_LOGIN
    ) {
      next(`/user/login?redirect=${to.fullPath}`);
      return;
    }

    //如果已经登录了,但是权限不足,则不跳转
    if (!checkAuthority(loginUser, needAccess)) {
      return;
    }
  }
  next();
});

export default router;
