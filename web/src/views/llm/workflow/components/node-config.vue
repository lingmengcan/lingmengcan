<script lang="ts" setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { WorkflowNode } from '@/models/workflow';
  import { useWorkflowStore } from '@/store/modules/workflow';

  interface Props {
    node: WorkflowNode;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    'update:node': [node: WorkflowNode];
  }>();

  const workflowStore = useWorkflowStore();
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

  // 从插件配置中获取配置表单
  const configForm = computed(() => {
    // 从 availableNodeTypes 中查找当前节点类型的配置
    const nodeTypeInfo = workflowStore.availableNodeTypes.find((t) => t.type === nodeData.value.type);

    if (nodeTypeInfo?.configSchema) {
      const schema = nodeTypeInfo.configSchema as any;

      // 如果 configSchema 已经是表单配置数组格式，直接返回
      if (Array.isArray(schema)) {
        return schema;
      }

      // 如果是 JSON Schema 格式，转换为表单配置
      if (schema.properties) {
        return convertJsonSchemaToFormConfig(schema);
      }
    }

    // 如果没有配置，返回空数组
    return [];
  });

  // 将 JSON Schema 转换为表单配置
  const convertJsonSchemaToFormConfig = (schema: any) => {
    const formConfig: any[] = [];

    if (!schema.properties) return formConfig;

    Object.keys(schema.properties).forEach((key) => {
      const prop = schema.properties[key];
      const formItem: any = {
        key,
        label: prop.title || key,
        type: getFormType(prop),
      };

      // 添加选项
      if (prop.enum) {
        formItem.options = prop.enum.map((value: any) => ({
          value,
          label: prop.enumNames?.[prop.enum.indexOf(value)] || value,
        }));
      }

      // 添加其他属性
      if (prop.minimum !== undefined) formItem.min = prop.minimum;
      if (prop.maximum !== undefined) formItem.max = prop.maximum;
      if (prop.default !== undefined) formItem.default = prop.default;
      if (prop.placeholder) formItem.placeholder = prop.placeholder;
      if (prop.description) formItem.description = prop.description;

      formConfig.push(formItem);
    });

    return formConfig;
  };

  // 根据 JSON Schema 类型获取表单类型
  const getFormType = (prop: any) => {
    if (prop.enum) return 'select';
    if (prop.type === 'boolean') return 'switch';
    if (prop.type === 'number' || prop.type === 'integer') {
      if (prop.minimum !== undefined && prop.maximum !== undefined) {
        return 'slider';
      }
      return 'number';
    }
    if (prop.type === 'string') {
      if (prop.format === 'textarea' || prop.maxLength > 100) {
        return 'textarea';
      }
      if (prop.format === 'json') {
        return 'json';
      }
      return 'input';
    }
    if (prop.type === 'object' || prop.type === 'array') {
      return 'json';
    }
    return 'input';
  };

  // 如果没有从插件配置中获取到表单，使用后备方案
  onMounted(() => {
    if (configForm.value.length === 0) {
      console.warn(`节点类型 ${nodeData.value.type} 没有配置表单定义，使用后备方案`);
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
