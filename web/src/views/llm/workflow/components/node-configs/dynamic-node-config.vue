<template>
  <div>
    <!-- 使用 TDesign Collapse 折叠面板 -->
    <t-collapse v-model="activeNames" borderless class="compact-collapse">
      <!-- 动态渲染配置项 -->
      <t-collapse-panel
        v-for="section in configSections"
        :key="section.key"
        :value="section.key"
      >
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">{{ section.label }}</span>
            </div>
            <!-- 如果是数组类型，显示添加按钮 -->
            <t-button
              v-if="section.type === 'array'"
              variant="text"
              size="small"
              class="text-blue-500"
              @click.stop="addArrayItem(section.key)"
            >
              <t-icon name="add" />
            </t-button>
          </div>
        </template>

        <div>
          <!-- 数组类型 -->
          <template v-if="section.type === 'array'">
            <t-empty v-if="getArrayValue(section.key).length === 0" :description="`暂无${section.label}`" />
            <div
              v-for="(item, index) in getArrayValue(section.key)"
              :key="index"
              class="mb-2"
            >
              <div class="flex items-center gap-2">
                <!-- 渲染数组项的字段 -->
                <template v-for="field in section.fields" :key="field.key">
                  <!-- 输入框 -->
                  <t-input
                    v-if="field.type === 'input' || field.type === 'text'"
                    :model-value="item[field.key]"
                    @update:model-value="(value) => updateArrayItem(section.key, index, field.key, value)"
                    :placeholder="field.placeholder || field.label"
                    size="small"
                    :style="field.style"
                  />
                  
                  <!-- 下拉选择 -->
                  <selectDict
                    v-else-if="field.type === 'select' && field.dictType"
                    :model-value="item[field.key]"
                    @update:model-value="(value) => updateArrayItem(section.key, index, field.key, value)"
                    :dict-type="field.dictType"
                    size="small"
                    :style="field.style"
                  />
                  
                  <!-- 数据源选择 -->
                  <t-select
                    v-else-if="field.type === 'source'"
                    :model-value="item[field.key]"
                    @update:model-value="(value) => updateArrayItem(section.key, index, field.key, value)"
                    :placeholder="field.placeholder || '选择来源'"
                    size="small"
                    clearable
                    :style="field.style"
                  >
                    <t-option
                      v-for="option in getSourceOptions(section.sourceType)"
                      :key="option.value"
                      :value="option.value"
                      :label="option.label"
                    />
                  </t-select>
                </template>
                
                <!-- 删除按钮 -->
                <t-button
                  variant="text"
                  size="small"
                  class="text-gray-400"
                  @click="removeArrayItem(section.key, index)"
                >
                  <t-icon name="remove" />
                </t-button>
              </div>
            </div>
          </template>

          <!-- 对象类型 -->
          <template v-else-if="section.type === 'object'">
            <div v-for="field in section.fields" :key="field.key" class="mb-3">
              <!-- 输入框 -->
              <t-input
                v-if="field.type === 'input' || field.type === 'text'"
                :model-value="localConfig[section.key]?.[field.key]"
                @update:model-value="(value) => updateObjectField(section.key, field.key, value)"
                :placeholder="field.placeholder || field.label"
                size="small"
              />
              
              <!-- 文本域 -->
              <t-textarea
                v-else-if="field.type === 'textarea'"
                :model-value="localConfig[section.key]?.[field.key]"
                @update:model-value="(value) => updateObjectField(section.key, field.key, value)"
                :placeholder="field.placeholder || field.label"
                size="small"
                :autosize="field.autosize || { minRows: 3, maxRows: 8 }"
              />
              
              <!-- 下拉选择 -->
              <selectDict
                v-else-if="field.type === 'select' && field.dictType"
                :model-value="localConfig[section.key]?.[field.key]"
                @update:model-value="(value) => updateObjectField(section.key, field.key, value)"
                :dict-type="field.dictType"
                size="small"
              />
            </div>
          </template>

          <!-- 简单字段类型 -->
          <template v-else>
            <!-- 输入框 -->
            <t-input
              v-if="section.fieldType === 'input' || section.fieldType === 'text'"
              :model-value="localConfig[section.key]"
              @update:model-value="(value) => updateSimpleField(section.key, value)"
              :placeholder="section.placeholder || section.label"
              size="small"
            />
            
            <!-- 文本域 -->
            <t-textarea
              v-else-if="section.fieldType === 'textarea'"
              :model-value="localConfig[section.key]"
              @update:model-value="(value) => updateSimpleField(section.key, value)"
              :placeholder="section.placeholder || section.label"
              size="small"
              :autosize="section.autosize || { minRows: 3, maxRows: 8 }"
            />
            
            <!-- 下拉选择 -->
            <selectDict
              v-else-if="section.fieldType === 'select' && section.dictType"
              :model-value="localConfig[section.key]"
              @update:model-value="(value) => updateSimpleField(section.key, value)"
              :dict-type="section.dictType"
              size="small"
            />
          </template>
        </div>
      </t-collapse-panel>
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

  interface ConfigSection {
    key: string;
    label: string;
    type: 'array' | 'object' | 'simple';
    fieldType?: string;
    fields?: Array<{
      key: string;
      label: string;
      type: string;
      placeholder?: string;
      style?: string;
      dictType?: string;
      autosize?: { minRows: number; maxRows: number };
    }>;
    defaultItem?: Record<string, any>;
    sourceType?: 'input' | 'output';
    placeholder?: string;
    dictType?: string;
    autosize?: { minRows: number; maxRows: number };
  }

  const props = defineProps<{
    node: any;
    configSchema: ConfigSection[];
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
    
    props.configSchema.forEach((section) => {
      const existingValue = props.node?.data?.config?.[section.key];
      
      if (section.type === 'array') {
        // 数组类型
        if (Array.isArray(existingValue) && existingValue.length > 0) {
          config[section.key] = existingValue;
        } else {
          // 默认一个项
          config[section.key] = section.defaultItem ? [{ ...section.defaultItem }] : [];
        }
      } else if (section.type === 'object') {
        // 对象类型
        config[section.key] = existingValue || {};
      } else {
        // 简单类型
        config[section.key] = existingValue !== undefined ? existingValue : '';
      }
    });
    
    return config;
  };

  // 本地配置副本
  const localConfig = reactive(initConfig());

  // 初始化激活的面板
  activeNames.value = props.configSchema.map((section) => section.key);

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

  // 添加数组项
  const addArrayItem = (key: string) => {
    const section = props.configSchema.find((s) => s.key === key);
    if (!section) return;
    
    if (!localConfig[key]) {
      localConfig[key] = [];
    }
    
    const defaultItem = section.defaultItem || {};
    localConfig[key].push({ ...defaultItem });
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
  const getSourceOptions = (sourceType?: 'input' | 'output') => {
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
