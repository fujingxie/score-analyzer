<template>
  <el-dialog
      v-model="visible"
      title="📋 学生不及格科目详情"
      width="650px"
      destroy-on-close
      custom-class="fail-detail-dialog"
  >
    <div class="student-header">
      <h2 class="name">{{ studentName }}</h2>
      <span class="fail-badge">不及格科目：<span class="count">{{ failSubjects.length }}</span> 科</span>
    </div>

    <div class="fail-cards-container">
      <div v-for="item in failSubjects" :key="item.sub" class="fail-card">
        <div class="sub-name">{{ item.sub }}</div>
        <div class="sub-score">{{ item.score }} 分</div>
        <div class="sub-info">及格分: {{ item.passLine }} 分</div>
        <div class="sub-gap">差 {{ item.gap }} 分及格</div>
      </div>
    </div>

    <div class="table-section">
      <h4 style="margin-bottom: 10px; color: #606266;">所有科目成绩</h4>
      <el-table
          :data="allSubjectsList"
          border
          style="width: 100%"
          :header-cell-style="{ background: '#7c5cfc', color: 'white', textAlign: 'center' }"
          :cell-style="{ textAlign: 'center' }"
      >
        <el-table-column prop="sub" label="科目" width="100" />
        <el-table-column prop="score" label="成绩">
          <template #default="scope">
            <span :class="scope.row.isPass ? 'score-pass' : 'score-fail'">
              {{ scope.row.score }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="passLine" label="及格分" width="80" />
        <el-table-column prop="fullMark" label="满分" width="80" />
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag v-if="scope.row.isPass" type="success" effect="plain">
              <el-icon><Check /></el-icon> 及格
            </el-tag>
            <el-tag v-else type="danger" effect="plain">
              <el-icon><Close /></el-icon> 不及格
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="visible = false" color="#7c5cfc">关 闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Check, Close } from '@element-plus/icons-vue';

const visible = ref(false);
const studentName = ref('');
const studentData = ref({});
const subjects = ref([]);
const rulesMap = ref({});

// 打开弹窗的方法
// 🟢 修复：接收 rules
const open = (name, rowData, subjectList, rules) => {
  studentName.value = name;
  studentData.value = rowData;
  subjects.value = subjectList;
  rulesMap.value = rules || {};
  visible.value = true;
};

// 计算所有科目列表
const allSubjectsList = computed(() => {
  return subjects.value.map(sub => {
    const score = Number(studentData.value[sub]) || 0;

    // 🟢 修复：获取动态规则
    const rule = rulesMap.value[sub] || { passLine: 60, fullMark: 100 };
    const isPass = score >= rule.passLine;

    return {
      sub,
      score,
      passLine: rule.passLine,
      fullMark: rule.fullMark,
      isPass,
      gap: isPass ? 0 : (rule.passLine - score).toFixed(1)
    };
  });
});

// 计算不及格科目列表 (用于顶部卡片)
const failSubjects = computed(() => {
  return allSubjectsList.value.filter(item => !item.isPass);
});

defineExpose({ open });
</script>

<style scoped>
.student-header { margin-bottom: 20px; display: flex; align-items: baseline; gap: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.name { margin: 0; color: #303133; }
.fail-badge { color: #F56C6C; font-weight: bold; }
.count { font-size: 20px; margin: 0 4px; }

/* 红色卡片样式 */
.fail-cards-container { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 25px; }
.fail-card {
  width: 140px;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  color: #F56C6C;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.1);
}
.sub-name { font-weight: bold; font-size: 16px; margin-bottom: 5px; color: #303133; }
.sub-score { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
.sub-info { font-size: 12px; color: #909399; margin-bottom: 2px; }
.sub-gap { font-size: 12px; font-weight: bold; }

/* 表格样式微调 */
.score-pass { color: #67C23A; font-weight: bold; }
.score-fail { color: #F56C6C; font-weight: bold; }

.dialog-footer { text-align: center; }
</style>
