<template>
  <!--  左边通讯录所有信息-->
  <div id="noteBookPage">
    <!--    通讯录的搜索框-->
    <div class="header-bar">
      <div class="searchBar">
        <el-input
            :placeholder="`${!isSearchAll ? '搜索' : '账号或名称'}`"
            v-model="searchParam"
            :style="{width: '100%'}"
            @change="searchDebounce"
            @focus="clickInputOnNoteBookPage(true)"
            @blur="clickInputOnNoteBookPage(false)"
        >
          <template #prefix>
            <el-icon v-if="!isSearchAll">
              <Search/>
            </el-icon>
            <people-plus-one :width="20" :height="20" :stroke="'#bbb'" v-else/>
          </template>
        </el-input>
      </div>
      <!--      通讯录的添加好友和加入群聊按钮-->
      <div class="header-button">
        <el-button style="width: 90%" @click="searchBarButtonEvent">
          <people-plus-one :width="20" :height="20" :stroke="'#888'" v-if="!isSearchAll"/>
          <text v-else>取消</text>
        </el-button>
      </div>
    </div>
    <div class="note-list-group">
      <!--      初始通讯录列表-->
      <el-scrollbar :height="props.height" v-if="!isSearchContact && !isSearchAll">
        <div class="note-lists" @click="showNewFriendApply">
          <div class="lists-label">新的朋友</div>
          <div class="list-item">
            <div style="background: linear-gradient(to right, #ff7e30, #ffb74d)" class="list-item-icon">
              <people-plus-one :width="28" :height="28" :stroke="'#fff'" :fill_color="'#fff'"/>
            </div>
            <div class="list-item-tag">新的朋友</div>
          </div>
        </div>
        <div class="note-lists">
          <div class="lists-label">群聊</div>
          <div class="list-item">
            <div style="background: linear-gradient(45deg, #1e90ff, #00bfff, #87cefa)" class="list-item-icon">
              <peoples :width="28" :height="28" :stroke="'#fff'" :fill_color="'#fff'"/>
            </div>
            <div class="list-item-tag">群聊</div>
          </div>
        </div>
        <div class="note-lists">
          <div class="lists-label" v-if="friendsData.length">联系人</div>
          <div v-for="(friend, i) in friendsData" :key="i">
            <div class="list-item" @click="showFriend(friend)">
              <div class="friend_avatar">
                <el-image :src="(friend as any).userAvatar" style="border-radius: 5px;"/>
              </div>
              <div class="list-item-tag">{{(friend as any).name}}</div>
            </div>
          </div>
        </div>
      </el-scrollbar>

      <!--      搜索所有人或群组-->
      <el-scrollbar :height="props.height" v-if="isSearchAll">
        <block-split-animation :dot-background-color="'#1e1e1e'" v-if="loading" />
        <div class="note-lists" v-else>
          <div class="lists-label" v-if="allSearchData.length">搜索结果</div>
          <div v-for="(item, i) in allSearchData" :key="i">
            <div class="list-item" @click="selectCurContact(item)">
              <div class="list-item-icon">
                <el-image :src="(item as any).userAvatar" style="width: 28px;height: 28px" />
              </div>
              <div class="list-item-tag">{{ (item as any).userName }}</div>
            </div>
          </div>
        </div>
      </el-scrollbar>

      <!--      搜索当前的好友或群组-->
      <el-scrollbar :height="props.height" v-if="isSearchContact">

      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Search} from "@element-plus/icons-vue";
import PeoplePlusOne from "../../MyIcons/people-plus-one.vue";
import {computed, defineProps, onMounted, ref, withDefaults} from "vue";
import Peoples from "../../MyIcons/peoples.vue";
import {UserService} from "../../../api/Services/UserService.ts";
import { ElMessage} from "element-plus";
import {debounce} from "../../../utils/debounceThrottle.ts";
import {isNumber} from "../../../utils/StringUtils.js"
import store from "../../../store";
import BlockSplitAnimation from "../../Loading/block-split-animation.vue";

interface Props {
  height: number;// 窗口当前高度
}

const props = withDefaults(defineProps<Props>(), {
  height: 0
})

