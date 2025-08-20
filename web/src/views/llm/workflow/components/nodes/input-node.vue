<template>
  <div class="input-node">
    <div class="node-header">
      <t-icon name="login" class="node-icon" />
      <span class="node-title">{{ data.label }}</span>
    </div>
    <div class="node-content">
      <div class="input-field">
        <label class="field-label">输入类型</label>
        <t-select v-model="config.inputType" size="small">
          <t-option value="text" label="文本" />
          <t-option value="number" label="数字" />
          <t-option value="file" label="文件" />
        </t-select>
      </div>
      <div class="input-field">
        <label class="field-label">默认值</label>
        <t-input v-model="config.defaultValue" size="small" placeholder="请输入默认值" />
      </div>
    </div>
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

<style scoped>
.input-node {
  background: white;
  border: 2px solid #10b981;
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #10b981;
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