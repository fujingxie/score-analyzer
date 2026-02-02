<template>
  <MultiClassAnalysisResult
      v-if="isResultView"
      :class-list="validClassList"
      :exam-name="examName"
      :exam-rules="examRules"
      @back="isResultView = false"
  />

  <div v-else class="comparison-container">

    <div class="header-section">
      <div class="form-row">
        <div class="input-group">
          <div class="input-label">考试名称</div>
          <el-input
              v-model="examName"
              placeholder="例如：2024秋季期末联考"
              size="large"
              style="width: 300px"
          />
        </div>
        <el-button
            type="primary"
            size="large"
            icon="Plus"
            plain
            class="add-btn"
            @click="addClassCard"
        >
          添加班级
        </el-button>
      </div>
    </div>

    <div class="cards-grid">
      <div
          v-for="(cls, index) in classList"
          :key="cls.id"
          class="class-card"
          :class="{ 'has-data': cls.hasData }"
      >
        <div class="card-header">
          <el-input
              v-model="cls.name"
              :placeholder="`班级 ${index + 1}`"
              class="class-name-input"
              size="large"
          >
            <template #prefix><el-icon><School /></el-icon></template>
          </el-input>
          <el-button
              v-if="classList.length > 2"
              type="danger"
              link
              icon="Delete"
              @click="removeClassCard(index)"
          >
            删除
          </el-button>
        </div>

        <div v-if="!cls.hasData" class="upload-area">
          <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(file) => handleUpload(file, index)"
              accept=".xlsx, .xls"
              drag
              class="full-uploader"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              <h3>上传班级成绩表</h3>
              <p>拖拽 Excel 到此处或点击上传</p>
              <span class="sub-text">支持同一文件多班级，系统会自动识别</span>
            </div>
          </el-upload>
        </div>

        <div v-else class="data-preview">
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="m-label">学生人数</div>
              <div class="m-value">{{ cls.stats.count }}</div>
            </div>
            <div class="metric-item">
              <div class="m-label">平均分</div>
              <div class="m-value text-blue">{{ cls.stats.avg }}</div>
            </div>
            <div class="metric-item">
              <div class="m-label">最高分</div>
              <div class="m-value text-green">{{ cls.stats.max }}</div>
            </div>
            <div class="metric-item">
              <div class="m-label">优秀率</div>
              <div class="m-value text-orange">{{ cls.stats.excellentRate }}</div>
            </div>
            <div class="metric-item">
              <div class="m-label">低分率</div>
              <div class="m-value text-red">{{ cls.stats.lowRate }}</div>
            </div>
          </div>

          <div class="file-info-bar">
            <div class="file-name"><el-icon><Document /></el-icon> {{ cls.fileName }}</div>
            <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="(file) => handleUpload(file, index)"
                accept=".xlsx, .xls"
            >
              <el-button type="primary" link size="small">更换文件</el-button>
            </el-upload>
          </div>

          <div class="success-tip">
            <el-icon><CircleCheckFilled /></el-icon>
            已识别 {{ cls.stats.subjectCount }} 个分数字段
          </div>
        </div>
      </div>
    </div>

    <div class="footer-section">
      <div class="tips-box">
        <h4><el-icon><InfoFilled /></el-icon> 上传说明：</h4>
        <ul>
          <li>请上传包含“姓名”、“班级”及各科成绩的 Excel 文件。</li>
          <li>系统会自动排除排名、学号等非科目列。</li>
          <li>点击“开始分析”前，您可以确认或修改各科目的满分标准。</li>
        </ul>
      </div>

      <div class="action-bar">
        <el-button
            type="primary"
            size="large"
            class="start-btn"
            :disabled="!canStart"
            @click="openRuleSettings"
        >
          开始对比分析 <el-icon class="el-icon--right"><Right /></el-icon>
        </el-button>
      </div>
    </div>

    <el-dialog
        v-model="ruleDialogVisible"
        title="⚙️ 设置考试满分标准"
        width="700px"
        align-center
    >
      <div class="rule-dialog-body">
        <el-alert
            title="系统已自动根据科目名称和最高分推测满分，请核对是否正确。"
            type="info"
            show-icon
            :closable="false"
            style="margin-bottom: 15px;"
        />

        <el-table :data="ruleList" border stripe style="width: 100%">
          <el-table-column prop="label" label="科目" width="120" align="center">
            <template #default="scope">
              <span style="font-weight: bold;">{{ scope.row.label }}</span>
            </template>
          </el-table-column>

          <el-table-column label="满分" width="160" align="center">
            <template #default="scope">
              <el-input-number
                  v-model="scope.row.full"
                  :min="10" :max="1000" :step="10"
                  @change="handleFullMarkChange(scope.row)"
                  style="width: 120px"
              />
            </template>
          </el-table-column>

          <el-table-column label="及格线 (60%)" align="center">
            <template #default="scope">
              <el-tag type="success" effect="plain">{{ scope.row.pass }} 分</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="优秀线 (85%)" align="center">
            <template #default="scope">
              <el-tag type="warning" effect="plain">{{ scope.row.excellent }} 分</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="ruleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmAnalysis">确认并分析</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Plus, Delete, UploadFilled, InfoFilled, School, Right, Document, CircleCheckFilled, Setting } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as XLSX from 'xlsx';
