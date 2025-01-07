// initial state
// @ts-nocheck
/* eslint-disable */
import { StoreOptions } from "vuex";
import { ElMessage } from "element-plus";
import {UserService} from "../../api/Services/UserService.ts";
import AuthorityCtrl from "../../access/authorityCtrl.ts";
import {setUserInfoStorage, getUserInfoStorage, testUserInfoExpireTime, USER_INFO_KEY} from "../../utils/storageUtil.js"
import store from "../index.ts";

export const user = {
  namespaced: true,
  state: () => ({
    loginUser: {
      userName: "登录 注册",
    },
    userMenuData: {
      curActive: "userCount",
    },
  }),
  actions: {
    // actions,执行异步操作,并触发mutations的修改
    async getLoginUser({ commit, state }, payload) {
      //从远程(即后端)获取用户信息
      const res = await UserService.getLoginUserUsingGet();
      if (res.code === 0) {
        commit("updateUser", res.data);

        /* localStorage操作持久化用户信息*/
        let userOldInfo = getUserInfoStorage();
        setUserInfoStorage({
          ...userOldInfo,
          ...res.data
        })

        //每隔5s检测一次
        const testUserInfoIntervalId = setInterval(() => {
          let expireStatus = testUserInfoExpireTime();
          if (expireStatus) clearInterval(testUserInfoIntervalId);// 过期了就无需再检测
        },5000);
      } else {
        commit("updateUser", {
          ...state.loginUser,
          userRole: AuthorityCtrl.NOT_LOGIN,
        });
      }
    },
    async getLoginUserFromBackend({ commit, state }, payload) {
      //从远程(即后端)获取用户信息
      const res = await UserService.getLoginUserUsingGet();
      if (res.code === 0) commit("updateUser", res.data);
      else {
        commit("updateUser", {
          ...state.loginUser,
          userRole: AuthorityCtrl.NOT_LOGIN,
        });
      }
    },
    updateMyUserInfo({ commit, state }, newMyUserInfo) {
      commit("updateMyUserInfo", newMyUserInfo);
    },
    //设置用户信息
    setUserInfoData({ commit, state }, payload) {
      if (!payload) {
        commit("setUserInfoData", {
          userName: "登录 注册",
        });
        return;
      }
      commit("setUserInfoData", payload);
    },
    //设置用户页面中的菜单名称
    setCurActive({ commit, state }, payload) {
      if (!payload) {
        commit("setCurActive", "userCount");
        return;
      }
      commit("setCurActive", payload);
    },
  },
  // mutations,修改状态变量
  mutations: {
    updateMyUserInfo(state, newMyUserInfo){
      UserService.updateMyUserOrUsingPost({
        userName: newMyUserInfo.userName,
        userAvatar: newMyUserInfo.userAvatar,
        address: newMyUserInfo.address,
        userProfile: newMyUserInfo.userProfile,
        addressVerifyCode: newMyUserInfo.addressVerifyCode || null,
      }).then(res => {
        if (res.code === 0){
          ElMessage.success("修改成功");
          /* localStorage操作持久化用户信息*/
          let userOldInfo = getUserInfoStorage();
          setUserInfoStorage({
            ...userOldInfo,
            ...res.data
          })
          console.log(getUserInfoStorage());
        }else {
          ElMessage.error("个人信息修改失败");
          console.error("个人信息修改失败，" + res.message);
        }
      }).catch(error => {
        ElMessage.error("个人信息修改失败");
        console.error("个人信息修改失败，" + error);
      })
    },
    setUserInfoData(state, payload) {
      state.loginUser = payload;
    },
    //更新用户页面中的当前菜单名称
    setCurActive(state, payload) {
      state.userMenuData.curActive = payload;
    },
  },
} as StoreOptions<any>;
