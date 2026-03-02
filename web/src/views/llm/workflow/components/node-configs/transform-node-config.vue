<template>
  <div>
    <t-collapse v-model="activeNames" borderless class="compact-collapse">
      <!-- 基本配置 -->
      <t-collapse-panel value="basic">
        <template #header>
          <span class="font-medium text-gray-700">基本配置</span>
        </template>

        <div class="space-y-3">
          <t-form-item label="转换类型" class="compact-form-item">
            <t-select v-model="localConfig.transformType" size="small" @change="updateConfig">
              <t-option value="mapping" label="字段映射" />
              <t-option value="filter" label="数据过滤" />
              <t-option value="format" label="格式转换" />
              <t-option value="script" label="自定义脚本" />
              <t-option value="extract" label="数据提取" />
              <t-option value="merge" label="数据合并" />
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
            <span class="font-medium text-gray-700">转换规则</span>
            <t-button size="small" variant="text" class="text-blue-500" @click.stop.prevent="addRule">
              <t-icon name="add" />
            </t-button>
          </div>
        </template>

        <div class="space-y-2">
          <div
            v-for="(rule, index) in localConfig.rules"
            :key="`rule-${index}`"
            class="border border-gray-200 rounded p-2 space-y-2"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500">规则 {{ index + 1 }}</span>
                <t-switch v-model="rule.enabled" size="small" @change="updateConfig" />
              </div>
              <t-button size="small" variant="text" class="text-gray-400 hover:text-red-500" @click="removeRule(index)">
                <t-icon name="close" />
              </t-button>
            </div>

            <t-input v-model="rule.source" placeholder="源字段 (如: data.name)" size="small" @change="updateConfig" />
            <t-input v-model="rule.target" placeholder="目标字段 (如: output.userName)" size="small" @change="updateConfig" />
            <t-select v-model="rule.transform" placeholder="转换函数（可选）" size="small" clearable @change="updateConfig">
              <t-option value="toString" label="toString - 转字符串" />
              <t-option value="toNumber" label="toNumber - 转数字" />
              <t-option value="toBoolean" label="toBoolean - 转布尔" />
              <t-option value="uppercase" label="uppercase - 转大写" />
              <t-option value="lowercase" label="lowercase - 转小写" />
              <t-option value="trim" label="trim - 去空格" />
              <t-option value="split" label="split - 按逗号分割" />
              <t-option value="join" label="join - 用逗号连接" />
            </t-select>
          </div>
          <t-empty v-if="localConfig.rules.length === 0" description="暂无转换规则，点击 + 添加" />
        </div>
      </t-collapse-panel>

      <!-- 高级配置 -->
      <t-collapse-panel value="advanced">
        <template #header>
          <span class="font-medium text-gray-700">高级配置</span>
        </template>

        <div class="space-y-3">
          <t-form-item label="输出变量名" class="compact-form-item">
            <t-input v-model="localConfig.outputVariable" placeholder="output" size="small" @change="updateConfig" />
          </t-form-item>

          <t-form-item label="错误处理" class="compact-form-item">
            <t-select v-model="localConfig.errorHandling" size="small" @change="updateConfig">
              <t-option value="fail" label="失败停止" />
              <t-option value="default" label="使用原始数据" />
              <t-option value="skip" label="跳过错误" />
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

          <t-form-item v-if="localConfig.transformType === 'script'" label="自定义脚本" class="compact-form-item">
            <t-textarea
              v-model="localConfig.customScript"
              placeholder="// 自定义转换脚本 (JavaScript)&#10;// 可使用 input 变量&#10;return input;"
              size="small"
              :autosize="{ minRows: 4, maxRows: 8 }"
              @change="updateConfig"
            />
            <div class="text-xs text-gray-400 mt-1">支持 JavaScript 语法，可使用 input 变量访问输入数据</div>
          </t-form-item>
        </div>
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, reactive, nextTick } from 'vue';

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

  const activeNames = ref(['basic', 'rules', 'advanced']);
  const isUpdating = ref(false);

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

  watch(
    () => props.node,
    (newNode, oldNode) => {
      if (isUpdating.value) return;
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

  const addRule = () => {
    localConfig.rules.push({
      source: '',
      target: '',
      transform: '',
      enabled: true,
    });
  };

  const removeRule = (index: number) => {
    localConfig.rules.splice(index, 1);
    updateConfig();
  };

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
        outputs: props.node?.data?.config?.outputs || [{ name: 'output', type: 'json' }],
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
    text-align: left;
  }
</style>
