<template>
  <div class="condition-node">
    <div class="node-header">
      <t-icon name="fork" class="node-icon" />
      <span class="node-title">{{ data.label }}</span>
    </div>
    <div class="node-content">
      <div class="input-field">
        <label class="field-label">条件变量</label>
        <t-input v-model="config.variable" size="small" placeholder="请输入变量名" />
      </div>
      <div class="input-field">
        <label class="field-label">操作符</label>
        <t-select v-model="config.operator" size="small">
          <t-option value="equals" label="等于" />
          <t-option value="not_equals" label="不等于" />
          <t-option value="greater_than" label="大于" />
          <t-option value="less_than" label="小于" />
          <t-option value="contains" label="包含" />
          <t-option value="not_contains" label="不包含" />
        </t-select>
      </div>
      <div class="input-field">
        <label class="field-label">比较值</label>
        <t-input v-model="config.value" size="small" placeholder="请输入比较值" />
      </div>
    </div>
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" id="true" style="top: 30%; background: #10b981;" />
    <Handle type="source" :position="Position.Right" id="false" style="top: 70%; background: #ef4444;" />
    <div class="condition-labels">
      <span class="true-label">True</span>
      <span class="false-label">False</span>
    </div>
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
.condition-node {
  background: white;
  border: 2px solid #ef4444;
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.node-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #ef4444;
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

.condition-labels {
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.true-label {
  font-size: 10px;
  color: #10b981;
  font-weight: 500;
}

.false-label {
  font-size: 10px;
  color: #ef4444;
  font-weight: 500;
}
</style>