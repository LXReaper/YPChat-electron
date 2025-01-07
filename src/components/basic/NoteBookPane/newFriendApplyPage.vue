<template>
  <!--  新朋友申请页面-->
  <div id="newFriendApplyPage">
    <el-input
        placeholder="账号或名称"
        @change="searchDebounce"
        size="large"
        v-model="searchParam"
        style="position: absolute"
    >
      <template #prefix>
        <el-icon>
          <Search/>
        </el-icon>
      </template>
      <template #suffix>
        <el-icon style="cursor: default" @click="clearInputSearchParam">
          <Close/>
        </el-icon>
      </template>
    </el-input>
    <el-scrollbar v-if="friendApplyData.length" :height="curWinHeight - 120" style="margin-top: 60px">
      <div v-for="(data, i) in friendApplyData" :key="i">
        <div class="apply-info-item">
          <div class="avatar">
            <el-image style="border-radius: 25%" :src="(data as any).userAvatar"/>
          </div>
          <div class="description">
            <div style="font-weight: bolder;font-size: 17pt">{{ (data as any).userName }}</div>
            <div>{{ (data as any).add_method }}</div>
          </div>
          <div class="status-info">
            <button v-if="!(data as any).is_access"  @click="showExamineDialog((data as any).user_id)">
              审核
            </button>
            <text v-if="(data as any).is_access === 1" style="color: #28a745">√已添加</text>
            <text v-if="(data as any).is_access === 2" style="color: red">×已拒绝</text>
            <text v-if="(data as any).is_access === 3" style="color: #aaa">已过期</text>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <el-empty v-else :style="{height: (curWinHeight - 112) + 'px'}"/>

    <!--    审核信息对话框-->
    <el-dialog
        v-model="isShowDialog"
        style="
          height: 78vh;
          backdrop-filter: blur(5px);
          background: rgba(255,255,255,0);
          border-radius: 5%;
        "
        :show-close="false"
    >
      <div style="color: black;padding: 0 8%">
        <div class="dialog_title_style">
          <div class="dialog_title_style_item">审</div>
          <div class="dialog_title_style_item">核</div>
          <div class="dialog_title_style_item">好</div>
          <div class="dialog_title_style_item">友</div>
          <div class="dialog_title_style_item">申</div>
          <div class="dialog_title_style_item">请</div>
        </div>
        <el-form>
          <el-form-item class="yp-form-item">
            <template #label>
              <h3 class="dialog_form_label">是否添加</h3>
            </template>
            <el-select
                v-model="examineParam.isAccess"
                size="large"
                :placeholder="'是否添加'"
            >
              <el-option :value="1" label="添加"/>
              <el-option :value="2" label="拒绝"/>
            </el-select>
          </el-form-item>
          <el-form-item class="yp-form-item" v-if="examineParam.isAccess === 1">
            <template #label>
              <h3 class="dialog_form_label">权限</h3>
            </template>
            <el-select
                v-model="examineParam.auth"
                size="large"
                placeholder="聊天、视频通话等"
            >
              <el-option :value="0" label="聊天、视频通话等"/>
              <el-option :value="1" label="仅聊天"/>
              <el-option :value="2" label="仅视频通话"/>
            </el-select>
            <el-switch
                v-model="examineParam.isIgnore"
                active-text="消息免打扰"
                style="margin-left: 10%"
            />
          </el-form-item>
          <el-form-item class="yp-form-item" v-if="examineParam.isAccess === 1">
            <template #label>
              <h3 class="dialog_form_label">备注</h3>
            </template>
            <el-input
                v-model="examineParam.alias"
                size="large"
            >
              <template #suffix>
                <el-icon style="cursor: default" @click="examineParam.alias = ''">
                  <Close/>
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item class="yp-form-item" v-if="examineParam.isAccess === 1">
            <template #label>
              <h3 class="dialog_form_label">标签</h3>
            </template>
            <el-input
                v-model="tag"
                size="large"
                @keydown.enter="enterTag('标签')"
                @keydown.delete="clearTag('标签')"
            >
              <template #prefix>
                <el-tag
                    v-for="(tagItem, i) in examineParam.tags"
                    :key="i"
                    round
                    closable
                    @close="deleteTag('标签', i)"
                    class="input-tag-style"
                >
                  {{ tagItem }}
                </el-tag>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item class="yp-form-item" v-if="examineParam.isAccess === 1">
            <template #label>
              <h3 class="dialog_form_label">电话号码</h3>
            </template>
            <el-input
                v-model="phone"
                size="large"
                @keydown.enter="enterTag('电话号码')"
                @keydown.delete="clearTag('电话号码')"
            >
              <template #prefix>
                <el-tag
                    v-for="(num, i) in examineParam.phone_num"
                    :key="i"
                    round
                    closable
                    @close="deleteTag('电话号码', i)"
                    class="input-tag-style"
                >
                  {{ num }}
                </el-tag>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
        <div>
          <button class="save-button" @click="examineInfo">确定</button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {Close, Search} from "@element-plus/icons-vue";
