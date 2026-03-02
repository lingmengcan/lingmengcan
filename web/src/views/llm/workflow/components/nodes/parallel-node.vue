<template>
  <div class="relative cursor-pointer node-container">
    <div class="bg-white border border-gray-200 rounded-lg w-60 shadow-sm hover:shadow-md transition-shadow">
      <!-- 头部 -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <t-icon name="layers" class="text-lg text-gray-700" />
          <span class="text-sm font-medium text-gray-700">{{ data.label }}</span>
        </div>
      </div>

      <!-- 节点内容 -->
      <div class="px-3 py-2 flex flex-col gap-2">
        <!-- 并行分支数量 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">分支数</span>
          <span class="text-xs text-gray-700">{{ branchCount }}</span>
        </div>

        <!-- 执行策略 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">策略</span>
          <span class="text-xs text-gray-700">{{ displayStrategy }}</span>
        </div>

        <!-- 超时设置 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">超时</span>
          <span class="text-xs text-gray-700">{{ data.config?.timeout || 30 }}s</span>
        </div>

        <!-- 并行分支 -->
        <div v-for="(branch, index) in branches" :key="`branch-${index}`" class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">分支{{ index + 1 }}</span>
          <span class="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{{ branch.name }}</span>
        </div>

        <!-- 输出 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">输出</span>
          <span class="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{{ data.config?.outputVariable || 'output' }}</span>
        </div>
      </div>
    </div>

    <!-- 左侧连接点 -->
    <div class="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Handle
        type="target"
        :position="Position.Left"
        class="handle-point w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
    </div>

    <!-- 右侧连接点 - 分支 -->
    <div
      v-for="(branch, index) in branches"
      :key="`handle-branch-${index}`"
      class="absolute right-0 transform translate-x-1/2 -translate-y-1/2"
      :style="{ top: `${((index + 1) / (branchCount + 2)) * 100}%` }"
    >
      <Handle
        type="source"
        :position="Position.Right"
        :id="`branch-${index}`"
        class="handle-point w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
      >
        <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
      </Handle>
    </div>

    <!-- 右侧连接点 - 合并 -->
    <div
      class="absolute right-0 transform translate-x-1/2 -translate-y-1/2"
      :style="{ top: `${((branchCount + 1) / (branchCount + 2)) * 100}%` }"
    >
      <Handle
        type="source"
        :position="Position.Right"
        id="merge"
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
      branches?: Array<{
        name: string;
        enabled: boolean;
      }>;
      strategy?: 'all' | 'any' | 'race';
      timeout?: number;
      mergeStrategy?: 'collect' | 'first' | 'last';
      outputVariable?: string;
    };
  }

  const props = defineProps<{
    id: string;
    data: NodeData;
  }>();

  const data = ref(props.data);

  // 分支数量
  const branchCount = computed(() => {
    return data.value.config?.branches?.length || 2;
  });

  // 分支列表
  const branches = computed(() => {
    const count = branchCount.value;
    return Array.from({ length: count }, (_, index) => ({
      name: `分支${index + 1}`,
      enabled: true,
    }));
  });

  // 显示执行策略
  const displayStrategy = computed(() => {
    const strategyMap = {
      all: '等待全部',
      any: '任一完成',
      race: '竞速模式',
    };
    return strategyMap[data.value.config?.strategy || 'all'] || '等待全部';
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
