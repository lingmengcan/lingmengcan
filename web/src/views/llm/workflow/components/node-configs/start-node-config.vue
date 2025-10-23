<template>
  <div>
    <DynamicNodeConfig
      :node="node"
      :config-schema="configSchema"
      @update-node="handleUpdateNode"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import DynamicNodeConfig from './dynamic-node-config.vue';
  import { useWorkflowStore } from '@/store/modules/workflow';

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

  const workflowStore = useWorkflowStore();

  // 从插件配置中获取配置 schema，如果没有则使用默认配置
  const configSchema = computed(() => {
    // 尝试从插件配置中获取
    const nodeTypeInfo = workflowStore.availableNodeTypes.find((t) => t.type === props.node?.type);
    
    if (nodeTypeInfo?.config?.nodeConfigSchema) {
      return nodeTypeInfo.config.nodeConfigSchema;
    }

    // 默认配置 - start 节点
    return [
      {
        key: 'inputs',
        label: '输入变量',
        type: 'array',
        fields: [
          {
            key: 'name',
            label: '变量名',
            type: 'input',
            placeholder: '变量名',
            style: 'width: 120px',
          },
          {
            key: 'type',
            label: '类型',
            type: 'select',
            dictType: 'INPUT_TYPE',
            style: 'width: 80px',
          },
        ],
        defaultItem: {
          name: 'input',
          type: 'text',
        },
      },
    ];
  });

  // 处理更新节点
  const handleUpdateNode = (data: NodeData) => {
    emit('update-node', data);
  };
</script>

<style scoped>
  .compact-collapse :deep(.t-collapse-panel) {
    border-bottom: 1px solid #e7e7e7;
    padding: 8px;
  }

  .compact-collapse :deep(.t-collapse-panel__header) {
    padding: 2px 0px;
  }

  .compact-collapse :deep(.t-collapse-panel__content) {
    padding: 8px;
  }

  .compact-form-item {
    margin: 0px;
  }

  .compact-form-item :deep(.t-form__label) {
    color: #999;
    font-size: 12px;
  }
</style>
