<template>
  <div>
    <!-- 使用 TDesign Collapse 折叠面板 -->
    <t-collapse v-model="activeNames" :default-value="['input']" borderless class="compact-collapse">
      <t-collapse-panel value="input" header="输入">
        <!-- 变量名 -->
        <t-space size="small">
          <t-form-item label="变量名" class="compact-form-item">
            <t-input v-model="localConfig.variableName" placeholder="input" size="small" @change="updateConfig" />
          </t-form-item>
          <!-- 变量类型 -->
          <t-form-item label="变量类型" class="compact-form-item">
            <t-select v-model="localConfig.inputType" placeholder="Text" size="small" @change="updateConfig">
              <t-option value="text" label="Text" />
              <t-option value="json" label="Json" />
              <t-option value="number" label="Number" />
              <t-option value="boolean" label="Boolean" />
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
  const activeNames = ref(['input']);

  // 本地配置副本
  const localConfig = ref({
    label: props.node?.data?.label || '开始节点',
    variableName: props.node?.data?.config?.variableName || 'input',
    inputType: props.node?.data?.config?.inputType || 'text',
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode) => {
      if (newNode) {
        localConfig.value = {
          label: newNode.data?.label || '开始节点',
          variableName: newNode.data?.config?.variableName || 'input',
          inputType: newNode.data?.config?.inputType || 'text',
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
        variableName: localConfig.value.variableName,
        inputType: localConfig.value.inputType,
      },
    });
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

  .compact-form-item :deep(.t-form__label) {
    color: #999;
    font-size: 12px;
  }
</style>
