// initial state
// @ts-nocheck
/* eslint-disable */
import {StoreOptions} from "vuex";

// 仅对于P2P单人聊天
export const phoneChatData = {
    namespaced: true,
    state: () => ({
        // 电话或视频聊天
        phoneStatus: 0,// 没有开启电话或视频聊天 0，开启了电话聊天 1，开启了视频聊天 2
        userInfo: {
            userAvatar: "https://thirdwx.qlogo.cn/mmopen/vi_32/dKtc6VAjUGHh7rMaiarIdSA70g7uU2pCQUV9c7Eu1K2jkom9Fw8cM0WlFB5TFFmeBh5TNBTlXqx1zOOG2Hmgic9g/132",
        },
    }),
    actions: {
        // actions,执行异步操作,并触发mutations的修改
        setPhoneStatus({ commit, state }, payload) {
            if (!payload) {
                commit("updatePhoneStatus", 0);
                return;
            }
            commit("updatePhoneStatus", payload);
        },
        setUserInfo({ commit, state }, payload) {
            if (!payload) {
                commit("updateUserInfo", {});
                return;
            }
            commit("updateUserInfo", payload);
        },
        clearAllData({ commit, state }){
            commit("clearAllData");
        }
    },
    // mutations,修改状态变量
    mutations: {
        updatePhoneStatus(state, payload) {
            state.phoneStatus = payload;
        },
        updateUserInfo(state, payload) {
            state.userInfo = payload;
        },
        clearAllData(state){
            state.phoneStatus= 0;
            state.userInfo= {
                userAvatar: "https://thirdwx.qlogo.cn/mmopen/vi_32/dKtc6VAjUGHh7rMaiarIdSA70g7uU2pCQUV9c7Eu1K2jkom9Fw8cM0WlFB5TFFmeBh5TNBTlXqx1zOOG2Hmgic9g/132",
            };
        }
    },
} as StoreOptions<any>;
