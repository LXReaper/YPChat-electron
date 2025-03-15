// initial state
// @ts-nocheck
/* eslint-disable */
import { StoreOptions } from "vuex";
import { ElMessage } from "element-plus";
import {UserService} from "../../api/Services/UserService.ts";
import AuthorityCtrl from "../../access/authorityCtrl.ts";
import store from "../index.ts";
import {WebRTCClass} from "../../utils/network/WebRTC.ts";
import {WebSocketClass} from "../../utils/network/WebSocket.ts";

export const useNetworkStore = {
    namespaced: true,
    state: () => ({
        wsMap: new Map<string, WebSocketClass>(),// roomId => WebSocketClass
        rtcMap: new Map<string, WebRTCClass>(), // userId => WebRTCClass
    }),
    actions: {
        removeWS({ commit, state }, roomId) {
            commit("removeWS", roomId);
        },
        removeRTC({ commit, state }, userId) {
            commit("removeRTC", userId);
        },
        clearAllData({ commit, state }, payload) {
            commit("clearAllData", payload);
        }
    },
    mutations: {
        removeWS(state, roomId) {
            const old = state.wsMap.get(roomId);
            if (old) old.close();
            state.wsMap.delete(roomId);
        },
        removeRTC(state, userId) {
            const old = state.rtcMap.get(userId);
            if (old) old.close();
            state.rtcMap.delete(userId);
        },
        clearAllData(state, payload) {
            state.wsMap = new Map<string, WebSocketClass>();
            state.rtcMap = new Map<string, WebRTCClass>();
        }
    },
} as StoreOptions<any>;