import _ from 'lodash';
// 引入结果页组件
import MultiClassAnalysisResult from './MultiClassAnalysisResult.vue';

// --- State ---
const isResultView = ref(false);
const examName = ref('');
const classList = ref([createEmptyClass(1), createEmptyClass(2)]);

// 规则配置相关状态
const ruleDialogVisible = ref(false);
const ruleList = ref([]); // 弹窗表格用的数组
const examRules = ref({}); // 传递给结果页的最终对象 map

// --- Computed ---
const validClassList = computed(() => classList.value.filter(c => c.hasData));
const canStart = computed(() => validClassList.value.length >= 2);

// --- Helpers ---
function createEmptyClass(index) {
  return {
    id: Date.now() + Math.random(),
    name: `${index}班`,
    hasData: false,
    fileName: '',
    rawData: [],
    stats: {
      count: 0, avg: 0, max: 0,
      excellentRate: '0%', lowRate: '0%',
      subjectCount: 0, subjects: []
    }
  };
}

// --- Actions ---
const addClassCard = () => { classList.value.push(createEmptyClass(classList.value.length + 1)); };
const removeClassCard = (index) => { classList.value.splice(index, 1); };

// 🟢 Upload Logic (优化版：自动清洗非科目数据)
const handleUpload = async (uploadFile, index) => {
  const file = uploadFile.raw;
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(sheet);

  if (!jsonData.length) { ElMessage.error('文件内容为空'); return; }

  // 1. 数据清洗与映射 (处理 '语文 成绩' 等复杂表头)
  const headers = Object.keys(jsonData[0]);
  const processedData = jsonData.map(row => {
    const newRow = { ...row };
    // 映射：如果有 '成绩' 则转为 '总分'
    if (row['成绩'] !== undefined) newRow['总分'] = Number(row['成绩']);
    else if (row['总分'] !== undefined) newRow['总分'] = Number(row['总分']);

    // 处理 "Subject Score" 模式
    headers.forEach(header => {
      if (header.endsWith(' 成绩')) {
        const realSubName = header.replace(' 成绩', '').trim();
        newRow[realSubName] = Number(row[header]);
      }
    });
    return newRow;
  });

  // 2. 智能识别纯科目 (排除元数据、排名、总分)
  const excludeCols = [
    '姓名', '学号', '班级', '班名', '排名', '班级排名', '年级排名', '级名',
    '总分', '成绩', '考号', '座位号', 'classRank', 'gradeRank', 'avg', 'rankDelta'
  ];

  const sample = processedData[0];
  const potentialSubjects = new Set();

  Object.keys(sample).forEach(key => {
    // 排除特定后缀列
    if (key.endsWith('_grade_rank')) return;
    if (key.endsWith(' 成绩')) return;
    if (key.endsWith(' 级名')) return;
    if (excludeCols.includes(key)) return;

    // 数值检查
    if (!isNaN(Number(sample[key]))) {
      potentialSubjects.add(key);
    }
  });

  const subjects = Array.from(potentialSubjects);

  if (subjects.length === 0) { ElMessage.warning('未检测到有效成绩列'); return; }

  // 3. 计算/获取总分 (优先用文件里的总分)
  const students = processedData.map(row => {
    let total = 0;
    if (row['总分'] !== undefined) {
      total = Number(row['总分']);
    } else {
      subjects.forEach(sub => total += Number(row[sub]) || 0);
    }
    return { ...row, _total: total };
  });

  // 4. 预览统计 (使用简单规则)
  const scores = students.map(s => s._total);
  const count = scores.length;
  const avg = count > 0 ? (_.sum(scores) / count).toFixed(1) : 0;
  const max = _.max(scores) || 0;

  // 简单推测满分用于预览
  const fullMark = max > 120 ? 150 : (max > 100 ? 120 : 100);
  const excellentCount = scores.filter(s => s >= fullMark * 0.85).length;
  const lowCount = scores.filter(s => s < fullMark * 0.6).length;

  classList.value[index].hasData = true;
  classList.value[index].fileName = file.name;
  classList.value[index].rawData = students;
  classList.value[index].stats = {
    count, avg, max,
    excellentRate: count > 0 ? ((excellentCount / count) * 100).toFixed(1) + '%' : '0%',
    lowRate: count > 0 ? ((lowCount / count) * 100).toFixed(1) + '%' : '0%',
    subjectCount: subjects.length,
    subjects // 保存清洗后的科目列表
  };
  ElMessage.success(`已解析: ${file.name} (识别 ${subjects.length} 个科目)`);
};

