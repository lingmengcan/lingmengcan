<template>
  <div
    class="bg-white border border-gray-200 rounded-lg w-60 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
  >
    <div class="flex items-center justify-between px-3 py-2 bg-white rounded-t-lg">
      <div class="flex items-center">
        <t-icon name="logout" class="text-sm text-blue-600 mr-1.5" />
        <span class="text-sm font-medium text-gray-700">{{ data.label }}</span>
      </div>
    </div>
    <div class="px-3 py-2 border-t border-gray-100">
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-gray-500">输出</span>
        <span class="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-xs font-medium">output</span>
      </div>
      <div class="flex items-center gap-1.5 mt-2">
        <span class="text-xs text-gray-500">输出类型</span>
        <span class="text-xs text-gray-700">返回变量</span>
      </div>
    </div>
    <Handle type="target" :position="Position.Left" />
  </div>
</template>

<script setup lang="ts">
  import { Handle, Position } from '@vue-flow/core';
  import { ref } from 'vue';

  interface NodeData {
    label: string;
    config: Record<string, any>;
  }

  const props = defineProps<{
    data: NodeData;
  }>();

  const data = ref(props.data);
</script>
