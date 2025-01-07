import axios, {AxiosProgressEvent} from "axios";
import {api} from "./api.ts";
import {ErrorCode} from "./errorCode.ts";
import {reLogin} from "../utils/electronUtil.ts";

export const base_request = (
        method = "post",
        url = "/",
        data = {},
        timeout = 15000,
        headers = {
            'Content-Type': "application/json",
        },
        handleUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
    ) => {
    return new Promise((resolve, reject) => {
        axios({
            headers: headers,
            method: method,
            baseURL: api.devBaseUrl,
            url: url,
            data: data,
            params: method === 'get' ? data : {},
            timeout: timeout,//如果请求时间超过 `timeout` 的值，则请求会被中断
            withCredentials: true,
            onUploadProgress(progressEvent: AxiosProgressEvent) {
                handleUploadProgress?.(progressEvent);// 异步处理上传进度
            },
        }).then(res => {
            // 先处理一波
            if (res.data.code === ErrorCode.NOT_LOGIN_ERROR.code) {
                // 未登录处理，重新登录
                reLogin("reLogin", ErrorCode.NOT_LOGIN_ERROR.text);
            }
            resolve(res.data);
        })
            .catch(error => reject(error.data))
    })
}

// axios.interceptors.response.use(
//     (response) => {
//         const cookies = response.headers['set-cookie'];
//         console.log(cookies)
//         // 处理 cookies
//         return response;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );
