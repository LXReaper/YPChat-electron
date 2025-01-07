// 创建一个video标签
import {LinkType} from "../constant/MsgTypeConstant.ts";

export const createVideo = (data: {
    controls?: boolean;
    src: string;
    autoplay?: boolean;// 是否自动播放
    loop?: boolean;// 是否循环播放
    playsInline?: boolean;// 是否在包含视频元素的页面中播放，而不会自动切换到全屏
    handleContextmenu?: (e: MouseEvent) => void;
}) => {
    const videoEl = document.createElement('video');
    videoEl.muted = data.controls || false;
    videoEl.src = data.src;
    videoEl.autoplay = !!data.autoplay;
    videoEl.loop = !!data.loop;
    videoEl.playsInline = data.playsInline || true;
    videoEl.style.width = '180px';
    videoEl.style.height = '100px';
    videoEl.style.objectFit = 'cover';

    videoEl.oncontextmenu = (e) => {
        e.preventDefault();
        data.handleContextmenu?.(e);
    };

    return videoEl;
}

// 创建一个img标签
export const createImage = (data: {
    src: string;
    alt?: string;
}) => {
    let img = document.createElement("img");
    img.src = data.src;
    img.alt = data.alt || "图片已过期或被清除";
    img.style.width = '150px';
    img.style.height = '100px';

    return img;
}

// 创建一个文件相关的标签，使用a标签实现
export const createFile = (data: {
    fileUrl: string;// 文件路径
    fileName: string;// 文件名称
    fileType: string;// 文件类型
    fileSize: string;// 文件大小
}) => {
    // 创建一个链接元素
    const link = document.createElement('a');
    link.href = data.fileUrl;
    link.textContent = data.fileName;
    link.download = data.fileName; // 让浏览器下载文件而不是直接打开

    link.dataset.linkType = LinkType.FILE;// 链接类型为文件链接
    link.dataset.fileType = data.fileType;
    link.dataset.fileSize = data.fileSize;

    link.style.width = '220px';
    link.style.height = '115px';
    return link;
}

// 创建一个语音通话消息标签，a标签实现
export const createPhoneMessage = (data: {
    content: string;
}) => {
    // 创建一个链接元素
    const link = document.createElement('a');
    link.href = '';
    link.textContent = data.content;
    link.download = ''; // 让浏览器下载文件而不是直接打开

    link.dataset.linkType = LinkType.PHONE_CHAT;// 链接类型为文件链接
    link.dataset.messageType = '[语音聊天]';// 指定消息类型

    link.style.width = '220px';
    link.style.height = '115px';
    return link;
}

// 创建一个视频通话消息标签，a标签实现
export const createPhoneVideoMessage = (data: {
    content: string;
}) => {
    // 创建一个链接元素
    const link = document.createElement('a');
    link.href = '';
    link.textContent = data.content;
    link.download = ''; // 让浏览器下载文件而不是直接打开

    link.dataset.linkType = LinkType.PHONE_VIDEO_CHAT;// 链接类型为文件链接
    link.dataset.messageType = '[视频聊天]';// 指定消息类型

    link.style.width = '220px';
    link.style.height = '115px';
    return link;
}