// 加载动画
const loading = ref(false);

/*搜索参数*/
// 主要参数
const searchParam = ref("");
// 搜索数量
const pageSize = ref(30);
// 搜索朋友参数
const searchFriendParam = ref({});

// 是否正在搜索联系人或群组
const isSearchContact = ref(false);
// 是否正在搜索其他人或群组
const isSearchAll = ref(false);

// 搜索到的所有信息
const allSearchData = ref([]);

// 查询到的朋友信息
const friendsData = computed(() => store.state.basicData.friendList);

// 查询朋友
const searchFriends = () => {
  store.dispatch("basicData/searchFriends", searchFriendParam.value);
}
onMounted(() => {
  if (!store.state.basicData.friendList ||
      !store.state.basicData.friendList.length) // 全局的联系人信息为空时才搜索
    searchFriends();
})


// 搜索栏按钮的事件
const searchBarButtonEvent = () => {
  isSearchContact.value = false;
  isSearchAll.value = !isSearchAll.value;
  if (!isSearchAll.value) {//点击了取消按钮
    allSearchData.value = [];
    searchParam.value = "";
    loading.value = false;
  }
}

// 在通讯录页面点击输入框事件
const clickInputOnNoteBookPage = (isSearchContactStatus: boolean) => {
  if (!isSearchAll.value) isSearchContact.value = isSearchContactStatus;
}

/*1、选择好友列表栏*/
// 查看新的朋友
const showNewFriendApply = () => {
  store.dispatch("noteBookPanelData/setIsShow", 3);
}
// 查看好友信息
const showFriend = (friend: any) => {
  store.dispatch("noteBookPanelData/setUserInfo", friend);
  store.dispatch("noteBookPanelData/setIsShow", 11);// 设置当前显示的是朋友信息
}
/*2、选中某个搜索得到的要联系对象*/
const selectCurContact = (item: any) => {
  if (item.userRole) {
    // 代表联系人
    store.dispatch("noteBookPanelData/setUserInfo", item)
    store.dispatch("noteBookPanelData/setIsShow", 1);// 设置显示的是联系人
  }
}

/*搜索*/
const search = () => {
  loading.value = true;
  if (isSearchAll.value) {
    searchAllDebounce();
  }

}
const searchDebounce = debounce(search, 100);
// 搜索所有
const searchAll = () => {
  UserService.getUserPageByConditionsOrUsingPost({
    userAccount: isNumber(searchParam.value) ? searchParam.value : "" as any,
    userName: searchParam.value,
    pageSize: pageSize.value
  }).then((res: any) => {
    if (res.code === 0) {
      allSearchData.value = res.data.records;
    } else ElMessage.error("搜索失败，" + res.message);
    loading.value = false;
  }).catch(() => {
    ElMessage.error("搜索失败");
    loading.value = false;
  })
}
const searchAllDebounce = debounce(searchAll, 500);

</script>

<style scoped>
#noteBookPage {
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

/*列表组*/
.note-list-group {

  .note-lists {
    /*每个列表*/
    margin-top: 7%;

    .lists-label {
      /*列表标签*/
      padding: 3% 5% 0 5%;
      user-select: none;
      font-size: 10pt;
      color: #888;
    }

    .list-item {
      /*每个列表中的小模块*/
      height: 12%;
      padding: 18px 20px;
      box-sizing: border-box;
      display: flex;

      .list-item-icon {
        /*小模块的图标*/
        width: 35px;
        height: 35px;
        padding: 2px 5px;
        box-sizing: border-box;
        border-radius: 5px;
      }

      .list-item-tag {
        /*小模块的文本内容*/
        color: #1e1e1e;
        user-select: none;
        margin-left: 10%;
        padding: 5px 0;
        box-sizing: border-box;
      }

      .friend_avatar{
        /*好友头像*/
        width: 35px;
        height: 35px;
        pointer-events: none;
        user-select: none;
      }
    }

    .list-item:hover {
      background-color: #f0f0f0;
    }

    .list-item:active {
      background-color: #e0e0df;
    }
  }
}
</style>
