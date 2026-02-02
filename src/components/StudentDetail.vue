<template>
  <el-dialog
      v-model="visible"
      :title="`${studentName} - 成绩深度分析`"
      width="90%"
      top="5vh"
      destroy-on-close
      @opened="initCharts"
  >
    <el-row :gutter="20" class="detail-cards">
      <el-col :span="6">
        <div class="card blue-card">
          <div class="label">平均总分</div>
          <div class="value">{{ avgTotal }}</div>
          <div class="sub">最高: {{ maxTotal }} | 最低: {{ minTotal }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="card green-card">
          <div class="label">进步幅度</div>
          <div class="value">{{ improvement > 0 ? '+' : '' }}{{ improvement }}</div>
          <div class="sub">较最后一次考试</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="card cyan-card">
          <div class="label">最新排名</div>
          <div class="value">{{ latestRank }}</div>
          <div class="sub">平均排名: {{ avgRank }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="card blue-card">
          <div class="label">考试次数</div>
          <div class="value">{{ examCount }}</div>
          <div class="sub">已参加的考试</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>📈 总分趋势</template>
          <div ref="totalChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>🏆 班级排名变化</template>
          <div ref="rankChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" style="margin-top: 20px;">
      <template #header>📚 各科目成绩趋势</template>
      <div ref="subChartRef" class="chart-box-wide"></div>
    </el-card>

    <el-card shadow="never" style="margin-top: 20px;">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <span>📊 学生多次年级排名趋势 (含波动参考线)</span>
          <el-radio-group v-model="selectedGradeRankSubject" size="small" @change="updateGradeRankChart">
            <el-radio-button label="总分">总分排名</el-radio-button>
            <el-radio-button
                v-for="sub in availableRankSubjects"
                :key="sub"
                :label="sub"
            >
              {{ sub }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <div ref="gradeRankChartRef" class="chart-box-wide"></div>

      <div style="text-align: center; color: #909399; font-size: 12px; margin-top: 5px;">
        <span style="margin-right: 15px;">💡 说明：排名数值越小越好</span>
        <span>--- 虚线表示历史波动的：高位值(最差)、低位值(最好)、中位数</span>
      </div>
    </el-card>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" @click="exportReport">导出报告</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import * as XLSX from 'xlsx';
import _ from 'lodash';

const props = defineProps(['studentName', 'historyData']);
const visible = ref(false);

const totalChartRef = ref(null);
const rankChartRef = ref(null);
const subChartRef = ref(null);
// 🟢 新增年级排名图表 Ref
const gradeRankChartRef = ref(null);
let gradeRankChartInstance = null;
const selectedGradeRankSubject = ref('总分');

// --- 计算属性 ---
const examCount = computed(() => props.historyData.length);
const scores = computed(() => props.historyData.map(h => h.data['总分']));
// 这里依然保留班级排名作为“最新排名”的展示，或者根据需求改为年级排名
const ranks = computed(() => props.historyData.map(h => h.data['班级排名'] || h.data['排名']));
const avgTotal = computed(() => (_.mean(scores.value) || 0).toFixed(1));
const maxTotal = computed(() => _.max(scores.value) || 0);
const minTotal = computed(() => _.min(scores.value) || 0);
const latestRank = computed(() => ranks.value.length > 0 ? ranks.value[ranks.value.length - 1] : '-');
const avgRank = computed(() => ranks.value.length > 0 ? Math.round(_.mean(ranks.value)) : '-');

const improvement = computed(() => {
  if (scores.value.length < 2) return 0;
  const current = scores.value[scores.value.length - 1];
  const prev = scores.value[scores.value.length - 2];
  return (current - prev).toFixed(1);
});

// 计算有哪些科目存在年级排名数据 (字段名包含 _grade_rank)
const availableRankSubjects = computed(() => {
  const subjects = new Set();
  props.historyData.forEach(h => {
    Object.keys(h.data).forEach(k => {
      if (k.endsWith('_grade_rank')) {
        subjects.add(k.replace('_grade_rank', ''));
      }
    });
  });
  return Array.from(subjects);
});

const open = (name, history, subjects, rules) => {
  visible.value = true;
};

const initCharts = async () => {
  await nextTick();
  if(!props.historyData || props.historyData.length === 0) return;

  const examNames = props.historyData.map(h => h.examName);

  // 1. 总分趋势图
  const totalChart = echarts.init(totalChartRef.value);
  totalChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: examNames },
    yAxis: { scale: true },
    grid: { left: 40, right: 20, top: 30, bottom: 20 },
    series: [{
      data: scores.value,
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.2 },
      itemStyle: { color: '#409EFF' },
      label: { show: true }
    }]
  });

  // 2. 班级排名趋势图
  const rankChart = echarts.init(rankChartRef.value);
  rankChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: examNames },
    yAxis: { inverse: true, min: 1, scale: true, minInterval: 1 },
    grid: { left: 40, right: 20, top: 30, bottom: 20 },
    series: [{
      data: ranks.value,
      type: 'line',
      itemStyle: { color: '#F56C6C' },
      markPoint: { data: [{ type: 'min', name: '最高排名' }] },
      label: { show: true }
    }]
  });

  // 3. 各科成绩趋势图
  const subChart = echarts.init(subChartRef.value);
  let allSubjects = new Set();
  const excludeKeys = ['姓名','总分','排名','班级排名','年级排名','学号','avg','rankDelta','班级'];

  props.historyData.forEach(h => {
    Object.keys(h.data).forEach(k => {
      if (!excludeKeys.includes(k) && !k.endsWith('_grade_rank')) allSubjects.add(k);
    });
  });
  const subjectsArr = Array.from(allSubjects);

  const seriesList = subjectsArr.map(sub => ({
    name: sub,
    type: 'line',
    data: props.historyData.map(h => h.data[sub] || 0)
  }));

  subChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: subjectsArr, top: 0, type: 'scroll' },
    grid: { left: 40, right: 20, top: 40, bottom: 20 },
    xAxis: { type: 'category', data: examNames },
    yAxis: {},
    series: seriesList
  });

  // 🟢 4. 初始化年级排名折线图
  selectedGradeRankSubject.value = '总分'; // 默认选中总分
  gradeRankChartInstance = echarts.init(gradeRankChartRef.value);
  updateGradeRankChart();
};

