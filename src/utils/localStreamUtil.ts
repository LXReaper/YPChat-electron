
// 获取本地音视频流
export const getLocalStream = (constraints: any) => {
    return new Promise((resolve, reject) => {
        // 获取媒体流
        navigator.mediaDevices.getUserMedia(constraints).then((localStream: MediaStream) => {
            console.log("本地音视频流：" + localStream);
            resolve(localStream);
        }).catch(error => {
            if (error.name === 'NotFoundError'
                || (error.name === 'NotReadableError' && error.message.includes("Device in use"))) { // 检查是否是因为找不到设备导致的错误
                console.error('找不到可用媒体设备：', error);
                // 如果是视频设备出现问题，可以尝试仅请求音频流
                navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(audioOnlyStream => { // 只请求音频流
                    console.log('已获取本地音频流:', audioOnlyStream);
                    resolve(audioOnlyStream); // 将音频流作为降级方案提供
                }).catch(audioError => {
                    console.error('获取音频流也失败:', audioError);
                    reject('获取媒体流失败'); // 如果连音频流也无法获取，则拒绝Promise
                });
            } else if (error.name === 'PermissionDeniedError') { // 用户拒绝访问权限导致的错误
                console.error('用户拒绝了访问媒体设备的权限:', error);
                // 这里可以选择提醒用户开启权限或者做其他处理
            } else { // 其他类型的错误
                console.error('获取本地音视频流发生未知错误:', error);
                reject('获取本地音视频流错误'); // 未知错误时拒绝Promise
            }
        });
    });
}

// 获取本地屏幕的音视频流
export const getLocalDisplayMediaStream = (constraints: any) => {
    return new Promise((resolve, reject) => {
        // 获取媒体流
        navigator.mediaDevices.getUserMedia(constraints).then((localStream: MediaStream) => {
            console.log("本地屏幕音视频流：" + localStream);
            resolve(localStream);
        }).catch(error => {
            if (error.name === 'NotAllowedError') {
                console.error('用户拒绝了屏幕共享请求。');
            } else if (error.name === 'NotFoundError') {
                console.error('没有找到可用于共享的屏幕或窗口。');
            } else if (error.name === 'NotReadableError') {
                console.error('屏幕共享流不可读取。');
            } else {
                console.error('发生错误:', error);
            }
            reject(error);
        });
    });
}

/**
 * detail，应将曲目视为视频细节格外重要。例如，带有文本内容、绘画或线条艺术的演示文稿或网页。设置该值时 MediaStreamTrack.kind的值必须为"video"。
 * text，轨道应该被视为视频细节特别重要，并且明显的锐利边缘和颜色一致的区域可能经常出现。例如，带有文本内容的演示文稿或网页。设置该值时 MediaStreamTrack.kind的值必须为"video"。
 * motion，应将轨道视为包含运动很重要的视频。例如，网络摄像头视频、电影或视频游戏。设置该值时 MediaStreamTrack.kind的值必须为"video"。
 */
export const setVideoTrackContentHints = (
    stream: MediaStream,
    hint: 'detail' | 'text' | 'motion'
) => {
    const tracks = stream.getVideoTracks();
    tracks.forEach((track) => {
        track.contentHint = hint;
        console.log('setVideoTrackContentHints', track.id, hint);
    });
}

/**
 * music，该曲目应被视为包含音乐。设置该值时 MediaStreamTrack.kind的值必须为"audio"。
 * speech，该轨道应被视为包含语音数据。设置该值时 MediaStreamTrack.kind的值必须为"audio"。
 * speech-recognition，该轨道应被视为包含用于机器语音识别的数据。设置该值时 MediaStreamTrack.kind的值必须为"audio"。
 */
export const setAudioTrackContentHints = (
    stream: MediaStream,
    hint: 'music' | 'speech' | 'speech-recognition'
) => {
    const tracks = stream.getAudioTracks();
    tracks.forEach((track) => {
        track.contentHint = hint;
        console.log('setAudioTrackContentHints', track.id, hint);
    });
}

/*具体参考<a>https://miaoxingyun.com/api/MediaTrackSettings.html</a>*/
/** interface MediaTrackConstraints extends MediaTrackConstraintSet {
 *     advanced?: MediaTrackConstraintSet[];
 * }
 *
 * interface MediaTrackSettings {
 *     aspectRatio?: number;// 这是图像的在其高度以像素为单位划分像素的宽度。
 *     autoGainControl?: boolean;// 如果启用了自动增益控制，其是 true，否则为 false。
 *     channelCount?: number;// 一个长整型，表示 channelCount 属性当前的值，指定当前轨道上音频通道的数目（因而指示了音频取样在各存在多少音频帧）。单声道为 1，立体声为 2，以此类推。
 *     deviceId?: string;// 设备 ID 是一个当前源唯一字符串标识的轨迹的源
 *     displaySurface?: string;// 指定轨道包含的源类型
 *     echoCancellation?: boolean;// 如果启用回声消除则为 true，否则为 false
 *     facingMode?: string;// 指定摄像机面对的方向。该值是这其中一个：user（面向用户的相机），environment（背向用户的照相机），left（面向用户左侧环境的相机），right（面向用户右侧环境的相机）
 *     frameRate?: number;// 指定每秒轨道包括视频的多少帧。如果由于任何原因无法确定该值，则该值将匹配用户代理正在运行的设备的垂直同步速率。
 *     groupId?: string;// 分组 ID 是一个浏览会话唯一字符串识别轨道的源组
 *     height?: number;// 指定轨道的视频数据的像素高度
 *     noiseSuppression?: boolean;// 如果启用了噪声抑制是 true，否则为 false
 *     sampleRate?: number;// 指定在每个音频数据每秒的采样率
 *     sampleSize?: number;// 指示每个音频样本的线性大小。例如 CD 质量的音频是 16 位的，则这个值是在这种情况下是 16。
 *     width?: number;// 指定轨道的视频数据的像素宽度
 * }
*/
export async function handleConstraints(data: {
    frameRate: number;
    height: number;
    stream: MediaStream;
}): Promise<number> {
    const { frameRate, height, stream } = data;
    const queue: Promise<any>[] = [];
    console.log('开始设置约束', JSON.stringify({ height, frameRate }));
    stream.getTracks().forEach((track) => {
        if (track.kind === 'video') {
            queue.push(
                track.applyConstraints({// MediaTrackConstraints
                    height: { ideal: height },
                    frameRate: { ideal: frameRate },
                })
            );
        }
    });
    try {
        await Promise.all(queue);
        console.log('设置设置约束成功');
        return 1;
    } catch (error) {
        console.error('设置设置约束失败', error);
        return 0;
    }
}
