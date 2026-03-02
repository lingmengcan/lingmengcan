<template>
  <div class="relative cursor-pointer node-container">
    <div class="bg-white border border-gray-200 rounded-lg w-60 shadow-sm hover:shadow-md transition-shadow">
      <!-- 头部 -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <t-icon name="refresh" class="text-lg text-gray-700" />
          <span class="text-sm font-medium text-gray-700">{{ data.label }}</span>
        </div>
      </div>

      <!-- 节点内容 -->
      <div class="px-3 py-2 flex flex-col gap-2">
        <!-- 循环类型 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">类型</span>
          <span class="text-xs text-gray-700">{{ displayLoopType }}</span>
        </div>

        <!-- 循环条件/次数 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">条件</span>
          <span class="text-xs text-gray-700 truncate max-w-32">{{ displayCondition }}</span>
        </div>

        <!-- 最大迭代次数 -->
        <div v-if="data.config?.loopType === 'for'" class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">次数</span>
          <span class="text-xs text-gray-700">{{ data.config?.maxIterations || 10 }}</span>
        </div>

        <!-- 输出 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">输出</span>
          <span class="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{{ data.config?.outputVariable || 'output' }}</span>
        </div>
      </div>
    </div>

    <!-- 左侧连接点 -->
    <div class="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Handle
        type="target"
        :position="Position.Left"
        class="handle-point w-3 h-3 bg-orange-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
    </div>

    <!-- 右侧连接点 - 循环体 -->
    <div class="absolute right-0 top-1/3 transform translate-x-1/2 -translate-y-1/2">
      <Handle
        type="source"
        :position="Position.Right"
        id="loop-body"
        class="handle-point w-3 h-3 bg-orange-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
    </div>

    <!-- 右侧连接点 - 结束 -->
    <div class="absolute right-0 top-2/3 transform translate-x-1/2 -translate-y-1/2">
      <Handle
        type="source"
        :position="Position.Right"
        id="loop-end"
        class="handle-point w-3 h-3 bg-gray-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
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
      loopType?: 'for' | 'while' | 'foreach';
      maxIterations?: number;
      condition?: string;
      breakCondition?: string;
      outputVariable?: string;
    };
  }

  const props = defineProps<{
    id: string;
    data: NodeData;
  }>();

  const data = ref(props.data);

  // 显示循环类型
  const displayLoopType = computed(() => {
    const typeMap = {
      for: '计数循环',
      while: '条件循环',
      foreach: '遍历循环',
    };
    return typeMap[data.value.config?.loopType || 'for'] || '计数循环';
  });

  // 显示循环条件
  const displayCondition = computed(() => {
    const config = data.value.config;
    if (config?.loopType === 'for') {
      return `0 到 ${config.maxIterations || 10}`;
    } else if (config?.loopType === 'while') {
      return config.condition || '条件';
    } else if (config?.loopType === 'foreach') {
      return config.condition || '遍历';
    }
    return '条件';
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
