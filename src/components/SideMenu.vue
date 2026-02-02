<template>
  <el-menu
      active-text-color="#409EFF"
      background-color="#304156"
      class="el-menu-vertical"
      default-active="1"
      text-color="#fff"
      @select="handleSelect"
  >
    <div class="logo-area">
      <h3>📈 成绩分析助手</h3>
    </div>

    <el-menu-item index="1">
      <el-icon><DataLine /></el-icon>
      <span>单班成绩分析</span>
    </el-menu-item>

    <el-menu-item index="2">
      <el-icon><Trophy /></el-icon>
      <span>年级排行榜</span>
    </el-menu-item>

    <el-menu-item index="3">
      <el-icon><Histogram /></el-icon>
      <span>多班级对比</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { DataLine, Trophy, Histogram } from '@element-plus/icons-vue';

const emit = defineEmits(['change-view']);

const handleSelect = (key) => {
  emit('change-view', key);
};
</script>

<style scoped>
.el-menu-vertical { height: 100vh; border-right: none; }
.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2b3649;
  color: white;
}
</style>
