<template>
  <div
    class="bg-white border border-gray-200 rounded-lg w-60 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
  >
    <div class="flex items-center justify-between px-3 py-2 bg-white rounded-t-lg">
      <div class="flex items-center">
        <t-icon :name="nodeIcon" class="text-sm text-gray-700 mr-1.5" />
        <span class="text-sm font-medium text-gray-700">{{ nodeLabel }}</span>
      </div>
      <t-icon name="more" class="text-xs text-gray-400 cursor-pointer" />
    </div>
    <div class="px-3 py-2 border-t border-gray-100">
      <div class="flex items-center gap-1.5 mb-1">
        <span class="text-xs text-gray-500">输入</span>
        <span 
          v-for="input in nodeInputs" 
          :key="input"
          class="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-xs font-medium mr-1"
        >
          {{ input }}
        </span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-gray-500">输出</span>
        <span 
          v-for="output in nodeOutputs" 
          :key="output"
          class="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium mr-1"
        >
          {{ output }}
        </span>
      </div>
    </div>
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Handle, Position } from '@vue-flow/core';

  interface NodeData {
    label: string;
    config: Record<string, any>;
    pluginType?: string;
  }

  const props = defineProps<{
    data: NodeData;
  }>();

  const config = computed(() => props.data.config || {});
  
  const nodeLabel = computed(() => props.data.label || '插件节点');
  
  const nodeIcon = computed(() => {
    const pluginType = props.data.pluginType || '';
    
    // 根据插件类型返回不同的图标
    switch (pluginType) {
      case 'ai':
        return 'chat';
      case 'rule':
        return 'check-circle';
      case 'logic':
        return 'fork';
      case 'common':
        return 'edit';
      case 'http':
        return 'internet';
      case 'custom':
        return 'code';
      default:
        return 'app';
    }
  });
  
  const nodeInputs = computed(() => {
    return config.value.inputs || ['input'];
  });
  
  const nodeOutputs = computed(() => {
    return config.value.outputs || ['output'];
  });
</script>