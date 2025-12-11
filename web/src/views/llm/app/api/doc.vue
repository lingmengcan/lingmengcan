<template>
  <div class="max-w-4xl mx-auto p-6 bg-white">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">应用问答接口 API 文档</h1>
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
          <span class="font-mono text-gray-800">POST</span>
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

    <!-- 请求参数说明 -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">请求参数说明</h2>
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <t-enhanced-table
          :data="requestParams"
          :columns="requestParamColumns"
          :disableDataPage="true"
          :hover="true"
          :bordered="true"
          :tree="{ childrenKey: 'children', treeNodeColumnIndex: 0, indent: 24, defaultExpandAll: true }"
          row-key="name"
        >
          <template #treeExpandAndFoldIcon="{ type }">
            <t-icon v-if="type === 'fold'" name="folder-open" style="color: #ff8c00" />
            <t-icon v-else name="folder" style="color: #ff8c00" />
          </template>
        </t-enhanced-table>
      </div>
    </div>

    <!-- 请求示例 -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">请求示例</h2>

      <!-- 基础示例 -->
      <div class="mb-6">
        <h3 class="text-base font-semibold text-gray-700 mb-2">基础文本输入</h3>
        <div class="bg-gray-100 rounded-lg p-4">
          <pre class="font-mono text-sm text-gray-800 whitespace-pre-wrap">
{
  "workflowId": "workflow-uuid-12345",
  "parameters": {
    "input": "你好，请帮我分析一下北京的经纬度"
  },
  "stream": false
}</pre
          >
        </div>
      </div>

      <!-- 文件URL示例 -->
      <div class="mb-6">
        <h3 class="text-base font-semibold text-gray-700 mb-2">文件输入（URL）</h3>
        <div class="bg-gray-100 rounded-lg p-4">
          <pre class="font-mono text-sm text-gray-800 whitespace-pre-wrap">
{
  "workflowId": "workflow-uuid-12345",
  "parameters": {
    "input": "请总结图片内容",
    "image": "https://example.com/tos-cn-i-mdko3gqilj/example.png"
  },
  "stream": true
}</pre
          >
        </div>
      </div>
    </div>

    <!-- 响应示例 -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">响应示例</h2>

      <!-- 流式执行响应 -->
      <div class="mb-6">
        <h3 class="text-base font-semibold text-gray-700 mb-2">流式执行响应 (stream: true)</h3>
        <div class="bg-gray-100 rounded-lg p-4">
          <pre class="font-mono text-sm text-gray-800 whitespace-pre-wrap">
{
  "code": 0,
  "message": "success",
  "data": {
    "executionId": "exec_123456789",
    "workflowId": "workflow-uuid-12345",
    "parameters": {
      "input": "你好，请帮我分析一下北京的经纬度"
    },
    "output": "北京的经度为116.4074°E，纬度为39.9042°N。",
    "executionLog": [
      {
        "nodeId": "start-xxx",
        "nodeType": "start",
        "message": "开始执行节点: 开始",
        "timestamp": "2024-01-01T12:00:00Z"
      },
      {
        "nodeId": "llm-xxx",
        "nodeType": "llm",
        "message": "LLM节点配置: 模型=\"deepseek-r1-0528-qwen3-8b\"",
        "timestamp": "2024-01-01T12:00:01Z"
      }
    ],
    "duration": 1,
    "timestamp": "2024-01-01T12:00:02Z"
  }
}</pre
          >
        </div>
      </div>
    </div>

    <!-- 返回参数说明 -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">返回参数说明</h2>
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <t-enhanced-table
          :data="responseParams"
          :columns="responseParamColumns"
          :disableDataPage="true"
          :hover="true"
          :bordered="true"
          :tree="{ childrenKey: 'children', treeNodeColumnIndex: 0, indent: 24, defaultExpandAll: true }"
          row-key="name"
        >
          <template #treeExpandAndFoldIcon="{ type }">
            <t-icon v-if="type === 'fold'" name="folder-open" style="color: #ff8c00" />
            <t-icon v-else name="folder" style="color: #ff8c00" />
          </template>
        </t-enhanced-table>
      </div>
    </div>

    <!-- 错误码说明 -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">错误码说明</h2>
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <t-enhanced-table
          :data="errorCodes"
          :columns="errorCodeColumns"
          :disableDataPage="true"
          :hover="true"
          :bordered="true"
          row-key="code"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { MessagePlugin, TableProps, Icon as TIcon } from 'tdesign-vue-next';

  const { t } = useI18n();
  const route = useRoute();

  const appId = ref<string>('');

  // 计算基础URL
  const baseUrl = computed(() => {
    return `/openapi/v1/workflow/execute`;
  });

  // 请求参数表格列配置
  const requestParamColumns = ref<TableProps['columns']>([
    {
      colKey: 'name',
      title: '参数名',
      width: 200,
      cell: (h: any, { row }: any) => {
        const hasChildren = row.children && row.children.length > 0;

        if (hasChildren) {
          return h('div', { class: 'flex items-center gap-2' }, [h('span', row.name)]);
        } else {
          return h('div', { class: 'flex items-center gap-2' }, [
            h(TIcon, { name: 'file', style: { color: '#52c41a', fontSize: '16px' } }),
            h('span', row.name),
          ]);
        }
      },
    },
    { colKey: 'type', title: '类型', width: 120 },
    { colKey: 'required', title: '必填', width: 100 },
    { colKey: 'description', title: '说明', width: 400 },
  ]);

  // 返回参数表格列配置
  const responseParamColumns = ref<TableProps['columns']>([
    {
      colKey: 'name',
      title: '参数名',
      width: 200,
      cell: (h: any, { row }: any) => {
        const hasChildren = row.children && row.children.length > 0;

        if (hasChildren) {
          return h('div', { class: 'flex items-center gap-2' }, [h('span', row.name)]);
        } else {
          return h('div', { class: 'flex items-center gap-2' }, [
            h(TIcon, { name: 'file', style: { color: '#52c41a', fontSize: '16px' } }),
            h('span', row.name),
          ]);
        }
      },
    },
    { colKey: 'type', title: '类型', width: 120 },
    { colKey: 'description', title: '说明', width: 400 },
  ]);

  // 错误码表格列配置
  const errorCodeColumns = [
    { colKey: 'code', title: t('views.llm.apiDocs.errorCode'), width: 120 },
    { colKey: 'message', title: t('views.llm.apiDocs.errorMessage'), width: 200 },
    { colKey: 'description', title: t('views.llm.apiDocs.description'), width: 300 },
  ];

  // 请求参数数据 - 使用树形结构
  const requestParams = ref([
    {
      name: 'workflowId',
      type: 'string',
      required: '是',
      description: '待执行的工作流ID，此工作流应已发布',
      children: [],
    },
    {
      name: 'parameters',
      type: 'json',
      required: '是',
      description: '工作流开始节点的输入参数及取值，支持文本、文件等多种类型',
      children: [
        {
          name: 'input',
          type: 'string',
          required: '是',
          description: '用户输入的文本内容',
          children: [],
        },
        {
          name: 'image',
          type: 'string',
          required: '否',
          description: '图片URL（可选）',
          children: [],
        },
      ],
    },
    {
      name: 'stream',
      type: 'boolean',
      required: '否',
      description: '是否流式返回结果，默认为false。true时同步返回完整结果，false时异步执行',
      children: [],
    },
  ]);

  // 返回参数数据 - 使用树形结构
  const responseParams = ref([
    {
      name: 'code',
      type: 'number',
      description: '响应状态码，0表示成功，非0表示失败',
      children: [],
    },
    {
      name: 'message ',
      type: 'string',
      description: '响应消息，成功时为"success"，失败时为错误描述',
      children: [],
    },
    {
      name: 'data',
      type: 'json',
      description: '响应数据对象',
      children: [
        {
          name: 'executionId',
          type: 'string',
          description: '执行ID，用于标识本次工作流执行',
          children: [],
        },
        {
          name: 'workflowId',
          type: 'string',
          description: '工作流ID',
          children: [],
        },
        {
          name: 'parameters',
          type: 'json',
          description: '输入参数，与请求中的parameters相同',
          children: [
            {
              name: 'input',
              type: 'string',
              description: '用户输入的文本内容',
              children: [],
            },
            {
              name: 'image',
              type: 'string',
              description: '图片文件ID或URL（可选）',
              children: [],
            },
          ],
        },
        {
          name: 'output',
          type: 'string',
          description: '工作流执行结果，包含LLM响应等最终输出内容',
          children: [],
        },
        {
          name: 'executionLog',
          type: 'array',
          description: '执行日志数组，记录每个节点的执行过程和结果',
          children: [
            {
              name: 'nodeId',
              type: 'string',
              description: '节点ID',
              children: [],
            },
            {
              name: 'nodeType',
              type: 'string',
              description: '节点类型，如start、llm、end等',
              children: [],
            },
            {
              name: 'message',
              type: 'string',
              description: '节点执行消息',
              children: [],
            },
            {
              name: 'timestamp',
              type: 'string',
              description: '节点执行时间戳',
              children: [],
            },
          ],
        },
        {
          name: 'duration',
          type: 'number',
          description: '执行时长（秒）',
          children: [],
        },
        {
          name: 'timestamp',
          type: 'string',
          description: '执行完成时间戳',
          children: [],
        },
      ],
    },
  ]);

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

<style scoped></style>
