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
            <p>支持格式：姓名 | 语文 | 语文排名 | 数学 | 数学排名 ...</p>
            <p style="font-size: 12px; color: #999">系统会自动识别规范表格；若表格结构复杂，将自动开启导入向导</p>
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
          <p class="success-text">状态: ✅ 已完成数据清洗与映射</p>
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
                <div>
                  <h3>{{ filterSubject === 'ALL' ? stats.subjectCount : 1 }}</h3>
                  <p>{{ filterSubject === 'ALL' ? '科目数量' : '当前科目' }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="sum-card c2">
              <template #header>📈 分数统计 ({{ filterSubject === 'ALL' ? '总分' : filterSubject }})</template>
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

        <el-card class="table-card" v-if="filterSubject === 'ALL'">
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
                <el-checkbox v-model="showRankChange" style="margin-left: 15px">显示班级排名变化</el-checkbox>
              </div>
            </div>
          </template>

          <el-table :data="filteredStudents" stripe style="width: 100%" @sort-change="handleSort">
            <el-table-column prop="姓名" label="姓名" fixed width="100" />

            <template v-for="sub in currentDisplaySubjects" :key="sub">
              <el-table-column
                  :prop="sub"
                  :label="sub"
                  sortable="custom"
                  align="center"
                  min-width="90"
              >
                <template #default="scope">
                  <span :class="getScoreColor(scope.row[sub], sub)">
                    {{ scope.row[sub] }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column
                  v-if="checkSubjectMeta(sub, 'hasRank')"
                  :prop="sub + '_rank'"
                  :label="'排名'"
                  align="center"
                  width="70"
                  class-name="sub-rank-col"
              >
                <template #default="scope">
                   <span class="rank-tag" v-if="scope.row[sub + '_rank']">
                     {{ scope.row[sub + '_rank'] }}
                   </span>
                  <span v-else>-</span>
                </template>
              </el-table-column>

              <el-table-column
                  v-if="checkSubjectMeta(sub, 'hasGradeRank')"
                  :prop="sub + '_grade_rank'"
                  :label="'年排'"
                  align="center"
                  width="70"
                  class-name="sub-grade-rank-col"
              >
                <template #default="scope">
                   <span class="grade-rank-tag" v-if="scope.row[sub + '_grade_rank']">
                     {{ scope.row[sub + '_grade_rank'] }}
                   </span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </template>

            <el-table-column prop="总分" label="总分" sortable="custom" width="100" align="center" fixed="right">
              <template #default="scope"><strong>{{ scope.row['总分'] }}</strong></template>
            </el-table-column>

            <el-table-column
                v-if="hasGradeRank"
                prop="年级排名"
                label="年排"
                sortable="custom"
                width="80"
                align="center"
                fixed="right"
            >
              <template #default="scope">
                {{ scope.row['年级排名'] || '-' }}
              </template>
            </el-table-column>

            <el-table-column prop="班级排名" label="班排" sortable="custom" width="100" align="center" fixed="right">
              <template #default="scope">
                {{ scope.row['班级排名'] }}
                <span v-if="showRankChange && scope.row.rankDelta" :class="scope.row.rankDelta > 0 ? 'rank-up' : 'rank-down'">
                   {{ scope.row.rankDelta > 0 ? '↑' : '↓' }}{{ Math.abs(scope.row.rankDelta) }}
                 </span>
              </template>
            </el-table-column>

            <el-table-column label="操作" fixed="right" width="100" align="center">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="viewStudentDetail(scope.row)">
                  详情
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

    <el-dialog v-model="simpleRuleDialogVisible" title="⚙️ 确认考试科目规则" width="650px" align-center :close-on-click-modal="false">
      <el-alert title="系统已成功识别标准格式，请确认各科满分与考核标准。" type="success" show-icon :closable="false" style="margin-bottom:15px"/>
      <el-table :data="ruleList" border stripe size="small">
        <el-table-column prop="label" label="科目" width="120" align="center" />
        <el-table-column label="满分" align="center">
          <template #default="scope">
            <el-input-number
                v-model="scope.row.full" :min="10" :max="300" :step="10" size="small"
                @change="handleRuleChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="及格分 (60%)" align="center">
          <template #default="scope">
            <el-input-number v-model="scope.row.pass" :min="0" :max="scope.row.full" size="small" style="width: 90px"/>
          </template>
        </el-table-column>
        <el-table-column label="优秀分 (85%)" align="center">
          <template #default="scope">
            <el-input-number v-model="scope.row.excellent" :min="0" :max="scope.row.full" size="small" style="width: 90px"/>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="simpleRuleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSimpleRules">确认并分析</el-button>
      </template>
    </el-dialog>

    <el-dialog
        v-model="wizardVisible"
        title="🧙‍♂️ 数据导入向导 - 请确认列类型"
        width="1100px"
        align-center
        :close-on-click-modal="false"
    >
      <el-alert
          title="系统尝试自动识别每一列的类型。如果有误（例如将年级排名识别错了，或者没识别出来），请在下方手动选择对应的列名。"
          type="info"
          show-icon
          :closable="false"
          style="margin-bottom:15px"
      />

      <div class="global-mapping-box">
        <el-form label-width="110px" :inline="true">
          <el-form-item label="姓名列">
            <el-select v-model="globalMapping.nameCol" placeholder="请选择" filterable style="width: 180px">
              <el-option v-for="h in allHeaders" :key="h" :label="h" :value="h" />
            </el-select>
          </el-form-item>
          <el-form-item label="总分列">
            <el-select v-model="globalMapping.totalScoreCol" placeholder="自动计算" clearable filterable style="width: 180px">
              <el-option v-for="h in allHeaders" :key="h" :label="h" :value="h" />
            </el-select>
          </el-form-item>
          <el-form-item label="年级排名列">
            <el-select v-model="globalMapping.totalRankCol" placeholder="无 (不显示)" clearable filterable style="width: 180px">
              <el-option v-for="h in allHeaders" :key="h" :label="h" :value="h" />
            </el-select>
            <div style="font-size: 12px; color: #999; line-height: 1;">
              {{ globalMapping.totalRankCol ? '✅ 表格将显示年排' : '⚪ 表格不显示年排' }}
            </div>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="wizardSubjects" border stripe size="small" height="350">
        <el-table-column label="科目名称" width="100">
          <template #default="scope">
            <el-input v-model="scope.row.name" placeholder="例如: 语文" />
          </template>
        </el-table-column>

        <el-table-column label="分数来源列" width="160">
          <template #default="scope">
            <el-select v-model="scope.row.scoreCol" filterable>
              <el-option v-for="h in allHeaders" :key="h" :label="h" :value="h" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="关联排名列" width="160">
          <template #default="scope">
            <el-select v-model="scope.row.rankCol" placeholder="无" clearable filterable>
              <el-option v-for="h in allHeaders" :key="h" :label="h" :value="h" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="排名类型" width="130">
          <template #default="scope">
            <el-select v-model="scope.row.rankType" size="small" :disabled="!scope.row.rankCol">
              <el-option label="班级排名" value="class" />
              <el-option label="年级排名" value="grade" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="满分" width="90" align="center">
          <template #default="scope">
            <el-input-number
                v-model="scope.row.full" :min="10" :max="300" :step="10" size="small"
                style="width: 70px" :controls="false"
                @change="handleWizardRuleChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="及格/优秀" width="120" align="center">
          <template #default="scope">
            <div style="display: flex; gap: 5px; justify-content: center">
              <el-input-number v-model="scope.row.pass" :min="0" :max="scope.row.full" size="small" :controls="false" style="width: 50px" placeholder="及格"/>
              <el-input-number v-model="scope.row.excellent" :min="0" :max="scope.row.full" size="small" :controls="false" style="width: 50px" placeholder="优秀"/>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="60" align="center">
          <template #default="scope">
            <el-button type="danger" link @click="removeSubjectFromWizard(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #666">
            共识别出 <b>{{ wizardSubjects.length }}</b> 个科目
          </span>
          <div>
            <el-button @click="wizardVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmWizardImport">确认导入</el-button>
          </div>
        </div>
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

// 排序状态
const sortState = reactive({
  prop: '',
  order: ''
});

const simpleRuleDialogVisible = ref(false);
const ruleList = ref([]);
const wizardVisible = ref(false);
const wizardSubjects = ref([]);
const globalMapping = ref({ nameCol: '', totalScoreCol: '', totalRankCol: '' });
const rawDataCache = ref([]);
const allHeaders = ref([]);

const examList = reactive([]);

// --- Computed ---
const currentExam = computed(() => examList[currentExamIndex.value]);

const hasGradeRank = computed(() => {
  if (filterExamId.value !== -1) {
    const target = examList.find(e => e.id === filterExamId.value);
    return target?.hasGradeRank || false;
  }
  const validExams = examList.filter(e => e.hasData);
  return validExams.length > 0 ? validExams[validExams.length - 1].hasGradeRank : false;
});

const allSubjects = computed(() => {
  const s = new Set();
  examList.forEach(e => e.subjects.forEach(sub => s.add(sub)));
  return Array.from(s);
});

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

  if (sortState.prop && sortState.order) {
    sourceData = _.orderBy(
        sourceData,
        [
          (item) => {
            const val = item[sortState.prop];
            const num = Number(val);
            if (!isNaN(num)) return num;
            return -Infinity;
          }
        ],
        [sortState.order === 'descending' ? 'desc' : 'asc']
    );
  }

  return sourceData;
});

