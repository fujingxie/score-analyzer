<template>
  <div class="comparison-section">
    <div class="comp-header">
      <div class="left">
        <h3>⚖️ 班级横向对比</h3>
        <p class="sub-text">当前分析班级 VS 对比班级</p>
      </div>
      <div class="right">
        <span v-if="hasOtherClass" class="status-tag">
          <el-tag type="success" effect="dark">
            已导入: {{ otherClassData.length }}人
          </el-tag>
        </span>

        <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleUpload"
            accept=".xlsx, .xls"
            style="display: inline-block; margin: 0 10px;"
        >
          <el-button type="primary" plain>
            <template #icon><Plus /></template>
            {{ hasOtherClass ? '更换对比班级' : '添加对比班级数据' }}
          </el-button>
        </el-upload>

        <el-button v-if="hasOtherClass" link type="danger" @click="clearData">
          清除对比
        </el-button>
      </div>
    </div>

    <div v-if="isReady" class="comp-content">
      <el-row :gutter="20" class="kpi-row">
        <el-col :span="8">
          <div class="kpi-card" :class="kpiData.avgGap >= 0 ? 'blue-bg' : 'red-bg'">
            <div class="kpi-title">总体平均分差距</div>
            <div class="kpi-value">{{ kpiData.avgGap > 0 ? '+' : '' }}{{ kpiData.avgGap }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="kpi-card" :class="kpiData.passRateGap >= 0 ? 'green-bg' : 'red-bg'">
            <div class="kpi-title">总体及格率差距</div>
            <div class="kpi-value">{{ kpiData.passRateGap > 0 ? '+' : '' }}{{ kpiData.passRateGap }}%</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="kpi-card" :class="kpiData.weakSubjects.length > 0 ? 'red-bg' : 'blue-bg'">
            <div class="kpi-title">{{ kpiData.weakSubjects.length > 0 ? '劣势科目' : '优势科目' }}</div>
            <div class="kpi-value small-font">
              {{ kpiData.weakSubjectsStr || '全科领先' }}
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-bottom: 30px;">
        <el-col :span="8">
          <el-card shadow="never" class="chart-card">
            <template #header>各科平均分</template>
            <div ref="avgChartRef" class="chart-box"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never" class="chart-card">
            <template #header>各科及格率</template>
            <div ref="passChartRef" class="chart-box"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never" class="chart-card">
            <template #header>各科最高分</template>
            <div ref="maxChartRef" class="chart-box"></div>
          </el-card>
        </el-col>
      </el-row>

      <div class="detail-table-container">
        <div class="table-title">
          <el-icon><List /></el-icon> 详细对比表
        </div>
        <el-table
            :data="comparisonTableData"
            stripe
            style="width: 100%"
            :header-cell-style="headerCellStyle"
        >
          <el-table-column prop="subject" label="科目" width="100" fixed />

          <el-table-column label="本班平均分" prop="myAvg" align="center" />
          <el-table-column label="对比班平均分" prop="otherAvg" align="center" />
          <el-table-column label="差距" align="center">
            <template #default="scope">
              <span :class="getDiffClass(scope.row.avgDiff)">
                {{ scope.row.avgDiff > 0 ? '+' : '' }}{{ scope.row.avgDiff }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="本班及格率" prop="myPass" align="center" />
          <el-table-column label="对比班及格率" prop="otherPass" align="center" />
          <el-table-column label="差距" align="center">
            <template #default="scope">
              <span :class="getDiffClass(scope.row.passDiffVal)">
                {{ scope.row.passDiffVal > 0 ? '+' : '' }}{{ scope.row.passDiff }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="本班最高分" prop="myMax" align="center" />
          <el-table-column label="对比班最高分" prop="otherMax" align="center" />
          <el-table-column label="差距" align="center">
            <template #default="scope">
              <span :class="getDiffClass(scope.row.maxDiffVal)">
                {{ scope.row.maxDiffVal > 0 ? '+' : '' }}{{ scope.row.maxDiff }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>

    </div>

    <div v-else class="empty-placeholder">
      <el-empty description="请点击上方按钮导入【对比班级】的 Excel 文件" :image-size="100" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { Plus, List } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as XLSX from 'xlsx';
import * as echarts from 'echarts';
import _ from 'lodash';

// 接收父组件数据
const props = defineProps({
  myClassData: { type: Array, default: () => [] },
  subjects: { type: Array, default: () => [] },
  rules: { type: Object, default: () => ({}) }
});

const otherClassData = ref([]);
const avgChartRef = ref(null);
const passChartRef = ref(null);
const maxChartRef = ref(null);

const hasOtherClass = computed(() => otherClassData.value.length > 0);
const isReady = computed(() => props.myClassData.length > 0 && hasOtherClass.value);

// --- 样式配置 ---
const headerCellStyle = {
  background: 'linear-gradient(to right, #6a5acd, #8367e6)',
  color: '#fff',
  fontWeight: 'bold',
  textAlign: 'center'
};

// --- 计算：详细对比表数据 ---
const comparisonTableData = computed(() => {
  if (!isReady.value) return [];

  return props.subjects.map(sub => {
    const myStats = getStats(props.myClassData, sub);
    const otherStats = getStats(otherClassData.value, sub);

    return {
      subject: sub,
      // 平均分
      myAvg: myStats.avg.toFixed(1),
      otherAvg: otherStats.avg.toFixed(1),
      avgDiff: (myStats.avg - otherStats.avg).toFixed(1),
      // 及格率
      myPass: myStats.passRate.toFixed(1) + '%',
      otherPass: otherStats.passRate.toFixed(1) + '%',
      passDiff: (myStats.passRate - otherStats.passRate).toFixed(1) + '%',
      passDiffVal: myStats.passRate - otherStats.passRate, // 用于判断颜色
      // 最高分
      myMax: myStats.max,
      otherMax: otherStats.max,
      maxDiff: myStats.max - otherStats.max,
      maxDiffVal: myStats.max - otherStats.max // 用于判断颜色
    };
  });
});

// --- KPI 计算 ---
const kpiData = computed(() => {
  if (!isReady.value) return { avgGap: 0, passRateGap: 0, weakSubjects: [], weakSubjectsStr: '' };

  let weakList = [];
  const subs = props.subjects;

  subs.forEach(sub => {
    const myStats = getStats(props.myClassData, sub);
    const otherStats = getStats(otherClassData.value, sub);
    const diff = myStats.avg - otherStats.avg;
    if (diff < 0) weakList.push(`${sub}(${diff.toFixed(1)})`);
  });

  const myTotalAvg = _.meanBy(props.myClassData, '总分') || 0;
  const otherTotalAvg = _.meanBy(otherClassData.value, '总分') || 0;

  // 总分及格线：累加所有科目及格线
  let totalPassLine = 0;
  subs.forEach(sub => {
    const r = props.rules[sub] || { passLine: 60 };
    totalPassLine += r.passLine;
  });

  const myPassRate = (props.myClassData.filter(s => s['总分'] >= totalPassLine).length / props.myClassData.length) * 100;
  const otherPassRate = (otherClassData.value.filter(s => s['总分'] >= totalPassLine).length / otherClassData.value.length) * 100;

  return {
    avgGap: (myTotalAvg - otherTotalAvg).toFixed(1),
    passRateGap: (myPassRate - otherPassRate).toFixed(1),
    weakSubjects: weakList,
    weakSubjectsStr: weakList.join(', ')
  };
});

// --- 辅助函数 ---
const handleUpload = async (uploadFile) => {
  const data = await uploadFile.raw.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(sheet);

  if (!jsonData.length) return ElMessage.error('文件为空');

  const processedData = jsonData.map(row => {
    let total = 0;
    props.subjects.forEach(sub => total += (Number(row[sub]) || 0));
    return { ...row, '总分': row['总分'] || total };
  });

  otherClassData.value = processedData;
  ElMessage.success('对比班级导入成功');
  await nextTick();
  renderCharts();
};

const clearData = () => {
  otherClassData.value = [];
};

const getStats = (data, subject) => {
  const scores = data.map(s => Number(s[subject]) || 0);
  if (scores.length === 0) return { avg: 0, max: 0, passRate: 0 };

  const r = props.rules[subject] || { passLine: 60 };

  return {
    avg: _.mean(scores) || 0,
    max: _.max(scores) || 0,
    passRate: (scores.filter(s => s >= r.passLine).length / scores.length) * 100
  };
};

const getDiffClass = (val) => {
  const num = Number(val);
  if (num > 0) return 'text-green';
  if (num < 0) return 'text-red';
  return 'text-gray';
};

// --- 图表渲染 ---
const renderCharts = () => {
  if (!isReady.value) return;
  const subs = props.subjects;
  const commonGrid = { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true };
  const myStats = subs.map(s => getStats(props.myClassData, s));
  const otherStats = subs.map(s => getStats(otherClassData.value, s));

  // 1. 均分
  const avgChart = echarts.init(avgChartRef.value);
  avgChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['本班', '对比班级'], top: 0 },
    grid: commonGrid,
    xAxis: { type: 'category', data: subs },
    yAxis: { type: 'value' },
    series: [
      { name: '本班', type: 'bar', data: myStats.map(s => s.avg.toFixed(1)), itemStyle: { color: '#409EFF' } },
      { name: '对比班级', type: 'bar', data: otherStats.map(s => s.avg.toFixed(1)), itemStyle: { color: '#F56C6C' } }
    ]
  });

  // 2. 及格率
  const passChart = echarts.init(passChartRef.value);
  passChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['本班', '对比班级'], top: 0 },
    grid: commonGrid,
    xAxis: { type: 'category', data: subs },
    yAxis: { type: 'value', max: 100 },
    series: [
      { name: '本班', type: 'bar', data: myStats.map(s => s.passRate.toFixed(1)), itemStyle: { color: '#67C23A' } },
      { name: '对比班级', type: 'bar', data: otherStats.map(s => s.passRate.toFixed(1)), itemStyle: { color: '#E6A23C' } }
    ]
  });

  // 3. 最高分
  const maxChart = echarts.init(maxChartRef.value);
  maxChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['本班', '对比班级'], top: 0 },
    grid: commonGrid,
    xAxis: { type: 'category', data: subs },
    yAxis: { type: 'value' },
    series: [
      { name: '本班', type: 'bar', data: myStats.map(s => s.max), itemStyle: { color: '#909399' } },
      { name: '对比班级', type: 'bar', data: otherStats.map(s => s.max), itemStyle: { color: '#409EFF' } }
    ]
  });

  window.addEventListener('resize', () => {
    avgChart.resize();
    passChart.resize();
    maxChart.resize();
  });
};

