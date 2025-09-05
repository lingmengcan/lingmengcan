<template>
  <div class="space-y-6">
    <!-- SpEL表达式按钮 -->
    <div class="flex justify-end">
      <t-button variant="outline" size="small" class="flex items-center space-x-1">
        <t-icon name="code" />
        <span>SpEL表达式</span>
      </t-button>
    </div>

    <!-- IF 条件区域 -->
    <div class="space-y-4">
      <div class="flex items-center">
        <div class="text-lg font-medium text-gray-700">IF</div>
        <t-button variant="outline" size="small" class="ml-4 flex items-center space-x-1">
          <t-icon name="add" />
          <span>添加条件</span>
        </t-button>
      </div>

      <!-- 条件配置区域 -->
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="mb-4">
          <t-select v-model="localConfig.variable" placeholder="选择变量" @change="updateConfig">
            <t-option value="input" label="输入值" />
            <t-option value="result" label="结果" />
          </t-select>
        </div>

        <div class="mb-4">
          <t-select v-model="localConfig.operator" placeholder="选择操作符" @change="updateConfig">
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

        <div>
          <t-input v-model="localConfig.value" placeholder="输入比较值" @change="updateConfig" />
        </div>
      </div>
    </div>

    <!-- ELIF 按钮 -->
    <div class="flex justify-center">
      <t-button variant="dashed" size="medium" class="w-full flex items-center justify-center space-x-2">
        <t-icon name="add" />
        <span>ELIF</span>
      </t-button>
    </div>

    <!-- ELSE 区域 -->
    <div class="space-y-2">
      <div class="text-lg font-medium text-gray-700">ELSE</div>
      <div class="text-sm text-gray-500">用于定义当 if 条件不满足时应执行的逻辑。</div>
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
    'update-node': [data: Partial<NodeData>];
  }>();

  // 本地配置副本
  const localConfig = ref({
    label: props.node?.data?.label || '条件分支',
    variable: props.node?.data?.config?.variable || 'input',
    operator: props.node?.data?.config?.operator || 'equals',
    value: props.node?.data?.config?.value || '',
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode) => {
      if (newNode) {
        localConfig.value = {
          label: newNode.data?.label || '条件分支',
          variable: newNode.data?.config?.variable || 'input',
          operator: newNode.data?.config?.operator || 'equals',
          value: newNode.data?.config?.value || '',
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
        variable: localConfig.value.variable,
        operator: localConfig.value.operator,
        value: localConfig.value.value,
      },
    });
  };
</script>
