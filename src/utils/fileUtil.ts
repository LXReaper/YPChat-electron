import Folder from "../components/MyIcons/fileIcon/folder.vue";
import CompressedPackage from "../components/MyIcons/fileIcon/compressed-package.vue";

import PdfFile from "../components/MyIcons/fileIcon/pdf-file.vue";
import DocxFile from "../components/MyIcons/fileIcon/docx-file.vue";
import DocFile from "../components/MyIcons/fileIcon/doc-file.vue";
import PptxFile from "../components/MyIcons/fileIcon/pptx-file.vue";
import PptFile from "../components/MyIcons/fileIcon/ppt-file.vue";
import UnKnownfile from "../components/MyIcons/fileIcon/unKnownfile.vue";
import JpegFile from "../components/MyIcons/fileIcon/jpeg-file.vue";
import PngFile from "../components/MyIcons/fileIcon/png-file.vue";
import VideoFile from "../components/MyIcons/fileIcon/video-file.vue";
import AudioFile from "../components/MyIcons/fileIcon/audio-file.vue";



// 将仅以Bytes为单位的数字转为合适的单位
export const formatFileSize = (size: any) => {
    if (typeof size !== 'number' || isNaN(size)) {
        throw new Error("size必须为数字");
    }
    if (size < 1024) {
        return size + ' B';
    } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + ' KB';
    } else if (size < 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
        return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
}

// 传入文件
export const isDirectory = (file: File) => {
    return !!file.webkitRelativePath; // 如果有该属性，说明是文件夹
}

// 传入事件的event.dataTransfer.items的其中某个数据判断是否为文件夹
export const isFolder = (item: any) => {
    // 获取文件条目
    const entry = item.webkitGetAsEntry();
    // 1、先判断是否为文件夹
    if (entry && entry.isDirectory) {
        return Folder;
    }
}

// 传入事件的event.dataTransfer.items的其中某个数据返回文件对应的图标vue组件
export const getIconComponent = (item: any) => {
    // 1、先判断是否为文件夹
    if (isFolder(item)) {
        return Folder;
    }

    const file = item.getAsFile();
    return getIconComponentByFile(file);
}

export const getIconComponentByFile = (file: File) => {
    if (isDirectory(file)) {
        return Folder;
    }
    return getIconComponentByFileType(file.type);
}

export const getIconComponentByFileType = (fileType: string) => {
    switch (fileType) {
        // 压缩包
        case "application/x-zip-compressed": // zip
        case "application/x-compressed": // rar
            return CompressedPackage;
        // 文本文件类型
        case "text/plain" : return UnKnownfile;
        case "application/pdf" : return PdfFile;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : return DocxFile;
        case "application/msword" : return DocFile;
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation" : return PptxFile;
        case "application/vnd.ms-powerpoint" : return PptFile;

        // 图片类型
        case "image/jpeg" : return JpegFile;
        case "image/png" : return PngFile;

        // 视频类型
        case "video/mp4" :
        case "video/webm" :
        case "video/ogg" :
        case "video/x-msvideo" :
        case "video/x-matroska" :
        case "video/quicktime" :
        case "video/x-ms-wmv" :
            return VideoFile;

        // 音频类型
        case "audio/mpeg" :
        case "audio/wav" :
        case "audio/ogg" :
        case "audio/aac" :
        case "audio/flac" :
        case "audio/mp4" :
            return AudioFile;

    }
    if (fileType.includes('video')) return VideoFile;// 视频
    if (fileType.includes('audio')) return AudioFile;// 音频
    return UnKnownfile;
}

