<template>
  <div id="settingsPanel">
    <el-button @click="logout">退出登录</el-button>
  </div>
</template>

<script setup lang="ts">
import {UserService} from "../api/Services/UserService.ts";
import {ElMessage} from "element-plus";
import {reLogin} from "../utils/electronUtil.ts";
import store from "../store";

const logout = () => {
  UserService.userLogoutUsingPost().then((res: any) => {
    if (res.code === 0) {
      reLogin(1000, "账号已退出登录");
      store.dispatch("noteBookPanelData/clearAllData");
      ElMessage.success("成功退出登录");
    }else ElMessage.error(`退出登录失败，${res.message}`);
  }).catch((error: any) => {
    ElMessage.error(`退出登录失败${error.message ? `，${error.message}` : ""}`)
  })
}
</script>

<style scoped>

</style>
