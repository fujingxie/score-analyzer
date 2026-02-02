<template>
  <el-card class="upload-card">
    <template #header>
      <div class="card-header">
        <span>步骤 1: 导入考试数据 & 配置</span>
      </div>
    </template>

    <div v-if="!headers.length" class="upload-area">
      <el-upload
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFile"
          :limit="1"
          accept=".xlsx, .xls"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽 Excel 文件到这里，或 <em>点击上传</em>
        </div>
      </el-upload>
    </div>

    <div v-else class="config-area">
      <el-steps :active="activeStep" finish-status="success" simple style="margin-bottom: 20px">
        <el-step title="选择科目" />
        <el-step title="设置分数线" />
      </el-steps>

      <div v-if="activeStep === 1">
        <el-alert title="请勾选本次考试的科目：" type="info" :closable="false" show-icon style="margin-bottom:15px;"/>
        <el-checkbox-group v-model="selectedSubjects" @change="initSubjectConfig">
          <el-checkbox
              v-for="head in headers"
              :key="head"
              :label="head"
              border
              style="margin: 0 10px 10px 0;"
          />
        </el-checkbox-group>

        <div class="step-actions">
          <el-button @click="reset">重新上传</el-button>
          <el-button type="primary" @click="activeStep = 2" :disabled="selectedSubjects.length === 0">
            下一步：设置满分 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>

      <div v-if="activeStep === 2">
        <el-alert title="请确认各科满分（修改满分后，及格分会自动按60%计算）" type="success" :closable="false" style="margin-bottom:15px;"/>

        <el-form inline class="score-config-form">
          <div v-for="sub in selectedSubjects" :key="sub" class="subject-row">
            <el-tag size="large" effect="dark" class="sub-tag">{{ sub }}</el-tag>

            <el-form-item label="满分">
              <el-input-number
                  v-model="subjectConfig[sub].full"
                  :min="1"
                  :max="300"
                  controls-position="right"
                  @change="(val) => handleFullScoreChange(sub, val)"
                  style="width: 100px"
              />
            </el-form-item>

            <el-form-item label="及格线">
              <el-input-number
                  v-model="subjectConfig[sub].pass"
                  :min="1"
                  :max="subjectConfig[sub].full"
                  controls-position="right"
                  style="width: 100px"
              />
            </el-form-item>

            <el-form-item label="优秀线">
              <el-input-number
                  v-model="subjectConfig[sub].excellent"
                  :min="1"
                  style="width: 100px"
                  disabled
              />
              <span class="tip-text">(85%)</span>
            </el-form-item>
          </div>
        </el-form>

        <div class="step-actions">
          <el-button @click="activeStep = 1">上一步</el-button>
          <el-button type="primary" size="large" @click="confirmConfig">
            开始智能分析
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { UploadFilled, ArrowRight } from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';

const emit = defineEmits(['data-ready']);

// 状态
const headers = ref([]);
const rawJson = ref([]);
const selectedSubjects = ref([]);
const activeStep = ref(1);

// 科目配置对象：{ '语文': { full: 150, pass: 90, excellent: 127.5 }, '数学': ... }
const subjectConfig = reactive({});

// 排除列表
const excludeColumns = ['姓名', '学号', '班级', '排名', '总分', '考号', '性别', '学校'];

const handleFile = async (uploadFile) => {
  const file = uploadFile.raw;
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const jsonData = XLSX.utils.sheet_to_json(sheet);
  rawJson.value = jsonData;

  if (jsonData.length > 0) {
    const keys = Object.keys(jsonData[0]);
    headers.value = keys;
    // 智能勾选
    selectedSubjects.value = keys.filter(k => !excludeColumns.includes(k));
    // 初始化配置
    initSubjectConfig();
  }
};

// 初始化各科分数配置
const initSubjectConfig = () => {
  selectedSubjects.value.forEach(sub => {
    if (!subjectConfig[sub]) {
      // 默认值：满分100，及格60，优秀85
      subjectConfig[sub] = { full: 100, pass: 60, excellent: 85 };
    }
  });
};

// 满分变化时，自动联动
const handleFullScoreChange = (sub, newVal) => {
  if (!newVal) return;
  subjectConfig[sub].pass = Math.round(newVal * 0.6);      // 60% 及格
  subjectConfig[sub].excellent = Math.round(newVal * 0.85); // 85% 优秀
};

const confirmConfig = () => {
  // 转换成简单的格式传给父组件
  // fullMarks: { '语文': 150 }
  // passLines: { '语文': 90 }
  const fullMarks = {};
  const passLines = {};

  selectedSubjects.value.forEach(sub => {
    fullMarks[sub] = subjectConfig[sub].full;
    passLines[sub] = subjectConfig[sub].pass;
  });

  emit('data-ready', {
    data: rawJson.value,
    subjects: selectedSubjects.value,
    config: { fullMarks, passLines } // 把配置传出去
  });
};

const reset = () => {
  headers.value = [];
  rawJson.value = [];
  selectedSubjects.value = [];
  activeStep.value = 1;
};
</script>

<style scoped>
.upload-card { max-width: 900px; margin: 40px auto; }
.upload-area { padding: 40px; text-align: center; }
.step-actions { margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
.subject-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
}
.sub-tag { width: 80px; text-align: center; margin-right: 20px; }
.tip-text { color: #999; font-size: 12px; margin-left: 5px; }
</style>
