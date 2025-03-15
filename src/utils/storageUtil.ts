import {ElMessage} from "element-plus";
import store from "../store";
import {reLogin} from "./electronUtil.ts";

// 键的类型
export const typeOfKeys = {
    USER_INFO_KEY: "userInfo",// 当前用户信息键
    CUR_CONTACTOR_INFO_KEY: "cur_contactor_info_key",// 当前联系对象键
};

/** ------------------------------用户信息-----------------------------*/
/*持久化用户信息*/
export const setUserInfoStorage = (data = {
    userAccount: "",
    userPassword: "",
    loginTime: new Date().getTime(),
    expire: 24 * 60 * 60 * 1000,//过期时间
}) => {
    localStorage.setItem(typeOfKeys.USER_INFO_KEY, JSON.stringify(data));
}
/*获取用户信息*/
export const getUserInfoStorage = () => {
    return JSON.parse(localStorage.getItem(typeOfKeys.USER_INFO_KEY) as string);
}
/*移除用户信息*/
export const removeUserInfoStorage = () =>{
    localStorage.removeItem(typeOfKeys.USER_INFO_KEY);
}
/*用户信息过期检测*/
export const testUserInfoExpireTime = () =>{
    let userOldInfo = getUserInfoStorage();
    if (!userOldInfo) return true;

    store.dispatch("user/setUserInfoData", userOldInfo);
    if (userOldInfo.loginTime + userOldInfo.expire <= new Date().getTime()){
        ElMessage.warning("登录已过期");
        //登录过期
        reLogin(1000, "登录信息已过期");//重新登录
        return true;
    }
    return false;
}

/** ------------------------------当前联系对象信息-----------------------------*/
/*持久化当前联系对象信息*/
export const setCurContactorInfoStorage = (data = {
    type: 0,// 默认是联系人
    contact_info_id: "",
    msgType: "",
}) => {
    localStorage.setItem(typeOfKeys.CUR_CONTACTOR_INFO_KEY, JSON.stringify(data));
}
/*获取当前联系对象信息*/
export const getCurContactorInfoStorage = () => {
    return JSON.parse(localStorage.getItem(typeOfKeys.CUR_CONTACTOR_INFO_KEY) as string);
}
/*移除联系对象信息*/
export const removeCurContactorInfoStorage = () =>{
    localStorage.removeItem(typeOfKeys.CUR_CONTACTOR_INFO_KEY);
}
