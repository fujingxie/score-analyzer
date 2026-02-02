<template>
  <el-container class="main-layout">
    <el-aside width="240px" class="aside">
      <div class="logo">
        <h2>成绩分析助手</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        router
        :collapse="false"
      >
        <el-menu-item index="/">
          <el-icon><DataLine /></el-icon>
          <span>单班成绩分析</span>
        </el-menu-item>
        <el-menu-item index="/grade">
          <el-icon><Trophy /></el-icon>
          <span>年级排行榜</span>
        </el-menu-item>
        <el-menu-item index="/compare">
          <el-icon><Histogram /></el-icon>
          <span>多班级对比</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="breadcrumb-container">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.path !== '/'">{{ $route.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
            <!-- User info or logout can go here -->
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" v-if="$route.meta.keepAlive" />
          </keep-alive>
          <component :is="Component" v-if="!$route.meta.keepAlive" />
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DataLine, Trophy, Histogram } from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = computed(() => {
  return route.path
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
  width: 100vw;
  background-color: var(--el-bg-color-page);
}

.aside {
  background-color: #fff;
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--el-border-color-light);
  color: var(--el-color-primary);
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.el-menu-vertical {
  border-right: none;
  flex: 1;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
}

.main-content {
  padding: 0;
  background-color: var(--el-bg-color-page); /* Corresponds to #F5F7FA usually */
}
</style>