// 打开规则设置弹窗
const openRuleSettings = () => {
  if (validClassList.value.length < 2) return;

  // 1. 收集所有涉及的科目 (已在 upload 阶段清洗过)
  const allSubjects = new Set();
  validClassList.value.forEach(c => c.stats.subjects.forEach(s => allSubjects.add(s)));

  const rules = [];

  // 2. 添加“总分”规则
  let maxTotal = 0;
  validClassList.value.forEach(c => {
    if (c.stats.max > maxTotal) maxTotal = c.stats.max;
  });
  let totalFull = 100;
  if (maxTotal > 600) totalFull = 750;
  else if (maxTotal > 300) totalFull = Math.ceil(maxTotal / 50) * 50;
  else if (maxTotal > 100) totalFull = 150;

  rules.push(createRuleItem('total', '总分', totalFull));

  // 3. 添加各单科规则
  allSubjects.forEach(sub => {
    let subMax = 0;
    validClassList.value.forEach(c => {
      // 在所有班级中找该科最高分
      const m = _.max(c.rawData.map(r => Number(r[sub]) || 0)) || 0;
      if (m > subMax) subMax = m;
    });

    let subFull = 100;
    if (['语文','数学','英语','English','Chinese','Math'].some(k => sub.includes(k))) {
      subFull = 150;
    } else if (subMax > 100) {
      subFull = 120;
      if (subMax > 120) subFull = 150;
    }

    rules.push(createRuleItem(sub, sub, subFull));
  });

  ruleList.value = rules;
  ruleDialogVisible.value = true;
};

// 辅助：生成一条规则对象
const createRuleItem = (key, label, full) => {
  return {
    key, // 内部识别用的key (total 或 科目名)
    label, // 显示名
    full,
    pass: Number((full * 0.6).toFixed(1)),
    excellent: Number((full * 0.85).toFixed(1))
  };
};

