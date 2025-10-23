<template>
  <div>
    <!-- 使用 TDesign Collapse 折叠面板 -->
    <t-collapse v-model="activeNames" :default-value="['output']" borderless class="compact-collapse">
      <t-collapse-panel value="output">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">输出变量</span>
            </div>
            <t-button variant="text" size="small" class="text-blue-500" @click.stop="addOutput">
              <t-icon name="add" />
            </t-button>
          </div>
        </template>

        <div>
          <t-empty v-if="localConfig.outputs.length === 0" description="暂无输出变量" />
          <div v-for="(output, index) in localConfig.outputs" :key="index" class="mb-2">
            <div class="flex items-center gap-2">
              <!-- 变量名 -->
              <t-input
                :model-value="output.name"
                @update:model-value="(value) => updateOutputName(index, value)"
                placeholder="变量名"
                size="small"
                style="width: 120px"
              />
              <!-- 类型 -->
              <selectDict
                :model-value="output.type"
                @update:model-value="(value) => updateOutputType(index, value)"
                dict-type="INPUT_TYPE"
                size="small"
                style="width: 80px"
              />
              <!-- 数据源选择 -->
              <t-select
                :model-value="output.source"
                @update:model-value="(value) => updateOutputSource(index, value)"
                placeholder="选择来源"
                size="small"
                clearable
                class="flex-1"
              >
                <t-option
                  v-for="option in availableSourceOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </t-select>
              <!-- 删除按钮 -->
              <t-button variant="text" size="small" class="text-gray-400" @click="removeOutput(index)">
                <t-icon name="remove" />
              </t-button>
            </div>
          </div>
        </div>
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, reactive, nextTick, computed } from 'vue';
  import { useVueFlow } from '@vue-flow/core';

  interface OutputVariable {
    name: string;
    type: string;
    source?: string;
  }

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

  // 获取 VueFlow 实例
  const { nodes, edges } = useVueFlow();

  // 折叠面板激活状态
  const activeNames = ref(['output']);

  // 标记是否正在更新配置，避免循环更新
  const isUpdating = ref(false);

  // 初始化输出变量
  const initOutputs = (): OutputVariable[] => {
    const configOutputs = props.node?.data?.config?.outputs;
    if (Array.isArray(configOutputs) && configOutputs.length > 0) {
      return configOutputs.map((output: any) => ({
        name: output.name || 'output',
        type: output.type || 'json',
        source: output.source || '',
      }));
    }
    // 默认一个输出变量
    return [{ name: 'output', type: 'json', source: '' }];
  };

  // 本地配置副本 - 使用 reactive
  const localConfig = reactive({
    label: props.node?.data?.label,
    outputs: initOutputs(),
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode, oldNode) => {
      // 如果正在更新配置，跳过外部数据同步
      if (isUpdating.value) {
        return;
      }

      if (newNode && newNode.id !== oldNode?.id) {
        // 只有当节点ID变化时才重新初始化（切换到不同节点）
        Object.assign(localConfig, {
          label: newNode.data?.label,
          outputs: initOutputs(),
        });
      }
    },
    { deep: true },
  );

  // 获取可用的数据源选项（上游节点的输出）- 使用 computed 确保响应式
  const availableSourceOptions = computed(() => {
    const options: Array<{ value: string; label: string }> = [];
    const currentNodeId = props.node?.id;
    
    if (!currentNodeId) {
      console.log('No current node ID');
      return options;
    }

    try {
      // 获取所有边和节点 - 使用 .value 访问 ref
      const allEdges = edges.value || [];
      const allNodes = nodes.value || [];

      console.log('Current node ID:', currentNodeId);
      console.log('All edges:', allEdges);
      console.log('All nodes:', allNodes);

      // 找到连接到当前节点的边（入边）
      const incomingEdges = allEdges.filter((edge: any) => edge.target === currentNodeId);
      console.log('Incoming edges:', incomingEdges);

      // 遍历入边，获取源节点的输出变量
      incomingEdges.forEach((edge: any) => {
        const sourceNode = allNodes.find((node: any) => node.id === edge.source);
        console.log('Source node:', sourceNode);
        if (sourceNode) {
          // 对于 start 节点，使用 inputs 作为输出；其他节点使用 outputs
          let sourceOutputs = sourceNode.data?.config?.outputs || [];
          if (sourceNode.type === 'start') {
            sourceOutputs = sourceNode.data?.config?.inputs || [];
          }
          console.log('Source outputs:', sourceOutputs);
          sourceOutputs.forEach((output: any) => {
            options.push({
              value: `${sourceNode.id}.${output.name}`,
              label: `${sourceNode.data?.label || sourceNode.id} - ${output.name}`,
            });
          });
        }
      });

      console.log('Final options:', options);
    } catch (error) {
      console.error('Error getting source options:', error);
    }

    return options;
  });

  // 添加输出变量
  const addOutput = () => {
    localConfig.outputs.push({
      name: `output${localConfig.outputs.length + 1}`,
      type: 'json',
      source: '',
    });
    updateConfig();
  };

  // 删除输出变量
  const removeOutput = (index: number) => {
    localConfig.outputs.splice(index, 1);
    updateConfig();
  };

  // 更新输出变量名
  const updateOutputName = (index: number, value: string) => {
    localConfig.outputs[index].name = value;
    nextTick(() => updateConfig());
  };

  // 更新输出变量类型
  const updateOutputType = (index: number, value: string) => {
    localConfig.outputs[index].type = value;
    nextTick(() => updateConfig());
  };

  // 更新输出变量数据源
  const updateOutputSource = (index: number, value: string) => {
    localConfig.outputs[index].source = value;
    nextTick(() => updateConfig());
  };

  // 更新配置
  const updateConfig = () => {
    isUpdating.value = true;

    emit('update-node', {
      label: localConfig.label,
      config: {
        outputs: localConfig.outputs,
      },
    });

    // 延迟重置标志位，确保 props 更新完成
    nextTick(() => {
      setTimeout(() => {
        isUpdating.value = false;
      }, 100);
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
