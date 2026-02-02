<template>
  <div class="grade-ranking-container" ref="exportAreaRef">
    <div class="top-toolbar">
      <div class="left-group">
        <el-button @click="clearAll" :icon="Delete" plain>清除所有数据</el-button>
      </div>

      <div class="right-group">
        <el-upload
            action="#"
            :auto-upload="false"
            multiple
            :show-file-list="false"
            :on-change="handleUpload"
            accept=".xlsx, .xls"
            style="display: inline-block; margin-right: 12px;"
        >
          <el-button type="primary" color="#626aef" :icon="Plus">
            导入班级表格 (支持多选)
          </el-button>
        </el-upload>

        <el-button type="success" plain @click="exportCompleteData">
          <el-icon style="margin-right: 5px"><Document /></el-icon> 导出完整数据
        </el-button>
        <el-button type="warning" plain @click="exportImage">
          <el-icon style="margin-right: 5px"><Picture /></el-icon> 导出截图
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="kpi-row" v-if="hasData">
      <el-col :span="6">
        <div class="kpi-card purple-gradient">
          <div class="kpi-title">班级总数</div>
          <div class="kpi-value">{{ classList.length }}</div>
          <div class="kpi-desc">个班级</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="kpi-card purple-gradient">
          <div class="kpi-title">学生总数</div>
          <div class="kpi-value">{{ totalStudentsCount }}</div>
          <div class="kpi-desc">名学生</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="kpi-card purple-gradient">
          <div class="kpi-title">年级平均分 (总)</div>
          <div class="kpi-value">{{ gradeAvgTotal }}</div>
          <div class="kpi-desc">满分 {{ examRules['total']?.fullMark || '-' }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="kpi-card purple-gradient">
          <div class="kpi-title">年级总及格率</div>
          <div class="kpi-value">{{ gradeAvgPassRate }}%</div>
          <div class="kpi-desc">及格线 {{ examRules['total']?.passLine || '-' }}</div>
        </div>
      </el-col>
    </el-row>

    <div v-if="hasData" class="charts-section">
      <div class="section-title">📈 班级趋势分析 (折线图)</div>
      <el-row :gutter="20">
        <el-col :span="8"><el-card shadow="hover" class="chart-card"><template #header>班级总分趋势</template><div ref="totalScoreTrendRef" class="chart-box"></div></el-card></el-col>
        <el-col :span="8"><el-card shadow="hover" class="chart-card"><template #header>班级排名趋势</template><div ref="rankTrendRef" class="chart-box"></div></el-card></el-col>
        <el-col :span="8"><el-card shadow="hover" class="chart-card"><template #header>班级均分趋势</template><div ref="avgScoreTrendRef" class="chart-box"></div></el-card></el-col>
      </el-row>
    </div>

    <div v-if="hasData" class="charts-section">
      <div class="section-title">📊 班级多维对比 (柱状图)</div>
      <el-row :gutter="20">
        <el-col :span="6"><el-card shadow="hover" class="chart-card"><template #header>平均分对比</template><div ref="avgChartRef" class="chart-box-small"></div></el-card></el-col>
        <el-col :span="6"><el-card shadow="hover" class="chart-card"><template #header>及格率对比</template><div ref="passChartRef" class="chart-box-small"></div></el-card></el-col>
        <el-col :span="6"><el-card shadow="hover" class="chart-card"><template #header>优秀率对比</template><div ref="excellentChartRef" class="chart-box-small"></div></el-card></el-col>
        <el-col :span="6"><el-card shadow="hover" class="chart-card"><template #header>人数对比</template><div ref="countChartRef" class="chart-box-small"></div></el-card></el-col>
      </el-row>
    </div>

    <el-card shadow="never" class="section-card" v-if="hasData" style="margin-top: 25px">
      <template #header>
        <div class="card-header">
          <div class="title-area">
            <span class="icon-box"><el-icon><Trophy /></el-icon></span>
            <span class="title-text">班级综合排名 (总分)</span>
          </div>
          <div class="control-area">
            <el-select v-model="classSortKey" size="default" style="width: 160px">
              <el-option label="按平均分排序" value="avg" />
              <el-option label="按及格率排序" value="passRate" />
              <el-option label="按优秀率排序" value="excellentRate" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="sortedClassList" style="width: 100%" :header-cell-style="headerStyle" stripe>
        <el-table-column type="index" label="排名" width="80" align="center">
          <template #default="scope">
            <div class="rank-badge" :class="'rank-'+(scope.$index+1)">{{ scope.$index + 1 }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="班级名称" width="120" align="center" />
        <el-table-column prop="count" label="人数" width="80" align="center" />
        <el-table-column prop="totalScoreSum" label="总分" align="center" />
        <el-table-column prop="avg" label="平均分" align="center" sortable>
          <template #default="scope"><span class="highlight-score">{{ scope.row.avg }}</span></template>
        </el-table-column>
        <el-table-column prop="passRate" label="及格率" align="center" sortable />
        <el-table-column prop="excellentRate" label="优秀率" align="center" sortable />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click="handleViewDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="danger" plain @click="removeClass(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="section-card" style="margin-top: 25px" v-if="hasData">
      <template #header>
        <div class="card-header">
          <div class="title-area">
            <span class="icon-box orange"><el-icon><Collection /></el-icon></span>
            <span class="title-text">单科班级排名</span>
          </div>
          <div class="control-area">
            <span class="label">选择科目:</span>
            <el-select v-model="selectedSubject" placeholder="请选择" size="default" style="width: 140px; margin-right: 15px">
              <el-option v-for="sub in allSubjects" :key="sub" :label="sub" :value="sub" />
            </el-select>
            <el-button type="primary" plain :icon="Download" @click="exportSingleSubjectRanking">导出表格</el-button>
          </div>
        </div>
      </template>

      <el-table :data="singleSubjectRankingData" style="width: 100%" :header-cell-style="headerStyleBlue" border stripe>
        <el-table-column label="排名" type="index" width="80" align="center">
          <template #default="scope">
            <span class="rank-text" :class="'text-rank-'+(scope.$index+1)">第{{ scope.$index + 1 }}名</span>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级" width="120" align="center" />
        <el-table-column prop="total" label="总分" align="center" />
        <el-table-column prop="avg" label="平均分" align="center" sortable />
        <el-table-column label="均分差" align="center">
          <template #default="scope">
               <span :class="Number(scope.row.diff) >= 0 ? 'text-green' : 'text-red'">
                  {{ Number(scope.row.diff) > 0 ? '+' : '' }}{{ scope.row.diff }}
               </span>
          </template>
        </el-table-column>
        <el-table-column prop="passRate" label="及格率" align="center" sortable />
        <el-table-column prop="excellentRate" label="优秀率" align="center" sortable />
        <el-table-column prop="lowRate" label="低分率" align="center" sortable />
      </el-table>
    </el-card>

    <el-card shadow="never" class="section-card" style="margin-top: 25px" v-if="hasData">
      <template #header>
        <div class="card-header">
          <div class="title-area">
            <span class="icon-box blue"><el-icon><Medal /></el-icon></span>
            <span class="title-text">年级总排名 (含各科明细)</span>
          </div>
          <div class="control-area">
            <el-select v-model="filterClass" size="small" style="width: 130px; margin-right: 15px">
              <el-option label="全部学生" value="ALL" />
              <el-option v-for="c in classList" :key="c.name" :label="c.name" :value="c.name" />
            </el-select>
            <el-select v-model="studentSortOrder" size="small" style="width: 130px; margin-right: 15px">
              <el-option label="按排名升序" value="asc" />
              <el-option label="按排名降序" value="desc" />
            </el-select>
            <el-button size="small" type="primary" :icon="Download" @click="exportLeaderboard">导出榜单</el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredStudentList" height="600" style="width: 100%" :header-cell-style="headerStyle" stripe fit>
        <el-table-column prop="gradeRank" label="年级排名" width="100" align="center" fixed>
          <template #default="scope">
            <span style="font-weight: bold; font-family: monospace; color: #606266;">{{ scope.row.gradeRank }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="班级" label="班级" width="110" align="center">
          <template #default="scope">
            <el-tag :type="getClassTagType(scope.row['班级'])" effect="light" round size="small">{{ scope.row['班级'] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="学号" label="学号" width="130" align="center" show-overflow-tooltip />
        <el-table-column prop="姓名" label="姓名" min-width="100" align="center" />
        <el-table-column prop="总分" label="总分" align="center" sortable min-width="100">
          <template #default="scope"><span class="total-score-text">{{ scope.row['总分'] }}</span></template>
        </el-table-column>
        <el-table-column v-for="sub in allSubjects" :key="sub" :prop="sub" :label="sub" align="center" min-width="80">
          <template #default="scope">
            <span :class="getScoreClass(scope.row[sub], sub)">{{ scope.row[sub] !== undefined ? scope.row[sub] : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="classRank" label="班级排名" width="100" align="center">
          <template #default="scope"><span style="color: #909399;">{{ scope.row.classRank }}</span></template>
        </el-table-column>
      </el-table>
    </el-card>

    <div v-if="!hasData" class="empty-placeholder">
      <el-empty description="请点击上方【导入班级表格】开始分析" :image-size="200" />
    </div>

    <el-dialog v-model="classConfirmDialogVisible" title="⚠️ 补充班级信息" width="500px" align-center :close-on-click-modal="false">
      <el-alert title="检测到文件缺少【班级】列。请确认或修改所属班级名称（默认使用文件名）。" type="warning" show-icon :closable="false" style="margin-bottom:15px"/>
      <el-table :data="classConfirmList" border size="small" max-height="400">
        <el-table-column prop="fileName" label="文件名" />
        <el-table-column label="所属班级 (必填)" width="200">
          <template #default="scope">
            <el-input v-model="scope.row.tempClassName" placeholder="请输入班级名" />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="classConfirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleClassConfirm">确认并继续</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="ruleDialogVisible" title="⚙️ 请确认考试满分标准" width="600px" align-center :close-on-click-modal="false">
      <el-alert title="系统已自动过滤非科目数据。已根据最高分自动推测满分，请核对。" type="success" show-icon :closable="false" style="margin-bottom:15px"/>
      <el-table :data="ruleList" border stripe size="small">
        <el-table-column prop="label" label="科目" width="100" align="center" />
        <el-table-column label="满分 (可修改)" align="center">
          <template #default="scope">
            <el-input-number v-model="scope.row.full" :min="10" :max="1000" :step="10" size="small" @change="handleRuleChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="及格线 (60%)" align="center">
          <template #default="scope"><span style="color:#67c23a">{{ scope.row.pass }}</span></template>
        </el-table-column>
        <el-table-column label="优秀线 (85%)" align="center">
          <template #default="scope"><span style="color:#e6a23c">{{ scope.row.excellent }}</span></template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRulesAndProcess">确认并生成排名</el-button>
      </template>
    </el-dialog>

    <ClassDetailModal ref="detailModalRef" />
  </div>
</template>

<script setup>
import { ref, computed, toRaw, watch, nextTick, onMounted } from 'vue';
import { Delete, Upload, Document, Picture, Plus, Trophy, Medal, Download, ArrowLeft, Collection } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as XLSX from 'xlsx';
import _ from 'lodash';
import html2canvas from 'html2canvas';
import * as echarts from 'echarts';
import ClassDetailModal from './ClassDetailModal.vue';

// --- State ---
const classList = ref([]);
const allSubjects = ref([]);
const classSortKey = ref('avg');
const filterClass = ref('ALL');
const studentSortOrder = ref('asc');
const selectedSubject = ref('');
const exportAreaRef = ref(null);
const detailModalRef = ref(null);

// 流程控制相关
const classConfirmDialogVisible = ref(false);
const classConfirmList = ref([]);
const rawFileBuffer = ref([]);
const pendingDataBuffer = ref([]);

const ruleDialogVisible = ref(false);
const ruleList = ref([]);
const examRules = ref({});

// Chart Refs (略)
const totalScoreTrendRef = ref(null);
const avgScoreTrendRef = ref(null);
const rankTrendRef = ref(null);
const avgChartRef = ref(null);
const passChartRef = ref(null);
const excellentChartRef = ref(null);
const countChartRef = ref(null);

const hasData = computed(() => classList.value.length > 0);

// --- KPI Computed ---
const totalStudentsCount = computed(() => _.sumBy(classList.value, 'count'));
const gradeAvgTotal = computed(() => {
  if (!hasData.value) return 0;
  return (_.meanBy(classList.value, c => Number(c.avg))).toFixed(1);
});
const gradeAvgPassRate = computed(() => {
  if (!hasData.value) return 0;
  let totalPass = 0;
  let totalCount = 0;
  classList.value.forEach(cls => {
    if (cls.rawStudents) {
      const passLine = examRules.value['total']?.passLine || 60;
      totalPass += cls.rawStudents.filter(s => s['总分'] >= passLine).length;
      totalCount += cls.rawStudents.length;
    }
  });
  return totalCount > 0 ? ((totalPass / totalCount) * 100).toFixed(1) : 0;
});

// --- 渲染图表 --- (保持不变)
const renderCharts = () => {
  if (!hasData.value) return;
  const sortedForCharts = _.sortBy(classList.value, 'name');
  const names = sortedForCharts.map(c => c.name);

  if (totalScoreTrendRef.value) initLineChart(totalScoreTrendRef.value, '总分', names, sortedForCharts.map(c => c.totalScoreSum), '#409EFF');
  if (rankTrendRef.value) {
    const ranks = _.orderBy(sortedForCharts, ['avg'], ['desc']).map(c => c.name);
    const chart = echarts.init(rankTrendRef.value);
    chart.setOption({
      tooltip: { trigger: 'axis' }, grid: { bottom: 20, top: 30, left: 50, right: 20 },
      xAxis: { type: 'category', data: names, boundaryGap: false },
      yAxis: { type: 'value', inverse: true, min: 1, max: classList.value.length, interval: 1 },
      series: [{ type: 'line', smooth: true, data: sortedForCharts.map(c => ranks.indexOf(c.name) + 1), itemStyle: { color: '#F56C6C' }, label: { show: true, formatter: '第{c}名' } }]
    });
  }
  if (avgScoreTrendRef.value) initLineChart(avgScoreTrendRef.value, '均分', names, sortedForCharts.map(c => c.avg), '#67C23A');

  if (avgChartRef.value) initBarChart(avgChartRef.value, names, sortedForCharts.map(c => c.avg), '#626aef');
  if (passChartRef.value) initBarChart(passChartRef.value, names, sortedForCharts.map(c => parseFloat(c.passRate)), '#67C23A', '%');
  if (excellentChartRef.value) initBarChart(excellentChartRef.value, names, sortedForCharts.map(c => parseFloat(c.excellentRate)), '#E6A23C', '%');
  if (countChartRef.value) initBarChart(countChartRef.value, names, sortedForCharts.map(c => c.count), '#409EFF');
};

const initLineChart = (dom, name, x, y, color) => {
  echarts.init(dom).setOption({
    tooltip: { trigger: 'axis' }, grid: { bottom: 20, top: 30, left: 50, right: 20 },
    xAxis: { type: 'category', data: x, boundaryGap: false }, yAxis: { type: 'value', min: 'dataMin' },
    series: [{ type: 'line', smooth: true, data: y, itemStyle: { color }, label: { show: true } }]
  });
};
const initBarChart = (dom, x, y, color, unit='') => {
  echarts.init(dom).setOption({
    tooltip: { trigger: 'axis' }, grid: { bottom: 20, top: 30, left: 40, right: 10 },
    xAxis: { type: 'category', data: x }, yAxis: { type: 'value' },
    series: [{ type: 'bar', barWidth: '40%', data: y, itemStyle: { color, borderRadius: [3, 3, 0, 0] }, label: { show: true, position: 'top', formatter: `{c}${unit}` } }]
  });
};

watch(classList, () => { nextTick(() => renderCharts()); }, { deep: true });

// --- 单科排名逻辑 --- (保持不变)
const singleSubjectRankingData = computed(() => {
  if (!selectedSubject.value || !hasData.value) return [];
  const subject = selectedSubject.value;
  const rule = examRules.value[subject] || { fullMark: 100, passLine: 60, excellentLine: 85, lowLine: 40 };

  let totalScoreSum = 0; let totalStudentCount = 0;

  const rawData = classList.value.map(cls => {
    const scores = cls.rawStudents.map(s => Number(s[subject]) || 0);
    const count = scores.length;
    totalScoreSum += _.sum(scores);
    totalStudentCount += count;
    const sum = _.sum(scores);
    const avg = count > 0 ? sum / count : 0;

    const passCount = scores.filter(s => s >= rule.passLine).length;
    const excellentCount = scores.filter(s => s >= rule.excellentLine).length;
    const lowCount = scores.filter(s => s <= rule.lowLine).length;

    return {
      className: cls.name, total: sum.toFixed(1), avg: avg,
      passCount, passRate: count > 0 ? ((passCount / count) * 100).toFixed(1) + '%' : '0.0%',
      excellentCount, excellentRate: count > 0 ? ((excellentCount / count) * 100).toFixed(1) + '%' : '0.0%',
      lowCount, lowRate: count > 0 ? ((lowCount / count) * 100).toFixed(1) + '%' : '0.0%',
      count
    };
  });

  const gradeSubjectAvg = totalStudentCount > 0 ? totalScoreSum / totalStudentCount : 0;
  const finalData = rawData.map(item => ({ ...item, avg: item.avg.toFixed(1), diff: (item.avg - gradeSubjectAvg).toFixed(1) }));
  return _.orderBy(finalData, row => Number(row.avg), ['desc']);
});

watch(allSubjects, (newVal) => { if (newVal.length > 0 && !selectedSubject.value) selectedSubject.value = newVal[0]; });

// --- Standard Lists ---
const sortedClassList = computed(() => {
  if (['passRate', 'excellentRate'].includes(classSortKey.value)) return _.orderBy(classList.value, c => parseFloat(c[classSortKey.value]), ['desc']);
  return _.orderBy(classList.value, [classSortKey.value], ['desc']);
});

const allStudentsWithRank = computed(() => {
  let all = []; classList.value.forEach(cls => all = all.concat(cls.rawStudents || []));
  all = _.orderBy(all, ['总分'], ['desc']);
  return all.map((stu, index) => ({ ...stu, gradeRank: index + 1 }));
});

const filteredStudentList = computed(() => {
  let list = allStudentsWithRank.value;
  if (filterClass.value !== 'ALL') list = list.filter(s => s['班级'] === filterClass.value);
  return _.orderBy(list, ['gradeRank'], [studentSortOrder.value]);
});

// --- Helpers ---
const headerStyle = { background: '#7c5cfc', color: '#ffffff', fontWeight: '600', textAlign: 'center', height: '50px' };
const headerStyleBlue = { background: '#409eff', color: '#ffffff', fontWeight: '600', textAlign: 'center', height: '50px' };

const getClassTagType = (name) => {
  if (!name) return 'info';
  if (name.includes('1') || name.includes('一')) return 'success';
  if (name.includes('2') || name.includes('二')) return 'warning';
  if (name.includes('3') || name.includes('三')) return 'danger';
  return 'primary';
};

const getScoreClass = (val, subject) => {
  if (val === undefined || val === '') return '';
  const rule = examRules.value[subject];
  const passLine = rule ? rule.passLine : 60;
  return Number(val) < passLine ? 'score-fail' : '';
};

// 🟢 --- 核心上传逻辑 ---

const handleUpload = async (uploadFile) => {
  const file = uploadFile.raw;
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(sheet);

  if (!jsonData.length) return;

  rawFileBuffer.value.push({ fileName: file.name, data: jsonData });
  processFilesDebounced();
};

const processFilesDebounced = _.debounce(() => {
  const files = [...rawFileBuffer.value];
  rawFileBuffer.value = [];

  if (files.length === 0) return;

  const toConfirm = [];
  const ready = [];

  files.forEach(fileObj => {
    const firstRow = fileObj.data[0];

    // 🟢 核心修改：只检查 "班级" 字段，忽略 "班名"
    // 这样如果只有 "班名" 也会进入 else，从而弹窗提醒
    if (firstRow['班级']) {
      const result = cleanAndExtractSubjects(fileObj.data);
      ready.push(result);
    } else {
      toConfirm.push({
        fileName: fileObj.fileName,
        tempClassName: fileObj.fileName.replace(/\.[^/.]+$/, ""),
        data: fileObj.data
      });
    }
  });

  ready.forEach(item => {
    pendingDataBuffer.value.push(item);
    item.subjects.forEach(s => { if (!allSubjects.value.includes(s)) allSubjects.value.push(s); });
  });

  if (toConfirm.length > 0) {
    classConfirmList.value = toConfirm;
    classConfirmDialogVisible.value = true;
  } else {
    if (pendingDataBuffer.value.length > 0) {
      prepareRuleDialog();
    }
  }

}, 300);

// 3. 通用数据清洗与提取函数
const cleanAndExtractSubjects = (jsonData, defaultClassName = null) => {
  const headers = Object.keys(jsonData[0]);

  const processedData = jsonData.map(row => {
    const newRow = { ...row };

    if (row['成绩'] !== undefined) newRow['总分'] = Number(row['成绩']);
    else if (row['总分'] !== undefined) newRow['总分'] = Number(row['总分']);

    if (row['级名'] !== undefined) newRow['年级排名'] = row['级名'];
    else if (row['年级排名'] !== undefined) newRow['年级排名'] = row['年级排名'];

    // 🟢 核心修改：移除 "班名" -> "班级" 的自动映射
    // 只有在弹窗确认后（defaultClassName 存在）才赋值，或者原数据就有 "班级" 列
    if (defaultClassName) {
      newRow['班级'] = defaultClassName;
    }
    // 注意：这里删除了 if (row['班名']) newRow['班级'] = row['班名']; 的逻辑

    headers.forEach(header => {
      if (header.endsWith(' 成绩')) {
        const realSubName = header.replace(' 成绩', '').trim();
        newRow[realSubName] = Number(row[header]);
        const rankHeaderSpace = realSubName + ' 级名';
        const rankHeaderNoSpace = realSubName + '级名';
        if (row[rankHeaderSpace] !== undefined) newRow[realSubName + '_grade_rank'] = row[rankHeaderSpace];
        else if (row[rankHeaderNoSpace] !== undefined) newRow[realSubName + '_grade_rank'] = row[rankHeaderNoSpace];
      }
    });
    return newRow;
  });

  const excludeCols = [
    '姓名', '学号', '班级', '班名', '排名', '班级排名', '年级排名', '级名',
    '总分', '成绩', '考号', '座位号', 'classRank', 'gradeRank', 'avg', 'rankDelta'
  ];
  const sample = processedData[0];
  const potentialSubjects = new Set();

  Object.keys(sample).forEach(key => {
    if (key.endsWith('_grade_rank')) return;
    if (excludeCols.includes(key)) return;
    if (key.endsWith(' 成绩')) return;
    if (key.endsWith(' 级名')) return;
    if (!isNaN(Number(sample[key]))) {
      potentialSubjects.add(key);
    }
  });

  return {
    className: defaultClassName || processedData[0]['班级'] || '未命名班级',
    students: processedData,
    subjects: Array.from(potentialSubjects)
  };
};

// 4. 班级确认后的处理
const handleClassConfirm = () => {
  for (const item of classConfirmList.value) {
    if (!item.tempClassName.trim()) {
      ElMessage.warning(`文件 ${item.fileName} 的班级名称不能为空`);
      return;
    }
  }

  classConfirmList.value.forEach(item => {
    const result = cleanAndExtractSubjects(item.data, item.tempClassName);
    pendingDataBuffer.value.push(result);
    result.subjects.forEach(s => { if (!allSubjects.value.includes(s)) allSubjects.value.push(s); });
  });

  classConfirmList.value = [];
  classConfirmDialogVisible.value = false;
  prepareRuleDialog();
};

// 5. 准备规则
const prepareRuleDialog = () => {
  let maxTotal = 0;
  pendingDataBuffer.value.forEach(item => {
    item.students.forEach(s => {
      let t = 0;
      if (s['总分'] !== undefined) {
        t = Number(s['总分']);
      } else {
        item.subjects.forEach(sub => t += (Number(s[sub]) || 0));
      }
      if (t > maxTotal) maxTotal = t;
    });
  });

  const rules = [];
  let totalFull = 100;
  if (maxTotal > 600) totalFull = 750;
  else if (maxTotal > 300) totalFull = Math.ceil(maxTotal / 50) * 50;
  else if (maxTotal > 120) totalFull = 150;

  rules.push({ key: 'total', label: '总分', full: totalFull, pass: totalFull*0.6, excellent: totalFull*0.85, low: totalFull*0.4 });

  allSubjects.value.forEach(sub => {
    let subMax = 0;
    pendingDataBuffer.value.forEach(item => {
      if (item.subjects.includes(sub)) {
        item.students.forEach(s => {
          const v = Number(s[sub]) || 0;
          if (v > subMax) subMax = v;
        });
      }
    });

    let subFull = 100;
    if (['语文','数学','英语','English','Chinese','Math'].some(k => sub.includes(k))) subFull = 150;
    else if (subMax > 100) subFull = 120;
    if (subMax > 120) subFull = 150;

    rules.push({
      key: sub, label: sub, full: subFull,
      pass: Number((subFull*0.6).toFixed(1)),
      excellent: Number((subFull*0.85).toFixed(1)),
      low: Number((subFull*0.4).toFixed(1))
    });
  });

  ruleList.value = rules;
  ruleDialogVisible.value = true;
};

const handleRuleChange = (row) => {
  row.pass = Number((row.full * 0.6).toFixed(1));
  row.excellent = Number((row.full * 0.85).toFixed(1));
  row.low = Number((row.full * 0.4).toFixed(1));
};

const confirmRulesAndProcess = () => {
  const rulesMap = {};
  ruleList.value.forEach(r => {
    rulesMap[r.key] = { fullMark: r.full, passLine: r.pass, excellentLine: r.excellent, lowLine: r.low };
  });
  examRules.value = rulesMap;

  pendingDataBuffer.value.forEach(item => {
    processClassData(item.className, item.students, item.subjects);
  });

  pendingDataBuffer.value = [];
  ruleDialogVisible.value = false;
  ElMessage.success('数据分析完成，已应用最新评分标准');
};

const processClassData = (className, studentsJson, subjects) => {
  const students = studentsJson.map(row => {
    let total = 0;
    if (row['总分'] !== undefined) {
      total = Number(row['总分']);
    } else {
      subjects.forEach(sub => total += (Number(row[sub]) || 0));
    }
    const cls = row['班级'] || className;
    return { ...row, '班级': cls, '总分': total };
  });

  const grouped = _.groupBy(students, '班级');
  for (const cName in grouped) {
    addClassStats(cName, grouped[cName], subjects);
  }
};

const addClassStats = (name, students, subjects) => {
  const scores = students.map(s => s['总分']);
  const count = scores.length;
  const sum = _.sum(scores);
  const avg = (sum / count).toFixed(1);
  const max = _.max(scores);
  const min = _.min(scores);

  const totalRule = examRules.value['total'] || { passLine: 60, excellentLine: 85 };

  const passCount = scores.filter(s => s >= totalRule.passLine).length;
  const passRate = ((passCount / count) * 100).toFixed(1) + '%';
  const excellentRate = ((scores.filter(s => s >= totalRule.excellentLine).length / count) * 100).toFixed(1) + '%';
  const failCount = count - passCount;

  const rankedStudents = _.orderBy(students, [
    (s) => {
      const val = Number(s['总分']);
      return isNaN(val) ? -Infinity : val;
    }
  ], ['desc']).map((s, i) => ({ ...s, classRank: i + 1 }));

  const stats = {
    name, count, totalScoreSum: sum.toFixed(1), avg: Number(avg), max, min,
    passRate, passCount, excellentRate, failCount,
    students: rankedStudents,
    rawStudents: rankedStudents
  };

  const idx = classList.value.findIndex(c => c.name === name);
  if (idx !== -1) classList.value[idx] = stats;
  else classList.value.push(stats);
};

const handleViewDetail = (row) => {
  if (detailModalRef.value) {
    const rawRow = toRaw(row);
    const classStudents = allStudentsWithRank.value.filter(s => s['班级'] === row.name);
    detailModalRef.value.open(rawRow, classStudents, allSubjects.value);
  }
};

const removeClass = (index) => classList.value.splice(index, 1);
const clearAll = () => { classList.value = []; allSubjects.value = []; selectedSubject.value = ''; pendingDataBuffer.value = []; };

const exportSingleSubjectRanking = () => {
  if (!singleSubjectRankingData.value.length) return;
  const wb = XLSX.utils.book_new();
  const data = singleSubjectRankingData.value.map((item, index) => ({
    '排名': index + 1, '班级': item.className, '总分': item.total, '平均分': item.avg,
    '均分差': item.diff, '及格率': item.passRate, '及格人数': item.passCount,
    '优秀率': item.excellentRate, '优秀人数': item.excellentCount, '低分率': item.lowRate,
    '低分人数': item.lowCount, '参考人数': item.count
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), `${selectedSubject.value}班级排名`);
  XLSX.writeFile(wb, `${selectedSubject.value}班级排名_${new Date().toLocaleDateString()}.xlsx`);
};

const exportCompleteData = () => {
  if (!hasData.value) return;
  const wb = XLSX.utils.book_new();
  const rankData = allStudentsWithRank.value.map(s => {
    const row = { '年级排名': s.gradeRank, '班级': s['班级'], '学号': s['学号'] || '', '姓名': s['姓名'], '总分': s['总分'] };
    allSubjects.value.forEach(sub => row[sub] = s[sub] !== undefined ? s[sub] : '');
    row['班级排名'] = s.classRank;
    return row;
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rankData), "年级总榜");
  const summary = sortedClassList.value.map((c, i) => ({
    '排名': i+1, '班级': c.name, '人数': c.count, '总分': c.totalScoreSum,
    '平均分': c.avg, '及格率': c.passRate, '优秀率': c.excellentRate
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "班级统计");
  XLSX.writeFile(wb, `年级完整分析数据包_${new Date().toLocaleDateString()}.xlsx`);
};

const exportLeaderboard = () => {
  if (!hasData.value) return;
  const wb = XLSX.utils.book_new();
  const rankData = allStudentsWithRank.value.map(s => {
    const row = { '年级排名': s.gradeRank, '班级': s['班级'], '学号': s['学号'] || '', '姓名': s['姓名'], '总分': s['总分'] };
    allSubjects.value.forEach(sub => row[sub] = s[sub] !== undefined ? s[sub] : '');
    row['班级排名'] = s.classRank;
    return row;
  });
  const ws = XLSX.utils.json_to_sheet(rankData);
  XLSX.utils.book_append_sheet(wb, ws, "年级成绩榜单");
  XLSX.writeFile(wb, `年级成绩榜单_${new Date().toLocaleDateString()}.xlsx`);
};

const exportImage = () => {
  html2canvas(exportAreaRef.value, { scale: 2, backgroundColor: '#f5f7fa' }).then(c => {
    const a = document.createElement('a'); a.href = c.toDataURL(); a.download = '年级排行榜.png'; a.click();
  });
};

onMounted(() => {
  window.addEventListener('resize', () => {
    [totalScoreTrendRef, avgScoreTrendRef, rankTrendRef, avgChartRef, passChartRef, excellentChartRef, countChartRef].forEach(ref => {
      if(ref.value) echarts.getInstanceByDom(ref.value)?.resize();
    });
  });
});
</script>

<style scoped>
.grade-ranking-container { padding: 20px; background-color: #f5f7fa; min-height: 100vh; }
.top-toolbar { background: #fff; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0,21,41,0.08); }
.kpi-row { margin-bottom: 20px; }
.kpi-card { height: 120px; border-radius: 12px; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 4px 15px rgba(124, 92, 252, 0.3); position: relative; overflow: hidden; }
.purple-gradient { background: linear-gradient(135deg, #8E7BF8 0%, #7C5CFC 100%); }
.kpi-title { font-size: 13px; opacity: 0.9; margin-bottom: 5px; }
.kpi-value { font-size: 40px; font-weight: bold; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.kpi-desc { font-size: 12px; opacity: 0.7; }
.charts-section { margin-bottom: 25px; }
.section-title { font-size: 16px; font-weight: bold; color: #303133; margin-bottom: 15px; border-left: 4px solid #7C5CFC; padding-left: 10px; }
.chart-card { border-radius: 8px; border: none; }
.chart-box { height: 300px; width: 100%; }
.chart-box-small { height: 250px; width: 100%; }
.section-card { border-radius: 8px; border: none; overflow: hidden; }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; }
.title-area { display: flex; align-items: center; gap: 8px; }
.icon-box { width: 24px; height: 24px; background: #f2f0ff; color: #7c5cfc; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
.icon-box.blue { background: #ecf5ff; color: #409eff; }
.icon-box.orange { background: #fdf6ec; color: #e6a23c; }
.title-text { font-size: 16px; font-weight: bold; color: #303133; }
.control-area { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #606266; }
.rank-badge { width: 26px; height: 26px; line-height: 26px; text-align: center; border-radius: 4px; font-weight: bold; color: #606266; background: #f0f2f5; margin: 0 auto; }
.rank-1 { background: #FFC107; color: white; box-shadow: 0 2px 6px rgba(255, 193, 7, 0.4); }
.rank-2 { background: #B0BCC7; color: white; }
.rank-3 { background: #E7A769; color: white; }
.highlight-score { color: #7c5cfc; font-weight: bold; }
.total-score-text { color: #626aef; font-weight: bold; }
.text-red { color: #f56c6c; font-weight: bold; }
.text-green { color: #67c23a; font-weight: bold; }
.text-gray { color: #dcdfe6; }
.score-fail { color: #f56c6c; font-weight: bold; }
.text-rank-1 { color: #ffc107; font-weight: bold; font-size: 16px; }
.text-rank-2 { color: #909399; font-weight: bold; font-size: 16px; }
.text-rank-3 { color: #e6a23c; font-weight: bold; font-size: 16px; }
.empty-placeholder { margin-top: 80px; }
</style>
