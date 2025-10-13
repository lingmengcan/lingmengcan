<template>
  <div class="max-w-4xl mx-auto p-6 bg-white">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">应用问答接口 API文档</h1>
      <div class="w-full h-px bg-gray-200"></div>
    </div>

    <!-- 基本信息 -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>

      <!-- 请求参数 -->
      <div class="mb-6">
        <h3 class="text-base font-semibold text-gray-800 mb-2">请求参数</h3>
        <div class="bg-gray-100 rounded-lg p-3 flex items-center justify-between">
          <span class="font-mono text-gray-800">{{ baseUrl }}</span>
          <t-icon name="copy" class="text-gray-600 cursor-pointer hover:text-gray-800" @click="copyApiUrl" />
        </div>
      </div>

      <!-- METHOD -->
      <div class="mb-6">
        <h3 class="text-base font-semibold text-gray-800 mb-2">METHOD</h3>
        <div class="bg-gray-100 rounded-lg p-3">
          <span class="font-mono text-gray-800">workflowQuiz</span>
        </div>
      </div>

      <!-- Content-Type -->
      <div class="mb-6">
        <h3 class="text-base font-semibold text-gray-800 mb-2">Content-Type</h3>
        <div class="bg-gray-100 rounded-lg p-3">
          <span class="font-mono text-gray-800">application/json</span>
        </div>
      </div>
    </div>

    <!-- 请求示例 -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">请求示例</h2>
      <div class="bg-gray-100 rounded-lg p-4">
        <pre class="font-mono text-sm text-gray-800 whitespace-pre-wrap">
{
  "input": {
    "message": "你好，请帮我分析一下这个数据",
    "data": {
      "type": "text",
      "content": "这是需要分析的内容"
    }
  },
  "variables": {
    "customVar1": "value1",
    "customVar2": "value2"
  }
}</pre
        >
      </div>
    </div>

    <!-- 响应示例 -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">响应示例</h2>
      <div class="bg-gray-100 rounded-lg p-4">
        <pre class="font-mono text-sm text-gray-800 whitespace-pre-wrap">
{
  "code": 0,
  "message": "success",
  "data": {
    "executionId": "exec_123456789",
    "status": "completed",
    "result": {
      "output": "分析结果...",
      "metadata": {
        "executionTime": 1.5,
        "tokensUsed": 150
      }
    },
    "timestamp": "2024-01-01T12:00:00Z"
  }
}</pre
        >
      </div>
    </div>

    <!-- 错误码说明 -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">错误码说明</h2>
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <t-table :data="errorCodes" :columns="errorCodeColumns" :pagination="false" :hover="true" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { MessagePlugin } from 'tdesign-vue-next';

  const { t } = useI18n();
  const route = useRoute();

  const appId = ref<string>('');

  // 计算基础URL
  const baseUrl = computed(() => {
    return `/lingmengcan/workflow/api/v1/execute`;
  });

  // 错误码表格列配置
  const errorCodeColumns = [
    { colKey: 'code', title: t('views.llm.apiDocs.errorCode'), width: 100 },
    { colKey: 'message', title: t('views.llm.apiDocs.errorMessage'), width: 200 },
    { colKey: 'description', title: t('views.llm.apiDocs.description') },
  ];

  // 错误码数据
  const errorCodes = ref([
    { code: 0, message: 'success', description: t('views.llm.apiDocs.errorSuccess') },
    { code: 400, message: 'bad_request', description: t('views.llm.apiDocs.errorBadRequest') },
    { code: 401, message: 'unauthorized', description: t('views.llm.apiDocs.errorUnauthorized') },
    { code: 403, message: 'forbidden', description: t('views.llm.apiDocs.errorForbidden') },
    { code: 404, message: 'not_found', description: t('views.llm.apiDocs.errorNotFound') },
    { code: 429, message: 'too_many_requests', description: t('views.llm.apiDocs.errorTooManyRequests') },
    { code: 500, message: 'internal_error', description: t('views.llm.apiDocs.errorInternalError') },
  ]);

  // 复制API URL
  const copyApiUrl = () => {
    navigator.clipboard.writeText(baseUrl.value).then(() => {
      MessagePlugin.success(t('views.llm.apiDocs.copySuccess'));
    });
  };

  onMounted(() => {
    // 从查询参数中获取appId
    appId.value = route.query.appId as string;
  });
</script>
