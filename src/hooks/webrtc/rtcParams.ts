import { ref } from 'vue';

export const useRTCParams = () => {
    // 最大码率
    const maxBitrate = ref([
        {
            label: '1',
            value: 1,
            disabled: false,
        },
        {
            label: '10',
            value: 10,
            disabled: false,
        },
        {
            label: '1000',
            value: 1000,
            disabled: false,
        },
        {
            label: '2000',
            value: 2000,
            disabled: false,
        },
        {
            label: '3000',
            value: 3000,
            disabled: false,
        },
        {
            label: '4000',
            value: 4000,
            disabled: false,
        },
        // {
        //   label: '5000',
        //   value: 5000,
        //   disabled: false,
        // },
        // {
        //   label: '6000',
        //   value: 6000,
        //   disabled: false,
        // },
        // {
        //   label: '7000',
        //   value: 7000,
        //   disabled: false,
        // },
        // {
        //   label: '8000',
        //   value: 8000,
        //   disabled: false,
        // },
    ]);
    // 最大帧数
    const maxFramerate = ref([
        {
            label: '1帧',
            value: 1,
            disabled: false,
        },
        {
            label: '10帧',
            value: 10,
            disabled: false,
        },
        {
            label: '20帧',
            value: 20,
            disabled: false,
        },
        {
            label: '30帧',
            value: 30,
            disabled: false,
        },
        {
            label: '60帧',
            value: 60,
            disabled: false,
        },
        {
            label: '120帧',
            value: 120,
            disabled: false,
        },
    ]);
    // 视频分辨率
    const resolutionRatio = ref([
        {
            label: '360P',
            value: 360,
            disabled: false,
        },
        {
            label: '540P',
            value: 540,
            disabled: false,
        },
        {
            label: '720P',
            value: 720,
            disabled: false,
        },
        {
            label: '1080P',
            value: 1080,
            disabled: false,
        },
        {
            label: '1440P',
            value: 1440,
            disabled: false,
        },
        {
            label: '2160P',
            value: 2160,
            disabled: false,
        },
    ]);
    // 视频内容配置
    const videoContentHint = ref([
        {
            label: '默认',
            value: '',
            disabled: false,
        },
        {
            label: '运动',
            value: 'motion',
            disabled: false,
        },
        {
            label: '文本',
            value: 'text',
            disabled: false,
        },
        {
            label: '平衡',
            value: 'detail',
            disabled: false,
        },
    ]);
    // 音频内容配置
    const audioContentHint = ref([
        {
            label: '默认',
            value: '',
            disabled: false,
        },
        {
            label: '音乐',
            value: 'music',
            disabled: false,
        },
        {
            label: '语言',
            value: 'speech',
            disabled: false,
        },
        {
            label: '语音识别',
            value: 'speech-recognition',
            disabled: false,
        },
    ]);

    return {
        maxBitrate,
        maxFramerate,
        resolutionRatio,
        videoContentHint,
        audioContentHint,
    };
};
