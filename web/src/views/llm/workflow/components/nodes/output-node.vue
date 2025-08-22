<template>
  <div class="bg-white border-2 border-amber-500 rounded-lg min-w-[200px] shadow-md">
    <div class="flex items-center px-3 py-2 bg-amber-500 text-white rounded-t-md">
      <t-icon name="logout" class="mr-2" />
      <span class="text-sm font-medium">{{ data.label }}</span>
    </div>
    <div class="p-3">
      <div class="mb-2">
        <label class="block text-xs text-gray-600 mb-1">输出格式</label>
        <t-select v-model="config.format" size="small">
          <t-option value="json" label="JSON" />
          <t-option value="text" label="文本" />
          <t-option value="markdown" label="Markdown" />
        </t-select>
      </div>
      <div>
        <label class="block text-xs text-gray-600 mb-1">输出名称</label>
        <t-input v-model="config.outputName" size="small" placeholder="请输入输出名称" />
      </div>
    </div>
    <Handle type="target" :position="Position.Left" />
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
