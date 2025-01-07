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
import phoneChatView from "../components/basic/ChatPane/VideoChat/phoneChatView.vue";
import videoChatView from "../components/basic/ChatPane/VideoChat/videoChatView.vue";
import deskShare from "../components/basic/ChatPane/Desk/deskShare.vue";

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

export default router;
