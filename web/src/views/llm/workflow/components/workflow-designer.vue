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
        :default-edge-options="{
          type: 'default',
          animated: true,
          style: { strokeWidth: 2, strokeDasharray: 'none' },
          markerEnd: { type: MarkerType.Arrow, width: 20, height: 20 },
        }"
        :min-zoom="0.2"
        :max-zoom="2"
        fit-view-on-init
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
        @pane-click="onPaneClick"
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
          <!-- 交互模式切换 -->
          <t-tooltip :content="interactionMode === 'mouse' ? '切换到触控板模式' : '切换到鼠标模式'">
            <t-button variant="text" size="small" @click="toggleInteractionMode" class="rounded-full">
              <template #icon><t-icon :name="interactionMode === 'mouse' ? 'mouse' : 'laptop'" /></template>
            </t-button>
          </t-tooltip>

          <!-- 分隔线 -->
          <div class="h-4 w-px bg-gray-200"></div>

          <!-- 撤销按钮 -->
          <t-tooltip content="撤销">
            <t-button variant="text" size="small" @click="undo" class="rounded-full">
              <template #icon><t-icon name="rollback" /></template>
            </t-button>
          </t-tooltip>

          <!-- 重做按钮 -->
          <t-tooltip content="重做">
            <t-button variant="text" size="small" @click="redo" class="rounded-full">
              <template #icon><t-icon name="rollfront" /></template>
            </t-button>
          </t-tooltip>

          <!-- 分隔线 -->
          <div class="h-4 w-px bg-gray-200"></div>

          <!-- 缩放控制 -->
          <t-tooltip content="缩小">
            <t-button variant="text" size="small" @click="zoomOut" class="rounded-full">
              <template #icon><t-icon name="zoom-out" /></template>
            </t-button>
          </t-tooltip>

          <span class="text-sm text-gray-600">{{ Math.round(zoom * 100) }}%</span>

          <t-tooltip content="放大">
            <t-button variant="text" size="small" @click="zoomIn" class="rounded-full">
              <template #icon><t-icon name="zoom-in" /></template>
            </t-button>
          </t-tooltip>

          <!-- 分隔线 -->
          <div class="h-4 w-px bg-gray-200"></div>

          <!-- 整理布局 -->
          <t-tooltip content="适应画布">
            <t-button variant="text" size="small" @click="fitView" class="rounded-full">
              <template #icon><t-icon name="fullscreen" /></template>
            </t-button>
          </t-tooltip>

          <t-tooltip content="自动布局">
            <t-button variant="text" size="small" @click="autoLayout" class="rounded-full">
              <template #icon><t-icon name="component-layout" /></template>
            </t-button>
          </t-tooltip>

          <!-- 分隔线 -->
          <div class="h-4 w-px bg-gray-200"></div>

          <!-- 添加节点 -->
          <t-button theme="primary" size="small" @click="showAddNodeDialog" class="rounded-full">
            <template #icon><t-icon name="add" /></template>
            添加节点
          </t-button>

          <!-- 分隔线 -->
          <div class="h-4 w-px bg-gray-200"></div>

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
      <div class="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
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
            <p class="text-xs text-gray-500 line-clamp-2 mb-2">{{ nodeType.description }}</p>
          </div>
        </div>
      </div>
    </t-dialog>

    <!-- 统一的节点配置面板 - 自适应高度面板 -->
    <div
      v-if="showNodeConfigPanel && selectedNode"
      class="fixed right-1 top-14 bottom-1 w-[450px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transform transition-all duration-300 overflow-hidden flex flex-col"
      :class="showNodeConfigPanel ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
      style="height: calc(100vh - 60px)"
    >
      <!-- 配置面板头部 -->
      <div class="flex items-center justify-between px-6 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <t-icon name="setting" class="text-blue-600" size="16" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">{{ selectedNode.data?.label }}</h3>
          </div>
        </div>
        <t-button
          variant="text"
          size="small"
          @click="showNodeConfigPanel = false"
          class="hover:bg-gray-200 rounded-full"
        >
          <t-icon name="close" size="16" />
        </t-button>
      </div>

      <!-- 配置面板内容 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- LLM节点配置 -->
        <component :is="selectedNodeConfigComponent" :node="selectedNode" @update-node="updateSelectedNode" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, markRaw, onMounted, computed } from 'vue';
  import { VueFlow, useVueFlow, Node, Edge, MarkerType } from '@vue-flow/core';
  import { Background } from '@vue-flow/background';
  import { MiniMap } from '@vue-flow/minimap';
  import { MessagePlugin } from 'tdesign-vue-next';
  import { getPluginList } from '@/api/llm/plugin';

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
    selected: boolean;
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
  const selectedNodeConfigComponent = ref<any>(null);
  const showNodeConfigPanel = ref(false);
  const interactionMode = ref<'mouse' | 'trackpad'>('trackpad');

  // 缩放状态
  const zoom = ref(1);

  // 历史记录
  const history = ref<{ nodes: WorkflowNode[]; edges: Edge[] }[]>([]);
  const historyIndex = ref(-1);
  const maxHistorySize = 50;

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

  // 监听选中节点变化，动态加载配置组件
  watch(
    selectedNode,
    async (newNode) => {
      if (newNode && newNode.type) {
        selectedNodeConfigComponent.value = await loadNodeConfigComponent(newNode.type);
      } else {
        selectedNodeConfigComponent.value = null;
      }
    },
    { immediate: true },
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
        type: 'default',
        animated: true,
        style: { strokeWidth: 2, strokeDasharray: 'none' },
        markerEnd: { type: MarkerType.Arrow, width: 20, height: 20 },
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
    // 设置选中节点
    selectedNode.value = event.node;
    showNodeConfigPanel.value = true;

    // 更新节点样式，添加选中状态
    nodes.value = nodes.value.map((node) => {
      if (node.id === event.node.id) {
        return {
          ...node,
          selected: true,
          style: {
            ...node.style,
            border: '1px solid #0052D9',
            borderRadius: '8px',
          },
        };
      } else {
        // 移除其他节点的选中状态
        return {
          ...node,
          selected: false,
          style: {
            border: 'none',
          },
        };
      }
    });
  });

  // 点击画布空白处的处理
  const onPaneClick = () => {
    // 取消所有节点的选中状态
    nodes.value = nodes.value.map((node) => ({
      ...node,
      selected: false,
      style: {
        border: 'none',
      },
    }));

    // 隐藏配置面板
    selectedNode.value = null;
    showNodeConfigPanel.value = false;
  };

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

    // 先取消所有节点的选中状态
    nodes.value = nodes.value.map((node) => ({
      ...node,
      selected: false,
      style: {
        border: 'none',
      },
    }));

    // 创建新节点，并设置为选中状态
    const newNode: WorkflowNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      selected: true,
      style: {
        border: '1px solid #0052D9',
        borderRadius: '8px',
      },
      data: {
        label: nodeTypeInfo?.label || nodeType,
        config: getDefaultNodeConfig(nodeType),
      },
    };

    nodes.value.push(newNode);
    showNodeSelector.value = false;

    // 设置选中节点并显示配置面板
    selectedNode.value = newNode;
    showNodeConfigPanel.value = true;

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

    // 返回空对象，让各个节点配置组件自己处理默认值
    return {};
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

  // 缩放控制
  const zoomIn = () => {
    const currentZoom = zoom.value;
    const newZoom = Math.min(currentZoom + 0.1, 2);
    zoomTo(newZoom);
    zoom.value = newZoom;
  };

  const zoomOut = () => {
    const currentZoom = zoom.value;
    const newZoom = Math.max(currentZoom - 0.1, 0.2);
    zoomTo(newZoom);
    zoom.value = newZoom;
  };

  // 交互模式切换
  const toggleInteractionMode = () => {
    interactionMode.value = interactionMode.value === 'mouse' ? 'trackpad' : 'mouse';
    localStorage.setItem('workflowInteractionMode', interactionMode.value);
  };

  // 自动布局
  const autoLayout = () => {
    const nodeSpacing = 250; // 增加节点间距，为连接线留出更多空间
    const levelSpacing = 350; // 增加层级间距，确保连接线清晰
    const isolatedNodeSpacing = 180; // 孤立节点竖向间距

    // 找到有连接的节点和孤立节点
    const connectedNodeIds = new Set<string>();
    edges.value.forEach((edge) => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const connectedNodes = nodes.value.filter((node) => connectedNodeIds.has(node.id));
    const isolatedNodes = nodes.value.filter((node) => !connectedNodeIds.has(node.id));

    // 处理有连接的节点 - 横向布局（从左到右）
    if (connectedNodes.length > 0) {
      // 找到起始节点（没有输入连接的节点）
      const startNodes = connectedNodes.filter((node) => !edges.value.some((edge) => edge.target === node.id));

      if (startNodes.length > 0) {
        // 层级布局
        const levels: { [key: number]: WorkflowNode[] } = {};
        const visited = new Set<string>();

        const assignLevel = (nodeId: string, level: number) => {
          if (visited.has(nodeId)) return;
          visited.add(nodeId);

          const node = connectedNodes.find((n) => n.id === nodeId);
          if (!node) return;

          if (!levels[level]) levels[level] = [];
          levels[level].push(node);

          // 找到所有连接到此节点的下级节点
          const connectedEdges = edges.value.filter((edge) => edge.source === nodeId);
          connectedEdges.forEach((edge) => {
            assignLevel(edge.target, level + 1);
          });
        };

        // 从起始节点开始分配层级
        startNodes.forEach((node) => assignLevel(node.id, 0));

        // 更新有连接节点的位置 - 横向排列，每层内部竖向分布
        Object.keys(levels).forEach((levelKey) => {
          const level = parseInt(levelKey);
          const levelNodes = levels[level];

          levelNodes.forEach((node, index) => {
            const totalHeight = (levelNodes.length - 1) * nodeSpacing;
            const startY = -totalHeight / 2;

            node.position = {
              x: level * levelSpacing, // 横向排列：每层在不同的X坐标
              y: startY + index * nodeSpacing, // 同层内竖向分布
            };
          });
        });
      }
    }

    // 处理孤立节点 - 与起始节点X轴对齐，竖向排列
    if (isolatedNodes.length > 0) {
      // 找到起始节点的X坐标作为基准（第0层的X坐标）
      let baseX = 0;

      // 计算连接节点的最大Y坐标，将孤立节点放在下方
      let maxY = 0;
      if (connectedNodes.length > 0) {
        maxY = Math.max(...connectedNodes.map((node) => node.position.y)) + nodeSpacing;
      }

      isolatedNodes.forEach((node, index) => {
        node.position = {
          x: baseX, // 与起始节点X轴对齐（都在第0层）
          y: maxY + index * isolatedNodeSpacing, // 在连接节点下方竖向排列
        };
      });
    }

    // 居中显示
    setTimeout(() => {
      fitView();
    }, 100);
  };

  // 历史记录控制
  const saveToHistory = () => {
    // 如果当前不在历史记录的最后，则删除当前位置之后的所有记录
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }

    // 添加当前状态到历史记录
    history.value.push({
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      edges: JSON.parse(JSON.stringify(edges.value)),
    });

    // 如果历史记录超过最大大小，则删除最早的记录
    if (history.value.length > maxHistorySize) {
      history.value.shift();
    }

    historyIndex.value = history.value.length - 1;
  };

  const undo = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      const state = history.value[historyIndex.value];
      nodes.value = JSON.parse(JSON.stringify(state.nodes));
      edges.value = JSON.parse(JSON.stringify(state.edges));
    }
  };

  const redo = () => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++;
      const state = history.value[historyIndex.value];
      nodes.value = JSON.parse(JSON.stringify(state.nodes));
      edges.value = JSON.parse(JSON.stringify(state.edges));
    }
  };

  // 预加载所有可能的节点组件和配置组件
  const nodeComponents = import.meta.glob('@/views/llm/workflow/components/nodes/*.vue', { eager: false });
  const nodeConfigComponents = import.meta.glob('@/views/llm/workflow/components/node-configs/*.vue', { eager: false });

  const loadNodeComponent = async (componentPath: string) => {
    try {
      // 如果是相对路径，转换为绝对路径
      let resolvedPath = componentPath;
      if (!componentPath.startsWith('@/') && !componentPath.startsWith('/')) {
        resolvedPath = `/src/views/llm/workflow/components/nodes/${componentPath}`;
      } else if (componentPath.startsWith('@/')) {
        // 将 @/ 转换为 /src/
        resolvedPath = componentPath.replace('@/', '/src/');
      }

      // 确保路径以 .vue 结尾
      if (!resolvedPath.endsWith('.vue')) {
        resolvedPath += '.vue';
      }

      // 从预加载的组件中查找
      const componentLoader = nodeComponents[resolvedPath];
      if (componentLoader) {
        const module = (await componentLoader()) as any;
        return markRaw(module.default || module);
      } else {
        return markRaw({
          template: `<div class="p-4 border border-red-300 bg-red-50 rounded">
            <p class="text-red-600 text-sm">未找到组件: ${resolvedPath}</p>
            <p class="text-xs text-gray-500 mt-1">可用组件: ${Object.keys(nodeComponents).join(', ')}</p>
          </div>`,
        });
      }
    } catch (error) {
      console.error(`加载组件失败: ${componentPath}`, error);
      return markRaw({
        template: `<div class="p-4 border border-red-300 bg-red-50 rounded">
          <p class="text-red-600 text-sm">组件加载失败: ${componentPath}</p>
          <p class="text-xs text-gray-500 mt-1">错误: ${error}</p>
        </div>`,
      });
    }
  };

  // 加载节点配置组件
  const loadNodeConfigComponent = async (nodeType: string) => {
    try {
      const configPath = `/src/views/llm/workflow/components/node-configs/${nodeType}-node-config.vue`;

      // 从预加载的配置组件中查找
      const componentLoader = nodeConfigComponents[configPath];
      if (componentLoader) {
        const module = (await componentLoader()) as any;
        return markRaw(module.default || module);
      } else {
        console.warn(`未找到配置组件: ${configPath}`);
        return null;
      }
    } catch (error) {
      console.error(`加载配置组件失败: ${nodeType}`, error);
      return null;
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
          const nodeType = config.nodeType || plugin.pluginId || 'custom';

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
            pluginId: plugin.pluginId || '',
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
      MessagePlugin.error(`加载工作流节点失败: ${error || '未知错误'}`);
    }
  };

  // 监听节点和边的变化，保存到历史记录
  watch(
    [nodes, edges],
    () => {
      saveToHistory();
    },
    { deep: true, flush: 'post' },
  );

  onMounted(async () => {
    await loadNodeTypesFromPlugins();

    if (props.modelValue.nodes && props.modelValue.nodes.length > 0) {
      // 确保所有节点初始化时都没有选中状态
      nodes.value = props.modelValue.nodes.map((node) => ({
        ...node,
        selected: false,
        style: {
          ...(typeof node.style === 'object' ? node.style : {}),
          border: 'none',
        },
      }));
    }

    if (props.modelValue.edges && props.modelValue.edges.length > 0) {
      // 确保所有边都使用正确的类型
      edges.value = props.modelValue.edges.map((edge) => ({
        ...edge,
        type: 'default', // 强制使用 default 类型
      }));
    }

    // 初始化历史记录
    saveToHistory();

    // 从本地存储加载交互模式
    const savedMode = localStorage.getItem('workflowInteractionMode');
    if (savedMode === 'mouse' || savedMode === 'trackpad') {
      interactionMode.value = savedMode;
    }

    // 监听缩放变化
    const updateZoom = () => {
      const viewport = getViewport();
      zoom.value = viewport.zoom;
      requestAnimationFrame(updateZoom);
    };
    updateZoom();
  });
</script>

<style>
  @import '@vue-flow/core/dist/style.css';
  @import '@vue-flow/core/dist/theme-default.css';

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
