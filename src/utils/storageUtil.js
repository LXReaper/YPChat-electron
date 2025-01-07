import {ElMessage} from "element-plus";
import store from "../store";
import {reLogin} from "./electronUtil.ts";

export const USER_INFO_KEY = "userInfo";


/*持久化用户信息*/
export const setUserInfoStorage = (data = {
    userAccount: "",
    userPassword: "",
    loginTime: new Date().getTime(),
    expire: 24 * 60 * 60 * 1000,//过期时间
}) => {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(data));
}
/*获取用户信息*/
export const getUserInfoStorage = () => {
    return JSON.parse(localStorage.getItem(USER_INFO_KEY));
}
/*移除用户信息*/
export const removeUserInfoStorage = () =>{
    localStorage.removeItem(USER_INFO_KEY);
}
/*用户信息过期检测*/
export const testUserInfoExpireTime = () =>{
    let userOldInfo = getUserInfoStorage();
    store.dispatch("user/setUserInfoData", userOldInfo);
    if (userOldInfo.loginTime + userOldInfo.expire <= new Date().getTime()){
        ElMessage.warning("登录已过期")
        //登录过期
        reLogin();//重新登录
        return true;
    }
    return false;
}
