<template>
  <div class="relative cursor-pointer node-container">
    <div class="bg-white border border-gray-200 rounded-lg w-60 shadow-sm hover:shadow-md transition-shadow">
      <!-- 节点头部 -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div class="flex items-center">
          <t-icon name="swap" class="text-purple-600 mr-2" />
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
        <!-- 转换类型 -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">类型</span>
          <span class="text-xs font-medium text-gray-700">{{ displayTransformType }}</span>
        </div>

        <!-- 输入格式 -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">输入</span>
          <span class="text-xs font-medium text-gray-700">{{ data.config?.inputFormat || 'JSON' }}</span>
        </div>

        <!-- 输出格式 -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">输出</span>
          <span class="text-xs font-medium text-gray-700">{{ data.config?.outputFormat || 'JSON' }}</span>
        </div>

        <!-- 转换规则数量 -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">规则</span>
          <span class="text-xs font-medium text-gray-700">{{ ruleCount }} 条</span>
        </div>

        <!-- 输出连接点 -->
        <div class="relative flex items-center justify-center py-1">
          <div class="absolute -right-3 top-1/2 transform translate-x-1/2 -translate-y-1/2">
            <Handle
              type="source"
              :position="Position.Right"
              id="output"
              class="handle-point w-3 h-3 bg-purple-500 border-2 border-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
            >
              <t-icon name="add" class="handle-icon text-white text-xs opacity-0 transition-opacity duration-200" />
            </Handle>
          </div>
          <span class="text-xs text-gray-500 bg-purple-100 px-2 py-1 rounded">输出</span>
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
  </div>
</template>

<script setup lang="ts">
  import { Handle, Position } from '@vue-flow/core';
  import { ref, computed, watch } from 'vue';
  import { MessagePlugin } from 'tdesign-vue-next';

  interface NodeData {
    label: string;
    config: {
      transformType?: 'mapping' | 'filter' | 'aggregate' | 'format' | 'custom';
      inputFormat?: 'json' | 'xml' | 'csv' | 'text';
      outputFormat?: 'json' | 'xml' | 'csv' | 'text';
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

  // 运行按钮点击事件
  const handleRun = () => {
    MessagePlugin.info('运行转换节点');
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
