<template>
  <!--  左边消息栏-->
  <div id="messageHistoryPage">
    <!--    消息栏的搜索框-->
    <div class="header-bar">
      <div class="searchBar">
        <el-input placeholder="搜索">
          <template #prefix>
            <el-icon>
              <Search/>
            </el-icon>
          </template>
        </el-input>
      </div>
      <!--      消息栏的发起群聊按钮-->
      <div class="header-button">
        <el-button style="width: 90%">
          <el-icon>
            <Plus/>
          </el-icon>
        </el-button>
      </div>
    </div>
    <!--    联系对象信息展示-->
    <div v-if="contactorList.length > 0" class="messageTab" @click="clickTable">
      <el-scrollbar :height="props.height">
        <div v-for="(item, i) in contactorList" :key="item.id">
          <div
              @contextmenu.prevent="(event) => showMenu(event, i)"
              :style="{
            backgroundColor: (item.isTop ? '#ebebeb' : (selectChatItemId === item.id ? '#e0e0df'
            : (hoverChatItemIndex === item.id ? '#f0f0f0' : '#fff')))
          }">
            <div
                class="conversation-item"
                @mouseover="hoverChatItemIndex = item.id"
                @mouseout="hoverChatItemIndex = -1"
                @click="selectChatContactor(item, i)"
            >
              <div class="header">
                <el-badge
                    v-if="(item as any).newMessageCount"
                    :value="
                        (item as any).newMessageCount + ((item as any).newMessageCount > 99 ? '+' : '')
                    "
                    :is-dot="(item as any).isIgnore"
                >
                  <el-image
                      class="avatar"
                      :src="(item as any).contactHeadImgUrl"
                  />
                </el-badge>
                <el-image
                    class="avatar"
                    :src="(item as any).contactHeadImgUrl"
                    v-else
                />
              </div>
              <div class="content-container">
                <div class="title-time-container">
                  <p class="title">{{ (item as any).nick_name }}</p>
                  <p class="time">
                    {{
                      moment((item as any).last_contact_time)
                          .format(`
                          ${
                              moment((item as any).last_contact_time).isSame(moment(), 'day')
                                  ? "h:mm" : "YYYY/M/DD"
                          }`)
                    }}
                  </p>
                </div>
                <div
                    class="content"
                    style="max-width: 100%;"
                >
                  <text>
                    {{ getHtmlInnerText((item as any).last_receive_message) }}
                  </text>
                  <text v-if="(item as any).isIgnore">
                    <el-icon>
                      <MuteNotification/>
                    </el-icon>
                  </text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>

    </div>
    <el-empty v-else/>
    <!--      右键弹出菜单-->
    <div
        v-if="menuVisible"
        @mouseleave="menuVisible = false"
        :style="{ top: `${menuY}px`, left: `${menuX}px`, backgroundColor: '#fff' }"
        class="context-menu"
    >
      <ul>
        <li
            @click="menuAction('top')"
            v-if="curRightDownContactor && !curRightDownContactor.isTop"
        >
          置顶
        </li>
        <li
            @click="menuAction('down')"
            v-if="curRightDownContactor && curRightDownContactor.isTop"
        >
          取消置顶
        </li>
        <li
            @click="menuAction('msg_not_disturb')"
            v-if="curRightDownContactor && !curRightDownContactor.isIgnore"
        >
          消息免打扰
        </li>
        <li
            @click="menuAction('msg_disturb')"
            v-if="curRightDownContactor && curRightDownContactor.isIgnore"
        >
          开启新消息提醒
        </li>
        <li @click="menuAction('delete')">删除聊天</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import {MuteNotification, Plus, Search} from "@element-plus/icons-vue";
import {computed, defineProps, onMounted, ref, withDefaults} from "vue";
import store from "../../store";
import {getUserInfoStorage} from "../../utils/storageUtil.js";
import {CommonConstant} from "../../constant/CommonConstant.ts"
import moment from "moment";
import {getHtmlInnerText} from "../../utils/StringUtils.js";

interface Props {
  height: number;// 窗口当前高度
}

const props = withDefaults(defineProps<Props>(), {
  height: 0
})
// 当前选中的聊天框
const selectChatItemId = computed(() => store.state.basicData.selectContactorId);//默认-1为空聊天面板
// 当前hover的聊天框
const hoverChatItemIndex = ref(-1);
// 查询列表
const searchParam = ref({
  user_id: getUserInfoStorage().id,
});

// 联系信息
const contactorList = computed(() => store.state.basicData.contactorList);

// 查询联系信息
const searchContactor = () => {
  store.dispatch("basicData/searchContactor", searchParam.value);
}
onMounted(() => {
  if (!store.state.basicData.contactorList ||
      !store.state.basicData.contactorList.length) // 全局的联系人信息为空时才搜索
    searchContactor();
});

