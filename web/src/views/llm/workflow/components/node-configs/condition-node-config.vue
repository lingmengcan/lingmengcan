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
        <label class="block text-sm font-medium text-gray-700 mb-2">比较操作符</label>
        <t-select v-model="localConfig.operator" placeholder="请选择操作符" @change="updateConfig">
          <t-option value="equals" label="等于 (==)" />
          <t-option value="not_equals" label="不等于 (!=)" />
          <t-option value="greater_than" label="大于 (>)" />
          <t-option value="less_than" label="小于 (<)" />
          <t-option value="greater_equal" label="大于等于 (>=)" />
          <t-option value="less_equal" label="小于等于 (<=)" />
          <t-option value="contains" label="包含" />
          <t-option value="not_contains" label="不包含" />
        </t-select>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">比较值</label>
        <t-input v-model="localConfig.value" placeholder="请输入比较值" @change="updateConfig" />
        <div class="text-xs text-gray-500 mt-1 leading-relaxed">用于与输入值进行比较的基准值</div>
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
    label: props.node?.data?.label || '条件节点',
    operator: props.node?.data?.config?.operator || 'equals',
    value: props.node?.data?.config?.value || ''
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode) => {
      if (newNode) {
        localConfig.value = {
          label: newNode.data?.label || '条件节点',
          operator: newNode.data?.config?.operator || 'equals',
          value: newNode.data?.config?.value || ''
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
        operator: localConfig.value.operator,
        value: localConfig.value.value,
      },
    });
  };

</script>