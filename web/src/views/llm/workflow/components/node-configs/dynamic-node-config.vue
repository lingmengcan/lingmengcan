<template>
  <div>
    <!-- 使用 TDesign Collapse 折叠面板 -->
    <t-collapse v-model="activeNames" borderless class="compact-collapse">
      <!-- 动态渲染配置项 -->
      <template v-for="(property, key) in schema.properties" :key="key">
        <t-collapse-panel :value="key">
          <template #header>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-700">{{ property.title }}</span>
                <span v-if="property.description" class="text-xs text-gray-400">{{ property.description }}</span>
              </div>
              <!-- 如果是数组类型，显示添加按钮 -->
              <t-button
                v-if="property.type === 'array'"
                variant="text"
                size="small"
                class="text-blue-500"
                @click.stop="addArrayItem(key as string, property)"
              >
                <t-icon name="add" />
              </t-button>
            </div>
          </template>

          <div>
            <!-- 数组类型 -->
            <template v-if="property.type === 'array'">
              <t-empty v-if="getArrayValue(key as string).length === 0" />
              <div v-for="(item, index) in getArrayValue(key)" :key="index" class="mb-2">
                <div class="flex items-center gap-2 flex-wrap w-full">
                  <!-- 渲染数组项的字段 -->
                  <template v-for="(itemProp, itemKey) in property.items?.properties" :key="itemKey">
                    <!-- 数据源选择 (特殊字段名: source) -->
                    <t-select
                      v-if="getFieldComponentType(itemKey as string, itemProp) === 'source'"
                      :model-value="item[itemKey]"
                      @update:model-value="(value: any) => updateArrayItem(key as string, index as number, itemKey as string, value)"
                      placeholder="选择来源"
                      size="small"
                      clearable
                      class="flex-1 min-w-[80px]"
                    >
                      <t-option
                        v-for="option in sourceOptions"
                        :key="option.value"
                        :value="option.value"
                        :label="option.label"
                      />
                    </t-select>

                    <!-- 文本输入 -->
                    <t-input
                      v-else-if="getFieldComponentType(itemKey as string, itemProp) === 'text'"
                      :model-value="item[itemKey]"
                      @update:model-value="(value: any) => updateArrayItem(key as string, index as number, itemKey as string, value)"
                      :placeholder="itemProp.title"
                      size="small"
                      class="flex-1 min-w-[80px]"
                    />

                    <!-- 数字输入 -->
                    <t-input-number
                      v-else-if="getFieldComponentType(itemKey as string, itemProp) === 'number'"
                      :model-value="item[itemKey]"
                      @update:model-value="(value: any) => updateArrayItem(key as string, index as number, itemKey as string, value)"
                      :placeholder="itemProp.title"
                      size="small"
                      class="flex-1 min-w-[80px]"
                    />

                    <!-- 布尔值 -->
                    <t-switch
                      v-else-if="getFieldComponentType(itemKey as string, itemProp) === 'boolean'"
                      :model-value="item[itemKey]"
                      @update:model-value="(value: any) => updateArrayItem(key as string, index as number, itemKey as string, value)"
                      size="small"
                    />

                    <!-- 枚举选择 -->
                    <t-select
                      v-else-if="getFieldComponentType(itemKey as string, itemProp) === 'enum'"
                      :model-value="item[itemKey]"
                      @update:model-value="(value: any) => updateArrayItem(key as string, index as number, itemKey as string, value)"
                      :placeholder="itemProp.title"
                      size="small"
                      class="flex-1 min-w-[80px]"
                    >
                      <t-option
                        v-for="(enumValue, enumIndex) in itemProp.enum"
                        :key="enumValue"
                        :value="enumValue"
                        :label="itemProp.enumNames?.[enumIndex] || enumValue"
                      />
                    </t-select>
                  </template>

                  <!-- 删除按钮 -->
                  <t-button variant="text" size="small" class="text-gray-400" @click="removeArrayItem(key as string, index as number)">
                    <t-icon name="remove" />
                  </t-button>
                </div>
              </div>
            </template>

            <!-- 简单类型字段 -->
            <template v-else>
              <!-- 文本输入 -->
              <t-input
                v-if="getFieldComponentType(key as string, property) === 'text'"
                :model-value="localConfig[key]"
                @update:model-value="(value: any) => updateSimpleField(key as string, value)"
                :placeholder="property.title"
                size="small"
                class="w-full"
              />

              <!-- 多行文本 -->
              <t-textarea
                v-else-if="getFieldComponentType(key as string, property) === 'textarea'"
                :model-value="localConfig[key]"
                @update:model-value="(value: any) => updateSimpleField(key as string, value)"
                :placeholder="property.title"
                :autosize="{ minRows: 3, maxRows: 8 }"
                class="w-full"
              />

              <!-- 数字输入 -->
              <t-input-number
                v-else-if="getFieldComponentType(key as string, property) === 'number'"
                :model-value="localConfig[key]"
                @update:model-value="(value: any) => updateSimpleField(key as string, value)"
                :placeholder="property.title"
                size="small"
                class="w-full"
              />

              <!-- 布尔值 -->
              <t-switch
                v-else-if="getFieldComponentType(key as string, property) === 'boolean'"
                :model-value="localConfig[key]"
                @update:model-value="(value: any) => updateSimpleField(key as string, value)"
                size="small"
              />

              <!-- 枚举选择 -->
              <t-select
                v-else-if="getFieldComponentType(key as string, property) === 'enum'"
                :model-value="localConfig[key]"
                @update:model-value="(value: any) => updateSimpleField(key as string, value)"
                :placeholder="property.title"
                size="small"
                class="w-full"
              >
                <t-option
                  v-for="(enumValue, enumIndex) in property.enum"
                  :key="enumValue"
                  :value="enumValue"
                  :label="property.enumNames?.[enumIndex] || enumValue"
                />
              </t-select>

              <!-- 数据源选择 -->
              <t-select
                v-else-if="getFieldComponentType(key as string, property) === 'source'"
                :model-value="localConfig[key]"
                @update:model-value="(value: any) => updateSimpleField(key as string, value)"
                placeholder="选择数据来源"
                size="small"
                clearable
                class="w-full"
              >
                <t-option
                  v-for="option in sourceOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </t-select>
            </template>
          </div>
        </t-collapse-panel>
      </template>
    </t-collapse>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, reactive, nextTick, computed } from 'vue';
  import { useVueFlow } from '@vue-flow/core';

  interface NodeData {
    label: string;
    config: Record<string, any>;
  }

  interface JSONSchemaProperty {
    type: string;
    title?: string;
    description?: string;
    default?: any;
    enum?: any[];
    enumNames?: string[];
    format?: string;
    items?: {
      type: string;
      properties?: Record<string, JSONSchemaProperty>;
      required?: string[];
    };
    properties?: Record<string, JSONSchemaProperty>;
    required?: string[];
    minItems?: number;
    maxItems?: number;
  }

  interface JSONSchema {
    type: string;
    properties: Record<string, JSONSchemaProperty>;
    required?: string[];
  }

  const props = defineProps<{
    node: any;
    schema: JSONSchema;
  }>();

  const emit = defineEmits<{
    'update-node': [data: NodeData];
  }>();

  // 获取 VueFlow 实例
  const { nodes, edges } = useVueFlow();

  // 折叠面板激活状态
  const activeNames = ref<string[]>([]);

  // 标记是否正在更新配置，避免循环更新
  const isUpdating = ref(false);

  // 初始化配置
  const initConfig = () => {
    const config: Record<string, any> = {};

    if (!props.schema || !props.schema.properties) {
      console.warn('Schema is missing or invalid:', props.schema);
      return config;
    }

    Object.keys(props.schema.properties).forEach((key) => {
      const property = props.schema.properties[key];
      const existingValue = props.node?.data?.config?.[key];

      if (property.type === 'array') {
        // 数组类型
        if (Array.isArray(existingValue) && existingValue.length > 0) {
          config[key] = existingValue;
        } else if (property.default) {
          config[key] = JSON.parse(JSON.stringify(property.default));
        } else {
          config[key] = [];
        }
      } else if (property.type === 'object') {
        // 对象类型
        config[key] = existingValue || property.default || {};
      } else {
        // 简单类型
        config[key] = existingValue !== undefined ? existingValue : property.default || '';
      }
    });

    return config;
  };

  // 本地配置副本
  const localConfig = reactive(initConfig());

  // 初始化激活的面板
  if (props.schema && props.schema.properties) {
    activeNames.value = Object.keys(props.schema.properties);
  } else {
    console.warn('Schema properties not found, cannot initialize active panels');
  }

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode, oldNode) => {
      if (isUpdating.value) return;

      if (newNode && newNode.id !== oldNode?.id) {
        Object.assign(localConfig, initConfig());
      }
    },
    { deep: true },
  );

  // 获取数组值
  const getArrayValue = (key: string) => {
    return localConfig[key] || [];
  };

  // 获取字段组件类型
  const getFieldComponentType = (fieldKey: string, fieldProp: JSONSchemaProperty): string => {
    // 特殊字段优先级最高
    if (fieldKey === 'source') return 'source';

    // 根据 schema 属性判断
    if (fieldProp.enum) return 'enum';
    if (fieldProp.type === 'boolean') return 'boolean';
    if (fieldProp.type === 'number' || fieldProp.type === 'integer') return 'number';
    if (fieldProp.type === 'string') {
      // 检查是否需要多行文本
      if (fieldProp.format === 'textarea' || fieldKey === 'prompt' || fieldKey === 'systemPrompt' || fieldKey === 'template') {
        return 'textarea';
      }
      return 'text';
    }

    return 'text'; // 默认文本
  };

  // 更新简单字段值
  const updateSimpleField = (key: string, value: any) => {
    localConfig[key] = value;
    nextTick(() => updateConfig());
  };

  // 添加数组项
  const addArrayItem = (key: string, property: any) => {
    if (!localConfig[key]) {
      localConfig[key] = [];
    }

    // 创建默认项
    const defaultItem: Record<string, any> = {};
    if (property.items?.properties) {
      Object.keys(property.items.properties).forEach((itemKey) => {
        const itemProp = property.items.properties[itemKey];
        defaultItem[itemKey] = itemProp.default !== undefined ? itemProp.default : '';
      });
    }

    localConfig[key].push(defaultItem);
    updateConfig();
  };

  // 删除数组项
  const removeArrayItem = (key: string, index: number) => {
    if (localConfig[key]) {
      localConfig[key].splice(index, 1);
      updateConfig();
    }
  };

  // 更新数组项
  const updateArrayItem = (sectionKey: string, index: number, fieldKey: string, value: any) => {
    if (localConfig[sectionKey] && localConfig[sectionKey][index]) {
      localConfig[sectionKey][index][fieldKey] = value;
      nextTick(() => updateConfig());
    }
  };

  // 获取所有祖先节点
  const getAllAncestorNodes = (nodeId: string, allEdges: any[], allNodes: any[], visited = new Set<string>()): any[] => {
    if (visited.has(nodeId)) {
      return [];
    }
    visited.add(nodeId);

    const ancestors: any[] = [];
    // 找到所有指向该节点的边（入边）
    const incomingEdges = allEdges.filter((edge: any) => edge.target === nodeId);

    incomingEdges.forEach((edge: any) => {
      const sourceNode = allNodes.find((node: any) => node.id === edge.source);
      if (sourceNode) {
        ancestors.push(sourceNode);
        // 递归获取源节点的祖先
        ancestors.push(...getAllAncestorNodes(edge.source, allEdges, allNodes, visited));
      }
    });

    return ancestors;
  };

  // 获取数据源选项 - 使用 computed 确保响应式
  const sourceOptions = computed(() => {
    const options: Array<{ value: string; label: string }> = [];
    const currentNodeId = props.node?.id;

    if (!currentNodeId) {
      return options;
    }

    try {
      // 获取所有边和节点 - 使用 .value 访问 ref
      const allEdges = edges.value || [];
      const allNodes = nodes.value || [];

      // 获取所有祖先节点
      const ancestorNodes = getAllAncestorNodes(currentNodeId, allEdges, allNodes);

      // 遍历所有祖先节点，获取它们的输出变量
      ancestorNodes.forEach((ancestorNode: any) => {
        // 对于 start 节点，使用 inputs 作为输出；其他节点使用 outputs
        let ancestorOutputs = ancestorNode.data?.config?.outputs || [];
        if (ancestorNode.type === 'start') {
          ancestorOutputs = ancestorNode.data?.config?.inputs || [];
        }

        ancestorOutputs.forEach((output: any) => {
          options.push({
            value: `${ancestorNode.id}.${output.name}`,
            label: `${ancestorNode.data?.label || ancestorNode.id} - ${output.name}`,
          });
        });
      });
    } catch (error) {
      console.error('Error getting source options:', error);
    }

    return options;
  });

  // 更新配置
  const updateConfig = () => {
    isUpdating.value = true;

    emit('update-node', {
      label: props.node?.data?.label,
      config: { ...localConfig },
    });

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
</style>
