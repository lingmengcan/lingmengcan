<template>
  <div>
    <t-collapse v-model="activeNames" borderless class="compact-collapse">
      <!-- 基本配置 -->
      <t-collapse-panel value="basic">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">基本配置</span>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <t-form-item label="转换类型" class="compact-form-item">
            <t-select v-model="localConfig.transformType" size="small" @change="updateConfig">
              <t-option value="mapping" label="字段映射" />
              <t-option value="filter" label="数据过滤" />
              <t-option value="aggregate" label="数据聚合" />
              <t-option value="format" label="格式转换" />
              <t-option value="custom" label="自定义转换" />
            </t-select>
          </t-form-item>

          <t-form-item label="输入格式" class="compact-form-item">
            <t-select v-model="localConfig.inputFormat" size="small" @change="updateConfig">
              <t-option value="json" label="JSON" />
              <t-option value="xml" label="XML" />
              <t-option value="csv" label="CSV" />
              <t-option value="text" label="文本" />
            </t-select>
          </t-form-item>

          <t-form-item label="输出格式" class="compact-form-item">
            <t-select v-model="localConfig.outputFormat" size="small" @change="updateConfig">
              <t-option value="json" label="JSON" />
              <t-option value="xml" label="XML" />
              <t-option value="csv" label="CSV" />
              <t-option value="text" label="文本" />
            </t-select>
          </t-form-item>
        </div>
      </t-collapse-panel>

      <!-- 转换规则 -->
      <t-collapse-panel value="rules">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">转换规则</span>
            </div>
            <t-button size="small" variant="outline" @click="addRule">
              <t-icon name="add" class="mr-1" />
              添加规则
            </t-button>
          </div>
        </template>

        <div class="space-y-3">
          <div
            v-for="(rule, index) in localConfig.rules"
            :key="`rule-${index}`"
            class="border border-gray-200 rounded p-3"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">规则 {{ index + 1 }}</span>
              <div class="flex items-center gap-2">
                <t-switch v-model="rule.enabled" size="small" @change="updateConfig" />
                <t-button size="small" variant="text" @click="removeRule(index)">
                  <t-icon name="close" />
                </t-button>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-2">
              <t-form-item label="源字段" class="compact-form-item">
                <t-input v-model="rule.source" placeholder="例如: {{input.name}}" size="small" @change="updateConfig" />
              </t-form-item>

              <t-form-item label="目标字段" class="compact-form-item">
                <t-input
                  v-model="rule.target"
                  placeholder="例如: output.userName"
                  size="small"
                  @change="updateConfig"
                />
              </t-form-item>

              <t-form-item label="转换函数" class="compact-form-item">
                <t-textarea
                  v-model="rule.transform"
                  placeholder="例如: value.toUpperCase()"
                  size="small"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  @change="updateConfig"
                />
              </t-form-item>
            </div>
          </div>

          <div v-if="localConfig.rules.length === 0" class="text-center text-gray-500 py-4">
            暂无转换规则，点击"添加规则"开始配置
          </div>
        </div>
      </t-collapse-panel>

      <!-- 高级配置 -->
      <t-collapse-panel value="advanced">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">高级配置</span>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <t-form-item label="输出变量名" class="compact-form-item">
            <t-input v-model="localConfig.outputVariable" placeholder="output" size="small" @change="updateConfig" />
          </t-form-item>

          <t-form-item label="错误处理" class="compact-form-item">
            <t-select v-model="localConfig.errorHandling" size="small" @change="updateConfig">
              <t-option value="skip" label="跳过错误" />
              <t-option value="fail" label="失败停止" />
              <t-option value="default" label="使用默认值" />
            </t-select>
          </t-form-item>

          <t-form-item label="默认值" class="compact-form-item">
            <t-textarea
              v-model="localConfig.defaultValue"
              placeholder="转换失败时使用的默认值"
              size="small"
              :autosize="{ minRows: 2, maxRows: 4 }"
              @change="updateConfig"
            />
          </t-form-item>

          <t-form-item label="自定义脚本" class="compact-form-item">
            <t-textarea
              v-model="localConfig.customScript"
              placeholder="自定义转换脚本 (JavaScript)"
              size="small"
              :autosize="{ minRows: 4, maxRows: 8 }"
              @change="updateConfig"
            />
            <div class="text-xs text-gray-500 mt-1">支持 JavaScript 语法，可使用 input 和 output 变量</div>
          </t-form-item>
        </div>
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, reactive, nextTick } from 'vue';

  interface TransformRule {
    source: string;
    target: string;
    transform: string;
    enabled: boolean;
  }

  interface NodeData {
    label: string;
    config: Record<string, any>;
  }

  const props = defineProps<{
    node: any;
  }>();

  const emit = defineEmits<{
    'update-node': [data: NodeData];
  }>();

  // 折叠面板激活状态
  const activeNames = ref(['basic', 'rules', 'advanced']);

  // 标记是否正在更新配置，避免循环更新
  const isUpdating = ref(false);

  // 本地配置副本
  const localConfig = reactive({
    label: props.node?.data?.label || '转换节点',
    transformType: props.node?.data?.config?.transformType || 'mapping',
    inputFormat: props.node?.data?.config?.inputFormat || 'json',
    outputFormat: props.node?.data?.config?.outputFormat || 'json',
    rules: props.node?.data?.config?.rules || [],
    outputVariable: props.node?.data?.config?.outputVariable || 'output',
    errorHandling: props.node?.data?.config?.errorHandling || 'skip',
    defaultValue: props.node?.data?.config?.defaultValue || '',
    customScript: props.node?.data?.config?.customScript || '',
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode, oldNode) => {
      if (isUpdating.value) {
        return;
      }

      if (newNode && newNode.id !== oldNode?.id) {
        Object.assign(localConfig, {
          label: newNode.data?.label || '转换节点',
          transformType: newNode.data?.config?.transformType || 'mapping',
          inputFormat: newNode.data?.config?.inputFormat || 'json',
          outputFormat: newNode.data?.config?.outputFormat || 'json',
          rules: newNode.data?.config?.rules || [],
          outputVariable: newNode.data?.config?.outputVariable || 'output',
          errorHandling: newNode.data?.config?.errorHandling || 'skip',
          defaultValue: newNode.data?.config?.defaultValue || '',
          customScript: newNode.data?.config?.customScript || '',
        });
      }
    },
    { deep: true },
  );

  // 添加规则
  const addRule = () => {
    localConfig.rules.push({
      source: '',
      target: '',
      transform: '',
      enabled: true,
    });
    updateConfig();
  };

  // 删除规则
  const removeRule = (index: number) => {
    localConfig.rules.splice(index, 1);
    updateConfig();
  };

  // 更新配置
  const updateConfig = () => {
    isUpdating.value = true;

    emit('update-node', {
      label: localConfig.label,
      config: {
        transformType: localConfig.transformType,
        inputFormat: localConfig.inputFormat,
        outputFormat: localConfig.outputFormat,
        rules: localConfig.rules,
        outputVariable: localConfig.outputVariable,
        errorHandling: localConfig.errorHandling,
        defaultValue: localConfig.defaultValue,
        customScript: localConfig.customScript,
      },
    });

    nextTick(() => {
      setTimeout(() => {
        isUpdating.value = false;
      }, 100);
    });
  };
</script>

<style scoped>
  .compact-collapse :deep(.t-collapse-panel) {
    border-bottom: 1px solid #e7e7e7;
    padding: 8px;
  }

  .compact-collapse :deep(.t-collapse-panel__header) {
    padding: 2px 0px;
  }

  .compact-collapse :deep(.t-collapse-panel__content) {
    padding: 8px;
  }

  .compact-form-item {
    margin: 0px;
  }

  .compact-form-item :deep(.t-form__label) {
    color: #999;
    font-size: 12px;
  }
</style>
