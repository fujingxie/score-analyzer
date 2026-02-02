<template>
  <el-container class="main-layout">
    <el-aside width="200px">
      <SideMenu @change-view="handleMenuChange" />
    </el-aside>

    <el-container>
      <el-header class="main-header">
        <span class="view-title">{{ viewTitle }}</span>
      </el-header>

      <el-main class="main-content">
        <keep-alive>
          <SingleClassAnalysis
              v-if="currentView === '1'"
              key="1"
          />

          <GradeRankingSection
              v-else-if="currentView === '2'"
              class="view-container"
              key="2"
          />

          <MultiClassComparison
              v-else-if="currentView === '3'"
              style="padding-top: 100px;"
              key="3"
          />
        </keep-alive>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue';
// 组件引入
import SideMenu from '../components/SideMenu.vue';
import SingleClassAnalysis from '../components/SingleClassAnalysis.vue';
import MultiClassComparison from '../components/MultiClassComparison.vue';
import GradeRankingSection from '../components/GradeRankingSection.vue';

// --- 状态管理 ---
const currentView = ref('1');

// --- 计算属性 ---
const viewTitle = computed(() => {
  const map = {
    '1': '单班成绩分析 (支持多考试趋势)',
    '2': '年级排行榜 (需包含班级列)',
    '3': '多班级横向对比'
  };
  return map[currentView.value] || '成绩分析工具';
});

// --- 事件处理 ---
const handleMenuChange = (key) => {
  currentView.value = key;
  // 🟢 保持修改：去掉了清空数据的代码，确保切回来数据还在
};
</script>

<style>
/* 样式保持不变 */
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.main-layout {
  height: 100vh;
  overflow: hidden;
}

.main-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  z-index: 10;
}

.view-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.main-content {
  background-color: #f0f2f5;
  padding: 0 !important;
  overflow-y: auto;
}

.view-container {
  padding: 20px;
}

.placeholder {
  /* 这个类保留在这里也没事，但我们不再把它加到组件上了 */
  padding-top: 100px;
  display: flex;
  justify-content: center;
}
</style>
