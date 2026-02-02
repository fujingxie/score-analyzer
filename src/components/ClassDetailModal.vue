<template>
  <el-dialog
      v-model="visible"
      :title="classData.name + ' 详细信息'"
      width="90%"
      top="5vh"
      destroy-on-close
      custom-class="class-detail-modal"
  >
    <div class="kpi-container">
      <div class="kpi-item">
        <div class="label">班级人数</div>
        <div class="value blue">{{ classData.count }}</div>
        <div class="sub">名学生</div>
      </div>
      <div class="kpi-item">
        <div class="label">班级总分</div>
        <div class="value blue">{{ classData.totalScoreSum }}</div>
        <div class="sub">分</div>
      </div>
      <div class="kpi-item">
        <div class="label">平均分</div>
        <div class="value blue">{{ classData.avg }}</div>
        <div class="sub">分</div>
      </div>
      <div class="kpi-item">
        <div class="label">最高分</div>
        <div class="value green">{{ classData.max }}</div>
        <div class="sub">分</div>
      </div>
      <div class="kpi-item">
        <div class="label">最低分</div>
        <div class="value red">{{ classData.min }}</div>
        <div class="sub">分</div>
      </div>
      <div class="kpi-item">
        <div class="label">优秀率</div>
        <div class="value green">{{ classData.excellentRate }}</div>
        <div class="sub">{{ classData.excellentCount }} 人</div>
      </div>
      <div class="kpi-item">
        <div class="label">及格率</div>
        <div class="value blue">{{ classData.passRate }}</div>
        <div class="sub">{{ classData.passCount }} 人</div>
      </div>
      <div class="kpi-item">
        <div class="label">不及格</div>
        <div class="value red">{{ classData.failCount }}</div>
        <div class="sub">人</div>
      </div>
    </div>

    <div class="table-container">
      <div class="table-header">
        <el-icon><List /></el-icon> 学生成绩明细
      </div>
      <el-table
          :data="students"
          height="500"
          stripe
          style="width: 100%"
          :header-cell-style="headerStyle"
      >
        <el-table-column prop="classRank" label="班级排名" width="100" align="center" fixed />
        <el-table-column prop="学号" label="学号" width="120" align="center" />
        <el-table-column prop="姓名" label="姓名" width="100" align="center" />
        <el-table-column prop="总分" label="总分" width="100" align="center" sortable>
          <template #default="scope">
            <span class="score-bold">{{ scope.row['总分'] }}</span>
          </template>
        </el-table-column>

        <el-table-column
            v-for="sub in subjects"
            :key="sub"
            :prop="sub"
            :label="sub"
            align="center"
        >
          <template #default="scope">
            <span :class="getScoreClass(scope.row[sub])">{{ scope.row[sub] }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="classRank" label="班级排名" width="100" align="center" />
        <el-table-column prop="gradeRank" label="年级排名" width="100" align="center" />
      </el-table>
    </div>

    <template #footer>
      <div class="modal-footer">
        <el-button @click="visible = false" class="close-btn">关 闭</el-button>
        <el-button type="primary" color="#626aef" @click="exportClassExcel">
          <el-icon style="margin-right: 5px"><Download /></el-icon> 导出班级成绩
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { List, Download } from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';

const visible = ref(false);
const classData = ref({});
const students = ref([]);
const subjects = ref([]);

// 打开弹窗的方法
const open = (cData, stuList, subList) => {
  classData.value = cData;
  students.value = stuList;
  subjects.value = subList;
  visible.value = true;
};

// 导出逻辑
const exportClassExcel = () => {
  const exportData = students.value.map(s => {
    const row = {
      '班级排名': s.classRank,
      '学号': s['学号'],
      '姓名': s['姓名'],
      '总分': s['总分'],
    };
    subjects.value.forEach(sub => row[sub] = s[sub]);
    row['年级排名'] = s.gradeRank;
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, classData.value.name);
  XLSX.writeFile(wb, `${classData.value.name}_成绩明细.xlsx`);
};

// 样式辅助
const headerStyle = {
  background: '#7c5cfc', // 深紫色表头
  color: 'white',
  textAlign: 'center',
  fontWeight: 'bold'
};

const getScoreClass = (score) => {
  return Number(score) < 60 ? 'score-fail' : 'score-normal';
};

defineExpose({ open });
</script>

<style scoped>
/* 弹窗头部样式覆盖 */
:deep(.el-dialog__header) {
  background: linear-gradient(to right, #7c5cfc, #a797ff);
  margin-right: 0;
  padding: 15px 20px;
}
:deep(.el-dialog__title) {
  color: white;
  font-weight: bold;
}
:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

/* KPI 容器 */
.kpi-container {
  display: flex;
  justify-content: space-between;
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.kpi-item {
  background: white;
  flex: 1;
  margin: 0 5px;
  padding: 15px 0;
  text-align: center;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.label { color: #909399; font-size: 12px; margin-bottom: 5px; }
.value { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
.sub { font-size: 12px; color: #C0C4CC; }

/* 颜色 */
.blue { color: #409EFF; }
.green { color: #67C23A; }
.red { color: #F56C6C; }

/* 表格区 */
.table-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.score-bold { font-weight: bold; color: #409EFF; }
.score-fail { color: #F56C6C; font-weight: bold; }
.score-normal { color: #606266; }

.modal-footer {
  display: flex;
  justify-content: center; /* 按钮居中 */
  gap: 20px;
}
.close-btn { width: 100px; }
</style>
