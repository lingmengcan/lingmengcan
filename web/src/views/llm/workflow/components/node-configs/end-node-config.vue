<template>
  <div>
    <!-- 使用 TDesign Collapse 折叠面板 -->
    <t-collapse v-model="activeNames" :default-value="['output']" borderless class="compact-collapse">
      <t-collapse-panel value="output" header="输出">
        <!-- 节点名称和输出类型 -->
        <t-space size="small">
          <t-form-item label="输出变量" class="compact-form-item">
            <t-input v-model="localConfig.variableName" placeholder="output" size="small" @change="updateConfig" />
          </t-form-item>

          <!-- 输出类型 -->
          <t-form-item label="变量类型" class="compact-form-item">
            <t-select v-model="localConfig.outputType" placeholder="text" size="small" @change="updateConfig">
              <t-option value="text" label="Text" />
              <t-option value="json" label="Json" />
            </t-select>
          </t-form-item>
        </t-space>
      </t-collapse-panel>
    </t-collapse>
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

  // 折叠面板激活状态
  const activeNames = ref(['output']);

  // 本地配置副本
  const localConfig = ref({
    label: props.node?.data?.label || '结束节点',
    variableName: props.node?.data?.config?.variableName || 'output',
    outputType: props.node?.data?.config?.outputType || 'text',
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode) => {
      if (newNode) {
        localConfig.value = {
          label: newNode.data?.label || '结束节点',
          variableName: newNode?.data?.config?.variableName || 'output',
          outputType: newNode.data?.config?.outputType || 'text',
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
        variableName: localConfig.value.variableName,
      },
    });
  };
</script>

<style scoped>
  .compact-collapse :deep(.t-collapse-panel__header) {
    padding: 0px;
  }

  .compact-collapse :deep(.t-collapse-panel__content) {
    padding: 8px;
  }

  .compact-form-item :deep(.t-form__label) {
    color: #999;
    font-size: 12px;
  }
</style>
