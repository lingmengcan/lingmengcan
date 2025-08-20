<template>
  <div class="http-node">
    <div class="node-header">
      <t-icon name="internet" class="node-icon" />
      <span class="node-title">{{ data.label }}</span>
    </div>
    <div class="node-content">
      <div class="input-field">
        <label class="field-label">请求方法</label>
        <t-select v-model="config.method" size="small">
          <t-option value="GET" label="GET" />
          <t-option value="POST" label="POST" />
          <t-option value="PUT" label="PUT" />
          <t-option value="DELETE" label="DELETE" />
          <t-option value="PATCH" label="PATCH" />
        </t-select>
      </div>
      <div class="input-field">
        <label class="field-label">请求URL</label>
        <t-input v-model="config.url" size="small" placeholder="https://api.example.com" />
      </div>
      <div class="input-field">
        <label class="field-label">请求头</label>
        <t-textarea 
          v-model="headersText" 
          size="small" 
          :rows="2"
          placeholder='{"Content-Type": "application/json"}'
        />
      </div>
      <div class="input-field" v-if="config.method !== 'GET'">
        <label class="field-label">请求体</label>
        <t-textarea 
          v-model="config.body" 
          size="small" 
          :rows="2"
          placeholder="请求体内容"
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

const headersText = computed({
  get: () => {
    return config.value.headers ? JSON.stringify(config.value.headers, null, 2) : '';
  },
  set: (value: string) => {
    try {
      config.value.headers = JSON.parse(value);
    } catch (e) {
      // 忽略JSON解析错误
    }
  }
});
</script>

<style scoped>
.http-node {
  background: white;
  border: 2px solid #06b6d4;
  border-radius: 8px;
  min-width: 250px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #06b6d4;
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