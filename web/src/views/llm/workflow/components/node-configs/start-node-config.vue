<template>
  <div class="space-y-6">
    <!-- 基础配置 -->
    <div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">输入类型</label>
        <t-select v-model="localConfig.inputType" placeholder="请选择输入类型" @change="updateConfig">
          <t-option value="text" label="文本" />
          <t-option value="json" label="JSON" />
          <t-option value="file" label="文件" />
        </t-select>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">默认值</label>
        <t-textarea v-model="localConfig.defaultValue" placeholder="请输入默认值" :rows="3" @change="updateConfig" />
      </div>

      <div class="mb-4">
        <t-checkbox v-model="localConfig.required" @change="updateConfig">必填</t-checkbox>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';

  interface NodeData {
    label: string;
    config: Record<string, any>;
  }

  const props = defineProps<{
    node: any;
  }>();

  const emit = defineEmits<{
    'update-node': [data: NodeData];
  }>();

  // 本地配置副本
  const localConfig = ref({
    label: props.node?.data?.label || '开始节点',
    inputType: props.node?.data?.config?.inputType || 'text',
    required: props.node?.data?.config?.required ?? true,
    defaultValue: props.node?.data?.config?.defaultValue || '',
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode) => {
      if (newNode) {
        localConfig.value = {
          label: newNode.data?.label || '开始节点',
          inputType: newNode.data?.config?.inputType || 'text',
          required: newNode.data?.config?.required ?? true,
          defaultValue: newNode.data?.config?.defaultValue || '',
        };
      }
    },
    { deep: true },
  );

  // 更新配置
  const updateConfig = () => {
    emit('update-node', {
      label: localConfig.value.label,
      config: {
        inputType: localConfig.value.inputType,
        required: localConfig.value.required,
        defaultValue: localConfig.value.defaultValue,
      },
    });
  };
</script>
