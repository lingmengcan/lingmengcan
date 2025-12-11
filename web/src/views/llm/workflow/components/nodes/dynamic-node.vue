<template>
  <div class="relative cursor-pointer node-container">
    <!-- 节点主体 -->
    <div class="bg-white border border-gray-200 rounded-lg w-60 shadow-sm hover:shadow-md transition-shadow">
      <!-- 头部 -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <t-icon :name="nodeIcon" class="text-lg text-gray-700" />
          <span class="text-sm font-medium text-gray-700">{{ data.label }}</span>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="px-3 py-2 flex flex-col gap-2">
        <!-- 输入变量列表 -->
        <div v-if="inputs.length > 0" class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">输入</span>
          <div class="flex items-center gap-1 flex-wrap">
            <span
              v-for="(input, index) in inputs"
              :key="`input-${index}`"
              class="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded"
            >
              {{ input.name }}
            </span>
          </div>
        </div>

        <!-- 输出变量列表 -->
        <div v-if="outputs.length > 0" class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">输出</span>
          <div class="flex items-center gap-1 flex-wrap">
            <span
              v-for="(output, index) in outputs"
              :key="`output-${index}`"
              class="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded"
            >
              {{ output.name }}
            </span>
          </div>
        </div>

        <!-- 额外信息（如模型名称等） -->
        <div v-if="extraInfo" class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">{{ extraInfo.label }}</span>
          <div class="flex items-center gap-2 text-xs text-gray-700">
            <span>{{ extraInfo.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 左侧连接点 -->
    <div class="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Handle
        type="target"
        :position="Position.Left"
        class="handle-point w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
    </div>

    <!-- 右侧连接点 -->
    <div class="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
      <Handle
        type="source"
        :position="Position.Right"
        class="handle-point w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Handle, Position } from '@vue-flow/core';
  import { useWorkflowStore } from '@/store/modules/workflow';

  interface Props {
    id: string;
    data: {
      label: string;
      config?: Record<string, any>;
    };
    type: string;
  }

  const props = defineProps<Props>();
  const workflowStore = useWorkflowStore();

  // 获取节点图标
  const nodeIcon = computed(() => {
    const nodeTypeInfo = workflowStore.availableNodeTypes.find((t) => t.type === props.type);
    return nodeTypeInfo?.icon || 'component';
  });

  // 获取输入变量
  const inputs = computed(() => {
    return props.data.config?.inputs || [];
  });

  // 获取输出变量
  const outputs = computed(() => {
    return props.data.config?.outputs || [];
  });

  // 获取额外信息（如模型名称等）
  const extraInfo = computed(() => {
    const config = props.data.config;
    if (!config) return null;

    // 从节点类型配置中获取要显示的字段
    const nodeTypeInfo = workflowStore.availableNodeTypes.find((t) => t.type === props.type);
    const displayField = nodeTypeInfo?.displayField;

    if (displayField && config[displayField]) {
      // 从 nodeConfigSchema 中获取字段的 title
      const schema = nodeTypeInfo?.configSchema as any;
      const fieldSchema = schema?.properties?.[displayField];
      const label = fieldSchema?.title || displayField;

      return {
        label,
        value: config[displayField],
      };
    }

    return null;
  });
</script>

<style scoped>
  /* 悬停时显示图标和放大连接点 */
  .node-container:hover .handle-icon {
    opacity: 1;
  }

  .node-container .handle-point {
    width: 12px;
    height: 12px;
  }

  .node-container:hover .handle-point {
    width: 16px;
    height: 16px;
  }
</style>
