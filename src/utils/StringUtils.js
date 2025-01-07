/*---------字符串判断*/
//判断是否为数字
import {LinkType} from "../constant/MsgTypeConstant";

export const isNumber = (data) => {
    let reg = /^[0-9]+$/;
    return reg.test(data);
}
// 判断是否是base64数据
export const isBase64 = (str) => {
    if (str === '' || str.trim() === '') return false;
    if (str.indexOf('data:') !== -1 && str.indexOf('base64') !== -1) return true;

    return false;
}

/*--------字符串获取*/
export const getFileSeparator = () => {
    const userAgent = navigator.userAgent;
    const isWindows = /Windows/i.test(userAgent);
    const isMac = /Macintosh/i.test(userAgent);
    const isLinux = /Linux/i.test(userAgent);
    if (isWindows) {
        return '\\'; // Windows 系统使用反斜杠作为文件分割符
    } else if (isMac || isLinux) {
        return '/'; // macOS 和 Linux 系统使用斜线作为文件分割符
    } else {
        // 无法确定的情况，可以返回一个通用的文件分割符或者报错
        return '/'; // 可以根据实际情况处理无法确定的情况
    }
}

/*-----html字符串操作*/
// 获取一个html文本中img标签的数量
export const getHtmlInnerImgCount = (htmlString) => {
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    return tempDiv.querySelectorAll('img').length;
}
// 获取一个html文本中video标签的数量
export const getHtmlInnerVideoCount = (htmlString) => {
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    return tempDiv.querySelectorAll('video').length;
}
// 获取一个html文本中文件的数量
export const getHtmlInnerFileCount = (htmlString) => {
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    let cnt = 0;
    let fileLinkList = tempDiv.querySelectorAll('a');
    fileLinkList.forEach(link => {
        if (link.dataset.linkType === LinkType.FILE) {
            ++cnt;// 表示是一个文件，个人自定义的
        }
    })
    return cnt;
}
// 获取一个html文本中语音聊天信息的数量
export const getHtmlInnerPhoneMessageCount = (htmlString) => {
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    let cnt = 0;
    let fileLinkList = tempDiv.querySelectorAll('a');
    fileLinkList.forEach(link => {
        if (link.dataset.linkType === LinkType.PHONE_CHAT) {
            ++cnt;// 表示是一个语音聊天消息，个人自定义的
        }
    })
    return cnt;
}
// 获取一个html文本中视频聊天信息的数量
export const getHtmlInnerPhoneVideoMessageCount = (htmlString) => {
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    let cnt = 0;
    let fileLinkList = tempDiv.querySelectorAll('a');
    fileLinkList.forEach(link => {
        if (link.dataset.linkType === LinkType.PHONE_VIDEO_CHAT) {
            ++cnt;// 表示是一个视频聊天消息，个人自定义的
        }
    })
    return cnt;
}
// 去除html标签，获取里面的文本内容
export const getHtmlInnerText = (input) => {
    if (getHtmlInnerImgCount(input)) {// 存在img标签
        return "[图片]";
    }else if (getHtmlInnerVideoCount(input)) {// 存在video标签
        return "[视频]";
    }else if (getHtmlInnerFileCount(input)) {// 存在文件
        return "[文件]";
    }else if (getHtmlInnerPhoneMessageCount(input)) {// 存在语音聊天消息
        return "[语音聊天]";
    }else if (getHtmlInnerPhoneVideoMessageCount(input)) {// 存在视频聊天消息
        return "[视频聊天]";
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = input;
    return tempDiv.innerText || tempDiv.textContent;
}
// 解析html文本中所有img标签的src属性，并组合成数组返回
export const extractImgSrcWithRegex = (htmlString) => {
    // 使用正则表达式匹配img标签的src属性
    const imgRegex = /<img\s+[^>]*\ssrc\s*=\s*(['"])([^'"]+)\b('")[^>]*>/gi;
    const imgSrc = [];

    // 使用exec方法逐个匹配src属性
    let match;
    while ((match = imgRegex.exec(htmlString)) !== null) {
        // 如果match[2]存在（即src属性存在且非空），则添加到数组中
        if (match[2]) {
            imgSrc.push(match[2]);
        }
    }
    // 返回包含所有src属性值的数组
    return imgSrc;
}
// 解析出html文本中的每一个标签内容
export const processHTMLContent = (htmlContent) => {
    // 使用DOMParser解析HTML字符串
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // 找到最外层的<p>元素
    const pElement = doc.body.querySelector('p');
    if (pElement) {
        // 创建一个数组来存储提取的标签
        const tagArray = [];
        // 遍历<p>标签的所有子节点
        for (let node of pElement.childNodes) {
            // 如果节点是元素节点，则添加到数组中（不包括<br>）
            if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'BR') {
                tagArray.push(node);
            }
            // 没有任何html标签包裹的文字
            if (node.nodeType === Node.TEXT_NODE) {
                // 确保文本是字符串（因为nodeValue可能是其他类型的值）
                const textContent = node.textContent || '';
                // 使用<p>标签包裹文本内容并添加到结果数组中
                tagArray.push(`<p>${textContent}</p>`);
            }
        }
        // 返回提取的标签数组（或做进一步处理）
        return tagArray;
    } else {
        // 如果没有找到<p>标签，则返回错误信息或空数组
        console.error('no <p> tag');
        return [];
    }
}

/*-----------数据转换*/
// base64转Blob
export const base64ToBlob = (base64Data) => {
    const binaryData  = atob(base64Data.split(',')[1]); // 移除Base64头部（如'data:image/png;base64,'）并解码为字节字符串
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer); // 创建Uint8Array用于存放字节数据
    for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i); // 将每个字节字符串转换为字符的Unicode编码，然后放入数组中
    }
    return new Blob([uint8Array.buffer], { type: 'image/png' }); // 使用buffer创建一个Blob对象
}
// base64转图片文件
export const base64ToFile = (base64Data) => {
    // 雪花算法获取图片名称
    let imagTmpName = Math.floor(Date.now() * Math.random()).toString() +
        Math.floor(Math.random() * 1000).toString();
    let blob = base64ToBlob(base64Data); // 将Base64数据转换为Blob对象
    return new File([blob], imagTmpName, { type: blob.type, lastModified: Date.now() }); // 使用Blob对象创建File对象，并设置文件名和最后修改时间等属性
}

/*-----------------生成随机数*/
export const getSnowflake = () => {
    let timestamp = Date.now();
    let epoch = 1577836800000;// 起始时间（毫秒）
    let workerId = 10;// 机器工作ID位数
    let sequence = 12;// 序列号位数

    return ((timestamp - epoch) << 22) |
        (workerId << 12) |
        sequence;
}
