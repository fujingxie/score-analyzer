<template>
  <div class="result-container">
    <div class="result-header">
      <div class="header-left">
        <div class="icon-box"><el-icon><DataAnalysis /></el-icon></div>
        <h2>多班级成绩对比结果 - {{ examName || '未命名考试' }}</h2>
      </div>
      <div class="header-right">
        <span class="label">当前分析科目:</span>
        <el-select v-model="currentSubject" placeholder="选择科目" size="default" style="width: 120px; margin-right: 12px">
          <el-option label="总分" value="total" />
          <el-option v-for="sub in subjects" :key="sub" :label="sub" :value="sub" />
        </el-select>

        <el-button size="default" @click="$emit('back')">返回</el-button>
        <el-button type="primary" size="default" icon="Download" @click="exportReport">导出报告</el-button>
      </div>
    </div>

    <div class="section-title"><el-icon><Trophy /></el-icon> 核心指标总览</div>
    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-header"><span class="class-tag" style="color: #606266;">考试名称</span></div>
        <div class="score-val" style="font-size: 18px; margin: 5px 0;">{{ examName || '期末联考' }}</div>
        <div class="kpi-main-text">当前分析场次</div>
      </div>
      <div class="kpi-card" v-for="(item, index) in kpiCards" :key="index">
        <div class="kpi-header">
          <span class="class-tag">{{ item.className }}</span>
          <span class="score-val">{{ item.value }}</span>
        </div>
        <div class="kpi-main-text">
          {{ item.label }}
          <span class="trend-icon" v-if="item.isBest"><el-icon><Top /></el-icon></span>
        </div>
        <div class="kpi-sub">{{ item.subText }}</div>
      </div>
    </div>

    <div class="section-title" style="margin-top: 20px;"><el-icon><TrendCharts /></el-icon> 班级趋势对比</div>
    <div class="charts-grid">
      <el-card shadow="hover" class="chart-card">
        <template #header>多班级总分对比</template>
        <div ref="totalTrendRef" class="chart-box"></div>
      </el-card>
      <el-card shadow="hover" class="chart-card">
        <template #header>班级平均分趋势对比</template>
        <div ref="avgTrendRef" class="chart-box"></div>
      </el-card>
      <el-card shadow="hover" class="chart-card">
        <template #header>班级排名趋势</template>
        <div ref="rankTrendRef" class="chart-box"></div>
      </el-card>
    </div>

    <div class="section-title" style="margin-top: 20px;"><el-icon><Histogram /></el-icon> 班级分数结构对比</div>
    <div class="charts-grid">
      <el-card shadow="hover" class="chart-card">
        <template #header>平均分 & 最高分对比</template>
        <div ref="avgChartRef" class="chart-box"></div>
      </el-card>
      <el-card shadow="hover" class="chart-card">
        <template #header>优秀率 & 及格率对比</template>
        <div ref="rateChartRef" class="chart-box"></div>
      </el-card>
      <el-card shadow="hover" class="chart-card">
        <template #header>分段人数分布</template>
        <div ref="pieChartRef" class="chart-box"></div>
      </el-card>
    </div>

    <div class="section-title" style="margin-top: 25px;"><el-icon><List /></el-icon> 班级表现榜</div>
    <el-card shadow="never" class="table-card">
      <el-table :data="comparisonData" style="width: 100%" :header-cell-style="purpleHeaderStyle" stripe>
        <el-table-column prop="name" label="班级名称" width="100" align="center" fixed />
        <el-table-column prop="avg" label="平均分" align="center" sortable>
          <template #default="scope"><span style="font-weight: bold; color: #626aef;">{{ scope.row.avg }}</span></template>
        </el-table-column>
        <el-table-column prop="totalScoreSum" label="总分" align="center" sortable />
        <el-table-column label="均分差" align="center">
          <template #default="scope">
            <span :class="getDiffColor(scope.row.avgDiff)">
              {{ scope.row.avgDiff > 0 ? '+' : ''}}{{ scope.row.avgDiff }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="参考人数" align="center" width="90" />
        <el-table-column prop="counts.excellent" label="优秀人数" align="center" />
        <el-table-column prop="counts.pass" label="及格人数" align="center" />
        <el-table-column prop="counts.fail" label="不及格人数" align="center" />
        <el-table-column prop="excellentRate" label="优秀率" align="center" sortable width="90"/>
        <el-table-column prop="passRate" label="及格率" align="center" sortable width="90"/>
        <el-table-column prop="lowRate" label="低分率" align="center" sortable width="90"/>
        <el-table-column prop="rank" label="班级排行" align="center" width="100">
          <template #default="scope">第 {{ scope.row.rank }} 名</template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="section-title" style="margin-top: 25px;"><el-icon><DataLine /></el-icon> 各班级优秀率、及格率、不及格人数统计</div>
    <el-card shadow="never" class="table-card">
      <el-table :data="comparisonData" style="width: 100%" :header-cell-style="purpleHeaderStyle" stripe>
        <el-table-column prop="rank" label="排名" width="60" align="center" />
        <el-table-column prop="name" label="班级名称" width="100" align="center" />
        <el-table-column prop="count" label="学生总数" align="center" />

        <el-table-column prop="counts.excellent" label="优秀人数" align="center" />
        <el-table-column label="优秀率" align="center" width="130">
          <template #default="scope">
            <div class="clickable-cell" @click="handleShowStudentList(scope.row, 'excellent')">
              <el-tag effect="plain" type="warning" class="click-tag">{{ scope.row.excellentRate }}%</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="counts.pass" label="及格人数" align="center" />
        <el-table-column label="及格率" align="center" width="130">
          <template #default="scope">
            <div class="clickable-cell" @click="handleShowStudentList(scope.row, 'pass')">
              <el-tag effect="plain" type="success" class="click-tag">{{ scope.row.passRate }}%</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="counts.fail" label="不及格人数" align="center" />
        <el-table-column prop="lowRate" label="不及格率" align="center">
          <template #default="scope"><el-tag effect="plain" type="danger">{{ scope.row.lowRate }}%</el-tag></template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="160">
          <template #default="scope">
            <el-button
                type="danger"
                plain
                size="small"
                v-if="scope.row.counts.fail > 0"
                @click="handleShowStudentList(scope.row, 'fail')"
            >
              查看不及格 ({{ scope.row.counts.fail }})
            </el-button>
            <span v-else style="color: #67c23a; font-size: 12px;">全员及格 🎉</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="section-title" style="margin-top: 25px;"><el-icon><Medal /></el-icon> 年级成绩排行 (前50名)</div>
    <el-card shadow="never" class="table-card">
      <el-table :data="top50Students" style="width: 100%" :header-cell-style="purpleHeaderStyle" stripe height="400">
        <el-table-column type="index" label="排名" width="80" align="center">
          <template #default="scope">
            <div class="rank-badge" :class="'rank-'+(scope.$index+1)">{{ scope.$index + 1 }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="姓名" label="姓名" align="center" />
        <el-table-column prop="className" label="班级" align="center">
          <template #default="scope"><el-tag round>{{ scope.row.className }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="score" label="分数" align="center">
          <template #default="scope"><span style="font-weight: bold; color: #626aef; font-size: 16px;">{{ scope.row.score }}</span></template>
        </el-table-column>
      </el-table>
    </el-card>

    <div style="height: 40px;"></div>

    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="800px"
        align-center
        destroy-on-close
    >
      <div class="dialog-summary-bar">
        <span>{{ dialogSummary.lineDesc }}：<strong>{{ dialogSummary.lineVal }}</strong> 分</span>
        <span class="divider">|</span>
        <span>人数：<strong>{{ dialogList.length }}</strong> 人</span>
        <span class="divider">|</span>
        <span>科目：<strong>{{ currentSubject === 'total' ? '总分' : currentSubject }}</strong></span>
      </div>

      <el-table :data="dialogList" style="width: 100%" height="400" stripe :header-cell-style="purpleHeaderStyle">
        <el-table-column type="index" label="排名" width="80" align="center" />
        <el-table-column prop="name" label="姓名" align="center" />
        <el-table-column prop="score" label="分数" align="center">
          <template #default="scope"><span style="font-weight: bold; color: #303133;">{{ scope.row.score }}</span></template>
        </el-table-column>
        <el-table-column prop="className" label="班级" align="center" />
        <el-table-column v-if="dialogType === 'fail'" label="与及格线差距" align="center">
          <template #default="scope">
            <span style="color: #F56C6C;">{{ scope.row.gap }}</span>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" icon="Download" @click="exportModalData">导出列表</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { DataAnalysis, Trophy, Histogram, Top, Download, TrendCharts, List, DataLine, Medal } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import * as XLSX from 'xlsx';
import _ from 'lodash';

// --- Props & Emits ---
const props = defineProps({
  classList: { type: Array, required: true },
  examName: { type: String, default: '' },
  // 核心：接收来自父组件的配置规则
  examRules: { type: Object, default: () => ({}) }
});
const emit = defineEmits(['back']);

// --- State ---
const currentSubject = ref('total');
// Refs
const avgChartRef = ref(null);
const rateChartRef = ref(null);
const pieChartRef = ref(null);
const totalTrendRef = ref(null);
const avgTrendRef = ref(null);
const rankTrendRef = ref(null);

// Dialog State
const dialogVisible = ref(false);
const dialogTitle = ref('');
const dialogType = ref('');
const dialogList = ref([]);
const dialogSummary = ref({ lineDesc: '', lineVal: 0 });

// --- 1. 提取科目 ---
const subjects = computed(() => {
  if (!props.classList.length) return [];
  return props.classList[0].stats.subjects || [];
});

// --- 2. 核心数据计算 ---
const comparisonData = computed(() => {
  const subject = currentSubject.value;
  // 获取当前科目的规则
  const rule = props.examRules[subject] || { fullMark: 100, passLine: 60, excellentLine: 85 };

  const { fullMark, passLine, excellentLine } = rule;
  const lowLine = Number((fullMark * 0.4).toFixed(1));

  const rawData = props.classList.map(cls => {
    let scores = [];
    if (subject === 'total') {
      scores = cls.rawData.map(s => s._total);
    } else {
      scores = cls.rawData.map(s => Number(s[subject]) || 0);
    }

    const count = scores.length;
    const sum = _.sum(scores);
    const avg = count > 0 ? (sum / count).toFixed(1) : 0;
    const max = _.max(scores) || 0;
    const min = _.min(scores) || 0;

    const passCountTotal = scores.filter(s => s >= passLine).length;
    const excellentCountTotal = scores.filter(s => s >= excellentLine).length;
    const lowCountTotal = scores.filter(s => s <= lowLine).length;
    const failCount = scores.filter(s => s < passLine).length;

    const segExcellent = excellentCountTotal;
    const segPass = scores.filter(s => s >= passLine && s < excellentLine).length;
    const segImprove = scores.filter(s => s > lowLine && s < passLine).length;
    const segLow = lowCountTotal;

    return {
      name: cls.name,
      totalScoreSum: sum.toFixed(1),
      avg: Number(avg),
      max, min, count,
      counts: { excellent: excellentCountTotal, pass: passCountTotal, fail: failCount, low: lowCountTotal },
      passRate: count > 0 ? ((passCountTotal / count) * 100).toFixed(1) : 0,
      excellentRate: count > 0 ? ((excellentCountTotal / count) * 100).toFixed(1) : 0,
      lowRate: count > 0 ? ((lowCountTotal / count) * 100).toFixed(1) : 0,
      segments: { excellent: segExcellent, pass: segPass, improve: segImprove, low: segLow },
      thresholds: { excellentLine, passLine, lowLine },
      rawScores: cls.rawData
    };
  });

  const totalGradeScore = _.sumBy(rawData, c => Number(c.totalScoreSum));
  const totalGradeCount = _.sumBy(rawData, 'count');
  const gradeAvg = totalGradeCount > 0 ? totalGradeScore / totalGradeCount : 0;
  const sortedByAvg = _.orderBy(rawData, ['avg'], ['desc']);

  return rawData.map(item => {
    const rank = sortedByAvg.findIndex(r => r.name === item.name) + 1;
    const avgDiff = (item.avg - gradeAvg).toFixed(1);
    return { ...item, rank, avgDiff };
  });
});

// Top 50
const top50Students = computed(() => {
  const subject = currentSubject.value;
  let allStudents = [];
  props.classList.forEach(cls => {
    const studentsWithScore = cls.rawData.map(s => ({
      '姓名': s['姓名'],
      'className': cls.name,
      'score': subject === 'total' ? s._total : (Number(s[subject]) || 0)
    }));
    allStudents = allStudents.concat(studentsWithScore);
  });
  return _.orderBy(allStudents, ['score'], ['desc']).slice(0, 50);
});

// KPI
const kpiCards = computed(() => {
  const data = comparisonData.value;
  if (!data.length) return [];
  const bestAvg = _.maxBy(data, 'avg');
  const bestExcellent = _.maxBy(data, c => Number(c.excellentRate));
  const bestLow = _.minBy(data, c => Number(c.lowRate));
  const highestScoreObj = _.maxBy(data, 'max');
  return [
    { label: '平均分第一', className: bestAvg.name, value: bestAvg.avg, subText: '年级领跑', isBest: true },
    { label: '优秀率第一', className: bestExcellent.name, value: bestExcellent.excellentRate + '%', subText: `占比最高`, isBest: true },
    { label: '低分率最低', className: bestLow.name, value: bestLow.lowRate + '%', subText: '后进生最少', isBest: true },
    { label: '最高分所在', className: highestScoreObj.name, value: highestScoreObj.max, subText: '单科状元', isBest: false }
  ];
});

// --- Dialog Logic ---
const handleShowStudentList = (row, type) => {
  dialogType.value = type;
  const subject = currentSubject.value;
  const { excellentLine, passLine } = row.thresholds;

  if (type === 'excellent') {
    dialogTitle.value = `${row.name} - 优秀学生列表`;
    dialogSummary.value = { lineDesc: '优秀线', lineVal: excellentLine };
  } else if (type === 'pass') {
    dialogTitle.value = `${row.name} - 及格学生列表`;
    dialogSummary.value = { lineDesc: '及格线', lineVal: passLine };
  } else if (type === 'fail') {
    dialogTitle.value = `${row.name} - 不及格学生列表 (需关注)`;
    dialogSummary.value = { lineDesc: '及格线', lineVal: passLine };
  }

  const students = row.rawScores.map(s => {
    const score = subject === 'total' ? s._total : (Number(s[subject]) || 0);
    return {
      name: s['姓名'],
      className: row.name,
      score: score,
      gap: (score - passLine).toFixed(1)
    };
  });

  let filtered = [];
  if (type === 'excellent') filtered = students.filter(s => s.score >= excellentLine);
  else if (type === 'pass') filtered = students.filter(s => s.score >= passLine);
  else if (type === 'fail') filtered = students.filter(s => s.score < passLine);

  dialogList.value = _.orderBy(filtered, ['score'], ['desc']);
  dialogVisible.value = true;
};

const exportModalData = () => {
  const wb = XLSX.utils.book_new();
  const data = dialogList.value.map((s, i) => {
    const row = { '排名': i+1, '姓名': s.name, '班级': s.className, '分数': s.score };
    if (dialogType.value === 'fail') row['与及格线差距'] = s.gap;
    return row;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, dialogTitle.value);
  XLSX.writeFile(wb, `${dialogTitle.value}.xlsx`);
};

// --- Charts ---
const renderCharts = () => {
  const data = _.sortBy(comparisonData.value, 'name');
  const names = data.map(c => c.name);
  const { excellentLine, passLine, lowLine } = data[0]?.thresholds || { excellentLine: 85, passLine: 60, lowLine: 40 };
  const commonGrid = { top: 40, left: 50, right: 20, bottom: 20, containLabel: true };

  if (totalTrendRef.value) {
    echarts.init(totalTrendRef.value).setOption({
      tooltip: { trigger: 'axis' }, grid: commonGrid, xAxis: { type: 'category', data: names, boundaryGap: false },
      yAxis: { type: 'value', min: 'dataMin' }, series: [{ type: 'line', smooth: true, data: data.map(c => c.totalScoreSum), itemStyle: { color: '#409EFF' }, areaStyle: { opacity: 0.2 } }]
    });
  }
  if (avgTrendRef.value) {
    echarts.init(avgTrendRef.value).setOption({
      tooltip: { trigger: 'axis' }, grid: commonGrid, xAxis: { type: 'category', data: names, boundaryGap: false },
      yAxis: { type: 'value', min: 'dataMin' }, series: [{ type: 'line', smooth: true, data: data.map(c => c.avg), itemStyle: { color: '#67C23A' }, areaStyle: { opacity: 0.2 } }]
    });
  }
  if (rankTrendRef.value) {
    echarts.init(rankTrendRef.value).setOption({
      tooltip: { trigger: 'axis' }, grid: commonGrid, xAxis: { type: 'category', data: names, boundaryGap: false },
      yAxis: { type: 'value', inverse: true, min: 1, interval: 1 }, series: [{ type: 'line', smooth: true, data: data.map(c => c.rank), itemStyle: { color: '#F56C6C' } }]
    });
  }
  if (avgChartRef.value) {
    echarts.init(avgChartRef.value).setOption({
      tooltip: { trigger: 'axis' }, legend: { top: 0, icon: 'circle' }, grid: commonGrid, xAxis: { type: 'category', data: names }, yAxis: { type: 'value' },
      series: [{ name: '平均分', type: 'bar', data: data.map(c => c.avg), itemStyle: { color: '#409EFF', borderRadius: [4,4,0,0] } }, { name: '最高分', type: 'bar', data: data.map(c => c.max), itemStyle: { color: '#67C23A', borderRadius: [4,4,0,0] } }]
    });
  }
  if (rateChartRef.value) {
    echarts.init(rateChartRef.value).setOption({
      tooltip: { trigger: 'axis' }, legend: { top: 0, icon: 'circle' }, grid: commonGrid, xAxis: { type: 'category', data: names }, yAxis: { type: 'value', max: 100 },
      series: [
        { name: `优秀率 (≥${excellentLine})`, type: 'bar', data: data.map(c => c.excellentRate), itemStyle: { color: '#E6A23C', borderRadius: [4,4,0,0] } },
        { name: `及格率 (≥${passLine})`, type: 'bar', data: data.map(c => c.passRate), itemStyle: { color: '#A0CFFF', borderRadius: [4,4,0,0] } },
        { name: `低分率 (≤${lowLine})`, type: 'bar', data: data.map(c => c.lowRate), itemStyle: { color: '#F56C6C', borderRadius: [4,4,0,0] } }
      ]
    });
  }
  if (pieChartRef.value) {
    const totalExcellent = _.sumBy(data, c => c.segments.excellent);
    const totalPass = _.sumBy(data, c => c.segments.pass);
    const totalImprove = _.sumBy(data, c => c.segments.improve);
    const totalLow = _.sumBy(data, c => c.segments.low);
    echarts.init(pieChartRef.value).setOption({
      tooltip: { trigger: 'item' }, legend: { bottom: 0, icon: 'circle' },
      series: [{
        type: 'pie', radius: ['45%', '70%'], center: ['50%', '45%'],
        itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{c}人 ({d}%)' },
        data: [
          { value: totalExcellent, name: `优秀 (≥${excellentLine})`, itemStyle: { color: '#409EFF' } },
          { value: totalPass, name: `及格 (${passLine}-${excellentLine})`, itemStyle: { color: '#67C23A' } },
          { value: totalImprove, name: `待提升 (${lowLine}-${passLine})`, itemStyle: { color: '#E6A23C' } },
          { value: totalLow, name: `低分 (≤${lowLine})`, itemStyle: { color: '#F56C6C' } }
        ]
      }]
    });
  }
};

watch(currentSubject, () => { nextTick(() => {
  [avgChartRef, rateChartRef, pieChartRef, totalTrendRef, avgTrendRef, rankTrendRef].forEach(ref => { if(ref.value) echarts.getInstanceByDom(ref.value)?.dispose(); });
  renderCharts();
}); });

onMounted(() => { nextTick(() => renderCharts()); window.addEventListener('resize', () => {
  [avgChartRef, rateChartRef, pieChartRef, totalTrendRef, avgTrendRef, rankTrendRef].forEach(ref => { if(ref.value) echarts.getInstanceByDom(ref.value)?.resize(); });
}); });

const purpleHeaderStyle = { background: '#7c5cfc', color: '#fff', fontWeight: 'bold' };
const getDiffColor = (val) => Number(val) > 0 ? 'text-green' : (Number(val) < 0 ? 'text-red' : '');
// --- 5. 导出功能 (补全逻辑) ---
const exportReport = () => {
  // 1. 准备工作簿
  const wb = XLSX.utils.book_new();

  // 2. 准备数据源
  // 我们需要把 comparisonData 里的数据转换成中文表头的格式
  const data = comparisonData.value.map(item => ({
    '排名': item.rank,
    '班级名称': item.name,
    '平均分': item.avg,
    '总分': item.totalScoreSum,
    '均分差': item.avgDiff, // 记得在 computed 里确保计算了这个字段
    '学生总数': item.count,
    '最高分': item.max,
    '最低分': item.min,
    '优秀人数': item.counts.excellent,
    '优秀率': item.excellentRate + '%',
    '及格人数': item.counts.pass,
    '及格率': item.passRate + '%',
    '不及格人数': item.counts.fail,
    '低分率': item.lowRate + '%'
  }));

  // 3. 生成 Sheet
  const ws = XLSX.utils.json_to_sheet(data);

  // 4. 设置列宽 (可选优化)
  ws['!cols'] = [
    { wch: 6 },  // 排名
    { wch: 10 }, // 班级
    { wch: 8 },  // 均分
    { wch: 10 }, // 总分
    { wch: 8 },  // 均分差
    { wch: 8 },  // 人数
    { wch: 8 },  // 最高
    { wch: 8 },  // 最低
    { wch: 10 }, // 优数
    { wch: 10 }, // 优率
    { wch: 10 }, // 及数
    { wch: 10 }, // 及率
    { wch: 10 }, // 不及数
    { wch: 10 }  // 低率
  ];

  // 5. 添加到工作簿并下载
  // 文件名带上科目和时间戳，防止覆盖
  const fileName = `多班级对比报表_${currentSubject.value}_${new Date().toLocaleDateString()}.xlsx`;
  XLSX.utils.book_append_sheet(wb, ws, `${currentSubject.value}分析`);
  XLSX.writeFile(wb, fileName);
};
</script>

<style scoped>
.result-container { width: 100%; min-height: 100%; padding: 10px 20px 40px 20px; background-color: #f5f7fa; box-sizing: border-box; }
.result-header { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 12px 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.header-left { display: flex; align-items: center; gap: 12px; }
.icon-box { width: 36px; height: 36px; background: linear-gradient(135deg, #626aef, #8590ff); color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.header-left h2 { margin: 0; font-size: 18px; color: #303133; }
.section-title { font-size: 15px; font-weight: bold; color: #303133; margin: 20px 0 12px 0; display: flex; align-items: center; gap: 8px; }
.kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
.kpi-card { background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.03); border: 1px solid #ebeef5; display: flex; flex-direction: column; justify-content: center; min-height: 100px; }
.kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.class-tag { font-size: 14px; font-weight: bold; color: #409EFF; }
.score-val { font-size: 26px; font-weight: 800; color: #303133; line-height: 1.2; }
.kpi-main-text { font-size: 13px; color: #909399; margin-bottom: 0; display: flex; align-items: center; gap: 4px; }
.trend-icon { color: #F56C6C; font-weight: bold; font-size: 14px; }
.kpi-sub { font-size: 12px; color: #67C23A; background: #f0f9eb; display: inline-block; padding: 2px 6px; border-radius: 4px; margin-top: 6px; width: fit-content; }
.charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 20px; }
.chart-card { border-radius: 8px; border: none; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); }
.chart-box { height: 350px; width: 100%; }
.text-green { color: #67C23A; font-weight: bold; }
.text-red { color: #F56C6C; font-weight: bold; }
.rank-badge { width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 4px; background: #f0f2f5; color: #909399; font-weight: bold; margin: 0 auto; }
.rank-1 { background: #FFC107; color: white; }
.rank-2 { background: #A0CFFF; color: white; }
.rank-3 { background: #E6A23C; color: white; }
.table-card { border-radius: 8px; border: none; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); }

/* 🟢 点击标签样式优化 (去掉箭头 + 强制不换行) */
.clickable-cell { cursor: pointer; display: flex; justify-content: center; align-items: center; height: 100%; }
.click-tag {
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; padding: 0 12px; height: 28px;
  border-radius: 14px; white-space: nowrap; min-width: 60px;
}
.click-tag:hover { opacity: 0.8; transform: translateY(-1px); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }

.dialog-summary-bar { background: #fdf6ec; color: #e6a23c; padding: 10px 15px; border-radius: 4px; margin-bottom: 15px; font-size: 14px; display: flex; align-items: center; }
.dialog-summary-bar .divider { margin: 0 15px; color: #dcdfe6; }
.dialog-footer { text-align: right; margin-top: 10px; }

@media (max-width: 768px) {
  .result-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .header-right { width: 100%; justify-content: space-between; }
  .charts-grid { grid-template-columns: 1fr; }
}
</style>
