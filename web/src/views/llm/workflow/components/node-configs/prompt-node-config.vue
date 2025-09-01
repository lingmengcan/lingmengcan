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
        <label class="block text-sm font-medium text-gray-700 mb-2">提示词模板</label>
        <t-textarea
          v-model="localConfig.template"
          placeholder="请输入提示词模板，使用 {{变量名}} 来定义变量"
          :rows="6"
          @change="updateConfig"
        />
        <div class="text-xs text-gray-500 mt-1 leading-relaxed">使用 {{ '{{变量名}}' }} 来定义可替换的变量</div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">变量列表</label>
        <div v-for="(variable, index) in localConfig.variables" :key="index" class="flex items-center mb-2">
          <t-input v-model="variable.name" placeholder="变量名" class="mr-2" @change="updateConfig" />
          <t-input v-model="variable.description" placeholder="变量描述" class="mr-2" @change="updateConfig" />
          <t-button variant="outline" size="small" @click="removeVariable(index)">删除</t-button>
        </div>
        <t-button variant="outline" size="small" @click="addVariable">添加变量</t-button>
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
    label: props.node?.data?.label || '提示词节点',
    template: props.node?.data?.config?.template || '',
    variables: props.node?.data?.config?.variables || []
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode) => {
      if (newNode) {
        localConfig.value = {
          label: newNode.data?.label || '提示词节点',
          template: newNode.data?.config?.template || '',
          variables: newNode.data?.config?.variables || []
        };
      }
    },
    { deep: true },
  );

  // 添加变量
  const addVariable = () => {
    localConfig.value.variables.push({ name: '', description: '' });
    updateConfig();
  };

  // 删除变量
  const removeVariable = (index: number) => {
    localConfig.value.variables.splice(index, 1);
    updateConfig();
  };

  // 更新配置
  const updateConfig = () => {
    emit('update-node', {
      label: localConfig.value.label,
      config: {
        template: localConfig.value.template,
        variables: localConfig.value.variables,
      },
    });
  };

</script>