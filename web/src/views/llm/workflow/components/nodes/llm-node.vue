<template>
  <div class="relative cursor-pointer node-container">
    <!-- 节点主体 -->
    <div class="bg-white border border-gray-200 rounded-lg w-60 shadow-sm hover:shadow-md transition-shadow">
      <!-- 头部 -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <t-icon name="chat" class="text-lg text-gray-700" />
          <span class="text-sm font-medium text-gray-700">{{ data.label }}</span>
        </div>
        <div class="flex items-center gap-1">
          <!-- 运行按钮 -->
          <t-button
            variant="text"
            size="small"
            class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            @click.stop="handleRun"
          >
            <t-icon name="play-circle" size="16" />
          </t-button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="px-3 py-2 flex flex-col gap-2">
        <!-- 输出信息 -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">输出</span>
          <span class="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-xs font-medium">output</span>
        </div>

        <!-- 模型信息 -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">模型</span>
          <div class="flex items-center gap-2 text-sm text-gray-700">
            <span>{{ displayModel }}</span>
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
  import { Handle, Position, useVueFlow } from '@vue-flow/core';
  import { MessagePlugin } from 'tdesign-vue-next';

  interface NodeData {
    label: string;
    config: Record<string, any>;
  }

  const props = defineProps<{
    id: string;
    type: string;
    data: NodeData;
    onUpdateNode?: (nodeId: string, updates: Partial<NodeData>) => void;
    onCopyNode?: (nodeId: string) => void;
    onDeleteNode?: (nodeId: string) => void;
  }>();

  // 获取Vue Flow实例
  const { findNode } = useVueFlow();

  // 显示的模型名称
  const displayModel = computed(() => {
    const model = props.data?.config?.model || 'hunyuan-standard';
    return model;
  });

  // 运行按钮点击事件
  const handleRun = () => {
    MessagePlugin.info('运行LLM节点');
    // 这里可以添加运行逻辑
  };
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
