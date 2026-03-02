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
          <t-form-item label="节点名称" class="compact-form-item">
            <t-input v-model="localConfig.label" placeholder="循环节点" size="small" @change="updateConfig" />
          </t-form-item>

          <t-form-item label="循环类型" class="compact-form-item">
            <t-select v-model="localConfig.loopType" size="small" @change="updateConfig">
              <t-option value="for" label="计数循环 (for)" />
              <t-option value="while" label="条件循环 (while)" />
              <t-option value="foreach" label="遍历循环 (foreach)" />
            </t-select>
          </t-form-item>
        </div>
      </t-collapse-panel>

      <!-- 循环参数 -->
      <t-collapse-panel value="params">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">循环参数</span>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <!-- 计数循环参数 -->
          <template v-if="localConfig.loopType === 'for'">
            <t-form-item label="最大迭代次数" class="compact-form-item">
              <t-input-number
                v-model="localConfig.maxIterations"
                :min="1"
                :max="10000"
                size="small"
                @change="updateConfig"
              />
            </t-form-item>
          </template>

          <!-- 条件循环参数 -->
          <template v-if="localConfig.loopType === 'while'">
            <t-form-item label="循环条件" class="compact-form-item">
              <t-textarea
                v-model="localConfig.condition"
                placeholder="例如: {{input.count}} < 10"
                size="small"
                :autosize="{ minRows: 2, maxRows: 4 }"
                @change="updateConfig"
              />
            </t-form-item>
          </template>

          <!-- 遍历循环参数 -->
          <template v-if="localConfig.loopType === 'foreach'">
            <t-form-item label="遍历变量" class="compact-form-item">
              <t-input
                v-model="localConfig.condition"
                placeholder="例如: {{input.items}}"
                size="small"
                @change="updateConfig"
              />
            </t-form-item>
          </template>

          <!-- 中断条件 -->
          <t-form-item label="中断条件" class="compact-form-item">
            <t-textarea
              v-model="localConfig.breakCondition"
              placeholder="例如: {{output.error}} === 'true'"
              size="small"
              :autosize="{ minRows: 2, maxRows: 4 }"
              @change="updateConfig"
            />
            <div class="text-xs text-gray-500 mt-1">满足此条件时提前退出循环</div>
          </t-form-item>
        </div>
      </t-collapse-panel>

      <!-- 输出配置 -->
      <t-collapse-panel value="output">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">输出配置</span>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <t-form-item label="输出变量名" class="compact-form-item">
            <t-input v-model="localConfig.outputVariable" placeholder="output" size="small" @change="updateConfig" />
          </t-form-item>

          <t-form-item label="输出类型" class="compact-form-item">
            <t-select v-model="localConfig.outputType" size="small" @change="updateConfig">
              <t-option value="array" label="数组" />
              <t-option value="object" label="对象" />
              <t-option value="string" label="字符串" />
            </t-select>
          </t-form-item>

          <t-form-item label="聚合方式" class="compact-form-item">
            <t-select v-model="localConfig.aggregation" size="small" @change="updateConfig">
              <t-option value="collect" label="收集所有结果" />
              <t-option value="last" label="最后一个结果" />
              <t-option value="first" label="第一个结果" />
              <t-option value="count" label="循环次数" />
            </t-select>
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

  // 折叠面板激活状态
  const activeNames = ref(['basic', 'params', 'output']);

  // 标记是否正在更新配置，避免循环更新
  const isUpdating = ref(false);

  // 本地配置副本
  const localConfig = reactive({
    label: props.node?.data?.label || '循环节点',
    loopType: props.node?.data?.config?.loopType || 'for',
    maxIterations: props.node?.data?.config?.maxIterations || 10,
    condition: props.node?.data?.config?.condition || '',
    breakCondition: props.node?.data?.config?.breakCondition || '',
    outputVariable: props.node?.data?.config?.outputVariable || 'output',
    outputType: props.node?.data?.config?.outputType || 'array',
    aggregation: props.node?.data?.config?.aggregation || 'collect',
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
          label: newNode.data?.label || '循环节点',
          loopType: newNode.data?.config?.loopType || 'for',
          maxIterations: newNode.data?.config?.maxIterations || 10,
          condition: newNode.data?.config?.condition || '',
          breakCondition: newNode.data?.config?.breakCondition || '',
          outputVariable: newNode.data?.config?.outputVariable || 'output',
          outputType: newNode.data?.config?.outputType || 'array',
          aggregation: newNode.data?.config?.aggregation || 'collect',
        });
      }
    },
    { deep: true },
  );

  // 更新配置
  const updateConfig = () => {
    isUpdating.value = true;

    emit('update-node', {
      label: localConfig.label,
      config: {
        loopType: localConfig.loopType,
        maxIterations: localConfig.maxIterations,
        condition: localConfig.condition,
        breakCondition: localConfig.breakCondition,
        outputVariable: localConfig.outputVariable,
        outputType: localConfig.outputType,
        aggregation: localConfig.aggregation,
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
