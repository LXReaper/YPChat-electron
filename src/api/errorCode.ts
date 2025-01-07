export const ErrorCode = {
    SUCCESS: {
        code: 0,
        text: "ok",
    },
    PARAMS_ERROR: {
        code: 40000,
        text: "请求参数错误",
    },
    NOT_LOGIN_ERROR: {
        code: 40100,
        text: "未登录",
    },
    NO_AUTH_ERROR: {
        code: 40101,
        text: "无权限",
    },
    NOT_FOUND_ERROR: {
        code: 40400,
        text: "请求数据不存在",
    },
    FORBIDDEN_ERROR: {
        code: 40300,
        text: "禁止访问",
    },
    SYSTEM_ERROR: {
        code: 50000,
        text: "系统内部异常",
    },
    OPERATION_ERROR: {
        code: 50001,
        text: "操作失败",
    },
    MSG_FORMAT_ERROR: {
        code: 415,
        text: "消息格式错误",
    },
}
