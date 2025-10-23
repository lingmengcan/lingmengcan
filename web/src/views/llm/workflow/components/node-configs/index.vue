<template>
  <div>
    <DynamicNodeConfig v-if="schema" :node="node" :schema="schema" @update-node="handleUpdateNode" />
    <t-empty v-else description="未找到节点配置" />
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

  // 从插件配置中获取 JSON Schema
  const schema = computed(() => {
    // 尝试从插件配置中获取
    const nodeTypeInfo = workflowStore.availableNodeTypes.find((t) => t.type === props.node?.type);

    if (nodeTypeInfo?.config?.nodeConfigSchema) {
      return nodeTypeInfo.config.nodeConfigSchema;
    }

    if (nodeTypeInfo?.configSchema) {
      return nodeTypeInfo.configSchema;
    }

    // 如果没有找到配置，返回 null
    console.warn(`未找到节点类型 ${props.node?.type} 的配置`);
    console.warn('节点类型信息:', nodeTypeInfo);
    return null;
  });

  // 处理更新节点
  const handleUpdateNode = (data: NodeData) => {
    emit('update-node', data);
  };
</script>
