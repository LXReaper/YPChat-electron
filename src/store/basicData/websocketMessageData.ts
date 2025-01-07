// initial state
// @ts-nocheck
/* eslint-disable */
import { StoreOptions } from "vuex";

/**
 * 后端服务器连接模块
 */
export const websocketMessageData = {
  namespaced: true,
  state: () => ({
    websocketMessage: {
      ws: "",// 主要的websocket连接实例
    },
    RTCData: {
      roomId: "",// 加入会议的房间号
    }
  }),
  actions: {
    // actions,触发mutations的修改
    async setNoticeSocket({ commit, state }, payload) {
      if (!payload) {
        commit("updateWS", "");
        return;
      }
      commit("updateWS", payload);
    },
    async setRTCJoinInfo({ commit, state }, payload) {
      if (!payload) {
        commit("updateRTCJoinInfo", "");
        return;
      }
      commit("updateRTCJoinInfo", payload);
    },
    clearAllData({ commit, state }){
      commit("clearAllData");
    }
  },
  // mutations,修改状态变量
  mutations: {
    // 增删改查
    updateWS(state, payload) {
      state.websocketMessage.ws = payload;
    },
    updateRTCJoinInfo(state, payload) {
      state.RTCData = payload;
    },
    clearAllData(state) {
      state.websocketMessage= {
        ws: "",// 主要的websocket连接实例
      };
      state.RTCData= {
        roomId: "",// 加入会议的房间号
      };
    }
  },
  getters: {
    //获取
    getWS(state) {
      return state.websocketMessage.ws;
    },
  },
} as StoreOptions<any>;
