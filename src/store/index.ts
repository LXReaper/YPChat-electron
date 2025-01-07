// @ts-nocheck
import { createStore } from "vuex";
import {basicData} from "./basicData/basicData.ts";
import {user} from "./basicData/user.ts";
import {noteBookPanelData} from "./noteBookPanelData.ts";
import {websocketMessageData} from "./basicData/websocketMessageData.ts";
import {phoneChatData} from "./basicData/phoneChatData.ts";
import {chatPanelData} from "./chatPanelData.ts";
import {useNetworkStore} from "./network";

export default createStore({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    basicData,
    user,
    chatPanelData,
    noteBookPanelData,
    websocketMessageData,
    phoneChatData,
    useNetworkStore,
  },
});
