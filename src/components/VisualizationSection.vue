<template>
  <div class="viz-container">
    <div class="section-title">
      <el-icon><Histogram /></el-icon> 可视化分析
    </div>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>学科平均分对比</template>
          <div ref="avgChartRef" class="chart-box"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>学科及格率对比</template>
          <div ref="passChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover" class="chart-card">
          <template #header>成绩分布统计 (各分数段人数)</template>
          <div ref="distChartRef" class="chart-box-wide"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { Histogram } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import _ from 'lodash';

// 接收数据
const props = defineProps({
  students: { type: Array, default: () => [] },
  subjects: { type: Array, default: () => [] },
  rules: { type: Object, default: () => ({}) }
});

const avgChartRef = ref(null);
const passChartRef = ref(null);
const distChartRef = ref(null);

let avgChart = null;
let passChart = null;
let distChart = null;

// --- 核心逻辑：数据计算与渲染 ---
const renderCharts = () => {
  if (!props.students.length || !props.subjects.length) return;

  const subs = props.subjects;

  // 1. 准备基础数据 (平均分、及格率)
  const avgData = [];
  const passRateData = [];

  // 2. 准备分布数据 (初始化计数器)
  const distDataMap = {};
  subs.forEach(sub => distDataMap[sub] = [0, 0, 0, 0, 0]);

  subs.forEach(sub => {
    const scores = props.students.map(s => Number(s[sub]) || 0);
    const rule = props.rules[sub] || { passLine: 60 };

    // 计算平均分
    const avg = _.mean(scores) || 0;
    avgData.push(avg.toFixed(1));

    // 计算及格率 (动态)
    const passCount = scores.filter(s => s >= rule.passLine).length;
    const rate = (passCount / scores.length) * 100;
    passRateData.push(rate.toFixed(1));

    // 计算分布 (遍历每个学生)
    // 注意：分布图依然保持 60-70-80 的固定区间，用于展示绝对分数分布
    scores.forEach(score => {
      let index = 0;
      if (score < 60) index = 0;      // 0-59
      else if (score < 70) index = 1; // 60-69
      else if (score < 80) index = 2; // 70-79
      else if (score < 90) index = 3; // 80-89
      else index = 4;                 // 90-100

      distDataMap[sub][index]++;
    });
  });

  // --- 渲染图表 1: 平均分 ---
  if (avgChartRef.value) {
    if (!avgChart) avgChart = echarts.init(avgChartRef.value);
    avgChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { top: 30, bottom: 30, left: 50, right: 20 },
      xAxis: { type: 'category', data: subs },
      yAxis: { type: 'value', name: '分数' },
      series: [{
        data: avgData,
        type: 'bar',
        barWidth: 40,
        itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] }, // 蓝色
        label: { show: true, position: 'top' }
      }]
    });
  }

  // --- 渲染图表 2: 及格率 ---
  if (passChartRef.value) {
    if (!passChart) passChart = echarts.init(passChartRef.value);
    passChart.setOption({
      tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
      grid: { top: 30, bottom: 30, left: 50, right: 20 },
      xAxis: { type: 'category', data: subs },
      yAxis: { type: 'value', max: 100, name: '及格率(%)' },
      series: [{
        data: passRateData,
        type: 'bar',
        barWidth: 40,
        itemStyle: { color: '#67C23A', borderRadius: [4, 4, 0, 0] }, // 绿色
        label: { show: true, position: 'top', formatter: '{c}%' }
      }]
    });
  }

  // --- 渲染图表 3: 成绩分布 (分组柱状图) ---
  if (distChartRef.value) {
    if (!distChart) distChart = echarts.init(distChartRef.value);

    // 构造 series
    const seriesList = subs.map(sub => ({
      name: sub,
      type: 'bar',
      data: distDataMap[sub],
      emphasis: { focus: 'series' }
    }));

    distChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: subs, top: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true, top: 40 },
      xAxis: {
        type: 'category',
        data: ['0-59分', '60-69分', '70-79分', '80-89分', '90-100分']
      },
      yAxis: { type: 'value', name: '人数' },
      series: seriesList
    });
  }
};

// 监听数据变化重绘
watch(() => props.students, () => {
  nextTick(renderCharts);
}, { deep: true });

onMounted(() => {
  nextTick(renderCharts);
  window.addEventListener('resize', () => {
    avgChart?.resize();
    passChart?.resize();
    distChart?.resize();
  });
});
</script>

<style scoped>
.viz-container { margin-top: 20px; }
.section-title {
  font-size: 18px; font-weight: bold; color: #303133;
  margin-bottom: 15px; display: flex; align-items: center; gap: 8px;
}
.chart-card :deep(.el-card__body) { padding: 15px; }
.chart-box { height: 300px; width: 100%; }
.chart-box-wide { height: 380px; width: 100%; }
</style>
