<template>
  <div class="bg-white border-2 border-blue-500 rounded-lg min-w-[220px] shadow-md">
    <div class="flex items-center px-3 py-2 bg-blue-500 text-white rounded-t-md">
      <t-icon name="chat" class="mr-2" />
      <span class="text-sm font-medium">{{ data.label }}</span>
    </div>
    <div class="p-3">
      <div class="mb-3">
        <label class="block text-xs text-gray-600 mb-1">模型</label>
        <t-select v-model="config.model" size="small" placeholder="选择模型">
          <t-option value="gpt-3.5-turbo" label="GPT-3.5 Turbo" />
          <t-option value="gpt-4" label="GPT-4" />
          <t-option value="claude-3" label="Claude-3" />
          <t-option value="qwen-max" label="通义千问" />
        </t-select>
      </div>
      <div class="mb-3">
        <label class="block text-xs text-gray-600 mb-1">温度 ({{ config.temperature }})</label>
        <t-slider v-model="config.temperature" :min="0" :max="2" :step="0.1" size="small" />
      </div>
      <div>
        <label class="block text-xs text-gray-600 mb-1">最大令牌数</label>
        <t-input-number v-model="config.maxTokens" size="small" :min="1" :max="4000" placeholder="1000" />
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
  }

  const props = defineProps<{
    data: NodeData;
  }>();

  const config = computed(() => props.data.config || {});
</script>
