<template>
  <div class="relative cursor-pointer node-container">
    <div class="bg-white border border-gray-200 rounded-lg w-60 shadow-sm hover:shadow-md transition-shadow">
      <!-- 节点头部 -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div class="flex items-center">
          <t-icon name="layers" class="text-green-600 mr-2" />
          <span class="font-medium text-gray-800">{{ data.label }}</span>
        </div>
        <div class="flex items-center gap-1">
          <t-button variant="text" size="small" @click.stop="handleRun" class="text-blue-600 hover:text-blue-800">
            <t-icon name="play-circle" class="text-sm" />
          </t-button>
        </div>
      </div>

      <!-- 节点内容 -->
      <div class="px-3 py-2 flex flex-col gap-2">
        <!-- 并行分支数量 -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">分支数</span>
          <span class="text-xs font-medium text-gray-700">{{ branchCount }}</span>
        </div>

        <!-- 执行策略 -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">策略</span>
          <span class="text-xs font-medium text-gray-700">{{ displayStrategy }}</span>
        </div>

        <!-- 超时设置 -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">超时</span>
          <span class="text-xs font-medium text-gray-700">{{ data.config?.timeout || 30 }}s</span>
        </div>

        <!-- 并行分支连接点 -->
        <div
          v-for="(branch, index) in branches"
          :key="`branch-${index}`"
          class="relative flex items-center justify-center py-1"
        >
          <div class="absolute -right-3 top-1/2 transform translate-x-1/2 -translate-y-1/2">
            <Handle
              type="source"
              :position="Position.Right"
              :id="`branch-${index}`"
              class="handle-point w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
            >
              <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
            </Handle>
          </div>
          <span class="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded">分支{{ index + 1 }}</span>
        </div>

        <!-- 合并连接点 -->
        <div class="relative flex items-center justify-center py-1">
          <div class="absolute -right-3 top-1/2 transform translate-x-1/2 -translate-y-1/2">
            <Handle
              type="source"
              :position="Position.Right"
              id="merge"
              class="handle-point w-3 h-3 bg-gray-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
            >
              <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
            </Handle>
          </div>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">合并</span>
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
  </div>
</template>

<script setup lang="ts">
  import { Handle, Position } from '@vue-flow/core';
  import { ref, computed, watch } from 'vue';
  import { MessagePlugin } from 'tdesign-vue-next';

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

  // 运行按钮点击事件
  const handleRun = () => {
    MessagePlugin.info('运行并行节点');
    // 这里可以添加运行逻辑
  };

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
