<template>
  <div class="llm-node">
    <div class="node-header">
      <t-icon name="chat" class="node-icon" />
      <span class="node-title">{{ data.label }}</span>
    </div>
    <div class="node-content">
      <div class="input-field">
        <label class="field-label">模型</label>
        <t-select v-model="config.model" size="small" placeholder="选择模型">
          <t-option value="gpt-3.5-turbo" label="GPT-3.5 Turbo" />
          <t-option value="gpt-4" label="GPT-4" />
          <t-option value="claude-3" label="Claude-3" />
          <t-option value="qwen-max" label="通义千问" />
        </t-select>
      </div>
      <div class="input-field">
        <label class="field-label">温度 ({{ config.temperature }})</label>
        <t-slider 
          v-model="config.temperature" 
          :min="0" 
          :max="2" 
          :step="0.1"
          size="small"
        />
      </div>
      <div class="input-field">
        <label class="field-label">最大令牌数</label>
        <t-input-number 
          v-model="config.maxTokens" 
          size="small" 
          :min="1" 
          :max="4000"
          placeholder="1000"
        />
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

<style scoped>
.llm-node {
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  min-width: 220px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #3b82f6;
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
  margin-bottom: 12px;
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