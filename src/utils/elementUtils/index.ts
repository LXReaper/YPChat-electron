import {ElLoading} from "element-plus";

/* 加载动画*/
// 渲染方块分割动画，取出html串
// const renderBlockSplitAnimation = (dotBackgroundColor: string) => {
//     const container = document.createElement("div");
//     const vNode = h(BlockSplitAnimation, { dotBackgroundColor });
//     render(vNode, container);
//     return container.innerHTML;
// };
// 创建加载动画
export const mLoadingAnimation = (dotBackgroundColor: string) => {
    dotBackgroundColor;
    return ElLoading.service({
        lock: true,
        text: "正在载入数据...",
        background: "rgba(0, 0, 0, 0.3)",
    });
}