watch(() => props.myClassData, () => {
  if (isReady.value) nextTick(renderCharts);
});
</script>

<style scoped>
.comparison-section { margin-top: 30px; border: 1px solid #EBEEF5; background: #fff; border-radius: 4px; padding: 20px; }
.comp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px; }
.sub-text { font-size: 12px; color: #909399; margin: 0; }
.status-tag { margin-right: 15px; }

/* KPI 卡片 */
.kpi-row { margin-bottom: 20px; }
.kpi-card { height: 100px; border-radius: 6px; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
.kpi-title { font-size: 14px; opacity: 0.9; }
.kpi-value { font-size: 28px; font-weight: bold; }
.small-font { font-size: 16px; padding: 0 10px; }

/* 颜色变体 */
.blue-bg { background: linear-gradient(135deg, #409EFF, #337ECC); }
.red-bg { background: linear-gradient(135deg, #F56C6C, #E64242); }
.green-bg { background: linear-gradient(135deg, #67C23A, #529B2E); }

/* 图表 */
.chart-card :deep(.el-card__body) { padding: 10px; }
.chart-box { height: 250px; width: 100%; }

/* 详细对比表 */
.detail-table-container { margin-top: 20px; }
.table-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; color: #303133; }

/* 字体颜色 */
.text-green { color: #67C23A; font-weight: bold; }
.text-red { color: #F56C6C; font-weight: bold; }
.text-gray { color: #909399; }

.empty-placeholder { padding: 40px 0; }
</style>
