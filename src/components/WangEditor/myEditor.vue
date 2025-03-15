<template>
  <!--  文本编辑器-->
  <div style="border: 1px solid #ccc; z-index: 2;">
    <Toolbar
        style="-webkit-app-region: no-drag"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
    />
    <Editor
        :style="{
        height: `${props.height}`,
        maxWidth: `${props.width}`,
        overflowY: 'hidden',
      }"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="handleChange"
        @onDestroyed="handleDestroyed"
        @onFocus="handleFocus"
        @onBlur="handleBlur"
        @keydown.enter="enterEvent"
        @customAlert="customAlert"
        @customPaste="customPaste"
    />
  </div>
</template>
<script setup lang="ts">
// @ts-nocheck
import "@wangeditor/editor/dist/css/style.css"; // 引入 css

import {
  onBeforeUnmount,
  ref,
  shallowRef,
  withDefaults,
  defineProps,
  watch, onMounted,
} from "vue";
import {Editor, Toolbar} from "@wangeditor/editor-for-vue";
import {Boot, DomEditor, IDomEditor} from '@wangeditor/editor'
import {myButtonMenu} from './myButtonMenu.js'
import store from "../../store";
import {ElMessage, ElMessageBox, ElNotification} from "element-plus";
import {extractImgSrcWithRegex, getHtmlInnerImgCount} from "../../utils/StringUtils.js";
import {MsgTypeConstant} from "../../constant/MsgTypeConstant.ts";
import {setCurContactorInfoStorage} from "../../utils/storageUtil.ts";

interface Props {
  valueHtml: string;
  placeholder: string;
  readOnly: boolean;
  maxLength: number;
  showWordCount: boolean;
  height: string;
  width: string;
  handleChangeText: (v: string) => void;
  handleChangeHtml: (v: string) => void;
  handleOutputText: (v: string) => void;
  handleOutputHtml: (v: string) => void;
  handleOutputStatus: (v: boolean) => void;
  handleIsFocus: (v: boolean) => void;
}

const props = withDefaults(defineProps<Props>(), {
  valueHtml: () => "", //文本内容
  placeholder: () => "请输入内容...", //提示内容
  readOnly: false, //是否只读
  maxLength: 2000, //文本内容最大数量
  showWordCount: false, //是否显示字数提示
  height: "300px", //编辑器的高度
  width: "670px", //编辑器的宽度
  handleChangeText: (v: string) => {
    //外部获取编辑器组件中的Text内容
    console.log(v);
  },
  handleChangeHtml: (v: string) => {
    //外部获取编辑器组件中的Html内容
    console.log(v);
  },
  handleOutputText: (v: string) => {
    //按下回车键后发送的文本内容
    console.log(v)
  },
  handleOutputHtml: (v: string) => {
    //按下回车键后发送的html文本内容
    console.log(v)
  },
  handleOutputStatus: (v: boolean) => {
    //处理输出状态，是否按下回车键
    console.log(v);
  },
  handleIsFocus: (v: boolean) => {
    // 处理是否聚焦
  }
});

/*判断当前按下的按键类型*/
// 判断当前是否按下键盘回车键
const isEnterKey = ref(false);
const enterStatus = ref(false);
// 判断当前是否同时按下shift+enter
const isShiftEnter = ref(false);

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 内容 HTML（文本框中的内容）
const valueHtml = ref(props.valueHtml);

//模式
const mode = ref("simple"); //simple
//工具栏配置
const toolbarConfig = {
  toolbarKeys: [
    "emotion",// 表情
  ],
  insertKeys: {
    index: 1,
    keys: ['phoneMenu', 'phoneVideoMenu', 'cutPictureMenu', 'recordAudioMenu']
  },
};
//编辑器配置
const editorConfig = {
  placeholder: props.placeholder,
  readOnly: props.readOnly,
  maxLength: props.maxLength,
  showWordCount: props.showWordCount,
  focus: true,
};

/**
 * 监听props.valueHtml变化
 */
watch(
    () => props.valueHtml,
    () => {
      valueHtml.value = props.valueHtml;
    }
);
/**
 * 监听props.height变化
 */
