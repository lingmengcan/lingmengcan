<template>
  <div class="space-y-4 p-3">
    <!-- IF 条件区域 -->
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">IF</span>
          <span class="text-xs text-gray-500">CASE1</span>
        </div>
      </div>

      <div class="p-4 space-y-3">
        <!-- 条件列表 -->
        <div class="space-y-3">
          <div v-for="(condition, idx) in localConfig.ifConditions" :key="`if-${idx}`" class="space-y-2">
            <!-- AND/OR 连接符 -->
            <div v-if="idx > 0" class="flex justify-start">
              <t-button
                variant="outline"
                size="small"
                :class="['text-xs', condition.logic === 'AND' ? 'bg-blue-50 border-blue-300 text-blue-600' : '']"
                @click="toggleLogic(condition)"
              >
                {{ condition.logic || 'AND' }}
                <t-icon name="swap" class="ml-1" />
              </t-button>
            </div>

            <!-- 条件配置 -->
            <div class="flex items-center gap-2">
              <div class="flex-1 grid grid-cols-3 gap-2">
                <t-select
                  v-model="condition.variable"
                  placeholder="选择变量"
                  class="bg-gray-50"
                  size="small"
                  filterable
                  clearable
                  @change="updateConfig"
                >
                  <t-option
                    v-for="opt in availableVariableOptions"
                    :key="opt.value"
                    :value="opt.value"
                    :label="opt.label"
                  />
                </t-select>
                <t-select
                  v-model="condition.operator"
                  placeholder="操作符"
                  class="min-w-0"
                  size="small"
                  @change="updateConfig"
                >
                  <t-option
                    v-for="op in OPERATOR_OPTIONS"
                    :key="op.value"
                    :value="op.value"
                    :label="op.label"
                  />
                </t-select>
                <t-input
                  v-if="!NO_VALUE_OPERATORS.includes(condition.operator)"
                  v-model="condition.value"
                  placeholder="输入值"
                  class="bg-gray-50"
                  size="small"
                  @change="updateConfig"
                />
              </div>
              <t-button
                variant="text"
                size="small"
                class="text-gray-400 hover:text-red-500"
                @click="removeCondition('if', idx)"
              >
                <t-icon name="delete" />
              </t-button>
            </div>
          </div>
        </div>

        <!-- 添加条件按钮 -->
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <t-button variant="text" size="small" class="text-gray-600 hover:text-blue-600" @click="addCondition('if')">
            <t-icon name="add" />
            添加条件
          </t-button>
          <t-button variant="text" size="small" class="text-gray-400 hover:text-red-500" @click="removeCase('if')">
            <t-icon name="delete" />
            移除
          </t-button>
        </div>
      </div>
    </div>

    <!-- ELIF 条件区域 -->
    <div
      v-for="(elifCase, caseIdx) in localConfig.elifCases"
      :key="`elif-${caseIdx}`"
      class="border border-gray-200 rounded-lg overflow-hidden"
    >
      <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">ELIF</span>
          <span class="text-sm text-gray-500">CASE{{ caseIdx + 2 }}</span>
        </div>
      </div>

      <div class="p-4 space-y-3">
        <!-- 条件列表 -->
        <div class="space-y-3">
          <div
            v-for="(condition, idx) in elifCase.conditions"
            :key="`elif-${caseIdx}-${idx}`"
            class="space-y-2"
          >
            <!-- AND/OR 连接符 -->
            <div v-if="idx > 0" class="flex justify-start">
              <t-button
                variant="outline"
                size="small"
                :class="['text-xs', condition.logic === 'AND' ? 'bg-blue-50 border-blue-300 text-blue-600' : '']"
                @click="toggleLogic(condition)"
              >
                {{ condition.logic || 'AND' }}
                <t-icon name="swap" class="ml-1" />
              </t-button>
            </div>

            <!-- 条件配置 -->
            <div class="flex items-center gap-2">
              <div class="flex-1 grid grid-cols-3 gap-2">
                <t-select
                  v-model="condition.variable"
                  placeholder="选择变量"
                  class="bg-gray-50"
                  size="small"
                  filterable
                  clearable
                  @change="updateConfig"
                >
                  <t-option
                    v-for="opt in availableVariableOptions"
                    :key="opt.value"
                    :value="opt.value"
                    :label="opt.label"
                  />
                </t-select>
                <t-select
                  v-model="condition.operator"
                  placeholder="操作符"
                  class="min-w-0"
                  size="small"
                  @change="updateConfig"
                >
                  <t-option
                    v-for="op in OPERATOR_OPTIONS"
                    :key="op.value"
                    :value="op.value"
                    :label="op.label"
                  />
                </t-select>
                <t-input
                  v-if="!NO_VALUE_OPERATORS.includes(condition.operator)"
                  v-model="condition.value"
                  placeholder="输入值"
                  class="bg-gray-50"
                  size="small"
                  @change="updateConfig"
                />
              </div>
              <t-button
                variant="text"
                size="small"
                class="text-gray-400 hover:text-red-500"
                @click="removeCondition('elif', idx, caseIdx)"
              >
                <t-icon name="delete" />
              </t-button>
            </div>
          </div>
        </div>

        <!-- 添加条件按钮 -->
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <t-button
            variant="text"
            size="small"
            class="text-gray-600 hover:text-blue-600"
            @click="addCondition('elif', caseIdx)"
          >
            <t-icon name="add" />
            添加条件
          </t-button>
          <t-button
            variant="text"
            size="small"
            class="text-gray-400 hover:text-red-500"
            @click="removeCase('elif', caseIdx)"
          >
            <t-icon name="delete" />
            移除
          </t-button>
        </div>
      </div>
    </div>

    <!-- 添加 ELIF 按钮 -->
    <div class="flex justify-center py-4">
      <t-button
        variant="dashed"
        size="medium"
        class="w-full max-w-xs flex items-center justify-center gap-2 text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
        @click="addElifCase"
      >
        <t-icon name="add" />
        ELIF
      </t-button>
    </div>

    <!-- ELSE 区域 -->
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="mb-2">
        <span class="text-sm font-medium text-gray-700">ELSE</span>
      </div>
      <div class="text-sm text-gray-500">用于定义当 if 条件不满足时应执行的逻辑。</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, reactive, nextTick, computed } from 'vue';
  import { useWorkflowStore } from '@/store/modules/workflow';

  interface Condition {
    variable: string;
    operator: string;
    value: string;
    logic: 'AND' | 'OR';
  }

  interface ElifCase {
    conditions: Condition[];
  }

  interface NodeData {
    label: string;
    config: Record<string, any>;
  }

  // 内置操作符选项（对齐后端 condition-node-executor.ts 的 evaluateCondition）
  const OPERATOR_OPTIONS = [
    { value: '==', label: '等于 (==)' },
    { value: '!=', label: '不等于 (!=)' },
    { value: '>', label: '大于 (>)' },
    { value: '<', label: '小于 (<)' },
    { value: '>=', label: '大于等于 (>=)' },
    { value: '<=', label: '小于等于 (<=)' },
    { value: 'contains', label: '包含' },
    { value: 'startsWith', label: '开头是' },
    { value: 'endsWith', label: '结尾是' },
    { value: 'isEmpty', label: '为空' },
    { value: 'isNotEmpty', label: '不为空' },
    { value: 'isTrue', label: '为真' },
    { value: 'isFalse', label: '为假' },
    { value: 'matches', label: '正则匹配' },
  ];

  // 不需要填写值的操作符
  const NO_VALUE_OPERATORS = ['isEmpty', 'isNotEmpty', 'isTrue', 'isFalse'];

  const props = defineProps<{
    node: any;
    schema?: any;
  }>();

  const emit = defineEmits<{
    'update-node': [data: NodeData];
  }>();

  const workflowStore = useWorkflowStore();
  const isUpdating = ref(false);

  // 递归获取所有上游祖先节点
  const getAllAncestorNodes = (
    nodeId: string,
    allEdges: any[],
    allNodes: any[],
    visited: Set<string> = new Set(),
  ): any[] => {
    const ancestors: any[] = [];
    if (visited.has(nodeId)) return ancestors;
    visited.add(nodeId);
    const incomingEdges = allEdges.filter((edge: any) => edge.target === nodeId);
    incomingEdges.forEach((edge: any) => {
      const sourceNode = allNodes.find((node: any) => node.id === edge.source);
      if (sourceNode) {
        ancestors.push(sourceNode);
        ancestors.push(...getAllAncestorNodes(sourceNode.id, allEdges, allNodes, visited));
      }
    });
    return ancestors;
  };

  // 获取节点的输出变量列表
  const getNodeOutputs = (node: any): Array<{ name: string; type?: string }> => {
    if (node.type === 'start') {
      return node.data?.config?.inputs || [];
    }
    const outputs = node.data?.config?.outputs;
    if (Array.isArray(outputs) && outputs.length > 0) {
      return outputs;
    }
    const outputVar = node.data?.config?.outputVariable;
    if (outputVar) {
      return [{ name: outputVar, type: 'json' }];
    }
    return [];
  };

  // 可选的变量列表（来自所有上游祖先节点的输出）
  const availableVariableOptions = computed(() => {
    const options: Array<{ value: string; label: string }> = [];
    const currentNodeId = props.node?.id;
    if (!currentNodeId) return options;

    try {
      const allEdges = workflowStore.edges || [];
      const allNodes = workflowStore.nodes || [];
      const ancestorNodes = getAllAncestorNodes(currentNodeId, allEdges, allNodes);

      ancestorNodes.forEach((ancestorNode: any) => {
        const nodeOutputs = getNodeOutputs(ancestorNode);
        nodeOutputs.forEach((output: any) => {
          options.push({
            value: `${ancestorNode.id}.${output.name}`,
            label: `${ancestorNode.data?.label || ancestorNode.id} - ${output.name}`,
          });
        });
      });
    } catch (error) {
      console.error('Error getting variable options:', error);
    }
    return options;
  });

  const createDefaultCondition = (): Condition => ({
    variable: '',
    operator: '',
    value: '',
    logic: 'AND',
  });

  const localConfig = reactive({
    label: props.node?.data?.label || '',
    ifConditions: (props.node?.data?.config?.ifConditions as Condition[]) || [createDefaultCondition()],
    elifCases: (props.node?.data?.config?.elifCases as ElifCase[]) || [],
  });

  watch(
    () => props.node,
    (newNode, oldNode) => {
      if (isUpdating.value) return;
      if (newNode && newNode.id !== oldNode?.id) {
        Object.assign(localConfig, {
          label: newNode.data?.label || '',
          ifConditions: newNode.data?.config?.ifConditions || [createDefaultCondition()],
          elifCases: newNode.data?.config?.elifCases || [],
        });
      }
    },
    { deep: true },
  );

  const addCondition = (type: 'if' | 'elif', caseIndex?: number) => {
    const newCondition = createDefaultCondition();
    if (type === 'if') {
      localConfig.ifConditions.push(newCondition);
    } else if (type === 'elif' && typeof caseIndex === 'number') {
      localConfig.elifCases[caseIndex].conditions.push(newCondition);
    }
    updateConfig();
  };

  const removeCondition = (type: 'if' | 'elif', index: number, caseIndex?: number) => {
    if (type === 'if') {
      if (localConfig.ifConditions.length > 1) {
        localConfig.ifConditions.splice(index, 1);
      }
    } else if (type === 'elif' && typeof caseIndex === 'number') {
      if (localConfig.elifCases[caseIndex].conditions.length > 1) {
        localConfig.elifCases[caseIndex].conditions.splice(index, 1);
      }
    }
    updateConfig();
  };

  const addElifCase = () => {
    localConfig.elifCases.push({
      conditions: [createDefaultCondition()],
    });
    updateConfig();
  };

  const removeCase = (type: 'if' | 'elif', caseIndex?: number) => {
    if (type === 'if') {
      if (localConfig.elifCases.length > 0) {
        const firstElif = localConfig.elifCases.shift();
        if (firstElif) {
          localConfig.ifConditions = firstElif.conditions;
        }
      } else {
        localConfig.ifConditions = [createDefaultCondition()];
      }
      updateConfig();
    } else if (type === 'elif' && typeof caseIndex === 'number') {
      localConfig.elifCases.splice(caseIndex, 1);
      updateConfig();
    }
  };

  const toggleLogic = (condition: Condition) => {
    condition.logic = condition.logic === 'AND' ? 'OR' : 'AND';
    updateConfig();
  };

  const updateConfig = () => {
    isUpdating.value = true;
    emit('update-node', {
      label: localConfig.label,
      config: {
        ifConditions: localConfig.ifConditions,
        elifCases: localConfig.elifCases,
        outputs: props.node?.data?.config?.outputs || [{ name: 'output', type: 'text' }],
      },
    });
    nextTick(() => {
      setTimeout(() => {
        isUpdating.value = false;
      }, 100);
    });
  };
</script>
