<template>
  <div class="output-node">
    <div class="node-header">
      <t-icon name="logout" class="node-icon" />
      <span class="node-title">{{ data.label }}</span>
    </div>
    <div class="node-content">
      <div class="input-field">
        <label class="field-label">输出格式</label>
        <t-select v-model="config.format" size="small">
          <t-option value="json" label="JSON" />
          <t-option value="text" label="文本" />
          <t-option value="markdown" label="Markdown" />
        </t-select>
      </div>
      <div class="input-field">
        <label class="field-label">输出名称</label>
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

<style scoped>
.output-node {
  background: white;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f59e0b;
  color: white;
  border-radius: 6px 6px 0 0;
}

.node-icon {
  margin-right: 8px;
}

.node-title {
  font-size: 14px;
  font-weight: 500;
}

.node-content {
  padding: 12px;
}

.input-field {
  margin-bottom: 8px;
}

.input-field:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
</style>