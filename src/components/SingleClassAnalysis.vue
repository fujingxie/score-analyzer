<template>
  <div class="sca-container">
    <div class="exam-tabs">
      <el-tag
          v-for="(exam, index) in examList"
          :key="exam.id"
          :effect="currentExamIndex === index ? 'dark' : 'plain'"
          size="large"
          closable
          class="exam-tag"
          @click="currentExamIndex = index"
          @close="deleteExam(index)"
      >
        {{ exam.name }}
      </el-tag>

      <div class="add-exam-box">
        <el-input
            v-model="newExamName"
            placeholder="输入考试名称 (如: 期中考试)"
            style="width: 200px; margin-right: 10px"
            @keyup.enter="addExam"
        />
        <el-button type="success" :icon="Plus" @click="addExam">添加考试</el-button>
      </div>
    </div>

    <template v-if="currentExam">

      <div v-if="!currentExam.hasData" class="upload-section">
        <el-card class="upload-card dashed-border">
          <div class="upload-inner">
            <el-icon :size="50" color="#909399"><DocumentAdd /></el-icon>
            <h3>上传【{{ currentExam.name }}】成绩表</h3>
            <p>支持列名：姓名 | 语文 成绩 | 语文 级名 | 成绩(总分) | 级名(年排) | 班名</p>
            <p style="font-size: 12px; color: #999">系统会自动清洗非科目数据，优先使用表内总分与排名</p>
            <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleUpload"
                accept=".xlsx, .xls"
                drag
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或 <em>点击上传</em>
              </div>
            </el-upload>
          </div>
        </el-card>
      </div>

      <div v-if="currentExam.hasData && !showAnalysisView" class="status-card-container">
        <el-card class="status-card">
          <h3>{{ currentExam.name }}</h3>
          <p>学生人数: {{ currentExam.data.length }}</p>
          <p>科目数量: {{ currentExam.subjects.length }}</p>
          <p class="success-text">状态: ✅ 已上传并配置规则</p>
          <div class="btn-group">
            <el-button type="primary" class="start-btn" @click="showAnalysisView = true">
              进入分析详情 🚀
            </el-button>
            <el-button plain class="start-btn" @click="reUpload">
              重新上传
            </el-button>
          </div>
        </el-card>
      </div>

      <div v-if="showAnalysisView" class="analysis-view">
        <div class="filter-bar">
          <h3>📈 分析结果 <el-tag type="success" size="small">专业版</el-tag></h3>
          <div class="filters">
            <el-select v-model="filterExamId" placeholder="选择考试" style="width: 150px">
              <el-option label="全部考试" :value="-1" />
              <el-option v-for="e in examList" :key="e.id" :label="e.name" :value="e.id" />
            </el-select>
            <el-select v-model="filterSubject" placeholder="全部科目" style="width: 150px; margin: 0 10px">
              <el-option label="全部科目" value="ALL" />
              <el-option v-for="sub in allSubjects" :key="sub" :label="sub" :value="sub" />
            </el-select>
            <el-button @click="showAnalysisView = false">返回</el-button>
            <el-button type="primary" @click="exportReport">导出报告</el-button>
          </div>
        </div>

        <el-row :gutter="20" class="summary-row">
          <el-col :span="6">
            <el-card class="sum-card c1">
              <template #header>📊 基础统计</template>
              <div class="sum-body">
                <div><h3>{{ stats.totalStudents }}</h3><p>总人数</p></div>
                <div><h3>{{ stats.examCount }}</h3><p>考试次数</p></div>
                <div><h3>{{ stats.subjectCount }}</h3><p>科目数量</p></div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="sum-card c2">
              <template #header>📈 分数统计</template>
              <div class="sum-body highlight">
                <div><h3 class="green">{{ stats.maxScore }}</h3><p>最高分</p></div>
                <div><h3 class="red">{{ stats.minScore }}</h3><p>最低分</p></div>
                <div><h3 class="blue">{{ stats.avgScore }}</h3><p>平均分</p></div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="sum-card c3">
              <template #header>✅ 及格概况</template>
              <div class="sum-body highlight">
                <div><h3 class="green">{{ stats.passCount }}</h3><p>及格人数</p></div>
                <div><h3 class="red">{{ stats.failCount }}</h3><p>不及格</p></div>
                <div><h3 class="blue">{{ stats.passRate }}</h3><p>及格率</p></div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="sum-card c4">
              <template #header>⭐ 培优概况</template>
              <div class="sum-body highlight white-text">
                <div><h3>{{ stats.excellentCount }}</h3><p>优秀人数</p></div>
                <div><h3>{{ stats.excellentRate }}</h3><p>优秀率</p></div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="table-card">
          <template #header>📄 学科指标对比 (基于当前考试标准)</template>
          <el-table :data="subjectComparisonData" stripe style="width: 100%">
            <el-table-column prop="subject" label="学科" />
            <el-table-column label="满分标准" align="center" width="100">
              <template #default="scope"><el-tag size="small" type="info">{{ scope.row.full }}分</el-tag></template>
            </el-table-column>
            <el-table-column prop="max" label="最高分" class-name="green-text" />
            <el-table-column prop="min" label="最低分" class-name="red-text" />
            <el-table-column prop="avg" label="平均分" />
            <el-table-column prop="passCount" label="及格人数" class-name="green-text" />
            <el-table-column prop="failCount" label="不及格人数" class-name="red-text" />
            <el-table-column prop="passRate" label="及格率" />
            <el-table-column prop="excellentRate" label="优秀率" class-name="green-text" />
          </el-table>
        </el-card>

        <el-card class="table-card" style="margin-top: 20px">
          <template #header>
            <div class="detail-header">
              <span>👥 学生成绩明细</span>
              <div class="search-box">
                <el-input v-model="searchText" placeholder="搜索学生姓名..." :prefix-icon="Search" style="width: 200px" />
                <el-checkbox v-model="showRankChange" style="margin-left: 15px">显示排名变化</el-checkbox>
              </div>
            </div>
          </template>

          <el-table :data="filteredStudents" stripe style="width: 100%" @sort-change="handleSort">
            <el-table-column prop="姓名" label="姓名" fixed width="100" />

            <el-table-column
                v-for="sub in currentDisplaySubjects"
                :key="sub"
                :prop="sub"
                :label="sub"
                sortable="custom"
                align="center"
            >
              <template #default="scope">
                <span :class="getScoreColor(scope.row[sub], sub)">{{ scope.row[sub] }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="总分" label="总分" sortable="custom" width="100" align="center">
              <template #default="scope"><strong>{{ scope.row['总分'] }}</strong></template>
            </el-table-column>
            <el-table-column prop="avg" label="平均分" width="100" align="center" />

            <el-table-column prop="年级排名" label="年级排名" sortable="custom" width="110" align="center">
              <template #default="scope">
                {{ scope.row['年级排名'] || '-' }}
              </template>
            </el-table-column>

            <el-table-column prop="班级排名" label="班级排名" sortable="custom" width="120" align="center">
              <template #default="scope">
                {{ scope.row['班级排名'] }}
                <span v-if="showRankChange && scope.row.rankDelta" :class="scope.row.rankDelta > 0 ? 'rank-up' : 'rank-down'">
                   {{ scope.row.rankDelta > 0 ? '↑' : '↓' }}{{ Math.abs(scope.row.rankDelta) }}
                 </span>
              </template>
            </el-table-column>

            <el-table-column label="操作" fixed="right" width="120" align="center">
              <template #default="scope">
                <el-button type="primary" size="small" @click="viewStudentDetail(scope.row)">
                  <el-icon><DataAnalysis /></el-icon> 详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <ClassComparisonSection
            v-if="currentExam.hasData"
            :my-class-data="currentExam.data"
            :subjects="currentExam.subjects"
            :rules="currentExam.rules"
        />
        <VisualizationSection
            :students="filteredStudents"
            :subjects="currentDisplaySubjects"
            :rules="currentExam.rules"
        />
        <TrendAnalysisSection :exam-list="examList" />
        <StudentHighlightSection
            v-if="currentExam.hasData"
            :students="currentExam.data"
            :subjects="currentExam.subjects"
            :rules="currentExam.rules"
        />
      </div>
    </template>

    <div v-else class="empty-state">
      <el-empty description="暂无考试记录，请在上方添加新考试" :image-size="200" />
    </div>

    <el-dialog v-model="ruleDialogVisible" title="⚙️ 确认考试科目与满分" width="600px" align-center :close-on-click-modal="false">
      <el-alert title="系统已自动识别以下科目，并过滤了排名/总分等无关列。请核对满分标准。" type="success" show-icon :closable="false" style="margin-bottom:15px"/>
      <el-table :data="ruleList" border stripe size="small">
        <el-table-column prop="label" label="科目" width="150" align="center" />
        <el-table-column label="满分 (可修改)" align="center">
          <template #default="scope">
            <el-input-number
                v-model="scope.row.full"
                :min="10" :max="1000" :step="10"
                size="small"
                @change="handleRuleChange(scope.row)"
            />
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
        <el-button type="primary" @click="confirmRules">确认并分析</el-button>
      </template>
    </el-dialog>

    <StudentDetail ref="detailModal" :student-name="detailName" :history-data="detailHistory" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { Plus, DocumentAdd, Search, DataAnalysis, UploadFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as XLSX from 'xlsx';
import _ from 'lodash';
// 引入子组件
import StudentDetail from './StudentDetail.vue';
import ClassComparisonSection from './ClassComparisonSection.vue';
import VisualizationSection from './VisualizationSection.vue';
import TrendAnalysisSection from './TrendAnalysisSection.vue';
import StudentHighlightSection from './StudentHighlightSection.vue';

// --- State ---
const newExamName = ref('');
const currentExamIndex = ref(0);
const showAnalysisView = ref(false);
const filterExamId = ref(-1);
const filterSubject = ref('ALL');
const searchText = ref('');
const showRankChange = ref(true);
const detailModal = ref(null);
const detailName = ref('');
const detailHistory = ref([]);

// 规则相关 State
const ruleDialogVisible = ref(false);
const ruleList = ref([]);
const pendingUploadData = ref(null);

// 考试列表
const examList = reactive([]);

// --- Computed ---
const currentExam = computed(() => examList[currentExamIndex.value]);

const allSubjects = computed(() => {
  const s = new Set();
  examList.forEach(e => e.subjects.forEach(sub => s.add(sub)));
  return Array.from(s);
});

// 获取当前上下文规则
const currentContextRules = computed(() => {
  if (filterExamId.value !== -1) {
    const target = examList.find(e => e.id === filterExamId.value);
    return target ? target.rules : {};
  } else {
    const validExams = examList.filter(e => e.hasData);
    return validExams.length > 0 ? validExams[validExams.length - 1].rules : {};
  }
});

const currentDisplaySubjects = computed(() => {
  if (filterSubject.value !== 'ALL') return [filterSubject.value];
  if (filterExamId.value !== -1) {
    const target = examList.find(e => e.id === filterExamId.value);
    return target ? target.subjects : [];
  }
  return allSubjects.value;
});

// 核心：筛选学生数据
const filteredStudents = computed(() => {
  let sourceData = [];
  if (filterExamId.value !== -1) {
    const target = examList.find(e => e.id === filterExamId.value);
    sourceData = target ? target.data : [];
  } else {
    const validExams = examList.filter(e => e.hasData);
    if (validExams.length > 0) sourceData = validExams[validExams.length - 1].data;
  }

  if (searchText.value) {
    const key = searchText.value.toLowerCase();
    sourceData = sourceData.filter(s =>
        String(s['姓名']).toLowerCase().includes(key) || String(s['学号']).includes(key)
    );
  }

  return sourceData.map(stu => ({
    ...stu,
    avg: (stu['总分'] / (currentDisplaySubjects.value.length || 1)).toFixed(1)
  }));
});

// 核心：Stats 计算 (带规则)
const stats = computed(() => {
  const students = filteredStudents.value;
  if (!students.length) return {
    totalStudents: 0, examCount: 0, subjectCount: 0,
    maxScore: 0, minScore: 0, avgScore: 0,
    passCount: 0, failCount: 0, passRate: '0%', excellentCount: 0, excellentRate: '0%'
  };

  const scores = students.map(s => s['总分']);
  const totalStudents = students.length;
  const maxScore = _.max(scores) || 0;
  const minScore = _.min(scores) || 0;
  const avgScore = (_.mean(scores) || 0).toFixed(1);

  const rules = currentContextRules.value;
  let totalPassLine = 0;
  let totalExcellentLine = 0;

  const subsToCheck = filterSubject.value === 'ALL' ? currentDisplaySubjects.value : [filterSubject.value];

  subsToCheck.forEach(sub => {
    const r = rules[sub] || { passLine: 60, excellentLine: 85 };
    totalPassLine += r.passLine;
    totalExcellentLine += r.excellentLine;
  });

  const passCount = scores.filter(s => s >= totalPassLine).length;
  const excellentCount = scores.filter(s => s >= totalExcellentLine).length;

  return {
    totalStudents,
    examCount: examList.filter(e => e.hasData).length,
    subjectCount: allSubjects.value.length,
    maxScore, minScore, avgScore,
    passCount,
    failCount: totalStudents - passCount,
    passRate: ((passCount / totalStudents) * 100).toFixed(1) + '%',
    excellentCount,
    excellentRate: ((excellentCount / totalStudents) * 100).toFixed(1) + '%'
  };
});

// 学科横向对比数据
const subjectComparisonData = computed(() => {
  const students = filteredStudents.value;
  if (!students.length) return [];
  const rules = currentContextRules.value;

  return currentDisplaySubjects.value.map(sub => {
    const scores = students.map(s => Number(s[sub]) || 0);
    const count = scores.length;
    const max = _.max(scores);
    const min = _.min(scores);
    const avg = (_.mean(scores)).toFixed(1);

    const r = rules[sub] || { fullMark: 100, passLine: 60, excellentLine: 85 };

    const passCount = scores.filter(s => s >= r.passLine).length;
    const excellentCount = scores.filter(s => s >= r.excellentLine).length;

    return {
      subject: sub, full: r.fullMark, max, min, avg,
      passCount,
      failCount: count - passCount,
      passRate: ((passCount / count) * 100).toFixed(1) + '%',
      excellentRate: ((excellentCount / count) * 100).toFixed(1) + '%'
    };
  });
});

// --- Actions ---

const addExam = () => {
  if (!newExamName.value.trim()) return ElMessage.warning('请输入名称');
  examList.push({ id: Date.now(), name: newExamName.value, hasData: false, data: [], subjects: [], rules: {} });
  newExamName.value = '';
  currentExamIndex.value = examList.length - 1;
};

const deleteExam = (index) => {
  const targetExam = examList[index];
  const performDelete = () => {
    examList.splice(index, 1);
    if (examList.length === 0) {
      showAnalysisView.value = false;
      currentExamIndex.value = 0;
    } else {
      currentExamIndex.value = Math.min(currentExamIndex.value, examList.length - 1);
    }
    ElMessage.success('已删除');
  };
  if (!targetExam.hasData) {
    performDelete();
    return;
  }
  ElMessageBox.confirm('确定删除该考试记录及其分析数据吗？', '提示', { type: 'warning' })
      .then(performDelete)
      .catch(() => {});
};

const reUpload = () => {
  examList[currentExamIndex.value].hasData = false;
  examList[currentExamIndex.value].data = [];
};

// 🟢 核心修改：上传解析逻辑
const handleUpload = async (file) => {
  const data = await file.raw.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(sheet);

  if (jsonData.length === 0) return ElMessage.error('空文件');

  const headers = Object.keys(jsonData[0]);
  const hasTotalCol = headers.includes('成绩') || headers.includes('总分');

  // 1. 数据清洗与映射
  const processedData = jsonData.map(row => {
    const newRow = { ...row };

    // 映射总分：优先取“成绩”，其次取“总分”
    if (row['成绩'] !== undefined) newRow['总分'] = Number(row['成绩']);
    else if (row['总分'] !== undefined) newRow['总分'] = Number(row['总分']);

    // 映射年级排名：优先取“级名”，其次取“年级排名”
    if (row['级名'] !== undefined) newRow['年级排名'] = row['级名'];
    else if (row['年级排名'] !== undefined) newRow['年级排名'] = row['年级排名'];

    // 映射班级：优先取“班名”
    if (row['班名'] !== undefined) newRow['班级'] = row['班名'];

    // 自动处理 "语文 成绩" -> "语文"
    headers.forEach(header => {
      if (header.endsWith(' 成绩')) {
        const realSubName = header.replace(' 成绩', '').trim();
        newRow[realSubName] = Number(row[header]);

        // 查找对应的级名 (支持 "语文 级名" 和 "语文级名")
        // 将其存储为 _grade_rank 后缀，这样后面识别科目时会自动忽略它
        const rankHeaderSpace = realSubName + ' 级名';
        const rankHeaderNoSpace = realSubName + '级名';

        if (row[rankHeaderSpace] !== undefined) newRow[realSubName + '_grade_rank'] = row[rankHeaderSpace];
        else if (row[rankHeaderNoSpace] !== undefined) newRow[realSubName + '_grade_rank'] = row[rankHeaderNoSpace];
      }
    });

    return newRow;
  });

  // 2. 自动识别纯科目 (排除所有元数据和衍生列)
  const excludeCols = [
    '姓名', '学号', '班级', '班名', '排名', '班级排名', '年级排名', '级名',
    '总分', '成绩', 'avg', 'rankDelta'
  ];

  const sample = processedData[0];
  const potentialSubjects = new Set();

  Object.keys(sample).forEach(key => {
    // 自动剔除 _grade_rank 等后缀列
    if (key.endsWith('_grade_rank')) return;
    if (excludeCols.includes(key)) return;

    // 自动剔除 "XX 成绩" 或 "XX 级名" (虽然上面已经清洗过，但防止有没有映射到的)
    if (key.endsWith(' 成绩')) return;
    if (key.endsWith(' 级名')) return;

    // 简单的数值检测，确保是成绩数据
    if (!isNaN(Number(sample[key]))) {
      potentialSubjects.add(key);
    }
  });

  const subjects = Array.from(potentialSubjects);

  // 3. 准备数据
  pendingUploadData.value = {
    data: processedData,
    subjects,
    // 标记是否原文件自带总分，如果自带，则后续不重新累加
    hasOriginalTotal: processedData[0]['总分'] !== undefined
  };

  prepareRuleDialog(processedData, subjects);
};

const prepareRuleDialog = (data, subjects) => {
  const rules = [];
  subjects.forEach(sub => {
    const scores = data.map(row => Number(row[sub]) || 0);
    const max = _.max(scores) || 0;

    // 智能推测满分
    let full = 100;
    if (['语文','数学','英语'].some(k => sub.includes(k))) full = 150;
    else if (max > 120) full = 150;
    else if (max > 100) full = 120;

    rules.push({
      key: sub,
      label: sub,
      full,
      pass: Number((full*0.6).toFixed(1)),
      excellent: Number((full*0.85).toFixed(1))
    });
  });
  ruleList.value = rules;
  ruleDialogVisible.value = true;
};

const handleRuleChange = (row) => {
  row.pass = Number((row.full * 0.6).toFixed(1));
  row.excellent = Number((row.full * 0.85).toFixed(1));
};

const confirmRules = () => {
  // 🟢 自动确认：所有识别出的科目都参与分析
  const activeSubjects = ruleList.value.map(r => r.key);

  const rulesMap = {};
  ruleList.value.forEach(r => {
    rulesMap[r.key] = { fullMark: r.full, passLine: r.pass, excellentLine: r.excellent };
  });

  const { data, hasOriginalTotal } = pendingUploadData.value;

  // 🟢 智能总分计算：如果原文档没有总分，则只累加识别出的科目
  if (!hasOriginalTotal) {
    data.forEach(row => {
      let sum = 0;
      activeSubjects.forEach(sub => sum += (Number(row[sub]) || 0));
      row['总分'] = sum;
    });
  }

  // 🟢 修复排序 Bug：使用函数自定义排序，确保 NaN / 0 / 无效值排在最后
  // 之前的 _.orderBy(data, ['总分'], ['desc']) 可能导致 NaN 或 0 排在第一
  const sorted = _.orderBy(data, [
    (item) => {
      let val = item['总分'];
      // 尝试转数字（防止字符串 "0" 或 "100" 比较问题）
      if (typeof val !== 'number') {
        val = Number(val);
      }
      // 如果是 NaN，返回 -Infinity 让其排在最后（desc 降序时）
      // 如果是 0，正常返回 0
      if (isNaN(val)) return -Infinity;
      return val;
    }
  ], ['desc']);

  // 生成/修正班级排名
  // 注意：如果原数据自带 '班级排名' (例如 row['排名'])，我们优先保留
  // 但为了排名连续性，这里通常建议重新生成。如果想优先用原排名，可改为 if(!item['班级排名'])
  sorted.forEach((item, idx) => {
    if(!item['班级排名']) item['班级排名'] = idx + 1;
  });

  const exam = examList[currentExamIndex.value];
  exam.data = sorted;
  exam.subjects = activeSubjects;
  exam.rules = rulesMap;
  exam.hasData = true;

  pendingUploadData.value = null;
  ruleDialogVisible.value = false;
  ElMessage.success('数据已导入，非科目数据已自动过滤');
  filterExamId.value = exam.id;
};

const viewStudentDetail = (row) => {
  const name = row['姓名'];
  const history = [];
  examList.forEach(exam => {
    if (exam.hasData) {
      const studentRecord = exam.data.find(s => s['姓名'] === name);
      if (studentRecord) history.push({ examName: exam.name, data: studentRecord });
    }
  });
  detailName.value = name;
  detailHistory.value = history;
  // 传递规则给详情页
  detailModal.value.open(name, history, currentExam.value.subjects, currentExam.value.rules);
};

const getScoreColor = (score, subject) => {
  const rules = currentContextRules.value;
  const rule = rules[subject];
  if (!rule) return '';
  if (Number(score) < rule.passLine) return 'red-text';
  if (Number(score) >= rule.excellentLine) return 'green-text';
  return '';
};

watch(filterExamId, (newVal) => { if (newVal === -1) {} });
const handleSort = ({ prop, order }) => {};

// 顶部总报表导出
const exportReport = () => {
  if (filteredStudents.value.length === 0) {
    ElMessage.warning('无数据可导出');
    return;
  }
  const exportData = filteredStudents.value.map(stu => {
    const studentRow = { '姓名': stu['姓名'], '总分': stu['总分'], '平均分': stu.avg, '班级排名': stu['班级排名'], '年级排名': stu['年级排名'] || '-' };
    currentDisplaySubjects.value.forEach(sub => { studentRow[sub] = stu[sub]; });
    return studentRow;
  });
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '学生成绩');
  let filename = '学生成绩报告.xlsx';
  if (filterExamId.value !== -1) {
    const exam = examList.find(e => e.id === filterExamId.value);
    if (exam) filename = `${exam.name}_成绩报告.xlsx`;
  }
  XLSX.writeFile(workbook, filename);
};
</script>

<style scoped>
.sca-container { padding: 20px; background: #f5f7fa; min-height: 100vh; }
.exam-tabs { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.exam-tag { cursor: pointer; transition: all 0.3s; }
.add-exam-box { display: flex; margin-left: auto; }
.upload-card { text-align: center; border: 2px dashed #dcdfe6; padding: 40px; margin-bottom: 20px; }
.upload-inner h3 { margin: 10px 0; color: #303133; }
.tip-bar { background: #fffbe6; color: #e6a23c; padding: 8px; margin-top: 20px; border-radius: 4px; font-size: 13px; }
.format-alert { margin-top: 20px; }
.format-list { margin: 0; padding-left: 20px; line-height: 1.8; }
.status-card-container { margin-bottom: 20px; }
.status-card { border-left: 5px solid #67C23A; }
.status-card h3 { margin-top: 0; }
.success-text { color: #67C23A; font-weight: bold; }
.btn-group { margin-top: 15px; }
.start-btn { width: 150px; }
.filter-bar { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
.filters { display: flex; align-items: center; }
.summary-row { margin-bottom: 20px; }
.sum-card { height: 180px; }
.sum-body { display: flex; justify-content: space-around; text-align: center; padding-top: 10px; }
.sum-body h3 { font-size: 28px; margin: 5px 0; }
.sum-body p { font-size: 12px; color: #909399; }
.highlight h3 { font-weight: bold; }
.c1 { border-top: 3px solid #409EFF; }
.c2 { border-top: 3px solid #909399; }
.c3 { border-top: 3px solid #67C23A; }
.c4 { background: linear-gradient(135deg, #FF69B4, #FFB6C1); border: none; }
.c4 :deep(.el-card__header) { border-bottom-color: rgba(255,255,255,0.3); color: white; }
.white-text h3, .white-text p { color: white !important; }
.green { color: #67C23A; }
.red { color: #F56C6C; }
.blue { color: #409EFF; }
.green-text { color: #67C23A; font-weight: bold; }
.red-text { color: #F56C6C; font-weight: bold; }
.detail-header { display: flex; justify-content: space-between; align-items: center; }
.rank-up { color: #F56C6C; font-size: 12px; margin-left: 3px; }
.rank-down { color: #67C23A; font-size: 12px; margin-left: 3px; }
.empty-state { padding: 40px; display: flex; justify-content: center; align-items: center; height: 400px; }
</style>