// 🟢 更新年级排名图表的逻辑
const updateGradeRankChart = () => {
  if (!gradeRankChartInstance) return;

  const examNames = props.historyData.map(h => h.examName);
  const subject = selectedGradeRankSubject.value;
  let ranksData = [];

  // 根据选择获取对应的数据列
  if (subject === '总分') {
    ranksData = props.historyData.map(h => {
      const r = h.data['年级排名'];
      return (r !== undefined && r !== null && r !== '') ? Number(r) : null;
    });
  } else {
    const key = `${subject}_grade_rank`;
    ranksData = props.historyData.map(h => {
      const r = h.data[key];
      return (r !== undefined && r !== null && r !== '') ? Number(r) : null;
    });
  }

  // 计算参考线数据 (Max, Min, Median)
  const validRanks = ranksData.filter(r => r !== null && !isNaN(r));
  let maxVal = null;    // 数值最大 -> 排名最差 (高位值)
  let minVal = null;    // 数值最小 -> 排名最好 (低位值)
  let medianVal = null;

  if (validRanks.length > 0) {
    maxVal = _.max(validRanks);
    minVal = _.min(validRanks);

    // 计算中位数
    const sorted = [...validRanks].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      medianVal = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      medianVal = sorted[mid];
    }
  }

  // ECharts 配置
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 60, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: examNames,
      axisLabel: { interval: 0 }
    },
    yAxis: {
      type: 'value',
      inverse: true, // 排名图通常翻转轴，使排名1在最上方
      min: 1,
      minInterval: 1,
      name: '年级排名'
    },
    series: [
      {
        name: `${subject}年级排名`,
        type: 'line',
        data: ranksData,
        symbolSize: 8,
        lineStyle: { width: 3, color: '#626aef' }, // 强调主线
        itemStyle: { color: '#626aef' },
        label: { show: true, position: 'top' },
        markLine: {
          symbol: 'none',
          data: [
            // 虚线定义：yAxis 对应 Y 轴数值
            { yAxis: minVal, name: '最好', label: { formatter: '低位值(最好): {c}' }, lineStyle: { color: '#67C23A', type: 'dashed' } },
            { yAxis: maxVal, name: '最差', label: { formatter: '高位值(最差): {c}' }, lineStyle: { color: '#F56C6C', type: 'dashed' } },
            { yAxis: medianVal, name: '中位数', label: { formatter: '中位数: {c}' }, lineStyle: { color: '#E6A23C', type: 'dashed', width: 2 } }
          ],
          silent: true // 鼠标悬停不显示 MarkLine 的 tooltip
        }
      }
    ]
  };

  gradeRankChartInstance.setOption(option, true); // true:不仅合并，而是重置选项（清除旧数据）
};

const exportReport = () => {
  if (!props.historyData || props.historyData.length === 0) {
    return ElMessage.warning('暂无数据可导出');
  }

  // 1. 获取所有科目列
  let allSubjects = new Set();
  props.historyData.forEach(h => {
    Object.keys(h.data).forEach(k => {
      if (!['姓名','总分','排名','班级排名','学号', 'avg', 'rankDelta'].includes(k) && !k.endsWith('_grade_rank')) {
        allSubjects.add(k);
      }
    });
  });
  const subjectsArr = Array.from(allSubjects);

  // 2. 构建 Excel 行数据
  const rows = props.historyData.map(item => {
    const row = {
      '考试名称': item.examName,
      '总分': item.data['总分'],
      '班级排名': item.data['班级排名'] || item.data['排名'],
      '年级排名': item.data['年级排名'] || '-'
    };

    // 填充科目成绩
    subjectsArr.forEach(sub => {
      row[sub] = item.data[sub] !== undefined ? item.data[sub] : '-';
      // 如果有年级排名数据，也导出来
      const rankKey = `${sub}_grade_rank`;
      if (item.data[rankKey]) {
        row[`${sub}年排`] = item.data[rankKey];
      }
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "成绩档案");

  const fileName = `${props.studentName}_个人成绩分析报告.xlsx`;
  XLSX.writeFile(wb, fileName);
  ElMessage.success(`已导出：${fileName}`);
};

defineExpose({ open });
</script>

<style scoped>
.detail-cards .card { padding: 20px; border-radius: 8px; color: white; text-align: center; margin-bottom: 10px; }
.blue-card { background: linear-gradient(135deg, #409EFF, #337ecc); }
.green-card { background: linear-gradient(135deg, #67C23A, #529b2e); }
.cyan-card { background: linear-gradient(135deg, #00CED1, #008B8B); }
.value { font-size: 32px; font-weight: bold; margin: 10px 0; }
.sub { font-size: 12px; opacity: 0.8; }
.chart-box { height: 300px; width: 100%; }
.chart-box-wide { height: 350px; width: 100%; }
</style>
