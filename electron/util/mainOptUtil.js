// 主进程操控渲染进程工具脚本
import store from "../../src/store";

function setWinSize(size) {
    store.dispatch("basicDat/setWin",size);
}

module.exports = { setWinSize };
