<template>
  <div class="space-y-6">
    <!-- 基础配置 -->
    <div>
      <h4 class="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">基础配置</h4>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">节点名称</label>
        <t-input v-model="localConfig.label" placeholder="请输入节点名称" @change="updateConfig" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">输出类型</label>
        <t-select v-model="localConfig.outputType" placeholder="请选择输出类型" @change="updateConfig">
          <t-option value="text" label="文本" />
          <t-option value="json" label="JSON" />
          <t-option value="file" label="文件" />
        </t-select>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
        <t-select v-model="localConfig.format" placeholder="请选择输出格式" @change="updateConfig">
          <t-option value="json" label="JSON" />
          <t-option value="xml" label="XML" />
          <t-option value="plain" label="纯文本" />
        </t-select>
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
    label: props.node?.data?.label || '结束节点',
    outputType: props.node?.data?.config?.outputType || 'text',
    format: props.node?.data?.config?.format || 'json'
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode) => {
      if (newNode) {
        localConfig.value = {
          label: newNode.data?.label || '结束节点',
          outputType: newNode.data?.config?.outputType || 'text',
          format: newNode.data?.config?.format || 'json'
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
        outputType: localConfig.value.outputType,
        format: localConfig.value.format,
      },
    });
  };

</script>