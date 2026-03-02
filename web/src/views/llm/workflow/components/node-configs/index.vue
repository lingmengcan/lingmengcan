<template>
  <div>
    <!-- 内置节点类型使用专用配置组件 -->
    <ConditionNodeConfig v-if="nodeType === 'condition'" :node="node" :schema="schema" @update-node="handleUpdateNode" />
    <HttpNodeConfig v-else-if="nodeType === 'http'" :node="node" @update-node="handleUpdateNode" />
    <DatabaseNodeConfig v-else-if="nodeType === 'database'" :node="node" @update-node="handleUpdateNode" />
    <TransformNodeConfig v-else-if="nodeType === 'transform'" :node="node" @update-node="handleUpdateNode" />
    <LoopNodeConfig v-else-if="nodeType === 'loop'" :node="node" @update-node="handleUpdateNode" />
    <ParallelNodeConfig v-else-if="nodeType === 'parallel'" :node="node" @update-node="handleUpdateNode" />
    <!-- 其他节点类型：有 schema 使用动态配置，否则提示 -->
    <DynamicNodeConfig v-else-if="schema" :node="node" :schema="schema" @update-node="handleUpdateNode" />
    <t-empty v-else description="未找到节点配置" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import DynamicNodeConfig from './dynamic-node-config.vue';
  import ConditionNodeConfig from './condition-node-config.vue';
  import HttpNodeConfig from './http-node-config.vue';
  import DatabaseNodeConfig from './database-node-config.vue';
  import TransformNodeConfig from './transform-node-config.vue';
  import LoopNodeConfig from './loop-node-config.vue';
  import ParallelNodeConfig from './parallel-node-config.vue';
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

  // 获取节点类型
  const nodeType = computed(() => {
    return props.node?.type;
  });

  // 从插件配置中获取 JSON Schema
  const schema = computed(() => {
    const nodeTypeInfo = workflowStore.availableNodeTypes.find((t) => t.type === props.node?.type);

    if (nodeTypeInfo?.config?.nodeConfigSchema) {
      return nodeTypeInfo.config.nodeConfigSchema;
    }

    if (nodeTypeInfo?.configSchema) {
      return nodeTypeInfo.configSchema;
    }

    return null;
  });

  // 处理更新节点
  const handleUpdateNode = (data: NodeData) => {
    emit('update-node', data);
  };
</script>
