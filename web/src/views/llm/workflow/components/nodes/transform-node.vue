<template>
  <div class="relative cursor-pointer node-container">
    <div class="bg-white border border-gray-200 rounded-lg w-60 shadow-sm hover:shadow-md transition-shadow">
      <!-- 头部 -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <t-icon name="swap" class="text-lg text-gray-700" />
          <span class="text-sm font-medium text-gray-700">{{ data.label }}</span>
        </div>
      </div>

      <!-- 节点内容 -->
      <div class="px-3 py-2 flex flex-col gap-2">
        <!-- 转换类型 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">类型</span>
          <span class="text-xs text-gray-700">{{ displayTransformType }}</span>
        </div>

        <!-- 输入格式 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">输入</span>
          <span class="text-xs text-gray-700">{{ data.config?.inputFormat }}</span>
        </div>

        <!-- 输出格式 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">输出</span>
          <span class="text-xs text-gray-700">{{ data.config?.outputFormat }}</span>
        </div>

        <!-- 转换规则数量 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">规则</span>
          <span class="text-xs text-gray-700">{{ ruleCount }} 条</span>
        </div>

        <!-- 输出 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">输出</span>
          <span class="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
            {{ data.config?.outputVariable || 'output' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 左侧连接点 -->
    <div class="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Handle
        type="target"
        :position="Position.Left"
        class="handle-point w-3 h-3 bg-purple-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
    </div>

    <!-- 右侧连接点 -->
    <div class="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
      <Handle
        type="source"
        :position="Position.Right"
        id="output"
        class="handle-point w-3 h-3 bg-purple-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Handle, Position } from '@vue-flow/core';
  import { ref, computed, watch } from 'vue';

  interface NodeData {
    label: string;
    config: {
      transformType?: 'mapping' | 'filter' | 'aggregate' | 'format' | 'custom';
      inputFormat?: 'json' | 'xml' | 'csv' | 'text';
      outputFormat?: 'json' | 'xml' | 'csv' | 'text';
      outputVariable?: string;
      rules?: Array<{
        source: string;
        target: string;
        transform: string;
        enabled: boolean;
      }>;
    };
  }

  const props = defineProps<{
    id: string;
    data: NodeData;
  }>();

  const data = ref(props.data);

  // 显示转换类型
  const displayTransformType = computed(() => {
    const typeMap = {
      mapping: '字段映射',
      filter: '数据过滤',
      aggregate: '数据聚合',
      format: '格式转换',
      custom: '自定义转换',
    };
    return typeMap[data.value.config?.transformType || 'mapping'] || '字段映射';
  });

  // 规则数量
  const ruleCount = computed(() => {
    return data.value.config?.rules?.length || 0;
  });

  // 监听 props 变化，更新本地数据
  watch(
    () => props.data,
    (newData) => {
      data.value = newData;
    },
    { deep: true },
  );
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
