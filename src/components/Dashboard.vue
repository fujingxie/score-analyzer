<template>
  <div class="dashboard-container">
    <div class="toolbar">
      <div class="left">
        <el-button type="info" :icon="Back" circle @click="$emit('back')" />
        <span class="title">分析报告 ({{ stats.totalStudents }}人参考)</span>
      </div>
      <el-button type="success" :icon="Download" @click="handleExport">导出完整报表</el-button>
    </div>

    <el-row :gutter="15" class="overview-cards">
      <el-col :span="4" v-for="sub in subjects" :key="sub">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '15px' }">
          <div class="stat-header">
            <span class="sub-name">{{ sub }}</span>
            <el-tag size="small" :type="getPassRateColor(stats.subjectStats[sub].passRate)">
              {{ parseFloat(stats.subjectStats[sub].passRate) >= 80 ? '优秀' : '正常' }}
            </el-tag>
          </div>
          <div class="stat-main">
            <span class="score">{{ stats.subjectStats[sub].avg }}</span>
            <span class="label">均分</span>
          </div>
          <div class="stat-footer">
            <span>及格: {{ stats.subjectStats[sub].passRate }}</span>
            <span>最高: {{ stats.subjectStats[sub].max }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" type="border-card" class="main-tabs">

      <el-tab-pane label="📊 图表分析" name="charts">
        <el-row :gutter="20">
          <el-col :span="14">
            <div class="chart-wrapper">
              <h3>各科分数段分布 (人数)</h3>
              <div ref="barChartDom" class="chart-box"></div>
            </div>
          </el-col>

          <el-col :span="10">
            <div class="chart-wrapper">
              <h3>各科均分雷达图</h3>
              <div ref="radarChartDom" class="chart-box"></div>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="📋 学生明细表" name="table">
        <el-table
            :data="stats.rankedStudents"
            height="500"
            stripe
            style="width: 100%"
            :default-sort="{ prop: '总分', order: 'descending' }"
        >
          <el-table-column prop="rank" label="排名" width="80" fixed sortable />
          <el-table-column prop="姓名" label="姓名" width="100" fixed />
          <el-table-column prop="总分" label="总分" sortable width="100">
            <template #default="scope">
              <strong>{{ scope.row['总分'] }}</strong>
            </template>
          </el-table-column>

          <el-table-column
              v-for="sub in subjects"
              :key="sub"
              :prop="sub"
              :label="sub"
              sortable
              align="center"
          >
            <template #default="scope">
              <span :class="{'fail-score': isFail(scope.row[sub], sub)}">
                {{ scope.row[sub] }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { Back, Download } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import * as XLSX from 'xlsx'; // 确保引入了这行
// 接收父组件传入的数据
const props = defineProps(['stats', 'subjects', 'config']); // config包含 fullMarks, passLines
const emit = defineEmits(['back']);

const activeTab = ref('charts');
const barChartDom = ref(null);
const radarChartDom = ref(null);

// 辅助函数：判断是否不及格 (用于表格标红)
const isFail = (score, subject) => {
  const passLine = props.config?.passLines?.[subject] || 60;
  return Number(score) < passLine;
};

const getPassRateColor = (rateStr) => {
  const rate = parseFloat(rateStr);
  if (rate >= 90) return 'success';
  if (rate >= 70) return 'warning';
  return 'danger';
};
// ... existing code ...

const handleExport = () => {
  // 1. 准备 Sheet 1: 学生明细数据
  // 直接使用 rankedStudents，它已经包含了排名和各科成绩
  const ws1 = XLSX.utils.json_to_sheet(props.stats.rankedStudents);

  // 2. 准备 Sheet 2: 统计概览数据
  // 我们需要把 subjectStats 对象转换成数组，方便 Excel 显示
  const summaryData = props.subjects.map(sub => ({
    '科目': sub,
    '平均分': props.stats.subjectStats[sub].avg,
    '及格率': props.stats.subjectStats[sub].passRate,
    '优秀率': props.stats.subjectStats[sub].excellentRate,
    '最高分': props.stats.subjectStats[sub].max,
    '最低分': props.stats.subjectStats[sub].min
  }));
  const ws2 = XLSX.utils.json_to_sheet(summaryData);

  // 3. 创建工作簿并挂载 Sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, "学生成绩明细");
  XLSX.utils.book_append_sheet(wb, ws2, "各科统计概览");

  // 4. 下载文件
  XLSX.writeFile(wb, `成绩分析报告_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
};
// --- ECharts 图表渲染逻辑 ---

// 1. 柱状图：各科及格率/优秀率对比 或 分数段
const initBarChart = () => {
  if (!barChartDom.value) return;
  const myChart = echarts.init(barChartDom.value);

  // 准备数据：计算各科的平均分
  const subjects = props.subjects;
  const avgs = subjects.map(sub => props.stats.subjectStats[sub].avg);
  const maxScores = subjects.map(sub => props.config?.fullMarks?.[sub] || 100);

  // 这里我们做一个双轴图：平均分 vs 满分
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['班级平均分', '科目满分'] },
    xAxis: { type: 'category', data: subjects },
    yAxis: { type: 'value' },
    series: [
      {
        name: '班级平均分',
        type: 'bar',
        data: avgs,
        itemStyle: { color: '#409EFF' },
        label: { show: true, position: 'top' }
      },
      {
        name: '科目满分',
        type: 'line',
        data: maxScores,
        itemStyle: { color: '#E6A23C' },
        lineStyle: { type: 'dashed' }
      }
    ]
  };
  myChart.setOption(option);

  // 响应窗口大小变化
  window.addEventListener('resize', () => myChart.resize());
};

// 2. 雷达图：班级学科均衡度
const initRadarChart = () => {
  if (!radarChartDom.value) return;
  const myChart = echarts.init(radarChartDom.value);

  const subjects = props.subjects;

  // 计算每个科目的“得分率” (平均分 / 满分 * 100)，统一化处理以便在雷达图展示
  const scoreRates = subjects.map(sub => {
    const avg = props.stats.subjectStats[sub].avg;
    const full = props.config?.fullMarks?.[sub] || 100;
    return Math.round((avg / full) * 100);
  });

  const indicator = subjects.map(sub => ({ name: sub, max: 100 }));

  const option = {
    tooltip: {},
    radar: {
      indicator: indicator,
      radius: '65%'
    },
    series: [{
      name: '学科得分率 (%)',
      type: 'radar',
      data: [{
        value: scoreRates,
        name: '班级整体',
        areaStyle: { color: 'rgba(64,158,255, 0.2)' },
        itemStyle: { color: '#409EFF' }
      }]
    }]
  };
  myChart.setOption(option);
  window.addEventListener('resize', () => myChart.resize());
};

// 生命周期：组件挂载后渲染图表
onMounted(async () => {
  await nextTick(); // 等待 DOM 生成
  initBarChart();
  initRadarChart();
});

// 监听 Tab 切换，如果在表格页切回图表页，可能需要重新 resize
watch(activeTab, async (newVal) => {
  if (newVal === 'charts') {
    await nextTick();
    // 重新初始化一下，防止 Tab 隐藏导致宽高计算错误
    echarts.getInstanceByDom(barChartDom.value)?.resize();
    echarts.getInstanceByDom(radarChartDom.value)?.resize();
  }
});
</script>

<style scoped>
.dashboard-container { padding: 20px; background: #f0f2f5; min-height: 100vh; }
.toolbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.left { display: flex; align-items: center; gap: 10px; }
.title { font-size: 18px; font-weight: bold; color: #303133; }

.overview-cards { margin-bottom: 20px; }
.stat-card { background: #fff; height: 120px; display: flex; flex-direction: column; justify-content: space-between; }
.stat-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
.sub-name { font-weight: bold; color: #606266; }
.stat-main { text-align: center; margin: 5px 0; }
.score { font-size: 32px; font-weight: bold; color: #303133; margin-right: 5px; }
.label { font-size: 12px; color: #909399; }
.stat-footer { display: flex; justify-content: space-between; font-size: 12px; color: #909399; border-top: 1px solid #EBEEF5; padding-top: 8px; }

.main-tabs { background: #fff; min-height: 600px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1); }
.chart-wrapper { text-align: center; }
.chart-box { width: 100%; height: 400px; margin-top: 10px; }

.fail-score { color: #F56C6C; font-weight: bold; }
</style>
