<template>
  <div class="highlight-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="highlight-card top-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">🏆 优秀学生 TOP10</span>
            </div>
          </template>

          <div class="list-container custom-scrollbar">
            <div
                v-for="(stu, index) in top10Students"
                :key="stu['姓名']"
                class="list-item"
            >
              <div class="left-info">
                <span class="rank-num" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                <span class="stu-name">{{ stu['姓名'] }}</span>
              </div>
              <div class="right-info score-text">
                {{ stu['总分'] }} 分
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="highlight-card warn-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">⚠️ 需关注学生 (点击查看详情)</span>
              <el-button type="warning" link size="small" @click="exportFailList">
                <el-icon style="margin-right: 4px"><Download /></el-icon> 导出明细
              </el-button>
            </div>
          </template>

          <div class="list-container custom-scrollbar">
            <div v-if="attentionList.length === 0" class="empty-tip">
              <el-result icon="success" title="太棒了" sub-title="全班所有科目均及格！" />
            </div>

            <div
                v-else
                v-for="stu in attentionList"
                :key="stu['姓名']"
                class="list-item warn-item clickable-row"
                @click="openStudentDetail(stu)"
            >
              <div class="left-info">
                <span class="stu-name">{{ stu['姓名'] }}</span>
              </div>
              <div class="right-info">
                <el-tag type="danger" effect="plain" class="fail-tag">
                  {{ stu.failCount }} 科不及格
                </el-tag>
                <div class="sub-detail">点击查看详情 <el-icon><ArrowRight /></el-icon></div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <FailingStudentDetail ref="detailRef" />
  </div>
</template>

<script setup>
import { ref, computed, toRaw } from 'vue';
import { Download, ArrowRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as XLSX from 'xlsx';
import _ from 'lodash';
import FailingStudentDetail from './FailingStudentDetail.vue';

const props = defineProps({
  students: { type: Array, default: () => [] },
  subjects: { type: Array, default: () => [] },
  rules: { type: Object, default: () => ({}) }
});

const detailRef = ref(null);

// --- 核心逻辑 ---

// 1. 计算优秀学生 TOP 10
const top10Students = computed(() => {
  // 🟢 修复：自定义排序函数，强制转数字，并将 NaN 视为无穷小
  return _.orderBy(props.students, [
    (stu) => {
      let val = Number(stu['总分']);
      // 如果是 NaN (非数字)，返回 -Infinity，保证在降序排序中排在最后
      if (isNaN(val)) return -Infinity;
      return val;
    }
  ], ['desc']).slice(0, 10);
});

// 2. 计算需关注学生 (不及格)
const attentionList = computed(() => {
  const list = [];

  props.students.forEach(stu => {
    let failCount = 0;
    let failedSubjects = [];

    props.subjects.forEach(sub => {
      // 确保分数为数字，空值视为 0
      const score = Number(stu[sub]) || 0;
      // 动态获取及格线
      const rule = props.rules[sub] || { passLine: 60 };

      if (score < rule.passLine) {
        failCount++;
        failedSubjects.push({ sub, score });
      }
    });

    if (failCount > 0) {
      list.push({
        ...stu, // 保留原始数据
        failCount,
        failedSubjects
      });
    }
  });

  // 排序规则：挂科多的排前面；挂科数一样，总分低的排前面
  // 🟢 修复：总分排序也增加数字强制转换，防止字符串比较错误
  return _.orderBy(list, [
    'failCount',
    (stu) => {
      let val = Number(stu['总分']);
      // 在升序排序中，NaN (无效成绩) 是否排在最前？
      // 这里将其视为 0，意味着“没有成绩”的人会被视为总分最低，排在前面提醒老师关注
      return isNaN(val) ? 0 : val;
    }
  ], ['desc', 'asc']);
});

// --- 交互逻辑 ---

// 点击打开详情
const openStudentDetail = (stu) => {
  if (detailRef.value) {
    const rawStu = toRaw(stu);
    // 传递 rules
    detailRef.value.open(rawStu['姓名'], rawStu, props.subjects, props.rules);
  }
};

// 导出不及格名单
const exportFailList = () => {
  if (attentionList.value.length === 0) return ElMessage.success('没有不及格学生');

  const exportData = attentionList.value.map(stu => {
    // 格式化不及格详情为字符串，例如 "数学(58); 英语(40)"
    const detail = stu.failedSubjects.map(f => `${f.sub}(${f.score})`).join('; ');
    return {
      '姓名': stu['姓名'],
      '总分': stu['总分'],
      '不及格科目数': stu.failCount,
      '不及格详情': detail
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "需关注学生名单");
  XLSX.writeFile(wb, `需关注学生名单_${new Date().getTime()}.xlsx`);
};
</script>

<style scoped>
.highlight-container { margin-top: 20px; }

/* 卡片基础样式 */
.highlight-card { height: 500px; display: flex; flex-direction: column; }
.highlight-card :deep(.el-card__header) { padding: 15px 20px; border-bottom: 1px solid #ebeef5; background-color: #fff; }
.highlight-card :deep(.el-card__body) { padding: 0; flex: 1; overflow: hidden; position: relative; }

.card-header { display: flex; justify-content: space-between; align-items: center; }
.header-title { font-weight: bold; font-size: 16px; color: #303133; }

/* 左侧边框装饰 */
.top-card { border-left: 4px solid #67C23A; } /* 绿色 */
.warn-card { border-left: 4px solid #E6A23C; } /* 橙色 */

/* 列表容器 */
.list-container { height: 100%; overflow-y: auto; padding: 0; }

.list-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 20px; border-bottom: 1px solid #f5f7fa;
  transition: all 0.2s;
}
.list-item:hover { background: #f9f9fa; }

/* 排名数字 */
.rank-num {
  display: inline-block; width: 24px; height: 24px; line-height: 24px;
  text-align: center; border-radius: 4px; margin-right: 12px;
  font-weight: bold; color: #606266; background: #f0f2f5; font-size: 12px;
}
.rank-1 { background: #F56C6C; color: white; } /* 冠军红 */
.rank-2 { background: #E6A23C; color: white; } /* 亚军橙 */
.rank-3 { background: #409EFF; color: white; } /* 季军蓝 */

.stu-name { font-weight: 500; color: #303133; font-size: 14px; }
.score-text { color: #409EFF; font-weight: bold; font-family: Monaco, monospace; }

/* 右侧列表特殊样式 */
.clickable-row { cursor: pointer; }
.clickable-row:hover { background-color: #fff5f5 !important; } /* 悬浮淡红背景 */

.fail-tag { margin-right: 0; font-weight: bold; }
.sub-detail { font-size: 12px; color: #909399; margin-top: 4px; display: flex; align-items: center; justify-content: flex-end; gap: 2px;}

.empty-tip {
  height: 100%; display: flex; align-items: center; justify-content: center;
}

/* 滚动条美化 */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
</style>
