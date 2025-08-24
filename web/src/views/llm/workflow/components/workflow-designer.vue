<script lang="ts" setup>
  import { ref, watch, nextTick, markRaw, onMounted } from 'vue';
  import { VueFlow, useVueFlow } from '@vue-flow/core';
  import { Background } from '@vue-flow/background';
  import { MiniMap } from '@vue-flow/minimap';
  import { MessagePlugin } from 'tdesign-vue-next';

  // 导入自定义节点组件
  import StartNode from './nodes/start-node.vue';
  import EndNode from './nodes/end-node.vue';
  import LlmNode from './nodes/llm-node.vue';
  import PromptNode from './nodes/prompt-node.vue';
  import ConditionNode from './nodes/condition-node.vue';
  import HttpNode from './nodes/http-node.vue';

  interface WorkflowConfig {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    variables: WorkflowVariable[];
  }

  interface WorkflowNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      label: string;
      config: Record<string, any>;
    };
    selected?: boolean;
  }

  interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    type?: string;
    animated?: boolean;
  }

  interface WorkflowVariable {
    name: string;
    type: string;
    value: any;
  }

  const props = defineProps<{
    modelValue: WorkflowConfig;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: WorkflowConfig];
    'test-workflow': [data: any];
  }>();

  // Vue Flow 实例
  const { onConnect, addEdges, onNodesChange, onEdgesChange, onNodeClick, fitView, zoomTo, getViewport } = useVueFlow();

  // 节点和边的响应式数据
  const nodes = ref(props.modelValue.nodes || []);
  const edges = ref(props.modelValue.edges || []);
  const variables = ref(props.modelValue.variables || []);

  // 节点类型定义
  const nodeTypes = markRaw({
    start: StartNode,
    end: EndNode,
    llm: LlmNode,
    prompt: PromptNode,
    condition: ConditionNode,
    http: HttpNode,
  }) as any;

  // 可用的节点类型
  const availableNodeTypes = [
    { type: 'start', label: '开始节点', icon: 'login', color: '#10b981' },
    { type: 'end', label: '结束节点', icon: 'logout', color: '#f59e0b' },
    { type: 'llm', label: 'LLM节点', icon: 'chat', color: '#3b82f6' },
    { type: 'prompt', label: '提示词节点', icon: 'edit-1', color: '#8b5cf6' },
    { type: 'condition', label: '条件节点', icon: 'fork', color: '#ef4444' },
    { type: 'http', label: 'HTTP请求', icon: 'internet', color: '#06b6d4' },
  ];

  // 节点选择弹窗状态
  const showNodeSelector = ref(false);
  const selectedNode = ref<any>(null);
  const zoomLevel = ref(100); // 初始化为100%，与default-viewport的1.0对应
  const zoomFormat = (value: number) => `${value}%`;

  // 交互模式状态
  const interactionMode = ref<'mouse' | 'trackpad'>('trackpad'); // 默认触控板友好模式
  const showInteractionModeDialog = ref(false);

  // 监听节点和边的变化
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

  // 监听外部数据变化
  watch(
    () => props.modelValue,
    (newValue) => {
      nodes.value = newValue.nodes || [];
      edges.value = newValue.edges || [];
      variables.value = newValue.variables || [];
    },
    { deep: true },
  );

  // 连接处理
  onConnect((connection) => {
    addEdges([
      {
        id: `edge-${Date.now()}`,
        ...connection,
        type: 'smoothstep',
        animated: true,
      },
    ]);
  });

  // 节点变化处理
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

  // 边变化处理
  onEdgesChange((changes) => {
    changes.forEach((change) => {
      if (change.type === 'remove') {
        edges.value = edges.value.filter((e) => e.id !== change.id);
      }
    });
  });

  // 节点点击处理
  onNodeClick((event) => {
    selectedNode.value = event.node;

    // 更新节点选中状态
    nodes.value.forEach((node) => {
      node.selected = node.id === event.node.id;
    });
  });


  // 显示节点选择器
  const showAddNodeDialog = () => {
    showNodeSelector.value = true;
  };

  // 添加节点
  const addNode = (nodeType: string) => {
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: availableNodeTypes.find((t) => t.type === nodeType)?.label || nodeType,
        config: getDefaultNodeConfig(nodeType),
      },
    };

    nodes.value.push(newNode);
    showNodeSelector.value = false;
    MessagePlugin.success(`已添加${newNode.data.label}`);
  };

  // 获取默认节点配置
  const getDefaultNodeConfig = (nodeType: string) => {
    const configs = {
      start: { inputType: 'text', required: true, defaultValue: '' },
      end: { outputType: 'text', format: 'json' },
      llm: { model: '', temperature: 0.7, maxTokens: 1000 },
      prompt: { template: '', variables: [] },
      condition: { operator: 'equals', value: '' },
      http: { method: 'GET', url: '', headers: {} },
    };
    return configs[nodeType] || {};
  };

  // 适应画布
  const fitToScreen = () => {
    fitView();
    MessagePlugin.info('适应画布');
  };

  // 居中显示
  const centerView = () => {
    fitView();
    MessagePlugin.info('居中显示');
  };

  // 获取节点描述
  const getNodeDescription = (nodeType: string) => {
    const descriptions: Record<string, string> = {
      start: '工作流开始节点，接收输入数据',
      end: '工作流结束节点，输出处理结果',
      llm: '使用大语言模型处理文本',
      prompt: '构建提示词模板',
      condition: '根据条件进行分支处理',
      http: '发送HTTP请求获取数据',
    };
    return descriptions[nodeType] || '';
  };

  // 交互模式切换
  const toggleInteractionMode = () => {
    showInteractionModeDialog.value = true;
  };

  const selectInteractionMode = (mode: 'mouse' | 'trackpad') => {
    interactionMode.value = mode;
    showInteractionModeDialog.value = false;
    MessagePlugin.success(`已切换到${mode === 'mouse' ? '鼠标友好模式' : '触控板友好模式'}`);
  };

  // 获取交互模式图标
  const getInteractionModeIcon = () => {
    return interactionMode.value === 'mouse' ? 'mouse' : 'laptop';
  };

  // 获取交互模式标题
  const getInteractionModeTitle = () => {
    return interactionMode.value === 'mouse' ? '鼠标友好模式' : '触控板友好模式';
  };

  // 同步缩放级别
  const syncZoomLevel = () => {
    try {
      const viewport = getViewport();
      if (viewport && viewport.zoom) {
        zoomLevel.value = Math.round(viewport.zoom * 100);
      }
    } catch (error) {
      // 如果获取失败，保持默认值
      console.warn('Failed to sync zoom level:', error);
    }
  };

  // 组件挂载后同步缩放级别
  // 处理缩放级别变化
  const handleZoomChange = (value: number) => {
    if (value && value >= 20 && value <= 200) {
      const zoomValue = value / 100;
      zoomTo(zoomValue);
      zoomLevel.value = value;
    }
  };

  // 组件挂载后同步缩放级别
  onMounted(() => {
    nextTick(() => {
      syncZoomLevel();
    });
  });
