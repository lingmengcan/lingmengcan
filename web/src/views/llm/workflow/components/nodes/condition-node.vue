<template>
  <div class="relative cursor-pointer node-container">
    <div class="bg-white border border-gray-200 rounded-lg w-60 shadow-sm hover:shadow-md transition-shadow">
      <!-- 头部 -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <t-icon name="fork" class="text-lg text-gray-700" />
          <span class="text-sm font-medium text-gray-700">{{ data.label }}</span>
        </div>
      </div>

      <!-- 节点内容 - 显示所有分支 -->
      <div class="px-3 py-2 flex flex-col gap-2">
        <!-- IF 分支 -->
        <div class="relative flex items-center justify-between">
          <span class="text-xs text-gray-400">CASE 1</span>
          <div class="flex items-center">
            <span class="text-xs font-medium text-gray-700 mr-2">IF</span>
          </div>
          <!-- IF 连接点 -->
          <div class="absolute -right-3 top-1/2 transform translate-x-1/2 -translate-y-1/2">
            <Handle
              type="source"
              :position="Position.Right"
              id="if"
              class="handle-point w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
            >
              <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
            </Handle>
          </div>
        </div>

        <!-- ELIF 分支 -->
        <div
          v-for="(elifCase, index) in elifCases"
          :key="`elif-${index}`"
          class="relative flex items-center justify-between"
        >
          <span class="text-xs text-gray-400">CASE {{ index + 2 }}</span>
          <div class="flex items-center">
            <span class="text-xs font-medium text-gray-700 mr-2">ELIF</span>
          </div>
          <!-- ELIF 连接点 -->
          <div class="absolute -right-3 top-1/2 transform translate-x-1/2 -translate-y-1/2">
            <Handle
              type="source"
              :position="Position.Right"
              :id="`elif-${index}`"
              class="handle-point w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
            >
              <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
            </Handle>
          </div>
        </div>

        <!-- ELSE 分支 -->
        <div class="relative flex items-center justify-between">
          <span class="text-xs text-gray-400"></span>
          <div class="flex items-center">
            <span class="text-xs font-medium text-gray-700 mr-2">ELSE</span>
          </div>
          <!-- ELSE 连接点 -->
          <div class="absolute -right-3 top-1/2 transform translate-x-1/2 -translate-y-1/2">
            <Handle
              type="source"
              :position="Position.Right"
              id="else"
              class="handle-point w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
            >
              <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
            </Handle>
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
  </div>
</template>

<script setup lang="ts">
  import { Handle, Position, useVueFlow } from '@vue-flow/core';
  import { ref, computed, watch } from 'vue';

  interface ElifCase {
    conditions: Array<{
      variable: string;
      operator: string;
      value: string;
      logic: 'AND' | 'OR';
    }>;
  }

  interface NodeData {
    label: string;
    config: {
      ifConditions?: Array<any>;
      elifCases?: ElifCase[];
    };
  }

  const props = defineProps<{
    id: string;
    data: NodeData;
  }>();

  const data = ref(props.data);

  // 计算 ELIF 分支数量
  const elifCases = computed(() => {
    return data.value.config?.elifCases || [];
  });

  // 监听 props 变化，更新本地数据
  watch(
    () => props.data,
    (newData) => {
      data.value = newData;
    },
    { deep: true },
  );

  // 获取Vue Flow实例
  const {} = useVueFlow();
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
