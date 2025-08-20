<template>
  <div class="prompt-node">
    <div class="node-header">
      <t-icon name="edit-1" class="node-icon" />
      <span class="node-title">{{ data.label }}</span>
    </div>
    <div class="node-content">
      <div class="input-field">
        <label class="field-label">提示词模板</label>
        <t-textarea 
          v-model="config.template" 
          size="small" 
          :rows="3"
          placeholder="请输入提示词模板，使用 {{变量名}} 引用变量"
        />
      </div>
      <div class="input-field">
        <label class="field-label">变量</label>
        <div class="variables-list">
          <div 
            v-for="(variable, index) in config.variables" 
            :key="index"
            class="variable-item"
          >
            <t-input 
              v-model="variable.name" 
              size="small" 
              placeholder="变量名"
              class="variable-input"
            />
            <t-button 
              size="small" 
              theme="danger" 
              variant="text"
              @click="removeVariable(index)"
            >
              <t-icon name="delete" />
            </t-button>
          </div>
          <t-button 
            size="small" 
            theme="primary" 
            variant="text"
            @click="addVariable"
          >
            <t-icon name="add" />
            添加变量
          </t-button>
        </div>
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

// 移除未使用的接口定义

const props = defineProps<{
  data: NodeData;
}>();

const config = computed(() => props.data.config || { variables: [] });

const addVariable = () => {
  if (!config.value.variables) {
    config.value.variables = [];
  }
  config.value.variables.push({ name: '', type: 'string' });
};

const removeVariable = (index: number) => {
  config.value.variables.splice(index, 1);
};
</script>

<style scoped>
.prompt-node {
  background: white;
  border: 2px solid #8b5cf6;
  border-radius: 8px;
  min-width: 250px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #8b5cf6;
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

.variables-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.variable-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.variable-input {
  flex: 1;
}
</style>