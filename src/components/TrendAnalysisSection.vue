<template>
  <div class="trend-container" v-if="validExams.length >= 2">
    <div class="section-title">
      <el-icon><TrendCharts /></el-icon> 考试趋势分析 (基于已上传的 {{ validExams.length }} 次考试)
    </div>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover" class="chart-card">
          <template #header>各科目总分趋势对比 (班级总分累加)</template>
          <div ref="totalTrendRef" class="chart-box-wide"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover" class="chart-card">
          <template #header>各科目平均分趋势对比</template>
          <div ref="avgTrendRef" class="chart-box-wide"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>

  <div v-else-if="validExams.length === 1" class="trend-tip">
    <el-alert title="趋势分析需要至少上传 2 次考试数据才能生成折线图" type="info" show-icon :closable="false" />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { TrendCharts } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import _ from 'lodash';

// 接收完整的考试列表
const props = defineProps({
  examList: { type: Array, default: () => [] }
});

const totalTrendRef = ref(null);
const avgTrendRef = ref(null);

let totalChart = null;
let avgChart = null;

// 过滤出有数据的考试
const validExams = computed(() => props.examList.filter(e => e.hasData));

// --- 核心逻辑：数据转换 ---
const renderCharts = () => {
  if (validExams.value.length < 2) return;

  const exams = validExams.value;
  const examNames = exams.map(e => e.name);

  // 1. 获取所有出现的科目 (去重并集)
  let allSubjects = new Set();
  exams.forEach(e => e.subjects.forEach(s => allSubjects.add(s)));
  const subjects = Array.from(allSubjects);

  // 2. 构建 Series 数据
  // 结构: { '语文': [考试1总分, 考试2总分...], '数学': [...] }
  const totalSeriesData = {};
  const avgSeriesData = {};

  subjects.forEach(sub => {
    totalSeriesData[sub] = [];
    avgSeriesData[sub] = [];

    exams.forEach(exam => {
      // 提取该次考试该科目的所有成绩
      const scores = exam.data.map(stu => Number(stu[sub]) || 0);

      if (scores.length > 0) {
        const sum = _.sum(scores);
        const avg = _.mean(scores);
        totalSeriesData[sub].push(sum.toFixed(1));
        avgSeriesData[sub].push(avg.toFixed(1));
      } else {
        // 如果这次考试没有这个科目，补 0 或 null (null 会断开线条)
        totalSeriesData[sub].push(0);
        avgSeriesData[sub].push(0);
      }
    });
  });

  // --- 通用图表配置 ---
  const commonOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: subjects, top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true, top: 40 },
    xAxis: { type: 'category', boundaryGap: false, data: examNames },
    yAxis: { type: 'value' }
  };

  // 3. 渲染总分趋势图
  if (totalTrendRef.value) {
    if (!totalChart) totalChart = echarts.init(totalTrendRef.value);

    const seriesList = subjects.map(sub => ({
      name: sub,
      type: 'line',
      data: totalSeriesData[sub],
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 3 }
    }));

    totalChart.setOption({
      ...commonOption,
      series: seriesList
    });
  }

  // 4. 渲染平均分趋势图
  if (avgTrendRef.value) {
    if (!avgChart) avgChart = echarts.init(avgTrendRef.value);

    const seriesList = subjects.map(sub => ({
      name: sub,
      type: 'line',
      data: avgSeriesData[sub],
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 3 }
    }));

    avgChart.setOption({
      ...commonOption,
      series: seriesList
    });
  }
};

// 监听数据变化 (如添加了新考试)
watch(() => props.examList, () => {
  nextTick(renderCharts);
}, { deep: true });

onMounted(() => {
  nextTick(renderCharts);
  window.addEventListener('resize', () => {
    totalChart?.resize();
    avgChart?.resize();
  });
});
</script>

<style scoped>
.trend-container { margin-top: 30px; border-top: 1px solid #ebeef5; padding-top: 20px; }
.section-title {
  font-size: 18px; font-weight: bold; color: #303133;
  margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
}
.chart-card :deep(.el-card__body) { padding: 15px; }
.chart-box-wide { height: 350px; width: 100%; }
.trend-tip { margin-top: 20px; }
</style>