import {onMounted, ref} from "vue";
import {UserService} from "../../../api/Services/UserService.ts";
import {ElMessage, ElNotification} from "element-plus";
import {debounce} from "../../../utils/debounceThrottle.ts";
import store from "../../../store";

const curWinHeight = ref(window.outerHeight);
window.addEventListener('resize', () => {
  curWinHeight.value = window.outerHeight;
});

// 查询参数
const searchParam = ref("");
const searchOrder = ref({
  sortField: "is_access",
  sortOrder: "",
})
// 审核用户好友申请参数
const examineParam = ref({
  user_id: "" as any,
  isAccess: 1,
  alias: "",
  auth: 0,
  isIgnore: 0,
  tags: Array<string>(),
  phone_num: Array<string>(),
  description: {
    profile: "",
    pictureList: Array<string>(),
  },
})
// 单个标签
const tag = ref("");
// 单个电话号码
const phone = ref("");

// 查询结果
const friendApplyData = ref([]);

onMounted(() => {
  search();
})

const search = () => {
  UserService.listFriendApplyPageByConditionOrUsingPost({
    request_user_name: searchParam.value,
    userAccount: searchParam.value as any,
    sortOrder: searchOrder.value.sortOrder,
    sortField: searchOrder.value.sortField,
  }).then((res: any) => {
    if (res.code === 0) {
      friendApplyData.value = res.data.records;
    } else ElMessage.error(`数据加载失败${res.message ? `，${res.message}` : ""}`);
  }).catch(() => {
    ElMessage.error("数据加载失败")
  })
}
const searchDebounce = debounce(search, 300);

// 输入框清空搜索参数
const clearInputSearchParam = () => {
  searchParam.value = "";
  searchDebounce();
}

/*审核*/
// 对话框是否显示
const isShowDialog = ref(false);
// 开启审核对话框
const showExamineDialog = (user_id: number) => {
  examineParam.value.user_id = user_id;
  isShowDialog.value = true;
}

/*输入框中的标签*/
// 输入标签内容进数组
const enterTag = (name: string) => {
  switch (name) {
    case '标签':
      if (!tag.value) return;// 不能为空
      examineParam.value.tags.push(tag.value);
      tag.value = "";
      break;
    case '电话号码':
      if (!phone.value) return;// 不能为空
      const regex = /^[0-9]+(\.[0-9]+)?$/;
      if (!regex.test(phone.value)) {
        ElMessage.warning("电话号码只有数字");
        // 只能是数字
        return;
      }
      examineParam.value.phone_num.push(phone.value);
      phone.value = "";
      break;
  }
}
// 清除数组中的标签内容
const clearTag = (name: string) => {
  switch (name) {
    case '标签':
      examineParam.value.tags.pop();
      break;
    case '电话号码':
      examineParam.value.phone_num.pop();
      break;
  }
}
// 只删除指定的标签
const deleteTag = (name: string, id: number) => {
  switch (name) {
    case '标签':
      examineParam.value.tags =
          examineParam.value.tags
              .filter((_, index) => index !== id);
      break;
    case '电话号码':
      examineParam.value.phone_num =
          examineParam.value.phone_num
              .filter((_, index) => index !== id);
      break;
  }
}

// 审核信息
const examineInfo = () => {
  UserService.examineFriendApplyUsingGet({
    userId: examineParam.value.user_id,
    isAccess: examineParam.value.isAccess,
    alias: examineParam.value.alias,
    tags: examineParam.value.tags,
    auth: examineParam.value.auth,
    isIgnore: !examineParam.value.isIgnore ? 0 : 1,
    phone_num: examineParam.value.phone_num,
    description: examineParam.value.description,
  }).then((res: any) => {
    if (res.code === 0) {
      ElNotification.success(`${examineParam.value.isAccess === 1 ? "添加成功" : "已拒绝"}`)
      search();
      store.dispatch("basicData/searchFriends");// 加载好友信息
      store.dispatch("basicData/searchContactor");// 加载联系对象信息
      isShowDialog.value = false;
    } else ElNotification.error("添加失败，" + res.message);
  }).catch((error: any) => {
    ElNotification.error("添加失败" + `${error.message ? `，${error.message}` : ""}`)
  })
}
</script>

<style scoped>
#newFriendApplyPage {
  color: black;
  padding: 1% 8%;
}

