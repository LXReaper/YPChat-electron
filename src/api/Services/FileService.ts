import {base_request} from "../request.ts";
import {api} from "../api.ts";
import {AxiosProgressEvent} from "axios";

export class FileService {
    /**
     * 上传文件
     * @param formData
     * @param handleUploadProgress
     */
    public static uploadFile(
        formData?: FormData,// 文件内容 包含文件file和上传文件请求UploadFileRequest
        handleUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
    ) {
        return base_request(
            "post",
            api.FILE_UPLOAD,
            formData,
            0,// 永不超时
            {
                'Content-Type': 'multipart/form-data'
            },
            (progressEvent: AxiosProgressEvent) =>
                handleUploadProgress?.(progressEvent),
        )
    }
}