</script>

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
        <div class="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200 backdrop-blur-sm">
          <!-- 交互模式切换 -->
          <t-popup v-model:visible="showInteractionModeDialog" placement="top" :show-arrow="false">
            <t-button
              variant="text"
              size="small"
              @click="toggleInteractionMode"
              :title="getInteractionModeTitle()"
              class="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all"
            >
              <t-icon :name="getInteractionModeIcon()" size="16px" />
            </t-button>
            <template #content>
              <div class="p-4 min-w-[280px]">
                <h4 class="text-sm font-semibold text-gray-800 mb-3 text-center">交互模式</h4>
                <div class="flex flex-col gap-2">
                  <!-- 鼠标友好模式 -->
                  <div
                    class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border"
                    :class="interactionMode === 'mouse' ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'"
                    @click="selectInteractionMode('mouse')"
                  >
                    <t-icon name="mouse" size="20" />
                    <div class="flex flex-col gap-0.5">
                      <span class="text-sm font-medium text-gray-800">鼠标友好模式</span>
                      <span class="text-xs text-gray-600 leading-tight">鼠标左键拖动画布，滚轮缩放</span>
                    </div>
                  </div>

                  <!-- 触控板友好模式 -->
                  <div
                    class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border"
                    :class="interactionMode === 'trackpad' ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'"
                    @click="selectInteractionMode('trackpad')"
                  >
                    <t-icon name="laptop" size="20" />
                    <div class="flex flex-col gap-0.5">
                      <span class="text-sm font-medium text-gray-800">触控板友好模式</span>
                      <span class="text-xs text-gray-600 leading-tight">双指同向移动拖动，双指张开捏合缩放</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </t-popup>

          <!-- 分隔线 -->
          <div class="h-6 w-px bg-gray-300"></div>
          
          <!-- 缩放控制 -->
          <div class="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
            <t-input-number
              v-model="zoomLevel"
              :min="20"
              :max="200"
              :step="10"
              size="small"
              :format="zoomFormat"
              @change="handleZoomChange"
              auto-width
            />
          </div>

          <!-- 视图控制 -->
          <div class="flex items-center gap-1">
            <t-button variant="text" size="small" @click="fitToScreen" title="适应画布" class="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all">
              <t-icon name="fullscreen" size="16px" />
            </t-button>
            <t-button variant="text" size="small" @click="centerView" title="居中显示" class="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all">
              <t-icon name="view-module" size="16px" />
            </t-button>
            <t-button variant="text" size="small" title="全屏" class="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all">
              <t-icon name="fullscreen-1" size="16px" />
            </t-button>
            <t-button variant="text" size="small" title="网格" class="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all">
              <t-icon name="edit" size="16px" />
            </t-button>
          </div>

          <!-- 分隔线 -->
          <div class="h-6 w-px bg-gray-300"></div>

          <!-- 添加节点 -->
          <t-button theme="primary" size="small" @click="showAddNodeDialog" class="rounded-full transition-all hover:-translate-y-0.5">
            <template #icon>
              <t-icon name="add" />
            </template>
            添加节点
          </t-button>

          <!-- 分隔线 -->
          <div class="h-6 w-px bg-gray-300"></div>

          <!-- 运行按钮 -->
          <t-button theme="success" size="small" @click="$emit('test-workflow', {})" class="rounded-full transition-all hover:-translate-y-0.5">
            <template #icon>
              <t-icon name="play-circle-stroke" />
            </template>
            试运行
          </t-button>
        </div>
      </div>
    </div>

    <!-- 节点选择弹窗 -->
    <t-dialog v-model:visible="showNodeSelector" header="选择节点类型" width="600px" :footer="false">
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="nodeType in availableNodeTypes"
          :key="nodeType.type"
          class="flex items-center p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all"
          @click="addNode(nodeType.type)"
        >
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
            :style="{ backgroundColor: nodeType.color + '20', color: nodeType.color }"
          >
            <t-icon :name="nodeType.icon" size="24" />
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900">{{ nodeType.label }}</h4>
            <p class="text-xs text-gray-500 mt-1">{{ getNodeDescription(nodeType.type) }}</p>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<style>
  @import '@vue-flow/core/dist/style.css';
  @import '@vue-flow/core/dist/theme-default.css';

  .vue-flow__edge {
    stroke-width: 2;
  }

  .vue-flow__edge.selected {
    stroke: #3b82f6;
  }

  .vue-flow__handle {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .vue-flow__handle-top {
    top: -4px;
  }

  .vue-flow__handle-bottom {
    bottom: -4px;
  }

  .vue-flow__handle-left {
    left: -4px;
  }

  .vue-flow__handle-right {
    right: -4px;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .absolute.bottom-6 {
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
      transform: none;
    }

    .flex.items-center.gap-3 {
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
    }

    .grid-cols-2 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }
</style>
