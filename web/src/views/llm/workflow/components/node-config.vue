<script lang="ts" setup>
  import { ref, computed, watch } from 'vue';
  import { WorkflowNode } from '@/models/workflow';

  interface Props {
    node: WorkflowNode;
  }

  // 移除未使用的接口定义，使用内联类型

  const props = defineProps<Props>();
  const emit = defineEmits<{
    'update:node': [node: WorkflowNode];
  }>();

  const nodeData = ref({ ...props.node });

  // 监听节点变化
  watch(
    () => props.node,
    (newNode) => {
      nodeData.value = { ...newNode };
    },
    { deep: true },
  );

  // 更新节点数据
  const updateNode = () => {
    emit('update:node', nodeData.value);
  };

  // 根据节点类型获取配置表单
  const configForm = computed(() => {
    switch (nodeData.value.type) {
      case 'input':
        return [
          {
            key: 'inputType',
            label: '输入类型',
            type: 'select',
            options: [
              { value: 'text', label: '文本' },
              { value: 'number', label: '数字' },
              { value: 'file', label: '文件' },
              { value: 'json', label: 'JSON' },
            ],
          },
          { key: 'required', label: '必填', type: 'switch' },
          { key: 'defaultValue', label: '默认值', type: 'input' },
          { key: 'placeholder', label: '占位符', type: 'input' },
        ];

      case 'output':
        return [
          {
            key: 'outputType',
            label: '输出类型',
            type: 'select',
            options: [
              { value: 'text', label: '文本' },
              { value: 'json', label: 'JSON' },
              { value: 'file', label: '文件' },
            ],
          },
          { key: 'format', label: '输出格式', type: 'textarea' },
        ];

      case 'llm':
        return [
          {
            key: 'model',
            label: '模型名称',
            type: 'select',
            options: [
              { value: 'gpt-4', label: 'GPT-4' },
              { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
              { value: 'claude-3', label: 'Claude-3' },
              { value: 'qwen-max', label: '通义千问Max' },
            ],
          },
          { key: 'temperature', label: '温度', type: 'slider', min: 0, max: 2, step: 0.1 },
          { key: 'maxTokens', label: '最大令牌数', type: 'number' },
          { key: 'systemPrompt', label: '系统提示词', type: 'textarea' },
          { key: 'userPrompt', label: '用户提示词', type: 'textarea' },
        ];

      case 'condition':
        return [
          {
            key: 'conditionType',
            label: '条件类型',
            type: 'select',
            options: [
              { value: 'equals', label: '等于' },
              { value: 'contains', label: '包含' },
              { value: 'greater', label: '大于' },
              { value: 'less', label: '小于' },
              { value: 'regex', label: '正则匹配' },
            ],
          },
          { key: 'leftValue', label: '左值', type: 'input' },
          { key: 'rightValue', label: '右值', type: 'input' },
        ];

      case 'loop':
        return [
          {
            key: 'loopType',
            label: '循环类型',
            type: 'select',
            options: [
              { value: 'for', label: '计数循环' },
              { value: 'while', label: '条件循环' },
              { value: 'foreach', label: '遍历循环' },
            ],
          },
          { key: 'maxIterations', label: '最大迭代次数', type: 'number' },
          { key: 'condition', label: '循环条件', type: 'input' },
          { key: 'breakCondition', label: '中断条件', type: 'input' },
          { key: 'outputVariable', label: '输出变量名', type: 'input' },
          {
            key: 'outputType',
            label: '输出类型',
            type: 'select',
            options: [
              { value: 'array', label: '数组' },
              { value: 'object', label: '对象' },
              { value: 'string', label: '字符串' },
            ],
          },
          {
            key: 'aggregation',
            label: '聚合方式',
            type: 'select',
            options: [
              { value: 'collect', label: '收集所有结果' },
              { value: 'last', label: '最后一个结果' },
              { value: 'first', label: '第一个结果' },
              { value: 'count', label: '循环次数' },
            ],
          },
        ];

      case 'http':
        return [
          {
            key: 'method',
            label: '请求方法',
            type: 'select',
            options: [
              { value: 'GET', label: 'GET' },
              { value: 'POST', label: 'POST' },
              { value: 'PUT', label: 'PUT' },
              { value: 'DELETE', label: 'DELETE' },
              { value: 'PATCH', label: 'PATCH' },
            ],
          },
          { key: 'url', label: '请求URL', type: 'input' },
          { key: 'headers', label: '请求头', type: 'json' },
          { key: 'params', label: '请求参数', type: 'json' },
          { key: 'body', label: '请求体', type: 'textarea' },
          {
            key: 'bodyType',
            label: '请求体类型',
            type: 'select',
            options: [
              { value: 'none', label: '无' },
              { value: 'json', label: 'JSON' },
              { value: 'form', label: '表单' },
              { value: 'raw', label: '原始数据' },
            ],
          },
          { key: 'timeout', label: '超时时间(秒)', type: 'number' },
          { key: 'retryCount', label: '重试次数', type: 'number' },
          { key: 'authEnabled', label: '启用认证', type: 'switch' },
          {
            key: 'authType',
            label: '认证类型',
            type: 'select',
            options: [
              { value: 'bearer', label: 'Bearer Token' },
              { value: 'basic', label: 'Basic Auth' },
              { value: 'apikey', label: 'API Key' },
            ],
          },
          { key: 'authToken', label: '认证令牌', type: 'input' },
        ];

      case 'database':
        return [
          {
            key: 'operationType',
            label: '操作类型',
            type: 'select',
            options: [
              { value: 'select', label: '查询 (SELECT)' },
              { value: 'insert', label: '插入 (INSERT)' },
              { value: 'update', label: '更新 (UPDATE)' },
              { value: 'delete', label: '删除 (DELETE)' },
              { value: 'execute', label: '执行SQL' },
            ],
          },
          {
            key: 'dataSource',
            label: '数据源',
            type: 'select',
            options: [
              { value: 'default', label: '默认数据源' },
              { value: 'mysql', label: 'MySQL' },
              { value: 'postgresql', label: 'PostgreSQL' },
              { value: 'sqlite', label: 'SQLite' },
            ],
          },
          { key: 'tableName', label: '表名', type: 'input' },
          { key: 'fields', label: '字段列表', type: 'json' },
          { key: 'conditions', label: '查询条件', type: 'json' },
          { key: 'sql', label: 'SQL语句', type: 'textarea' },
          { key: 'outputVariable', label: '输出变量名', type: 'input' },
          { key: 'limit', label: '限制条数', type: 'number' },
          { key: 'orderBy', label: '排序字段', type: 'input' },
          {
            key: 'errorHandling',
            label: '错误处理',
            type: 'select',
            options: [
              { value: 'fail', label: '失败停止' },
              { value: 'skip', label: '跳过错误' },
              { value: 'default', label: '返回默认值' },
            ],
          },
        ];

      case 'transform':
        return [
          {
            key: 'transformType',
            label: '转换类型',
            type: 'select',
            options: [
              { value: 'mapping', label: '字段映射' },
              { value: 'filter', label: '数据过滤' },
              { value: 'aggregate', label: '数据聚合' },
              { value: 'format', label: '格式转换' },
              { value: 'custom', label: '自定义转换' },
            ],
          },
          {
            key: 'inputFormat',
            label: '输入格式',
            type: 'select',
            options: [
              { value: 'json', label: 'JSON' },
              { value: 'xml', label: 'XML' },
              { value: 'csv', label: 'CSV' },
              { value: 'text', label: '文本' },
            ],
          },
          {
            key: 'outputFormat',
            label: '输出格式',
            type: 'select',
            options: [
              { value: 'json', label: 'JSON' },
              { value: 'xml', label: 'XML' },
              { value: 'csv', label: 'CSV' },
              { value: 'text', label: '文本' },
            ],
          },
          { key: 'rules', label: '转换规则', type: 'json' },
          { key: 'outputVariable', label: '输出变量名', type: 'input' },
          {
            key: 'errorHandling',
            label: '错误处理',
            type: 'select',
            options: [
              { value: 'skip', label: '跳过错误' },
              { value: 'fail', label: '失败停止' },
              { value: 'default', label: '使用默认值' },
            ],
          },
          { key: 'defaultValue', label: '默认值', type: 'textarea' },
          { key: 'customScript', label: '自定义脚本', type: 'textarea' },
        ];

      case 'parallel':
        return [
          { key: 'branchCount', label: '分支数量', type: 'number' },
          {
            key: 'strategy',
            label: '执行策略',
            type: 'select',
            options: [
              { value: 'all', label: '等待全部完成' },
              { value: 'any', label: '任一完成即结束' },
              { value: 'race', label: '竞速模式（最快获胜）' },
            ],
          },
          { key: 'branches', label: '分支配置', type: 'json' },
          {
            key: 'mergeStrategy',
            label: '合并策略',
            type: 'select',
            options: [
              { value: 'collect', label: '收集所有结果' },
              { value: 'first', label: '第一个结果' },
              { value: 'last', label: '最后一个结果' },
              { value: 'merge', label: '合并为对象' },
            ],
          },
          { key: 'outputVariable', label: '输出变量名', type: 'input' },
          {
            key: 'errorHandling',
            label: '错误处理',
            type: 'select',
            options: [
              { value: 'fail-fast', label: '快速失败' },
              { value: 'continue', label: '继续执行' },
              { value: 'retry', label: '重试失败分支' },
            ],
          },
          { key: 'timeout', label: '全局超时(秒)', type: 'number' },
        ];

      default:
        return [];
    }
  });

  // 获取配置值
  const getConfigValue = (key: string) => {
    return nodeData.value.data.config[key] || '';
  };

  // 设置配置值
  const setConfigValue = (key: string, value: any) => {
    nodeData.value.data.config[key] = value;
    updateNode();
  };

  // 添加输入端口
  const addInputPort = () => {
    if (!nodeData.value.data.inputs) {
      nodeData.value.data.inputs = [];
    }
    const newPort = {
      name: `输入${nodeData.value.data.inputs.length + 1}`,
      type: 'any',
      required: false,
      description: '',
    };
    nodeData.value.data.inputs.push(newPort);
    updateNode();
  };

  // 删除输入端口
  const removeInputPort = (index: number) => {
    if (nodeData.value.data.inputs) {
      nodeData.value.data.inputs.splice(index, 1);
      updateNode();
    }
  };

  // 添加输出端口
  const addOutputPort = () => {
    if (!nodeData.value.data.outputs) {
      nodeData.value.data.outputs = [];
    }
    const newPort = {
      name: `输出${nodeData.value.data.outputs.length + 1}`,
      type: 'any',
      description: '',
    };
    nodeData.value.data.outputs.push(newPort);
    updateNode();
  };

  // 删除输出端口
  const removeOutputPort = (index: number) => {
    if (nodeData.value.data.outputs) {
      nodeData.value.data.outputs.splice(index, 1);
      updateNode();
    }
  };
</script>

<template>
  <div class="node-config p-4 space-y-6">
    <!-- 基本信息 -->
    <div>
      <h4 class="text-lg font-semibold mb-4">基本信息</h4>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">节点名称</label>
          <t-input v-model:value="nodeData.data.label" placeholder="请输入节点名称" @blur="updateNode" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">节点类型</label>
          <t-input :value="nodeData.type" readonly />
        </div>
      </div>
    </div>

    <!-- 配置参数 -->
    <div v-if="configForm.length > 0">
      <h4 class="text-lg font-semibold mb-4">配置参数</h4>
      <div class="space-y-4">
        <div v-for="field in configForm" :key="field.key">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ field.label }}
          </label>

          <!-- 输入框 -->
          <t-input
            v-if="field.type === 'input'"
            :model-value="getConfigValue(field.key)"
            @update:model-value="setConfigValue(field.key, $event)"
            :placeholder="`请输入${field.label}`"
          />

          <!-- 数字输入 -->
          <t-input-number
            v-else-if="field.type === 'number'"
            :model-value="getConfigValue(field.key)"
            @update:model-value="setConfigValue(field.key, $event)"
            :placeholder="`请输入${field.label}`"
          />

          <!-- 文本域 -->
          <t-textarea
            v-else-if="field.type === 'textarea'"
            :model-value="getConfigValue(field.key)"
            @update:model-value="setConfigValue(field.key, $event)"
            :placeholder="`请输入${field.label}`"
            :autosize="{ minRows: 3, maxRows: 8 }"
          />

          <!-- 选择器 -->
          <t-select
            v-else-if="field.type === 'select'"
            :model-value="getConfigValue(field.key)"
            @update:model-value="setConfigValue(field.key, $event)"
            :placeholder="`请选择${field.label}`"
          >
            <t-option v-for="option in field.options" :key="option.value" :value="option.value" :label="option.label" />
          </t-select>

          <!-- 开关 -->
          <t-switch
            v-else-if="field.type === 'switch'"
            :model-value="getConfigValue(field.key)"
            @update:model-value="setConfigValue(field.key, $event)"
          />

          <!-- 滑块 -->
          <div v-else-if="field.type === 'slider'" class="px-2">
            <t-slider
              :model-value="getConfigValue(field.key)"
              @update:model-value="setConfigValue(field.key, $event)"
              :min="field.min || 0"
              :max="field.max || 100"
              :step="field.step || 1"
              show-input
            />
          </div>

          <!-- 标签输入 -->
          <t-tag-input
            v-else-if="field.type === 'tags'"
            :model-value="getConfigValue(field.key) || []"
            @update:model-value="setConfigValue(field.key, $event)"
            :placeholder="`请输入${field.label}`"
          />

          <!-- JSON编辑器 -->
          <t-textarea
            v-else-if="field.type === 'json'"
            :model-value="
              typeof getConfigValue(field.key) === 'object'
                ? JSON.stringify(getConfigValue(field.key), null, 2)
                : getConfigValue(field.key)
            "
            @update:model-value="setConfigValue(field.key, $event)"
            :placeholder="`请输入${field.label} (JSON格式)`"
            :autosize="{ minRows: 4, maxRows: 10 }"
          />
        </div>
      </div>
    </div>

    <!-- 输入端口配置 -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-semibold">输入端口</h4>
        <t-button size="small" @click="addInputPort">
          <template #icon>
            <t-icon name="add" />
          </template>
          添加端口
        </t-button>
      </div>

      <div class="space-y-3">
        <div
          v-for="(input, index) in nodeData.data.inputs"
          :key="index"
          class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex-1">
            <t-input v-model:value="input.name" placeholder="端口名称" @blur="updateNode" />
          </div>
          <div class="w-24">
            <t-select v-model:value="input.type" placeholder="类型" @change="updateNode">
              <t-option value="any" label="任意" />
              <t-option value="text" label="文本" />
              <t-option value="number" label="数字" />
              <t-option value="json" label="JSON" />
              <t-option value="file" label="文件" />
            </t-select>
          </div>
          <t-switch v-model:value="input.required" @change="updateNode" />
          <t-button size="small" theme="danger" variant="text" @click="removeInputPort(index)">
            <template #icon>
              <t-icon name="delete" />
            </template>
          </t-button>
        </div>

        <div v-if="!nodeData.data.inputs || nodeData.data.inputs.length === 0" class="text-center text-gray-500 py-4">
          暂无输入端口
        </div>
      </div>
    </div>

    <!-- 输出端口配置 -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-semibold">输出端口</h4>
        <t-button size="small" @click="addOutputPort">
          <template #icon>
            <t-icon name="add" />
          </template>
          添加端口
        </t-button>
      </div>

      <div class="space-y-3">
        <div
          v-for="(output, index) in nodeData.data.outputs"
          :key="index"
          class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex-1">
            <t-input v-model:value="output.name" placeholder="端口名称" @blur="updateNode" />
          </div>
          <div class="w-24">
            <t-select v-model:value="output.type" placeholder="类型" @change="updateNode">
              <t-option value="any" label="任意" />
              <t-option value="text" label="文本" />
              <t-option value="number" label="数字" />
              <t-option value="json" label="JSON" />
              <t-option value="file" label="文件" />
            </t-select>
          </div>
          <t-button size="small" theme="danger" variant="text" @click="removeOutputPort(index)">
            <template #icon>
              <t-icon name="delete" />
            </template>
          </t-button>
        </div>

        <div v-if="!nodeData.data.outputs || nodeData.data.outputs.length === 0" class="text-center text-gray-500 py-4">
          暂无输出端口
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .node-config {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .node-config::-webkit-scrollbar {
    width: 6px;
  }

  .node-config::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .node-config::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .node-config::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>
