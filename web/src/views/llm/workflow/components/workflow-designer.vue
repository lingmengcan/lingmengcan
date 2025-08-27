<template>
  <div class="w-full h-[calc(100vh-60px)] relative">
    <!-- 主画布区域 -->
    <div class="w-full h-full relative">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        class="w-full h-full bg-slate-50"
        :default-viewport="{ zoom: 1.0 }"
        :default-edge-options="{ type: 'smoothstep', animated: true, style: { strokeDasharray: 'none' } }"
        :min-zoom="0.2"
        :max-zoom="2"
        :pan-on-drag="interactionMode === 'mouse'"
        :zoom-on-scroll="interactionMode === 'mouse'"
        :zoom-on-pinch="interactionMode === 'trackpad'"
        :pan-on-scroll="interactionMode === 'trackpad'"
        :zoom-on-double-click="false"
        :selection-key-code="null"
        :multi-selection-key-code="null"
        :delete-key-code="['Backspace', 'Delete']"
        :zoom-activation-key-code="null"
        :pan-activation-key-code="interactionMode === 'mouse' ? 'Space' : null"
      >
        <!-- 背景 -->
        <Background pattern-color="#aaa" :gap="20" />
        <!-- 小地图 -->
        <MiniMap />
      </VueFlow>

      <!-- 空状态 -->
      <div v-if="nodes.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="text-center">
          <t-icon name="flow" size="48" class="text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg mb-2">开始构建您的工作流</p>
          <p class="text-gray-400 text-sm">点击下方"添加节点"按钮开始</p>
        </div>
      </div>

      <!-- 浮动工具栏 -->
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <div
          class="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200 backdrop-blur-sm"
        >
          <!-- 添加节点 -->
          <t-button theme="primary" size="small" @click="showAddNodeDialog" class="rounded-full">
            <template #icon><t-icon name="add" /></template>
            添加节点
          </t-button>
          <!-- 运行按钮 -->
          <t-button theme="success" size="small" @click="$emit('test-workflow', {})" class="rounded-full">
            <template #icon><t-icon name="play-circle-stroke" /></template>
            试运行
          </t-button>
        </div>
      </div>
    </div>

    <!-- 节点选择弹窗 -->
    <t-dialog v-model:visible="showNodeSelector" header="添加节点" width="800px" :footer="false">
      <div v-if="availableNodeTypes.length === 0" class="text-center py-8">
        <t-icon name="component" size="48" class="text-gray-300 mb-4" />
        <p class="text-gray-500">暂无可用的工作流节点</p>
      </div>
      <div v-else class="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        <div
          v-for="nodeType in availableNodeTypes"
          :key="nodeType.type"
          class="flex items-start p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all"
          @click="addNode(nodeType.type)"
        >
          <div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mr-4 flex-shrink-0">
            <t-icon :name="nodeType.icon" size="24" class="text-blue-600" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-900 truncate">{{ nodeType.label }}</h4>
            <p class="text-xs text-gray-500 line-clamp-2 mb-2">{{ nodeType.description || '暂无描述' }}</p>
          </div>
        </div>
      </div>
    </t-dialog>

    <!-- 统一的节点配置面板 - 自适应高度面板 -->
    <div
      v-if="showNodeConfigPanel && selectedNode"
      class="fixed right-1 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transform transition-all duration-300 overflow-hidden flex flex-col"
      :class="showNodeConfigPanel ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
      style="top: 55px; bottom: 5px; height: calc(100vh - 60px)"
    >
      <!-- 配置面板头部 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <t-icon name="setting" class="text-blue-600" size="16" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ getNodeTitle(selectedNode) }}</h3>
            <p class="text-sm text-gray-500">节点配置</p>
          </div>
        </div>
        <t-button
          variant="text"
          size="small"
          @click="showNodeConfigPanel = false"
          class="hover:bg-gray-200 rounded-full"
        >
          <t-icon name="close" size="20" />
        </t-button>
      </div>

      <!-- 配置面板内容 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- LLM节点配置 -->
        <LlmNodeConfig v-if="selectedNode.type === 'llm'" :node="selectedNode" @update-node="updateSelectedNode" />
        <!-- 其他节点类型的配置组件可以在这里添加 -->
        <div v-else class="text-center py-8">
          <t-icon name="setting" size="48" class="text-gray-300 mb-4" />
          <p class="text-gray-500">{{ selectedNode.type }} 节点配置</p>
          <p class="text-gray-400 text-sm mt-2">配置组件开发中...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, nextTick, markRaw, onMounted, computed } from 'vue';
  import { VueFlow, useVueFlow, Node, Edge } from '@vue-flow/core';
  import { Background } from '@vue-flow/background';
  import { MiniMap } from '@vue-flow/minimap';
  import { MessagePlugin } from 'tdesign-vue-next';
  import { getPluginList } from '@/api/llm/plugin';
  import LlmNodeConfig from './node-configs/llm-node-config.vue';

  // 类型定义
  interface WorkflowVariable {
    name: string;
    type: string;
    value: any;
  }

  interface WorkflowConfig {
    nodes: WorkflowNode[];
    edges: Edge[];
    variables: WorkflowVariable[];
  }

  type WorkflowNode = Node & {
    data: {
      label: string;
      config: Record<string, any>;
    };
  };

  interface NodeTypeInfo {
    type: string;
    label: string;
    icon: string;
    pluginId: string;
    description?: string;
    config?: any;
    componentPath?: string;
    configSchema?: object;
  }

  // Props 和 Emits
  const props = defineProps<{
    modelValue: WorkflowConfig;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: WorkflowConfig];
    'test-workflow': [data: any];
  }>();

  // Vue Flow 实例
  const { onConnect, addEdges, onNodesChange, onEdgesChange, onNodeClick, fitView, zoomTo, getViewport } = useVueFlow();

  // 响应式状态
  const nodes = ref<WorkflowNode[]>([]);
  const edges = ref<Edge[]>([]);
  const variables = ref(props.modelValue.variables || []);
  const nodeTypes = ref<Record<string, any>>({});
  const availableNodeTypes = ref<NodeTypeInfo[]>([]);

  // UI 状态
  const showNodeSelector = ref(false);
  const selectedNode = ref<any>(null);
  const showNodeConfigPanel = ref(false);
  const interactionMode = ref<'mouse' | 'trackpad'>('trackpad');

  // 计算属性
  const isNodeTypesLoaded = computed(() => Object.keys(nodeTypes.value).length > 0);

  // 监听数据变化
  watch(
    [nodes, edges, variables],
    () => {
      emit('update:modelValue', {
        nodes: nodes.value,
        edges: edges.value,
        variables: variables.value,
      });
    },
    { deep: true },
  );

  watch(
    () => props.modelValue,
    (newValue) => {
      if (isNodeTypesLoaded.value) {
        nodes.value = newValue.nodes || [];
        edges.value = newValue.edges || [];
      }
      variables.value = newValue.variables || [];
    },
    { deep: true },
  );

  // 事件处理
  onConnect((connection) => {
    addEdges([
      {
        id: `edge-${Date.now()}`,
        ...connection,
        type: 'smoothstep',
        animated: true,
        style: { strokeDasharray: 'none' },
      } as Edge,
    ]);
  });

  onNodesChange((changes) => {
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        const node = nodes.value.find((n) => n.id === change.id);
        if (node) {
          node.position = change.position;
        }
      } else if (change.type === 'remove') {
        nodes.value = nodes.value.filter((n) => n.id !== change.id);
      }
    });
  });

  onEdgesChange((changes) => {
    changes.forEach((change) => {
      if (change.type === 'remove') {
        edges.value = edges.value.filter((e) => e.id !== change.id);
      }
    });
  });

  onNodeClick((event) => {
    selectedNode.value = event.node;
    showNodeConfigPanel.value = true;
  });

  // 方法
  const showAddNodeDialog = () => {
    showNodeSelector.value = true;
  };

  const addNode = (nodeType: string) => {
    if (!availableNodeTypes.value || !Array.isArray(availableNodeTypes.value)) {
      MessagePlugin.error('节点类型未加载完成，请稍后重试');
      return;
    }

    const nodeTypeInfo = availableNodeTypes.value.find((t) => t.type === nodeType);

    const newNode: WorkflowNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: nodeTypeInfo?.label || nodeType,
        config: getDefaultNodeConfig(nodeType),
      },
    };

    nodes.value.push(newNode);
    showNodeSelector.value = false;
    MessagePlugin.success(`已添加${newNode.data.label}`);
  };

  const getDefaultNodeConfig = (nodeType: string) => {
    if (availableNodeTypes.value && Array.isArray(availableNodeTypes.value)) {
      const nodeTypeInfo = availableNodeTypes.value.find((t) => t.type === nodeType);
      if (nodeTypeInfo?.configSchema) {
        const schema = nodeTypeInfo.configSchema as any;
        if (schema.properties) {
          const defaultConfig: Record<string, any> = {};
          Object.keys(schema.properties).forEach((key) => {
            const property = schema.properties[key];
            if (property.default !== undefined) {
              defaultConfig[key] = property.default;
            }
          });
          return defaultConfig;
        }
      }
    }

    const configs = {
      start: { inputType: 'text', required: true, defaultValue: '' },
      end: { outputType: 'text', format: 'json' },
      llm: { model: 'hunyuan-standard', temperature: 0.7, maxTokens: 1000 },
      prompt: { template: '', variables: [] },
      condition: { operator: 'equals', value: '' },
      http: { method: 'GET', url: '', headers: {} },
    };
    return configs[nodeType] || {};
  };

  const getNodeTitle = (node: any) => {
    if (!node) return '';
    return node.data?.label || node.type || '未知节点';
  };

  const updateSelectedNode = (updatedData: any) => {
    if (selectedNode.value) {
      const nodeIndex = nodes.value.findIndex((n) => n.id === selectedNode.value.id);
      if (nodeIndex !== -1) {
        nodes.value[nodeIndex] = {
          ...nodes.value[nodeIndex],
          data: {
            ...nodes.value[nodeIndex].data,
            ...updatedData,
          },
        };
        selectedNode.value = nodes.value[nodeIndex];
      }
    }
  };

  const loadNodeComponent = async (componentPath: string) => {
    try {
      const module = await import(/* @vite-ignore */ componentPath);
      return markRaw(module.default || module);
    } catch (error) {
      console.warn(`加载组件失败: ${componentPath}`, error);
      return markRaw({
        template: `<div class="p-4 border border-red-300 bg-red-50 rounded">
          <p class="text-red-600 text-sm">组件加载失败: ${componentPath}</p>
        </div>`,
      });
    }
  };

  const loadNodeTypesFromPlugins = async () => {
    try {
      const res = await getPluginList({
        page: 1,
        pageSize: 1000,
      });

      if (res && res.data && res.data.list) {
        const workflowPlugins = res.data.list.filter((plugin) => {
          try {
            JSON.parse(plugin.config || '{}');
            return true;
          } catch (parseError) {
            console.warn(`插件 ${plugin.pluginId} 的config字段解析失败:`, parseError);
            return false;
          }
        });

        const nodeTypesMap: Record<string, any> = {};

        for (const plugin of workflowPlugins) {
          const config = JSON.parse(plugin.config || '{}');
          const nodeType = config.nodeType || plugin.pluginType || 'custom';

          if (config.componentPath) {
            try {
              const component = await loadNodeComponent(config.componentPath);
              nodeTypesMap[nodeType] = component;
            } catch (error) {
              console.warn(`加载组件失败: ${nodeType} -> ${config.componentPath}`, error);
            }
          }
        }

        nodeTypes.value = nodeTypesMap;

        availableNodeTypes.value = workflowPlugins.map((plugin) => {
          const config = JSON.parse(plugin.config || '{}');
          const nodeType = config.nodeType || plugin.pluginType || 'custom';

          return {
            type: nodeType,
            label: plugin.pluginName,
            icon: plugin.icon || 'component',
            pluginId: plugin.pluginId,
            description: plugin.description,
            config: config,
            componentPath: config.componentPath,
            configSchema: config.nodeConfigSchema,
          };
        });

        if (availableNodeTypes.value.length === 0) {
          MessagePlugin.warning('未找到可用的工作流节点，请检查插件配置');
        }
      }
    } catch (error) {
      console.error('加载工作流节点失败:', error);
      MessagePlugin.error(`加载工作流节点失败: ${error.message || '未知错误'}`);
    }
  };

  onMounted(async () => {
    await loadNodeTypesFromPlugins();

    if (props.modelValue.nodes && props.modelValue.nodes.length > 0) {
      nodes.value = props.modelValue.nodes;
    }

    if (props.modelValue.edges && props.modelValue.edges.length > 0) {
      edges.value = props.modelValue.edges;
    }
  });
</script>

<style>
  @import '@vue-flow/core/dist/style.css';
  @import '@vue-flow/core/dist/theme-default.css';

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