const stats = computed(() => {
  const students = filteredStudents.value;
  if (!students.length) return {
    totalStudents: 0, examCount: 0, subjectCount: 0,
    maxScore: 0, minScore: 0, avgScore: 0,
    passCount: 0, failCount: 0, passRate: '0%', excellentCount: 0, excellentRate: '0%'
  };

  const isAll = filterSubject.value === 'ALL';
  const targetKey = isAll ? '总分' : filterSubject.value;

  const scores = students.map(s => Number(s[targetKey]) || 0);

  const totalStudents = students.length;
  const maxScore = _.max(scores) || 0;
  const minScore = _.min(scores) || 0;
  const avgScore = (_.mean(scores) || 0).toFixed(1);

  const rules = currentContextRules.value;
  let targetPassLine = 0;
  let targetExcellentLine = 0;

  if (isAll) {
    const subsToCheck = currentDisplaySubjects.value;
    subsToCheck.forEach(sub => {
      const r = rules[sub] || { passLine: 60, excellentLine: 85 };
      targetPassLine += r.passLine;
      targetExcellentLine += r.excellentLine;
    });
  } else {
    const r = rules[filterSubject.value] || { passLine: 60, excellentLine: 85 };
    targetPassLine = r.passLine;
    targetExcellentLine = r.excellentLine;
  }

  const passCount = scores.filter(s => s >= targetPassLine).length;
  const excellentCount = scores.filter(s => s >= targetExcellentLine).length;

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

// 🟢 核心修复：检查当前考试的 SubjectMeta 来决定列显示，而不是检查第一行数据
const checkSubjectMeta = (subject, type) => {
  // 如果选择了"全部考试"(-1)，因为无法确定上下文，暂时保守返回 false 或基于第一个有数据的考试
  // 这里简化为：如果有 currentExam 且有 meta，就用 meta
  // 如果是 -1，取最后一个有数据的考试
  let exam = null;
  if (filterExamId.value !== -1) {
    exam = examList.find(e => e.id === filterExamId.value);
  } else {
    const validExams = examList.filter(e => e.hasData);
    if (validExams.length > 0) exam = validExams[validExams.length - 1];
  }

  if (exam && exam.subjectMeta && exam.subjectMeta[subject]) {
    return exam.subjectMeta[subject][type] === true;
  }
  return false;
};

// --- Actions ---

const addExam = () => {
  if (!newExamName.value.trim()) return ElMessage.warning('请输入名称');
  examList.push({ id: Date.now(), name: newExamName.value, hasData: false, data: [], subjects: [], rules: {}, subjectMeta: {} });
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

const handleUpload = async (file) => {
  const data = await file.raw.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(sheet);

  if (jsonData.length === 0) return ElMessage.error('空文件');

  rawDataCache.value = jsonData;
  const headers = Object.keys(jsonData[0]);
  allHeaders.value = headers;

  analyzeHeaders(headers, jsonData);
};

const analyzeHeaders = (headers, data) => {
  let nameCol = headers.find(h => /姓名|name|student/i.test(h)) || '';
  let totalScoreCol = headers.find(h => /总分|total|score_sum|^成绩$/i.test(h)) || '';
  let totalRankCol = headers.find(h => /^级名$|^年级排名$|^总排名$|^总排$/i.test(h)) || '';

  const subjects = [];
  let currentSubject = null;
  let hasComplexRank = false;
  let unhandledCols = 0;

  headers.forEach((h) => {
    if (h === nameCol || h === '学号' || h === '班级' || h === '班名' || h === totalScoreCol || h === totalRankCol) return;

    // 🟢 增强正则：把 "级名" 也视为排名列
    const isRankColumn = /排名|rank|级名|order/i.test(h);

    if (isRankColumn) {
      if (currentSubject) {
        currentSubject.rankCol = h;
        // 🟢 智能识别：如果是"级名"，默认为年级排名
        if (h.includes('级名') || h.includes('年级') || h.includes('Grade')) {
          currentSubject.rankType = 'grade';
        } else {
          currentSubject.rankType = 'class';
        }
        hasComplexRank = true;
      } else {
        unhandledCols++;
      }
    } else {
      const sampleVal = data[0][h];
      if (!isNaN(Number(sampleVal))) {
        currentSubject = {
          id: h,
          name: h.replace(/成绩|分数|Score/ig, '').trim(),
          scoreCol: h,
          rankCol: '',
          rankType: 'class',
          full: 100,
          pass: 60,
          excellent: 85
        };
        let full = 100;
        const maxVal = _.max(data.map(r => Number(r[h]) || 0));
        if (['语文','数学','英语'].some(k => h.includes(k))) full = 150;
        else if (maxVal > 120) full = 150;

        currentSubject.full = full;
        currentSubject.pass = Number((full * 0.6).toFixed(1));
        currentSubject.excellent = Number((full * 0.85).toFixed(1));

        subjects.push(currentSubject);
      } else {
        unhandledCols++;
      }
    }
  });

  globalMapping.value = { nameCol, totalScoreCol, totalRankCol };
  wizardSubjects.value = subjects;

  if (hasComplexRank || unhandledCols > 0 || !nameCol || !totalScoreCol) {
    wizardVisible.value = true;
  } else {
    ruleList.value = subjects.map(s => ({
      label: s.name,
      key: s.scoreCol,
      full: s.full,
      pass: s.pass,
      excellent: s.excellent
    }));
    simpleRuleDialogVisible.value = true;
  }
};

const handleRuleChange = (row) => {
  row.pass = Number((row.full * 0.6).toFixed(1));
  row.excellent = Number((row.full * 0.85).toFixed(1));
};

const handleWizardRuleChange = (row) => {
  row.pass = Number((row.full * 0.6).toFixed(1));
  row.excellent = Number((row.full * 0.85).toFixed(1));
};

const removeSubjectFromWizard = (index) => {
  wizardSubjects.value.splice(index, 1);
};

const confirmSimpleRules = () => {
  const raw = rawDataCache.value;
  const { nameCol, totalScoreCol, totalRankCol } = globalMapping.value;
  const activeSubjects = ruleList.value.map(r => r.label);
  const rulesMap = {};

  ruleList.value.forEach(r => {
    rulesMap[r.label] = { fullMark: r.full, passLine: r.pass, excellentLine: r.excellent };
  });

  processAndSaveData(raw, activeSubjects, [], rulesMap, nameCol, totalScoreCol, totalRankCol);
  simpleRuleDialogVisible.value = false;
};

const confirmWizardImport = () => {
  const raw = rawDataCache.value;
  const { nameCol, totalScoreCol, totalRankCol } = globalMapping.value;

  if (!nameCol) return ElMessage.error('请选择姓名列！');

  const activeSubjects = [];
  const subjectConfigs = [];
  const rulesMap = {};

  wizardSubjects.value.forEach(sub => {
    activeSubjects.push(sub.name);
    subjectConfigs.push(sub);
    rulesMap[sub.name] = {
      fullMark: sub.full,
      passLine: sub.pass,
      excellentLine: sub.excellent
    };
  });

  processAndSaveData(raw, activeSubjects, subjectConfigs, rulesMap, nameCol, totalScoreCol, totalRankCol);
  wizardVisible.value = false;
};

// 🟢 核心：保存数据时，顺便生成 SubjectMeta 记录每一科的排名状态
const processAndSaveData = (raw, activeSubjects, subjectConfigs, rulesMap, nameCol, totalScoreCol, totalRankCol) => {
  const subjectMeta = {}; // { '语文': { hasRank: true, hasGradeRank: false } }

  const cleanedData = raw.map((row, index) => {
    const student = {
      '姓名': row[nameCol],
      '班级': row['班级'] || row['班名'] || '默认班级',
      '总分': totalScoreCol ? Number(row[totalScoreCol]) : 0
    };

    if (totalRankCol && row[totalRankCol] !== undefined) {
      student['年级排名'] = row[totalRankCol];
    }

    let calculatedTotal = 0;

    activeSubjects.forEach((subName, idx) => {
      const config = subjectConfigs.length > 0 ? subjectConfigs[idx] : { scoreCol: subName };
      const score = Number(row[config.scoreCol]) || 0;

      student[subName] = score;
      calculatedTotal += score;

      // 初始化 Meta
      if (!subjectMeta[subName]) subjectMeta[subName] = { hasRank: false, hasGradeRank: false };

      if (config.rankCol) {
        if (config.rankType === 'grade') {
          student[subName + '_grade_rank'] = row[config.rankCol];
          subjectMeta[subName].hasGradeRank = true; // 标记：该科目有年排
        } else {
          student[subName + '_rank'] = row[config.rankCol];
          subjectMeta[subName].hasRank = true; // 标记：该科目有班排
        }
      }
    });

    if (!totalScoreCol) student['总分'] = calculatedTotal;

    return student;
  });

  const sorted = _.orderBy(cleanedData, ['总分'], ['desc']);

  sorted.forEach((item, idx) => {
    if (!item['班级排名']) item['班级排名'] = idx + 1;
  });

  const exam = examList[currentExamIndex.value];
  exam.data = sorted;
  exam.subjects = activeSubjects;
  exam.rules = rulesMap;
  exam.subjectMeta = subjectMeta; // 🟢 保存 Meta 信息
  exam.hasData = true;
  exam.hasGradeRank = !!totalRankCol;

  filterExamId.value = exam.id;

  ElMessage.success(`导入成功：${sorted.length} 名学生，${activeSubjects.length} 个科目`);
};

const handleSort = ({ prop, order }) => {
  sortState.prop = prop;
  sortState.order = order;
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

const exportReport = () => {
  if (filteredStudents.value.length === 0) {
    ElMessage.warning('无数据可导出');
    return;
  }
  const exportData = filteredStudents.value.map(stu => {
    const studentRow = { '姓名': stu['姓名'], '总分': stu['总分'], '班级排名': stu['班级排名'] };
    if (hasGradeRank.value) {
      studentRow['年级排名'] = stu['年级排名'] || '-';
    }
    currentDisplaySubjects.value.forEach(sub => {
      studentRow[sub] = stu[sub];
      if(stu[sub + '_rank']) studentRow[sub + '排名'] = stu[sub + '_rank'];
      if(stu[sub + '_grade_rank']) studentRow[sub + '年排'] = stu[sub + '_grade_rank'];
    });
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
/* 保持原有样式 */
.sca-container { padding: 20px; background: #f5f7fa; min-height: 100vh; }
.exam-tabs { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.exam-tag { cursor: pointer; transition: all 0.3s; }
.add-exam-box { display: flex; margin-left: auto; }
.upload-card { text-align: center; border: 2px dashed #dcdfe6; padding: 40px; margin-bottom: 20px; }
.upload-inner h3 { margin: 10px 0; color: #303133; }
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

.global-mapping-box {
  background: #f0f9eb;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e1f3d8;
  margin-bottom: 15px;
}

.sub-rank-col { border-left: 1px dashed #ebeef5; }
.sub-grade-rank-col { border-left: 1px dotted #dcdfe6; background-color: #fafafa; }
.rank-tag {
  font-size: 12px; color: #909399;
  background-color: #f0f2f5; padding: 2px 6px; border-radius: 4px;
}
.grade-rank-tag {
  font-size: 12px; color: #626aef;
  background-color: #f0f0ff; padding: 2px 6px; border-radius: 4px;
}
</style>