watch(() => props.height,
    () => {
      console.log(editorRef.value.getConfig())
    }
);

/*自定义工具栏菜单*/
const menu1Conf = {
  key: 'phoneMenu', // 定义唯一的 menu key，电话
  factory: () => {
    let phone = new myButtonMenu(this); // 使用箭头函数以避免 `this` 问题
    phone.setTitle('电话');
    phone.setIcon(`
      <svg t="1731581407881" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8064" width="16" height="16">
        <path d="M446.756571 194.706286c33.792 52.882286 47.055238 90.307048 35.596191 136.655238-5.948952 24.405333-18.236952 40.033524-40.569905 58.709333l-22.991238 18.748953-2.779429 2.194285-15.36 11.580953c-10.410667 8.045714-14.482286 12.55619-15.262476 15.311238-4.681143 16.579048 3.218286 38.497524 22.016 67.876571 31.256381 48.615619 67.779048 89.941333 112.396191 126.122667 30.134857 24.478476 47.786667 33.718857 60.147809 31.256381 9.752381-1.950476 17.212952-7.68 34.450286-26.258286l7.021714-7.484952c26.843429-28.135619 45.494857-40.789333 77.238857-45.568 45.29981-6.802286 79.725714 7.94819 119.369143 40.71619l11.800381 10.069333 12.239238 10.72762 25.721905 21.504c40.667429 34.791619 61.488762 64.804571 58.416762 106.203428-2.31619 30.110476-15.872 48.176762-43.715048 72.094476l-6.314666 5.412572a288.914286 288.914286 0 0 0-5.022476 4.486095l-16.091429 14.969905-8.484571 7.753143a187.733333 187.733333 0 0 1-22.747429 17.627428c-47.079619 30.524952-103.984762 45.031619-167.643429 43.081143-55.02781-1.706667-101.010286-16.798476-156.330666-46.08-74.99581-39.716571-138.118095-93.817905-209.676191-173.641143-68.144762-75.971048-118.930286-154.819048-147.626666-236.836571-40.155429-114.834286-20.72381-237.372952 49.200761-316.537905 5.729524-6.509714 9.99619-10.727619 18.895239-18.285714l25.404952-21.089524 12.434286-10.922667c19.065905-16.481524 32.134095-24.30781 52.809143-28.184381 48.713143-9.142857 82.895238 15.701333 117.418666 64.902095l6.509714 9.581715 5.851429 8.923428 15.676952 24.380953z m-86.552381 166.741333l12.921905-9.752381 5.802667-4.827428 15.603809-12.629334c11.166476-9.337905 15.433143-14.726095 16.822858-20.333714 4.87619-19.846095-1.682286-40.252952-22.430477-73.776762l-3.803428-6.046476-23.137524-35.669334c-20.796952-30.695619-35.181714-41.862095-47.201524-39.594666-4.315429 0.804571-8.411429 3.145143-16.530286 9.971809l-14.945523 13.068191-20.821334 17.237333c-7.801905 6.509714-11.385905 9.801143-14.531047 13.165714l-5.778286 6.753524c-48.128 58.904381-61.366857 150.674286-30.573714 238.762667 25.136762 71.850667 70.851048 142.848 133.046857 212.163048 66.31619 73.97181 123.270095 122.806857 189.44 157.842285 46.275048 24.502857 82.236952 36.303238 124.342857 37.595429 49.298286 1.536 91.526095-9.264762 125.635048-31.353905 4.193524-2.706286 8.728381-6.290286 14.482285-11.410286l3.608381-3.242666 19.992381-18.627048 6.192762-5.485714 6.485333-5.558857c14.019048-12.04419 18.066286-17.456762 18.432-22.113524 0.731429-9.898667-7.728762-22.77181-28.672-41.350095l-4.36419-3.803429c-4.071619-3.486476-20.577524-17.091048-24.405333-20.382476l-18.041905-15.774476-6.680381-5.607619c-24.697905-20.358095-41.642667-27.477333-61.561905-24.478477-11.50781 1.706667-19.480381 7.143619-35.986286 24.551619l-10.556952 11.264c-24.380952 25.575619-40.911238 37.302857-68.656762 42.861715-42.349714 8.484571-73.313524-7.728762-120.612571-46.177524-50.761143-41.155048-92.452571-88.33219-127.902476-143.433143-29.525333-46.201905-43.081143-83.748571-30.841905-127.171048 6.582857-23.527619 19.894857-37.64419 45.226666-56.636952z" p-id="8065" />
      </svg>
    `);
    phone.setExec((editor) => {
      // 发起电话
      let isElectron = store.state.basicData.isElectron;
      if (isElectron) {
        //获取自定义electronAPI上下文
        let electron = (window as any).electronAPI;
        electron.sendMessage('openChildWindow', {
          winName: "phone_chat",
          path: "/phone/chat",
          resizable: false,
          x: 300,
          y: 150,
          width: 400,
          height: 760,
          maximizable: false, //不允许放大
          transportObj: JSON.stringify({
            ...store.getters["basicData/getCurContactor"],
            msgType: MsgTypeConstant.JOIN_ROOM,
          }),
        })
      }else {
        setCurContactorInfoStorage({
          ...store.getters["basicData/getCurContactor"],
          msgType: MsgTypeConstant.JOIN_ROOM,
        });
        window.open("/#/phone/chat", "_blank");
      }
    });
    return phone;
  }
};
const menu2Conf = {
  key: 'phoneVideoMenu', // 定义唯一的 menu key，视频电话
  factory: () => {
    let phoneVideoMenu = new myButtonMenu(this); // 使用箭头函数以避免 `this` 问题
    phoneVideoMenu.setTitle('视频电话');
    phoneVideoMenu.setIcon(`
      <svg t="1731580917829" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4278" width="16" height="16">
        <path d="M973.386667 252.746667l-160 91.04a5.333333 5.333333 0 0 1-7.946667-4.64V176a5.333333 5.333333 0 0 0-5.333333-5.333333H48a5.333333 5.333333 0 0 0-5.333333 5.333333v672a5.333333 5.333333 0 0 0 5.333333 5.333333h752a5.333333 5.333333 0 0 0 5.333333-5.333333v-163.146667a5.333333 5.333333 0 0 1 7.946667-4.64l160 91.04a5.333333 5.333333 0 0 0 7.946667-4.586666v-509.333334a5.333333 5.333333 0 0 0-7.84-4.586666zM725.333333 778.666667H122.666667a5.333333 5.333333 0 0 1-5.333334-5.333334V250.666667a5.333333 5.333333 0 0 1 5.333334-5.333334h602.666666a5.333333 5.333333 0 0 1 5.333334 5.333334v522.666666a5.333333 5.333333 0 0 1-5.333334 5.333334z m173.333334-135.733334l-90.666667-51.573333a5.333333 5.333333 0 0 1-2.666667-4.586667V437.333333a5.333333 5.333333 0 0 1 2.666667-4.586666l90.666667-51.573334a5.333333 5.333333 0 0 1 7.946666 4.64v252.586667a5.333333 5.333333 0 0 1-7.893333 4.533333z" p-id="4279" />
      </svg>
    `);
    phoneVideoMenu.setExec((editor) => {
      // 发起视频电话
      let isElectron = store.state.basicData.isElectron;
      if (isElectron) {
        //获取自定义electronAPI上下文
        let electron = (window as any).electronAPI;
        electron.sendMessage('openChildWindow', {
          winName: "video_chat",
          path: "/video/chat",
          resizable: false,
          x: 300,
          y: 150,
          width: 400,
          height: 760,
          maximizable: false, //不允许放大
          transportObj: JSON.stringify({
            ...store.getters["basicData/getCurContactor"],
            msgType: MsgTypeConstant.JOIN_ROOM,
          }),
        })
      }else {
        setCurContactorInfoStorage({
          ...store.getters["basicData/getCurContactor"],
          msgType: MsgTypeConstant.JOIN_ROOM,
        });
        window.open("/#/video/chat", "_blank");
      }
    })
    return phoneVideoMenu;
  }
};
const cutMenu3Conf = {
  key: 'cutPictureMenu', // 定义截图工具
  factory: () => {
    let cutPictureMenu = new myButtonMenu(this);
    cutPictureMenu.setTitle('截图');
    cutPictureMenu.setIcon(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
        <path fill="currentColor" d="
          m512.064 578.368-106.88 152.768a160 160 0 1 1-23.36-78.208L472.96 522.56 196.864 128.256a32 32 0 1 1 52.48-36.736l393.024 561.344a160 160 0 1 1-23.36 78.208l-106.88-152.704zm54.4-189.248 208.384-297.6a32 32 0 0 1 52.48 36.736l-221.76 316.672-39.04-55.808zm-376.32 425.856a96 96 0 1 0 110.144-157.248 96 96 0 0 0-110.08 157.248zm643.84 0a96 96 0 1 0-110.08-157.248 96 96 0 0 0 110.08 157.248" />
      </svg>
    `)
    cutPictureMenu.setExec((editor) => {
      let isElectron = store.state.basicData.isElectron;
      if (isElectron) {
        // 发起截图
        let electron = (window as any).electronAPI;
        electron.sendMessage('screenshots-start', {});
      }
    })
    return cutPictureMenu;
  }
}
const recordAudioMenu4Conf = {
  key: 'recordAudioMenu', // 定义录制音频工具
  factory: () => {
    let recordAudioMenu = new myButtonMenu(this);
    recordAudioMenu.setTitle('录音');
    recordAudioMenu.setIcon(`
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path fill="currentColor" d="
            M512 128a128 128 0 0 0-128 128v256a128 128 0 1 0 256 0V256a128 128 0 0 0-128-128m0-64a192 192 0 0 1 192 192v256a192 192 0 1 1-384 0V256A192 192 0 0 1 512 64m-32 832v-64a288 288 0 0 1-288-288v-32a32 32 0 0 1 64 0v32a224 224 0 0 0 224 224h64a224 224 0 0 0 224-224v-32a32 32 0 1 1 64 0v32a288 288 0 0 1-288 288v64h64a32 32 0 1 1 0-64z
          "/>
       </svg>
    `);
    recordAudioMenu.setExec((editor) => {
      if (!recordAudioMenu.getStatus()) {
        // 开始录音
        recordAudioMenu.setStatus(true);
        ElNotification({
          title: "开始录音",
          type: "success",
        })
      }else {
        // 结束录音
        recordAudioMenu.setStatus(false);
        ElNotification({
          title: "结束录音",
          type: "warning",
        })
      }
    })
    return recordAudioMenu;
  }
}
const module = {
  menus: [menu1Conf, menu2Conf, cutMenu3Conf, recordAudioMenu4Conf]
}

/*组件事件*/
// 组件加载时
onMounted(() => {
  let isElectron = store.state.basicData.isElectron;
  if (isElectron) {
    // 监听截图发送
    let electron = window.electronAPI;
    electron.onReceiveMessage("screenshots-ok", (args: any) => {
      console.log('screenshots-ok', args);
      console.log('screenshots-ok', args.filePath);// 图片存放的临时路径
      if (editorRef.value && args.base64) {
        let editor = editorRef.value;
        // 插入截图图片base64数据
        editor.dangerouslyInsertHtml(`<img src='${args.base64}' style="width: 100px;height: 100px" />`)
      }
    })
  }
})
// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

/**
 * 创建事件
 * @param editor
 */
const handleCreated = (editor: any) => {
  editorRef.value = Object.seal(editor); // 记录 editor 实例，重要！

  /*自定义工具栏菜单*/
  // 注册。要在创建编辑器之前注册，且只能注册一次，一定要判断，不可重复注册。
  if (editorRef.value && !editorRef.value.getAllMenuKeys()?.includes("phoneMenu")) {
    //判断如果已经插入进去，不在二次插入
    Boot.registerModule(module);
  }
};
/**
 * 编辑器中的文字发生变化
 * @param editor
 */
const handleChange = (editor: any) => {
  let curText = editor.getText();
  let curHtml = editor.getHtml(); //.replace(/<p>/g, "<div>").replace(/<\/p>/g, "</div>")

  if (isEnterKey.value) {
    // 按下回车键将内容输出
    editor.setHtml("<p></p>");
    props.handleOutputStatus(enterStatus.value);
    props.handleOutputText(curText);
    // 删除按下回车键后末尾的<p><br></p>标签
    props.handleOutputHtml(curHtml.replace(/<p>\s*<br>\s*<\/p>$/, ''));
  }
  if (isShiftEnter.value) {
    // 同时按下shift和回车键
  }

  // 重置按键
  isEnterKey.value = false;
  isShiftEnter.value = false;
  props.handleChangeText(editor.getText());
  props.handleChangeHtml(editor.getHtml());
};
const handleDestroyed = (editor: any) => {
  console.log("destroyed", editor);
};
const handleFocus = (editor: any) => {
  console.log("focus", editor);
  props.handleIsFocus(true);
};
const handleBlur = (editor: any) => {
  console.log("blur", editor);
  props.handleIsFocus(false);
};
const customAlert = (info: any, type: any) => {
  ElMessage.warning(`【自定义提示】${type} - ${info}`);
};
const customPaste = (editor: IDomEditor, event: any, callback: any) => {
  console.log("ClipboardEvent 粘贴事件对象", event);

  let files = event.clipboardData.files;
  let dataTransFerItems = event.clipboardData.items;
  let pasteDataTypes = event.clipboardData.types as Array<string>;// 有['Files']，['text/plain', 'text/html']

  // console.log(event.clipboardData);
  // console.log(event.clipboardData.files);
  // console.log(event.clipboardData.files[0]);
  // console.log(event.clipboardData.files[0].type);
  // console.log(event.clipboardData.types);
  // console.log(editor)

  // const html = event.clipboardData.getData('text/html') // 获取粘贴的 html
  const text = event.clipboardData.getData('text/plain') // 获取粘贴的纯文本
  // const rtf = event.clipboardData.getData('text/rtf') // 获取 rtf 数据（如从 word wsp 复制粘贴）

  // 返回 false ，阻止默认粘贴行为
  event.preventDefault();

  if (pasteDataTypes && pasteDataTypes[0] && pasteDataTypes.includes('Files')) {// 有文件类型数据
    if (files[0] && files[0].type.includes('image/')) {// 是图片
      if (getHtmlInnerImgCount(editor.getHtml()) === 9) {// 编辑器中图片数量超过9
        ElMessage.warning("图片最多允许一次性插入9张");
        return;
      }

      // 创建一个FileReader实例
      let reader = new FileReader();
      // 添加onload事件处理器，当文件读取完成后执行
      reader.onload = function (event) {
        // event.target.result 将包含Base64编码的字符串
        let base64Data = event.target.result;
        // 插入编辑器中
        editor.dangerouslyInsertHtml(`<img src='${base64Data}' style="width: 150px;height: 100px" />`)
      };
      // 以DataURL的形式读取文件，这将自动将文件转换为Base64编码
      reader.readAsDataURL(files[0]); // 如果是非File对象，需要先转为Blob或URL等其他形式
    } else {// 普通文件 todo

    }
  } else {
    // 非文件类型
    editor.insertText(text);
  }
  callback(false); // 返回值（注意，vue 事件的返回值，不能用 return）
};


/*自定义按键事件*/
//监听回车事件
const enterEvent = (e: any) => {
  if (!e.shiftKey && e.key === 'Enter') {
    console.log('按下了回车键');
    // 处理回车键的操作，设置当前按下了回车键
    isEnterKey.value = true;
    enterStatus.value = !enterStatus.value;
  } else if (e.shiftKey && e.key === 'Enter') {
    console.log('按下了shift和回车键');
    // 处理shift回车键的操作，设置当前按下了shift和回车键
    isShiftEnter.value = true;
  }
}
</script>

<style>
.w-e-full-screen-container {
  background-color: white !important;
}

.w-e-bar svg {
  /*工具栏菜单图标样式*/
  width: 25px;
  height: 40px;
}

.w-e-bar-item {
  .title {
    margin: 3.1vh auto 30px 0.5vw !important;
  }
}

.w-e-text-container {
  .w-e-scroll {
    #w-e-textarea-5 #w-e-element-35 {
      margin: 10px 0 !important;
    }
  }
}
</style>
