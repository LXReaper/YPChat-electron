export type IFileFormat = {
    MsgTo: string;// 发送给的某人或者某个群聊的id
    name: string;// 文件名称
    type: any;// 文件类型预览图标
    size: string;// 文件大小
    file: File;// 文件
    uploadProgress: number;// 上传进度, 位于[0 - 1]区间
    uploadResult: string;// 上传结果，FileUploadResult
}
