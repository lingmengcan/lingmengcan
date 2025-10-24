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
                @click.stop="addArrayItem(key, property)"
              >
                <t-icon name="add" />
              </t-button>
            </div>
          </template>

          <div>
            <!-- 数组类型 -->
            <template v-if="property.type === 'array'">
              <t-empty v-if="getArrayValue(key).length === 0" />
              <div v-for="(item, index) in getArrayValue(key)" :key="index" class="mb-2">
                <div class="flex items-center gap-2">
                  <!-- 渲染数组项的字段 -->
                  <template v-for="(itemProp, itemKey) in property.items?.properties" :key="itemKey">
                    <!-- 文本输入 -->
                    <t-input
                      v-if="itemProp.type === 'string' && !itemProp.enum"
                      :model-value="item[itemKey]"
                      @update:model-value="(value) => updateArrayItem(key, index, itemKey, value)"
                      :placeholder="itemProp.title || itemKey"
                      size="small"
                      :style="getFieldStyle(itemKey)"
                    />

                    <!-- 数字输入 -->
                    <t-input-number
                      v-else-if="itemProp.type === 'number' || itemProp.type === 'integer'"
                      :model-value="item[itemKey]"
                      @update:model-value="(value) => updateArrayItem(key, index, itemKey, value)"
                      :placeholder="itemProp.title || itemKey"
                      size="small"
                      :style="getFieldStyle(itemKey)"
                    />

                    <!-- 布尔值 -->
                    <t-switch
                      v-else-if="itemProp.type === 'boolean'"
                      :model-value="item[itemKey]"
                      @update:model-value="(value) => updateArrayItem(key, index, itemKey, value)"
                      size="small"
                    />

                    <!-- 枚举选择 -->
                    <t-select
                      v-else-if="itemProp.enum"
                      :model-value="item[itemKey]"
                      @update:model-value="(value) => updateArrayItem(key, index, itemKey, value)"
                      :placeholder="itemProp.title || itemKey"
                      size="small"
                      :style="getFieldStyle(itemKey)"
                    >
                      <t-option
                        v-for="(enumValue, enumIndex) in itemProp.enum"
                        :key="enumValue"
                        :value="enumValue"
                        :label="itemProp.enumNames?.[enumIndex] || enumValue"
                      />
                    </t-select>

                    <!-- 数据源选择 (特殊字段名: source) -->
                    <t-select
                      v-else-if="itemKey === 'source'"
                      :model-value="item[itemKey]"
                      @update:model-value="(value) => updateArrayItem(key, index, itemKey, value)"
                      placeholder="选择来源"
                      size="small"
                      clearable
                      :style="getFieldStyle(itemKey)"
                    >
                      <t-option
                        v-for="option in getSourceOptions()"
                        :key="option.value"
                        :value="option.value"
                        :label="option.label"
                      />
                    </t-select>
                  </template>

                  <!-- 删除按钮 -->
                  <t-button variant="text" size="small" class="text-gray-400" @click="removeArrayItem(key, index)">
                    <t-icon name="remove" />
                  </t-button>
                </div>
              </div>
            </template>

            <!-- 对象类型 -->
            <template v-else-if="property.type === 'object'">
              <div v-for="(objProp, objKey) in property.properties" :key="objKey" class="mb-3">
                <div class="text-xs text-gray-500 mb-1">{{ objProp.title }}</div>

                <!-- 文本输入 -->
                <t-input
                  v-if="objProp.type === 'string' && !objProp.enum"
                  :model-value="localConfig[key]?.[objKey]"
                  @update:model-value="(value) => updateObjectField(key, objKey, value)"
                  :placeholder="objProp.description || objProp.title"
                  size="small"
                />

                <!-- 文本域 -->
                <t-textarea
                  v-else-if="objProp.type === 'string' && objProp.format === 'textarea'"
                  :model-value="localConfig[key]?.[objKey]"
                  @update:model-value="(value) => updateObjectField(key, objKey, value)"
                  :placeholder="objProp.description || objProp.title"
                  size="small"
                  :autosize="{ minRows: 3, maxRows: 8 }"
                />

                <!-- 数字输入 -->
                <t-input-number
                  v-else-if="objProp.type === 'number' || objProp.type === 'integer'"
                  :model-value="localConfig[key]?.[objKey]"
                  @update:model-value="(value) => updateObjectField(key, objKey, value)"
                  :placeholder="objProp.description || objProp.title"
                  size="small"
                />

                <!-- 布尔值 -->
                <t-switch
                  v-else-if="objProp.type === 'boolean'"
                  :model-value="localConfig[key]?.[objKey]"
                  @update:model-value="(value) => updateObjectField(key, objKey, value)"
                  size="small"
                />

                <!-- 枚举选择 -->
                <t-select
                  v-else-if="objProp.enum"
                  :model-value="localConfig[key]?.[objKey]"
                  @update:model-value="(value) => updateObjectField(key, objKey, value)"
                  :placeholder="objProp.description || objProp.title"
                  size="small"
                >
                  <t-option
                    v-for="(enumValue, enumIndex) in objProp.enum"
                    :key="enumValue"
                    :value="enumValue"
                    :label="objProp.enumNames?.[enumIndex] || enumValue"
                  />
                </t-select>
              </div>
            </template>

            <!-- 简单类型 -->
            <template v-else>
              <!-- 文本输入 -->
              <t-input
                v-if="property.type === 'string' && !property.enum"
                :model-value="localConfig[key]"
                @update:model-value="(value) => updateSimpleField(key, value)"
                :placeholder="property.description || property.title"
                size="small"
              />

              <!-- 文本域 -->
              <t-textarea
                v-else-if="property.type === 'string' && property.format === 'textarea'"
                :model-value="localConfig[key]"
                @update:model-value="(value) => updateSimpleField(key, value)"
                :placeholder="property.description || property.title"
                size="small"
                :autosize="{ minRows: 3, maxRows: 8 }"
              />

              <!-- 数字输入 -->
              <t-input-number
                v-else-if="property.type === 'number' || property.type === 'integer'"
                :model-value="localConfig[key]"
                @update:model-value="(value) => updateSimpleField(key, value)"
                :placeholder="property.description || property.title"
                size="small"
              />

              <!-- 布尔值 -->
              <t-switch
                v-else-if="property.type === 'boolean'"
                :model-value="localConfig[key]"
                @update:model-value="(value) => updateSimpleField(key, value)"
                size="small"
              />

              <!-- 枚举选择 -->
              <t-select
                v-else-if="property.enum"
                :model-value="localConfig[key]"
                @update:model-value="(value) => updateSimpleField(key, value)"
                :placeholder="property.description || property.title"
                size="small"
              >
                <t-option
                  v-for="(enumValue, enumIndex) in property.enum"
                  :key="enumValue"
                  :value="enumValue"
                  :label="property.enumNames?.[enumIndex] || enumValue"
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
  import { ref, watch, reactive, nextTick } from 'vue';
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

  // 获取字段样式
  const getFieldStyle = (fieldKey: string) => {
    // 特殊字段的固定宽度
    // if (fieldKey === 'name') return 'width: 120px';
    // if (fieldKey === 'type') return 'width: 100px';
    // if (fieldKey === 'required') return 'width: 80px';
    if (fieldKey === 'source') return 'flex: 1';

    // 其他字段平均分配
    return 'flex: 1';
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

  // 更新对象字段
  const updateObjectField = (sectionKey: string, fieldKey: string, value: any) => {
    if (!localConfig[sectionKey]) {
      localConfig[sectionKey] = {};
    }
    localConfig[sectionKey][fieldKey] = value;
    nextTick(() => updateConfig());
  };

  // 更新简单字段
  const updateSimpleField = (key: string, value: any) => {
    localConfig[key] = value;
    nextTick(() => updateConfig());
  };

  // 获取数据源选项
  const getSourceOptions = () => {
    const options: Array<{ value: string; label: string }> = [];
    const currentNodeId = props.node?.id;

    if (!currentNodeId) return options;

    try {
      const allEdges = edges.value || [];
      const allNodes = nodes.value || [];

      // 找到连接到当前节点的边（入边）
      const incomingEdges = allEdges.filter((edge: any) => edge.target === currentNodeId);

      // 遍历入边，获取源节点的输出变量
      incomingEdges.forEach((edge: any) => {
        const sourceNode = allNodes.find((node: any) => node.id === edge.source);
        if (sourceNode) {
          // 对于 start 节点，使用 inputs 作为输出；其他节点使用 outputs
          let sourceOutputs = sourceNode.data?.config?.outputs || [];
          if (sourceNode.type === 'start') {
            sourceOutputs = sourceNode.data?.config?.inputs || [];
          }

          sourceOutputs.forEach((output: any) => {
            options.push({
              value: `${sourceNode.id}.${output.name}`,
              label: `${sourceNode.data?.label || sourceNode.id} - ${output.name}`,
            });
          });
        }
      });
    } catch (error) {
      console.error('Error getting source options:', error);
    }

    return options;
  };

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