#newFriendApplyPage ::v-deep .el-input__wrapper {
  max-width: 30%;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  will-change: transform;
  backface-visibility: hidden;
  z-index: 1;
}
#newFriendApplyPage ::v-deep .el-input__wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid #535bf2;
  border-radius: 15px;
  transform: scaleX(0);
  transition: transform 0.2s ease-in-out;
  z-index: 1;
  pointer-events: none;
}
#newFriendApplyPage ::v-deep .el-input__wrapper:hover::before {
  transform: scaleX(1);
}
#newFriendApplyPage ::v-deep .el-input__wrapper:hover {
  max-width: 58%;
  transform: scale(1.05) translateY(10px) translateZ(0);
  transition: max-width 0.3s cubic-bezier(0.5, 0, 0.5, 1),
  transform 0.3s cubic-bezier(0.5, 0, 0.5, 1);
}
#newFriendApplyPage ::v-deep .el-input__wrapper:not(:hover) {
  max-width: 30%;
  transform: scale(1) translateY(0);
  transition: max-width 0.3s cubic-bezier(0.5, 0, 0.5, 1),
  transform 0.3s cubic-bezier(0.5, 0, 0.5, 1);
}
#newFriendApplyPage ::v-deep .el-input__inner::selection {
  background-color: rgba(173, 216, 230, 0.6);
}

/*申请信息卡片*/
.apply-info-item {
  margin-top: 2%;
  border-radius: 70px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 5px 8px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  padding: 2% 5%;
  box-sizing: border-box;
  user-select: none;

  .avatar {
    width: 80px;
    height: 80px;
    pointer-events: none;
  }

  .description {
    user-select: none;
    display: block;
    padding: 0 5%;
  }

  .status-info {
    /*申请状态*/
    flex: 1;
    text-align: right;
    align-content: center;

    button {
      background: rgba(135, 206, 250, 0.9);
      backdrop-filter: blur(10px);
      transition: background 0.3s cubic-bezier(0.5, 0, 0.5, 1), box-shadow 0.3s ease,
      transform 0.2s cubic-bezier(0.5, 0, 0.5, 1);
      box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2),
      -5px -5px 15px rgba(255, 255, 255, 0.7);
      width: 100px;
      border: none;
      color: white;
    }

    button:hover {
      background: linear-gradient(145deg, #6a5acd, #836fff);
      box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2),
      -3px -3px 10px rgba(255, 255, 255, 0.7);
      transform: translateY(-3px);
    }

    button:not(:hover) {
      background: rgba(135, 206, 250, 0.9);
      transform: translateY(0);
      transition: background 0.3s cubic-bezier(0.5, 0, 0.5, 1),
      transform 0.2s cubic-bezier(0.5, 0, 0.5, 1);
    }

    button:active {
      background: linear-gradient(145deg, #6a5acd, #836fff);
      transform: translateY(2px);
      box-shadow: inset 5px 5px 15px rgba(0, 0, 0, 0.2),
      inset -5px -5px 15px rgba(255, 255, 255, 0.5);
    }
  }
}
.apply-info-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid #535bf2;
  border-radius: 70px;
  transform: scaleX(0);
  transition: transform 0.2s ease-in-out;
  z-index: 1;
  pointer-events: none;
}
.apply-info-item:hover::before {
  transform: scaleX(1);
}

/*对话框样式*/
.dialog_title_style {
  display: flex;
  justify-content: center;
  letter-spacing: 5px;

  .dialog_title_style_item {
    font-weight: bolder;
    font-size: 20pt;
    color: #003366;
    user-select: none;
  }

  .dialog_title_style_item:hover {
    transform: translateY(-5px);
    transition: transform 0.5s ease;
  }

  .dialog_title_style_item:not(:hover) {
    transform: translateY(0) scale(1);
    transition: transform 0.5s ease;
  }
}

.yp-form-item {
  /*表单样式修改*/
  display: block;
}

.yp-form-item ::v-deep .el-input__wrapper {
  /*输入框中标签超出输入框区域时隐藏部分标签*/
  overflow: hidden;
}

.input-tag-style {
  /*输入框中标签样式*/
  color: #1e1e1e;
  margin-right: 5px;

  border: none;
}

.yp-form-item ::v-deep .el-input__wrapper {
  min-width: 100%;
}

.yp-form-item ::v-deep .el-input__inner::selection {
  background-color: rgba(173, 216, 230, 0.6);
}

.yp-form-item ::v-deep .el-select {
  max-width: 60%;
}

.yp-form-item ::v-deep .el-select__wrapper {
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
}

.yp-form-item ::v-deep .el-select__wrapper:hover {
  background: rgba(200, 230, 255, 0.6);
  transform: scale(1.05) translateY(10px);
  transition: background 0.5s ease, transform 0.5s ease;
}

.yp-form-item ::v-deep .el-select__wrapper:not(:hover) {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1);
  transition: background 0.5s ease, transform 0.5s ease;
}

.save-button {
  /*保存按钮*/
  background: rgba(255, 255, 255, 0.5);
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 16px;
  color: #333;
  transition: background 0.3s ease;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.save-button:hover {
  background: rgba(230, 240, 255, 0.8);
  transform: translateY(-3px) scale(1.03);
  transition: transform 0.3s ease;
}

.save-button:not(:hover) {
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(0) scale(1);
  transition: background 0.5s ease, transform 0.5s ease-in-out;
}

.dialog_form_label {
  color: #aaa;
  user-select: none;
}
</style>