// 监听满分输入变化，自动联动计算
const handleFullMarkChange = (row) => {
  row.pass = Number((row.full * 0.6).toFixed(1));
  row.excellent = Number((row.full * 0.85).toFixed(1));
};

// 确认并开始分析
const handleConfirmAnalysis = () => {
  // 将数组转为 map 格式，方便结果页 O(1) 查找
  const rulesMap = {};
  ruleList.value.forEach(r => {
    rulesMap[r.key] = {
      fullMark: r.full,
      passLine: r.pass,
      excellentLine: r.excellent
    };
  });

  examRules.value = rulesMap;
  ruleDialogVisible.value = false;
  isResultView.value = true; // 跳转
  ElMessage.success('配置已应用，分析报告生成中...');
};
</script>

<style scoped>
/* 样式保持不变 */
.comparison-container { padding: 24px; background-color: #fff; min-height: 100%; width: 100%; box-sizing: border-box; }
.header-section { margin-bottom: 24px; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.form-row { display: flex; align-items: flex-end; gap: 20px; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-label { font-size: 14px; font-weight: bold; color: #303133; }
.add-btn { padding: 0 30px; font-weight: bold; }
.cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px; width: 100%; }
@media (max-width: 900px) { .cards-grid { grid-template-columns: 1fr; } }
.class-card { background: #fff; border-radius: 12px; border: 1px solid #dcdfe6; padding: 24px; transition: all 0.3s; display: flex; flex-direction: column; }
.class-card:hover { border-color: #c0c4cc; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.class-card.has-data { border-color: #67c23a; border-width: 2px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.class-name-input { width: 180px; font-weight: bold; }
.upload-area { flex: 1; display: flex; flex-direction: column; }
.full-uploader :deep(.el-upload) { width: 100%; }
.full-uploader :deep(.el-upload-dragger) { width: 100%; height: 220px; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: #fafafa; border: 2px dashed #e4e7ed; border-radius: 8px; transition: .3s; }
.full-uploader :deep(.el-upload-dragger:hover) { border-color: #409eff; background-color: #ecf5ff; }
.el-upload__text h3 { margin: 10px 0 5px; color: #303133; font-size: 16px; }
.el-upload__text p { margin: 0 0 10px; color: #606266; }
.sub-text { font-size: 12px; color: #909399; }
.el-icon--upload { font-size: 48px; color: #a8abb2; margin-bottom: 10px; }
.data-preview { flex: 1; display: flex; flex-direction: column; padding-top: 10px; }
.metrics-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; text-align: center; margin-bottom: 20px; background: #f9fafb; padding: 20px 0; border-radius: 8px; }
.m-label { font-size: 12px; color: #909399; margin-bottom: 6px; }
.m-value { font-size: 20px; font-weight: 800; color: #303133; }
.text-blue { color: #409eff; } .text-green { color: #67c23a; } .text-orange { color: #e6a23c; } .text-red { color: #f56c6c; }
.file-info-bar { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: #f4f4f5; border-radius: 6px; margin-bottom: 10px; }
.file-name { font-size: 13px; color: #606266; display: flex; align-items: center; gap: 6px; }
.success-tip { font-size: 12px; color: #67c23a; display: flex; align-items: center; gap: 5px; margin-top: auto; }
.footer-section { background: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; padding: 24px; }
.tips-box h4 { margin: 0 0 12px 0; color: #e6a23c; display: flex; align-items: center; gap: 6px; font-size: 15px; }
.tips-box ul { margin: 0; padding-left: 20px; color: #606266; font-size: 14px; line-height: 1.8; }
.action-bar { margin-top: 30px; text-align: center; border-top: 1px dashed #e6dcb1; padding-top: 20px; }
.start-btn { width: 240px; height: 50px; font-size: 16px; font-weight: bold; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(64,158,255,0.4); }

.rule-dialog-body { padding: 10px; }
</style>