// 选中当前要聊天的对象
const selectChatContactor = (contactor: any, i: number) => {
  let isChangeContactor = selectChatItemId.value !== contactor.id;// 是否改变了当前要联系的对象
  store.dispatch("basicData/setSelectContactor",
      {
        selectContactorIndex: selectChatItemId.value === contactor.id ? -1 : i,
        selectContactorId: selectChatItemId.value === contactor.id ? -1 : contactor.id,
      });// 重复选中已选中的联系对象会置为-1

  if (contactor.type === CommonConstant.CONTACTOR_PERSON_TYPE) {
    // 将当前联系人信息保存下来
    store.dispatch("chatPanelData/setUserInfo", {
      contact_info_id: contactor.contact_info_id,
    }).then(() => {
      // 查询联系人消息
      store.dispatch("chatPanelData/searchCurChatMessage", {
        user_id: getUserInfoStorage().id,
        friend_id: contactor.contact_info_id,
      }).then(() => {
        // 设置聊天界面是否显示
        store.dispatch("chatPanelData/setIsShow",
            isChangeContactor ? 1 : 0
        );
      });
    });
  }
}

// 点击了整个联系对象信息面板
const clickTable = () => {
  menuVisible.value = false;// 右键弹出的菜单隐藏
}

/*右键联系对象弹出菜单*/
// 弹出菜单是否可见
const menuVisible = ref(false);
// 菜单的x和y坐标参数
const menuX = ref(0);
const menuY = ref(0);
// 当前右键的联系对象
const curRightDownContactor = ref();
// 菜单显示事件
const showMenu = (event: any, contactorIndex: number) => {
  menuX.value = event.clientX - 5;
  menuY.value = event.clientY - 5;
  curRightDownContactor.value = store.state.basicData.contactorList[contactorIndex];
  menuVisible.value = true;
}
// 某个菜单触发事件
const menuAction = (type: string) => {
  switch (type) {
    case 'top' :// 置顶
      store.dispatch("basicData/setContactorIsTop", {
        id: curRightDownContactor.value.id,
        isTop: 1,
      });
      break;
    case 'down' :// 取消置顶
      store.dispatch("basicData/setContactorIsTop", {
        id: curRightDownContactor.value.id,
        isTop: 0,
      });
      break;
    case 'msg_not_disturb' :// 设置消息免打扰
      store.dispatch("basicData/setIsIgnoreContactorMsg", {
        id: curRightDownContactor.value.id,
        isIgnore: 1,
      });
      break;
    case 'msg_disturb' :// 设置取消消息免打扰
      store.dispatch("basicData/setIsIgnoreContactorMsg", {
        id: curRightDownContactor.value.id,
        isIgnore: 0,
      });
      break;
    case 'delete' :// 删除联系对象

      break;
  }
  menuVisible.value = false;
}
</script>

<style scoped>
#messageHistoryPage {
  width: 89.5%;
  color: #1e1e1e;
  border-right: 1px solid #f2cc60;
}

.header-bar {
  display: flex;
  padding: 20px 0 6px 12px;
  column-gap: 10px;
  position: relative;
}

.searchBar {
  width: 78%;
  justify-content: space-between;
}

.header-button {
  width: 20%;
}

/*聊天历史记录卡片页*/
.messageTab {

  /*聊天卡片*/

  .conversation-item {
    width: 23vw;
    display: flex;
    padding: 0 10px;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    cursor: default;
    user-select: none; /*禁止鼠标选取内容*/
    /*聊天卡片的头像部分*/

    .header {
      height: 100%;
      padding: 10px 12px 10px 0;
      position: relative;
    }

    .header .avatar {
      position: relative;
      width: 45px;
      height: 45px;
      min-width: 45px;
      min-height: 45px;
      background: #d6d6d6;
      border-radius: 5px;
      pointer-events: none; /*禁止鼠标选取图片*/
    }

    /***---------------------***/
    /*聊天卡片的内容部分 包括聊天的对象名称以及聊天的最新消息简介*/

    .content-container {
      width: 100%;
      height: 50px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      padding-right: 12px;
    }

    .content-container .title-time-container { /*聊天标题（对象）和时间*/
      display: flex;
      width: 100%;
      max-width: 100%;
      align-content: center;
      justify-content: space-between;
      /*标题*/

      .title {
        display: inline-block;
        font-size: 14px;
        color: #262626;
        font-style: normal;
        font-weight: 400;
        flex: 1;
      }

      /*时间*/

      .time {
        display: inline-block;
        color: gray;
        font-size: 10px;
      }
    }

    .content-container .content { /*聊天最新消息简介*/
      color: #b8b8b8;
      font-size: 13px;
      height: 2vh;
      display: flex;
      justify-content: space-between;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}


/*右键弹出菜单样式*/
.context-menu {
  position: absolute;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.context-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.context-menu li {
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  user-select: none;
}

.context-menu li:hover {
  background-color: #f0f0f0;
}
</style>
