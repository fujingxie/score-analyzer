<template>
  <div class="grade-dashboard">
    <el-button type="info" :icon="Back" @click="$emit('back')" style="margin-bottom: 20px">返回上传</el-button>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>🏆 班级平均分 PK</template>
          <div ref="chartDom" style="width: 100%; height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>全校/年级总排名 ({{ stats.gradeRanked.length }}人)</template>
      <el-table :data="stats.gradeRanked" height="500" stripe>
        <el-table-column prop="年级排名" label="年级排名" width="100" sortable fixed />
        <el-table-column prop="班级" label="班级" width="100" sortable filters />
        <el-table-column prop="姓名" label="姓名" width="100" />
        <el-table-column prop="总分" label="总分" sortable width="100">
          <template #default="scope">
            <strong>{{ scope.row['总分'] }}</strong>
          </template>
        </el-table-column>
        <el-table-column
            v-for="sub in stats.subjects"
            :key="sub"
            :prop="sub"
            :label="sub"
            sortable
        />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { Back } from '@element-plus/icons-vue';
import * as echarts from 'echarts';

const props = defineProps(['stats']);
const emit = defineEmits(['back']);
const chartDom = ref(null);

onMounted(async () => {
  await nextTick();
  initChart();
});

const initChart = () => {
  if (!chartDom.value) return;
  const myChart = echarts.init(chartDom.value);

  // 提取数据：班级名 和 对应的总平均分
  const classNames = props.stats.classStats.map(c => c.className);
  const totalAvgs = props.stats.classStats.map(c => c.totalAvg);

  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: classNames },
    yAxis: { type: 'value', name: '总平均分' },
    series: [{
      name: '班级总均分',
      type: 'bar',
      data: totalAvgs,
      itemStyle: { color: '#67C23A' }, // 绿色
      label: { show: true, position: 'top' },
      markLine: {
        data: [{ type: 'average', name: '年级平均线' }]
      }
    }]
  };

  myChart.setOption(option);
  window.addEventListener('resize', () => myChart.resize());
};
</script>

<style scoped>
.grade-dashboard { padding: 20px; background: #f5f7fa; }
</style>
