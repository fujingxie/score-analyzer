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

    <el-card v-if="hasAnyRankData" shadow="never" style="margin-top: 20px;">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>📊 综合排名趋势 (总分/单科)</span>
          <el-tag size="small" type="info">点击图例可 隐藏/显示 对应科目</el-tag>
        </div>
      </template>

      <div ref="rankingChartRef" class="chart-box-wide"></div>

      <div style="text-align: center; color: #909399; font-size: 12px; margin-top: 5px;">
        <span style="margin-right: 15px;">💡 提示：排名数值越小越靠前</span>
        <span>--- 虚线表示【总分排名】的历史波动范围（最高/最低/中位）</span>
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
// 🟢 改名：rankingChartRef (不再局限于年级排名)
const rankingChartRef = ref(null);

// --- 计算属性 ---
const examCount = computed(() => props.historyData.length);
const scores = computed(() => props.historyData.map(h => h.data['总分']));
// 这里的 ranks 依然主要用于展示班级排名的单项卡片
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

// 🟢 核心修改：判断是否有任何类型的排名数据 (用于决定是否显示卡片)
const hasAnyRankData = computed(() => {
  if (!props.historyData || props.historyData.length === 0) return false;
  // 1. 检查总分年级排名
  const hasTotalGradeRank = props.historyData.some(h => h.data['年级排名']);
  if (hasTotalGradeRank) return true;

  // 2. 检查是否有任意科目排名 (_grade_rank 或 _rank)
  const hasSubRank = props.historyData.some(h => {
    return Object.keys(h.data).some(k => k.endsWith('_grade_rank') || k.endsWith('_rank'));
  });
  return hasSubRank;
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
      // 排除掉排名列，只画分数列
      if (!excludeKeys.includes(k) && !k.endsWith('_grade_rank') && !k.endsWith('_rank')) {
        allSubjects.add(k);
      }
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

  // 🟢 4. 综合排名趋势图 (多系列混合)
  if (hasAnyRankData.value && rankingChartRef.value) {
    const rankingChart = echarts.init(rankingChartRef.value);

    // 4.1 收集所有排名 Series
    const rankSeries = [];
    const legendData = [];

    // --- A. 总分年级排名 (带波动参考线) ---
    const totalRanks = props.historyData.map(h => {
      const r = h.data['年级排名'];
      return (r !== undefined && r !== null && r !== '') ? Number(r) : null;
    });

    // 只有当存在有效总分排名数据时才添加
    if (totalRanks.some(r => r !== null)) {
      legendData.push('总分年排');

      // 计算波动参考 (Max/Min/Median)
      const validTotal = totalRanks.filter(r => r !== null);
      let maxVal = _.max(validTotal);
      let minVal = _.min(validTotal);
      let medianVal = 0;
      if(validTotal.length > 0) {
        const sorted = [...validTotal].sort((a,b)=>a-b);
        const mid = Math.floor(sorted.length/2);
        medianVal = sorted.length%2!==0 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
      }

      rankSeries.push({
        name: '总分年排',
        type: 'line',
        data: totalRanks,
        symbolSize: 8,
        lineStyle: { width: 4, color: '#626aef' }, // 总分线加粗
        itemStyle: { color: '#626aef' },
        label: { show: true, position: 'top', formatter: '{c}' },
        // 仅总分显示参考线，避免太乱
        markLine: {
          symbol: 'none',
          data: [
            { yAxis: minVal, label: { formatter: '最好: {c}' }, lineStyle: { color: '#67C23A', type: 'dashed' } },
            { yAxis: maxVal, label: { formatter: '最差: {c}' }, lineStyle: { color: '#F56C6C', type: 'dashed' } },
            { yAxis: medianVal, label: { formatter: '中位: {c}' }, lineStyle: { color: '#E6A23C', type: 'dashed' } }
          ],
          silent: true
        }
      });
    }

    // --- B. 自动扫描所有科目排名 (包括 _grade_rank 和 _rank) ---
    const subRankKeys = new Set();
    props.historyData.forEach(h => {
      Object.keys(h.data).forEach(k => {
        // 只要是以 _rank 或 _grade_rank 结尾，且不是被禁用的关键词
        if ((k.endsWith('_grade_rank') || k.endsWith('_rank')) && !['班级排名', '年级排名', '排名'].includes(k)) {
          subRankKeys.add(k);
        }
      });
    });

    subRankKeys.forEach(key => {
      const isGradeRank = key.endsWith('_grade_rank');
      const subName = key.replace(isGradeRank ? '_grade_rank' : '_rank', '');

      // 区分图例名称：如果是年级排名显示"年排"，否则显示"排名"
      const labelName = isGradeRank ? `${subName}年排` : `${subName}排名`;

      const data = props.historyData.map(h => {
        const r = h.data[key];
        return (r !== undefined && r !== null && r !== '') ? Number(r) : null;
      });

      // 只有当该列有有效数据时才添加到图表
      if (data.some(r => r !== null)) {
        legendData.push(labelName);
        rankSeries.push({
          name: labelName,
          type: 'line',
          data: data,
          smooth: true,
          lineStyle: { width: 2 },
          connectNulls: true, // 允许断点连接
          label: { show: false } // 科目就不显示具体数字了，避免重叠
        });
      }
    });

    rankingChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: legendData, top: 0, type: 'scroll' }, // 支持点击图例筛选
      grid: { left: 50, right: 50, top: 40, bottom: 20 },
      xAxis: { type: 'category', data: examNames },
      yAxis: {
        type: 'value',
        inverse: true, // 排名越小越上面
        min: 1,
        minInterval: 1,
        scale: true
      },
      series: rankSeries
    });
  }
};

const exportReport = () => {
  if (!props.historyData || props.historyData.length === 0) {
    return ElMessage.warning('暂无数据可导出');
  }

  let allSubjects = new Set();
  props.historyData.forEach(h => {
    Object.keys(h.data).forEach(k => {
      // 导出时排除排名列
      if (!['姓名','总分','排名','班级排名','学号', 'avg', 'rankDelta'].includes(k) && !k.endsWith('_grade_rank') && !k.endsWith('_rank')) {
        allSubjects.add(k);
      }
    });
  });
  const subjectsArr = Array.from(allSubjects);

  const rows = props.historyData.map(item => {
    const row = {
      '考试名称': item.examName,
      '总分': item.data['总分'],
      '班级排名': item.data['班级排名'] || item.data['排名'],
      '年级排名': item.data['年级排名'] || '-'
    };

    subjectsArr.forEach(sub => {
      row[sub] = item.data[sub] !== undefined ? item.data[sub] : '-';
      if (item.data[`${sub}_grade_rank`]) {
        row[`${sub}年排`] = item.data[`${sub}_grade_rank`];
      }
      if (item.data[`${sub}_rank`]) {
        row[`${sub}排名`] = item.data[`${sub}_rank`];
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
