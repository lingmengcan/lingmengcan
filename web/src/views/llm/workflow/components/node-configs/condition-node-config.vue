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
          <div v-for="(condition, index) in localConfig.ifConditions" :key="`if-${index}`" class="space-y-2">
            <!-- AND/OR 连接符 -->
            <div v-if="index > 0" class="flex justify-start">
              <t-button
                variant="outline"
                size="small"
                :class="['text-xs', condition.logic === 'AND' ? 'bg-blue-50 border-blue-300 text-blue-600' : '']"
                @click="toggleLogic(condition, 'if', index)"
              >
                {{ condition.logic }}
                <t-icon name="swap" class="ml-1" />
              </t-button>
            </div>

            <!-- 条件配置 -->
            <div class="flex items-center gap-2">
              <div class="flex-1 grid grid-cols-3 gap-2">
                <t-input
                  v-model="condition.variable"
                  placeholder="键入 '{' 键快速插入变量"
                  class="bg-gray-50"
                  size="small"
                  @change="updateConfig"
                />
                <t-select
                  v-model="condition.operator"
                  placeholder="请选择"
                  class="min-w-0"
                  size="small"
                  @change="updateConfig"
                >
                  <t-option
                    v-for="(option, index) in operatorOptions"
                    :key="index"
                    :value="option.value"
                    :label="option.label"
                  />
                </t-select>
                <t-input
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
                @click="removeCondition('if', index)"
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
      v-for="(elifCase, caseIndex) in localConfig.elifCases"
      :key="`elif-${caseIndex}`"
      class="border border-gray-200 rounded-lg overflow-hidden"
    >
      <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">ELIF</span>
          <span class="text-sm text-gray-500">CASE{{ caseIndex + 2 }}</span>
        </div>
      </div>

      <div class="p-4 space-y-3">
        <!-- 条件列表 -->
        <div class="space-y-3">
          <div v-for="(condition, index) in elifCase.conditions" :key="`elif-${caseIndex}-${index}`" class="space-y-2">
            <!-- AND/OR 连接符 -->
            <div v-if="index > 0" class="flex justify-start">
              <t-button
                variant="outline"
                size="small"
                :class="['text-xs', condition.logic === 'AND' ? 'bg-blue-50 border-blue-300 text-blue-600' : '']"
                @click="toggleLogic(condition, 'elif', index, caseIndex)"
              >
                {{ condition.logic }}
                <t-icon name="swap" class="ml-1" />
              </t-button>
            </div>

            <!-- 条件配置 -->
            <div class="flex items-center gap-2">
              <div class="flex-1 grid grid-cols-3 gap-2">
                <t-input
                  v-model="condition.variable"
                  placeholder="键入 '{' 键快速插入变量"
                  class="bg-gray-50"
                  size="small"
                  @change="updateConfig"
                />
                <t-select
                  v-model="condition.operator"
                  placeholder="请选择"
                  class="min-w-0"
                  size="small"
                  @change="updateConfig"
                >
                  <t-option
                    v-for="(option, index) in operatorOptions"
                    :key="index"
                    :value="option.value"
                    :label="option.label"
                  />
                </t-select>
                <t-input
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
                @click="removeCondition('elif', index, caseIndex)"
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
            @click="addCondition('elif', caseIndex)"
          >
            <t-icon name="add" />
            添加条件
          </t-button>
          <t-button
            variant="text"
            size="small"
            class="text-gray-400 hover:text-red-500"
            @click="removeCase('elif', caseIndex)"
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

  interface OperatorOption {
    value: string;
    label: string;
  }

  const props = defineProps<{
    node: any;
    schema?: any;
  }>();

  const emit = defineEmits<{
    'update-node': [data: NodeData];
  }>();

  // 标记是否正在更新配置，避免循环更新
  const isUpdating = ref(false);

  // 本地配置副本
  const localConfig = reactive({
    label: props.node?.data?.label,
    ifConditions: props.node?.data?.config?.ifConditions,
    elifCases: props.node?.data?.config?.elifCases,
  });

  // 从配置 schema 中获取操作符选项
  const operatorOptions = computed((): OperatorOption[] => {
    // 优先使用传入的schema，然后尝试从node中获取
    const configSchema = props.schema || props.node?.configSchema;

    console.log('configSchema', configSchema);

    // 查找操作符配置的多种可能路径
    let operatorConfig: any = null;

    // 路径1: conditions.items.properties.operator (新schema格式)
    if (configSchema?.properties?.conditions?.items?.properties?.operator) {
      operatorConfig = configSchema.properties.conditions.items.properties.operator;
    }
    // 路径2: ifConditions.items.properties.operator (旧schema格式)
    else if (configSchema?.properties?.ifConditions?.items?.properties?.operator) {
      operatorConfig = configSchema.properties.ifConditions.items.properties.operator;
    }

    // 如果找到了操作符配置且有enum和enumNames，使用配置的选项
    if (operatorConfig?.enum && operatorConfig?.enumNames) {
      return (operatorConfig.enum as string[]).map((value: string, index: number) => ({
        value,
        label: (operatorConfig.enumNames as string[])[index] || value,
      }));
    }

    // 如果没有配置，返回空数组（不提供兜底，让问题暴露）
    console.error('未找到操作符配置，请检查数据库配置');
    return [];
  });
  console.log('props', props.node);
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
          ifConditions: newNode.data?.config?.ifConditions,
          elifCases: newNode.data?.config?.elifCases,
        });
      }
    },
    { deep: true },
  );

  // 添加条件
  const addCondition = (type: 'if' | 'elif', caseIndex?: number) => {
    const newCondition: Condition = {
      variable: '',
      operator: undefined as any,
      value: '',
      logic: undefined as any,
    };

    if (type === 'if') {
      localConfig.ifConditions.push(newCondition);
    } else if (type === 'elif' && typeof caseIndex === 'number') {
      localConfig.elifCases[caseIndex].conditions.push(newCondition);
    }

    updateConfig();
  };

  // 删除条件
  const removeCondition = (type: 'if' | 'elif', index: number, caseIndex?: number) => {
    if (type === 'if') {
      localConfig.ifConditions.splice(index, 1);
    } else if (type === 'elif' && typeof caseIndex === 'number') {
      localConfig.elifCases[caseIndex].conditions.splice(index, 1);
    }

    updateConfig();
  };

  // 添加 ELIF 分支
  const addElifCase = () => {
    localConfig.elifCases.push({
      conditions: [{ variable: '', operator: undefined as any, value: '', logic: undefined as any }],
    });
    updateConfig();
  };

  // 删除分支
  const removeCase = (type: 'if' | 'elif', caseIndex?: number) => {
    if (type === 'if') {
      // 如果删除 IF 条件且存在 ELIF 分支，将第一个 ELIF 转换为 IF
      if (localConfig.elifCases.length > 0) {
        const firstElif = localConfig.elifCases.shift(); // 移除第一个 ELIF
        if (firstElif) {
          localConfig.ifConditions = firstElif.conditions; // 将其条件设为 IF 条件
        }
      } else {
        // 如果没有 ELIF 分支，重置 IF 条件
        localConfig.ifConditions = [{ variable: '', operator: undefined as any, value: '', logic: undefined as any }];
      }
      updateConfig();
    } else if (type === 'elif' && typeof caseIndex === 'number') {
      localConfig.elifCases.splice(caseIndex, 1);
      updateConfig();
    }
  };

  // 切换逻辑连接符
  const toggleLogic = (condition: Condition, type: string, index: number, caseIndex?: number) => {
    condition.logic = condition.logic === 'AND' ? 'OR' : 'AND';
    updateConfig();
  };

  // 更新配置
  const updateConfig = () => {
    isUpdating.value = true;

    emit('update-node', {
      label: localConfig.label,
      config: {
        ifConditions: localConfig.ifConditions,
        elifCases: localConfig.elifCases,
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
