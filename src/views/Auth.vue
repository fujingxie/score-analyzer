<template>
  <div class="auth-container">
    <el-card class="auth-card">
      <div class="card-content">
        <div class="icon-wrapper">
          <el-icon :size="48" color="#409EFF"><Lock /></el-icon>
        </div>

        <h2>系统激活</h2>
        <p class="sub-text">请输入您的产品激活码以继续使用</p>

        <div class="input-section">
          <el-input
              v-model="licenseKey"
              placeholder="请输入激活码 (如 VIP-8888)"
              prefix-icon="Key"
              clearable
              size="large"
              @keyup.enter="handleActivate"
          />

          <el-button
              type="primary"
              size="large"
              class="activate-btn"
              :loading="loading"
              @click="handleActivate"
          >
            立即激活
          </el-button>
        </div>

        <div v-if="errorMsg" class="error-msg">
          <el-icon><Warning /></el-icon> {{ errorMsg }}
        </div>
      </div>

      <div class="footer">
        © 2026 Class Analysis System
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Lock, Warning, Key } from '@element-plus/icons-vue';
import { verifyLicense, saveAuth } from '../utils/auth';
import { ElMessage } from 'element-plus';

const router = useRouter();
const licenseKey = ref(''); // 绑定输入框
const loading = ref(false); // 按钮加载状态
const errorMsg = ref('');

const handleActivate = async () => {
  if (!licenseKey.value) {
    errorMsg.value = "请输入激活码";
    return;
  }

  loading.value = true;
  errorMsg.value = '';

  // 1. 调用 utils/auth.js 里的联网验证
  const result = await verifyLicense(licenseKey.value);

  loading.value = false;

  if (result.success) {
    // 2. 成功：保存状态并跳转
    saveAuth(licenseKey.value);

    ElMessage.success({
      message: '激活成功！欢迎回来',
      duration: 2000
    });

    setTimeout(() => {
      router.push('/');
    }, 500);
  } else {
    // 3. 失败：显示 Cloudflare 返回的错误信息
    errorMsg.value = result.msg;
    ElMessage.error(result.msg);
  }
};
</script>

<style scoped>
/* 保持你原来的大部分样式，新增 input 相关样式 */
.auth-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: radial-gradient(#e0e0e0 1px, transparent 1px);
  background-size: 20px 20px;
}

.auth-card {
  width: 420px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.05);
  text-align: center;
}

.card-content { padding: 30px 20px; }

.icon-wrapper {
  width: 80px; height: 80px; background: #ecf5ff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
}

h2 { margin: 0 0 10px 0; color: #303133; }
.sub-text { margin: 0 0 30px 0; color: #909399; font-size: 14px; }

.input-section {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activate-btn { width: 100%; font-weight: bold; }

.error-msg {
  color: #F56C6C; font-size: 13px; background: #fef0f0;
  padding: 8px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center; gap: 5px;
}

.footer {
  border-top: 1px solid #ebeef5; padding: 15px; font-size: 12px; color: #c0c4cc; background: #fafafa;
}
</style>
