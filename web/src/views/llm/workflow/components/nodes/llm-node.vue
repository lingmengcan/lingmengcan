<template>
  <div class="relative cursor-pointer">
    <!-- 节点主体 -->
    <div
      class="bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
      style="min-width: 240px; transform: translateY(0)"
    >
      <!-- 头部 -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <t-icon name="chat" class="text-lg text-gray-700" />
          <span class="text-sm font-medium text-gray-900">LLM插件</span>
        </div>
        <div class="flex items-center gap-1">
          <t-button
            variant="text"
            size="small"
            class="p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            @click.stop="handleRun"
          >
            <t-icon name="play-circle" size="16" />
          </t-button>
          <t-button
            variant="text"
            size="small"
            class="p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            @click.stop="handleMore"
          >
            <t-icon name="more" size="16" />
          </t-button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="p-4 flex flex-col gap-3">
        <!-- 输出信息 -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">输出</span>
          <span class="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-xs font-medium">output</span>
        </div>

        <!-- 模型信息 -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">模型</span>
          <div class="flex items-center gap-2 text-sm text-gray-700">
            <t-icon name="logo-github" class="text-base text-blue-500" />
            <span>{{ displayModel }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 连接点 -->
    <Handle
      type="target"
      :position="Position.Left"
      class="bg-blue-500 border-2 border-white rounded-full shadow-sm"
      style="width: 16px; height: 16px; left: -8px"
    />
    <Handle
      type="source"
      :position="Position.Right"
      class="bg-blue-500 border-2 border-white rounded-full shadow-sm"
      style="width: 16px; height: 16px; right: -8px"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Handle, Position } from '@vue-flow/core';
  import { MessagePlugin } from 'tdesign-vue-next';

  interface NodeData {
    label: string;
    config: Record<string, any>;
  }

  const props = defineProps<{
    data: NodeData;
  }>();

  // 显示的模型名称
  const displayModel = computed(() => {
    const modelMap: Record<string, string> = {
      'hunyuan-standard': 'hunyuan-standard',
      'hunyuan-pro': 'hunyuan-pro',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      'gpt-4': 'GPT-4',
      'claude-3': 'Claude-3',
      'qwen-max': '通义千问',
    };
    const model = props.data?.config?.model || 'hunyuan-standard';
    return modelMap[model] || model;
  });

  // 运行按钮点击事件
  const handleRun = () => {
    MessagePlugin.info('运行LLM节点');
    // 这里可以添加运行逻辑
  };

  // 更多操作按钮点击事件
  const handleMore = () => {
    MessagePlugin.info('更多操作');
    // 这里可以添加更多操作的菜单
  };
</script>

<style scoped>
  /* Vue Flow 连接点样式覆盖 */
  :deep(.vue-flow__handle) {
    width: 16px;
    height: 16px;
    background: #3b82f6;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .node-container {
      min-width: 200px;
    }
  }
</style>
